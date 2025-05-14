import React, { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import Popover from '@mui/material/Popover';
import { Bounce, toast } from 'react-toastify'; 
import { CheckinData } from '../utils/type';
import { useTranslation } from 'react-i18next';
import { getAllUserName, getCheckinDataByUserId, getRecordDataByMonth } from '../apis/CheckinDataApi';
import dayjs from 'dayjs';
import { holidays } from '../utils/holidays';
import { addAbsenceAndHolidayEvents, generateUserEvent } from '../utils/calendarCalculate';
import { Autocomplete, TextField, Card, Typography, CircularProgress, Chip, Paper, Box, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function CalendarComponent() {
    const [loading, setLoading] = useState(false);
    const [loadingUsername, setLoadingUsername] = useState(true);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [nameOfUsers, setNameOfUsers] = useState<string[]>([]);
    const [selectedName, setSelectedName] = useState('');
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
    const calendarRef = useRef<FullCalendar>(null);
    const [workDays, setWorkDays] = useState<number>(0);
    const { t } = useTranslation();
    const lang = localStorage.getItem('language') === 'vi' ? 'vi' : 'en';

    const getWorkDaysInitial = async (id: string) => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentViewDate = calendarApi.view.currentStart;
            const month = currentViewDate.getMonth() + 1;
            const year = currentViewDate.getFullYear();

            if (id === '') return;

            const valueBeforeDash = id.split('-')[0];
            console.log("valueBeforeDash", valueBeforeDash);
            const data = await getRecordDataByMonth(month, year, valueBeforeDash);
            setWorkDays(data);
        } else {
            console.error('Calendar API is not available');
        }
    };

    const getWorkDays = async () => {
        console.log("Call api")
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentViewDate = calendarApi.view.currentStart;
            const month = currentViewDate.getMonth() + 1;
            const year = currentViewDate.getFullYear();

            if (selectedName === '') return;

            const valueBeforeDash = selectedName.split('-')[0];
            console.log("valueBeforeDash", valueBeforeDash);
            try {
                const data = await getRecordDataByMonth(month, year, valueBeforeDash);
                setWorkDays(data);
            } catch (error) {
                console.error('Error fetching work schedule:', error);
            }

        } else {
            console.error('Calendar API is not available');
        }
    };

    const EventPopover = () => {
        const handlePopoverClose = () => {
            setAnchorEl(null);
            setSelectedEvent(null);
        };

        const isOpen = Boolean(anchorEl);

        return (
            <Popover
                open={isOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        mt: 1.5,
                    }
                }}
            >
                <AnimatePresence>
                    {selectedEvent && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Paper sx={{ p: 2.5, maxWidth: 320, width: 'auto' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1.5 }}>
                                    {selectedEvent.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    <span style={{ fontWeight: '500' }}>{t('staff')}:</span> {selectedEvent.extendedProps?.staffName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                                    <span style={{ fontWeight: '500' }}>{t('time')}:</span> {' '}
                                    {new Date(selectedEvent.start as string).toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                                </Typography>

                                {selectedEvent.title === 'Nghỉ phép' ? (
                                    <>
                                        <Chip
                                            label={selectedEvent.extendedProps?.description}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'success.light',
                                                color: 'success.dark',
                                                fontWeight: 500,
                                                mr: 1,
                                                mb: 1
                                            }}
                                        />
                                        {selectedEvent.extendedProps?.description2 &&
                                            <Chip
                                                label={selectedEvent.extendedProps?.description2}
                                                size="small"
                                                sx={{
                                                    backgroundColor: 'success.light',
                                                    color: 'success.dark',
                                                    fontWeight: 500,
                                                    mb: 1
                                                }}
                                            />
                                        }
                                    </>
                                ) : (
                                    selectedEvent.extendedProps?.description &&
                                    <Chip
                                        label={selectedEvent.extendedProps?.description}
                                        size="small"
                                        sx={{
                                            backgroundColor:
                                                selectedEvent.extendedProps?.description === t('InLate') ||
                                                    selectedEvent.extendedProps?.description === t('OutEarly') ||
                                                    selectedEvent.extendedProps?.description === t('Absent')
                                                    ? 'error.light'
                                                    : 'success.light',
                                            color:
                                                selectedEvent.extendedProps?.description === t('InLate') ||
                                                    selectedEvent.extendedProps?.description === t('OutEarly') ||
                                                    selectedEvent.extendedProps?.description === t('Absent')
                                                    ? 'error.dark'
                                                    : 'success.dark',
                                            fontWeight: 500
                                        }}
                                    />
                                )}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Popover>
        );
    };

    useEffect(() => {
        async function fetchAllUserName() {
            try {
                setLoadingUsername(true);
                const data = await getAllUserName();
                data.push("huync@becawifi.vn - Nguyễn Chí Huy")
                setNameOfUsers(data);
            } catch (error) {
                console.error('Error fetching usernames:', error);
                toast.error(t('toastMessages.errorFetchingUsernames'), {
                    position: 'top-center',
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'light',
                    transition: Bounce,
                });
            } finally {
                setLoadingUsername(false);
            }
        }
        getWorkDaysInitial('');
        fetchAllUserName();
    }, []);

    const handleNameChange = (_event: React.SyntheticEvent, value: string | null) => {
        if (value) {
            console.log("name", value);
            setSelectedName(value);
            fetchWorkScheduleByMonthInitial(value);
            getWorkDaysInitial(value);
        } else {
            setSelectedName('');
            setEvents([]);
            setWorkDays(0);
        }
    };

    const fetchWorkScheduleByMonthInitial = async (id: string): Promise<void> => {
        if (id === '') {
            toast.error(t('toastMessages.pleaseEnterName'), {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'light',
                transition: Bounce,
            });
            return;
        }
        setLoading(true);
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentViewDate = calendarApi.view.currentStart;
            const month = currentViewDate.getMonth() + 1;
            const year = currentViewDate.getFullYear();

            const valueBeforeDash = id.split('-')[0].trim();
            const valueAfterDash = id.split('-')[1]?.trim();
            try {
                const data = await getCheckinDataByUserId(month, year, valueBeforeDash, valueAfterDash);

                if (data.length === 0) {
                    toast.error(t('toastMessages.employeeScheduleNotFound'), {
                        position: 'top-center',
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: 'light',
                        transition: Bounce,
                    });
                    setLoading(false);
                    setEvents([]);
                    return;
                }

                const eventList: EventInput[] = [];
                data.forEach((item: CheckinData) => {
                    const userEvents = generateUserEvent(item, t);
                    eventList.push(...userEvents);
                });
                const start = new Date(calendarApi.view.currentStart);
                const end = new Date(calendarApi.view.currentEnd);

                const datesWithEvents = new Set(
                    eventList
                        .filter(e => e.start)
                        .map(e => dayjs(e.start as string | Date).format('YYYY-MM-DD'))
                );

                const updatedEventList = addAbsenceAndHolidayEvents(
                    start,
                    end,
                    eventList,
                    holidays,
                    datesWithEvents,
                    selectedName,
                    t
                );
                setTimeout(() => {
                    setLoading(false);
                    setEvents(updatedEventList);
                    getWorkDays();
                }, 1000);
            } catch (error) {
                console.error('Error fetching work schedule:', error);
                setLoading(false);
            }
        }
    };

    const getWorkScheduleByMonth = async (): Promise<void> => {
        if (selectedName === '') {
            return;
        }
        setLoading(true);
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentViewDate = calendarApi.view.currentStart;
            const month = currentViewDate.getMonth() + 1;
            const year = currentViewDate.getFullYear();

            const valueBeforeDash = selectedName.split('-')[0].trim();
            const valueAfterDash = selectedName.split('-')[1]?.trim();
            console.log("valueBeforeDash", valueBeforeDash);
            console.log("valueAfterDash", valueAfterDash);
            try {
                const data = await getCheckinDataByUserId(month, year, valueBeforeDash, valueAfterDash);

                if (data.length === 0) {
                    toast.error(t('toastMessages.employeeScheduleNotFoundForMonth'), {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                        transition: Bounce,
                    });
                    setLoading(false);
                    setEvents([]);
                    setWorkDays(0);
                    return;
                }
                const eventList: EventInput[] = [];

                data.forEach((item: CheckinData) => {
                    const userEvents = generateUserEvent(item, t);
                    eventList.push(...userEvents);
                });

                const start = new Date(calendarApi.view.currentStart);
                const end = new Date(calendarApi.view.currentEnd);

                const datesWithEvents = new Set(
                    eventList
                        .filter(e => e.start)
                        .map(e => dayjs(e.start as string | Date).format('YYYY-MM-DD'))
                );


                const updatedEventList = addAbsenceAndHolidayEvents(
                    start,
                    end,
                    eventList,
                    holidays,
                    datesWithEvents,
                    selectedName,
                    t
                );
                setTimeout(() => {
                    setLoading(false);
                    setEvents(updatedEventList);
                    getWorkDays();
                }, 1000);
            } catch (error) {
                console.error('Error fetching work schedule for month:', error);
                setLoading(false);
            }
        }
    };

    const handleEventClick = (info: EventClickArg) => {
        setAnchorEl(info.el);
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start ? info.event.start.toISOString() : undefined,
            end: info.event.end ? info.event.end.toISOString() : undefined,
            extendedProps: info.event.extendedProps,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 md:p-6 min-h-screen bg-[#083B75] text-white"
        >
            <Box sx={{ maxWidth: 1200, margin: 'auto' }}>
                <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                        fontWeight: 'bold',
                        textAlign: 'center',
                        mb: 4,
                        color: 'white',
                        pb: 1,
                    }}
                >
                    {t('staffCalendar')}
                </Typography>

                <Card sx={{ 
                    p: 2, 
                    mb: 3, 
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                    {loadingUsername ? (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            minHeight: '56px',
                            gap: 2
                        }}>
                            <CircularProgress size={24} sx={{ color: 'primary.main' }} />
                            <Typography color="text.secondary">
                                {t('loadingData')}...
                            </Typography>
                        </Box>
                    ) : (
                        <Autocomplete
                            id="staff-name-autocomplete"
                            options={nameOfUsers}
                            value={selectedName || null}
                            onChange={handleNameChange}
                            slotProps={{
                                popper: {
                                    sx: {
                                        zIndex: 99999
                                    },
                                    placement: "bottom-start"
                                },
                                listbox: {
                                    sx: { 
                                        backgroundColor: 'white',
                                        color: 'text.primary',
                                        zIndex: 99999,
                                        '& .MuiAutocomplete-option':{
                                            '&[aria-selected="true"]':{
                                                backgroundColor: 'primary.light',
                                                color: 'primary.contrastText',
                                                '&.Mui-focused': {
                                                     backgroundColor: 'primary.main',
                                                     color: 'primary.contrastText',
                                                }
                                            },
                                            '&:hover':{
                                                backgroundColor: 'action.hover',
                                            }
                                        }
                                    }
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder={t('selectName')}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            color: 'text.primary',
                                            '& fieldset': {
                                                borderColor: 'grey.400',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: 'grey.600',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: 'primary.main',
                                            },
                                            '& .MuiAutocomplete-input': {
                                                color: 'text.primary',
                                                paddingLeft: '4px !important',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: 'text.secondary',
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': {
                                            color: 'primary.main',
                                        },
                                        '& .MuiAutocomplete-popupIndicator': { color: 'text.secondary' },
                                        '& .MuiAutocomplete-clearIndicator': { color: 'text.secondary' },
                                    }}
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <>
                                                <SearchIcon sx={{ color: 'text.secondary', ml: 1, mr:0.5 }} />
                                                {params.InputProps.startAdornment}
                                            </>
                                        ),
                                        endAdornment: (
                                            <>
                                                {selectedName && (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleNameChange({} as React.SyntheticEvent, null)}
                                                        sx={{ color: 'text.secondary' }}
                                                    >
                                                        <ClearIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}
                </Card>

                <Card sx={{ 
                    p: { xs: 1, sm: 2, md: 3 },
                    borderRadius: '16px',
                    backgroundColor: 'white',
                    boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
                    position: 'relative'
                }}>
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 10,
                                    borderRadius: '16px',
                                }}
                            >
                                <CircularProgress sx={{color: '#b39ddb'}} />
                                <Typography sx={{ mt: 2, color: 'white' }}>{`${t('loadingData')}...`}</Typography>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {selectedName && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between', 
                            mb: 2, 
                            p: 1.5, 
                            backgroundColor: 'grey.100',
                            borderRadius: '12px' 
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarTodayIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
                                    {t('workingDays')}: <span style={{ fontWeight: 'bold' }}>{selectedName.split('-')[1]?.trim() || ''}</span>
                                </Typography>
                            </Box>
                            <Chip label={workDays} sx={{ backgroundColor: '#b39ddb', color: 'black', fontWeight: 'bold' }} />
                        </Box>
                    )}
                    
                    <FullCalendar
                        ref={calendarRef}
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth',
                        }}
                        buttonText={{
                            today: t('today'),
                            month: t('month'),
                        }}
                        locale={lang}
                        events={events}
                        eventClick={handleEventClick}
                        editable={true}
                        selectable={true}
                        aspectRatio={1.2}
                        contentHeight="auto"
                        height="auto"
                        datesSet={() => {
                            getWorkScheduleByMonth();
                        }}
                        dayMaxEventRows={true}
                        eventContent={(arg) => (
                            <div className="flex flex-col box-border items-start whitespace-normal break-words text-xs sm:text-sm md:text-base">
                                {arg.event.title == t('Absent') || arg.event.title == t('holidays') || arg.event.title === 'Nghỉ phép năm' ?
                                    <p className="font-bold">{arg.event.title} : {arg.event.start ? new Date(arg.event.start).toLocaleDateString('vi-VN') : 'N/A'} </p>
                                    : <p className="font-bold">{arg.event.title} : {arg.event.start ? new Date(arg.event.start).toLocaleString('vi-VN') : 'N/A'} </p>
                                }
                                <p className="text-black-600">{arg.event.extendedProps?.description}</p>
                            </div>
                        )}
                        viewClassNames='w-full'
                    />
                </Card>
                <EventPopover />
            </Box>
        </motion.div>
    );
}


