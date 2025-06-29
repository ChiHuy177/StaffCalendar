import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react';
import Popover from '@mui/material/Popover';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Chip, Paper, Box, List, ListItem, ListItemIcon, ListItemText, CircularProgress, GlobalStyles } from '@mui/material';
import { motion } from 'framer-motion';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import listPlugin from '@fullcalendar/list';
import { useThemeContext } from '../../../contexts/ThemeContext';
import { EventInput, EventClickArg, EventContentArg } from '@fullcalendar/core/index.js';
import { getAllMeetingEvents, getEventAttachments } from '../../../apis/EventApi';

interface EventAttachment {
    id: number;
    eventId: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
}

interface FetchInfo {
    start: Date;
    end: Date;
    timeZone: string;
}

const EventPopoverContent = React.memo(({
    selectedEvent,
    attachments,
    isDarkMode,
    lang,
    t,
    isLoading
}: {
    selectedEvent: EventInput;
    attachments: EventAttachment[];
    isDarkMode: boolean;
    lang: string;
    t: (key: string) => string;
    isLoading: boolean;
}) => {


    const handleViewFile = (filePath: string) => {
        const url = `${import.meta.env.VITE_API_URL}api/file/${filePath}`;
        window.open(url, '_blank');
    };

    const getRecurrentType = (recurrentType: string) => {
        switch (recurrentType) {
            case 'Weekly': return t('recurrentType.weekly');
            case 'Monthly': return t('recurrentType.monthly');
            default: return t('recurrentType.default');
        }
    };

    return (
        <Paper sx={{ p: 2.5, maxWidth: 320, width: 'auto' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1.5 }}>
                {selectedEvent.title}
            </Typography>

            {selectedEvent.extendedProps?.recurrentType && (
                <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5 }}>
                    <span style={{ fontWeight: 'bold' }}>{t('recurrentType')}: </span> {' '}
                    {getRecurrentType(selectedEvent.extendedProps.recurrentType)}
                </Typography>
            )}

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                <span style={{ fontWeight: 'bold' }}>{t('organizer')}:</span> {selectedEvent.extendedProps?.organizer === undefined ? "None" : selectedEvent.extendedProps?.organizer}
            </Typography>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 0.5}}>
                <span style={{ fontWeight: 'bold '}}>{t('room')}:</span> {selectedEvent.extendedProps?.meetingRoom}
            </Typography>
            
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                <span style={{ fontWeight: 'bold' }}>{t('time')}:</span> {' '}
                {selectedEvent.start instanceof Date ? selectedEvent.start.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US') : 'N/A'}
            </Typography>
            <Chip
                label={
                    <div dangerouslySetInnerHTML={{ __html: selectedEvent.extendedProps?.description || '<p>None</p>' }} />
                }
                size="small"
                sx={{
                    backgroundColor: isDarkMode ? 'success.light' : '#e8f5e9',
                    color: isDarkMode ? 'success.dark' : '#2e7d32',
                    fontWeight: 500,
                    '& .MuiChip-label': {
                        padding: '0 8px'
                    }
                }}
            />

            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{
                    color: isDarkMode ? 'text.secondary' : 'text.primary',
                    mb: 1,
                    fontWeight: 500
                }}>
                    {t('attachments')}:
                </Typography>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                        <CircularProgress size={24} color={isDarkMode ? "primary" : "secondary"} />
                    </Box>
                ) : attachments.length > 0 ? (
                    <List dense>
                        {attachments.map((attachment) => (
                            <ListItem
                                key={attachment.id}
                                sx={{
                                    borderRadius: '8px',
                                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                                    mb: 0.5,
                                    '&:hover': {
                                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#eeeeee',
                                    },
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleViewFile(attachment.filePath)}
                            >
                                <ListItemIcon>
                                    <InsertDriveFileIcon color={isDarkMode ? "primary" : "action"} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={attachment.fileName}
                                    secondary={`${(attachment.fileSize / 1024).toFixed(1)} KB`}
                                    primaryTypographyProps={{
                                        sx: {
                                            color: isDarkMode ? 'text.primary' : 'text.primary',
                                            fontWeight: 500
                                        }
                                    }}
                                    secondaryTypographyProps={{
                                        sx: {
                                            color: isDarkMode ? 'text.secondary' : 'text.secondary',
                                            fontSize: '0.75rem'
                                        }
                                    }}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Typography variant="body2" sx={{
                        color: isDarkMode ? 'text.secondary' : 'text.secondary',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        py: 2
                    }}>
                        {t('noAttachments')}
                    </Typography>
                )}
            </Box>
        </Paper>
    );
});

const EventPopover = React.memo(({
    anchorEl,
    selectedEvent,
    attachments,
    isDarkMode,
    lang,
    t,
    isLoading,
    onClose
}: {
    anchorEl: HTMLElement | null;
    selectedEvent: EventInput | null;
    attachments: EventAttachment[];
    isDarkMode: boolean;
    lang: string;
    t: (key: string) => string;
    isLoading: boolean;
    onClose: () => void;
}) => {
    const isOpen = Boolean(anchorEl) && Boolean(selectedEvent);

    return (
        <Popover
            open={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
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
            {selectedEvent && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    <EventPopoverContent
                        selectedEvent={selectedEvent}
                        attachments={attachments}
                        isDarkMode={isDarkMode}
                        lang={lang}
                        t={t}
                        isLoading={isLoading}
                    />
                </motion.div>
            )}
        </Popover>
    );
});



export default function MeetingCalendarComponent() {
    const { t } = useTranslation();
    const lang = localStorage.getItem('language') === 'vi' ? 'vi' : 'en';
    const { isDarkMode } = useThemeContext();
    const calendarRef = useRef<FullCalendar>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
    const [attachments, setAttachments] = useState<EventAttachment[]>([]);
    const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);

    const calendarStyles = useMemo(() => ({
        '.fc-header-toolbar .fc-button': {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : '#f0f2f5',
            color: isDarkMode ? '#fff' : '#495057',
            border: 'none',
            borderRadius: '8px',
            textTransform: 'capitalize',
            fontWeight: 500,
            padding: '8px 14px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
                backgroundColor: '#083B75',
                color: '#fff',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            }
        },
        '.fc-header-toolbar .fc-button-primary:not(:disabled).fc-button-active, .fc-header-toolbar .fc-button-primary:not(:disabled):active': {
            backgroundColor: '#083B75',
            color: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        '.fc-today-button': {
            border: `1px solid ${isDarkMode ? '#083B75' : '#dee2e6'}`,
        },
        '.fc-today-button:disabled': {
            opacity: 0.6,
        },
        '.fc-toolbar-title': {
            color: isDarkMode ? '#fff' : '#083B75',
            fontWeight: 'bold',
        }
    }), [isDarkMode]);

    const fetchEvents = useCallback((fetchInfo: FetchInfo, successCallback: (events: EventInput[]) => void, failureCallback: (error: Error) => void) => {
        setIsLoadingEvents(true);
        getAllMeetingEvents(fetchInfo.start, fetchInfo.end)
            .then(data => {
                const eventList: EventInput[] = [];
                if (data && Array.isArray(data)) {
                    data.forEach(meeting => {
                        const isRecurrent = meeting.recurrentType !== "Default";
                        const recurrentIcon = isRecurrent ?
                            (meeting.recurrentType === 'Weekly' ? '🔄' : '📅') : '';

                        eventList.push({
                            id: meeting.id,
                            eventType: meeting.eventType,
                            title: `${meeting.title} ${recurrentIcon}`,
                            start: meeting.startTime,
                            end: meeting.endTime,
                            backgroundColor: meeting.eventType === 'personal' ? '#4CAF50' :
                                meeting.eventType === 'company' ? '#2196F3' :
                                    meeting.eventType === 'meeting' ? '#9C27B0' :
                                        meeting.eventType === 'vehicle' ? '#FF9800' : '#4CAF50',
                            extendedProps: {
                                description: meeting.description,
                                organizer: meeting.organizer,
                                status: meeting.status,
                                recurrentType: meeting.recurrentType,
                                isRecurrent: isRecurrent,
                                recurrentIcon: recurrentIcon,
                                meetingRoom: meeting.meetingRoomId
                            }
                        });
                    });
                }
                successCallback(eventList);
            })
            .catch(error => {
                console.error("Error fetching meeting events:", error);
                failureCallback(error);
            })
            .finally(() => {
                setIsLoadingEvents(false);
            });
    }, []);

    const handleEventClick = useCallback((info: EventClickArg) => {
        setAnchorEl(info.el);
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start || undefined,
            end: info.event.end || undefined,
            extendedProps: info.event.extendedProps,
        });
    }, []);

    useEffect(() => {
        const fetchAttachments = async () => {
            if (selectedEvent?.id) {
                try {
                    setIsLoadingAttachments(true);
                    const eventAttachments = await getEventAttachments(Number(selectedEvent.id));
                    setAttachments(eventAttachments);
                } catch (error) {
                    console.error("Error fetching attachments:", error);
                    setAttachments([]);
                } finally {
                    setIsLoadingAttachments(false);
                }
            }
        };

        fetchAttachments();
    }, [selectedEvent?.id]);

    const handlePopoverClose = useCallback(() => {
        setAnchorEl(null);
        setSelectedEvent(null);
        setAttachments([]);
    }, []);

    const plugins = useMemo(() => [dayGridPlugin, timeGridPlugin, listPlugin], []);

    const headerToolbar = useMemo(() => ({
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth listDay listWeek',
    }), []);

    const buttonText = useMemo(() => ({
        today: t('today'),
        month: t('month'),
        listDay: t('listByDay'),
        listWeek: t('listByWeek'),
    }), [t]);

    const renderEventContent = useCallback((arg: EventContentArg) => {
        const viewType = arg.view.type;
        const isMonth = viewType === 'dayGridMonth';
        const startTime = arg.event.start ? new Date(arg.event.start).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
        const endTime = arg.event.end ? new Date(arg.event.end).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';
        const timeRange = endTime !== '' && endTime !== startTime ? `${startTime}-${endTime}` : startTime;
        const eventType = arg.event.extendedProps.eventType === 'personal' ? t('calendarTypes.personal') :
            arg.event.extendedProps.eventType === 'vehicle' ? t('calendarTypes.vehicle') :
                arg.event.extendedProps.eventType === 'meeting' ? t('calendarTypes.meeting') :
                    arg.event.extendedProps.eventType === 'company' ? t('calendarTypes.company') : "Không xác định"


        return (
            <div className="flex w-[100%] h-[100%] flex-col rounded-xl box-border items-start whitespace-normal break-words text-xs sm:text-sm md:text-base"
                style={{
                    background: isDarkMode ? '#69707C' : '#F6F6F6',
                    color: isDarkMode ? '#fff' : 'black',
                    borderRadius: 8,
                    borderLeft: `4px solid ${arg.event.backgroundColor}`,
                    borderBottom: `4px solid ${arg.event.backgroundColor}`,
                    marginBottom: '5px',
                    fontWeight: 500,
                    boxShadow: '0 1px 2px rgba(21,101,192,0.05)',
                    minHeight: 48,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: isMonth ? '0.5rem' : '0.1rem 0.25rem'
                }}>
                <p className="font-bold ">{timeRange} - {eventType}</p>
                <p className="font-bold ">{arg.event.title} </p>
            </div>
        );
    }, [lang, t, isDarkMode]);

    const noEventsContent = useCallback(() => (
        <div className="flex flex-col background-color: transparent items-center justify-center p-4">
            <Typography
                sx={{
                    color: isDarkMode ? 'text.secondary' : 'text.primary',
                    fontStyle: 'italic'
                }}
            >
                {t('noEvents')}
            </Typography>
        </div>
    ), [isDarkMode, t]);

    return (
        <>
            <GlobalStyles styles={calendarStyles} />
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
                        {t('meetingCalendar')}
                    </Typography>

                    <Card sx={{
                        p: { xs: 1, sm: 2, md: 3 },
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
                        position: 'relative'
                    }}>
                        {isLoadingEvents && (
                            <Box sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                zIndex: 10
                            }}>
                                <CircularProgress sx={{ color: '#083B75' }} />
                            </Box>
                        )}

                        <div className={isDarkMode ? 'dark-calendar' : 'light-calendar'}>
                            <FullCalendar
                                ref={calendarRef}
                                plugins={plugins}
                                initialView="dayGridMonth"
                                headerToolbar={headerToolbar}
                                buttonText={buttonText}
                                allDayContent={t('allDay')}
                                noEventsContent={noEventsContent}
                                locale={lang}
                                events={fetchEvents}
                                editable={true}
                                selectable={true}
                                aspectRatio={1.2}
                                contentHeight="auto"
                                height="auto"
                                dayMaxEventRows={true}
                                eventContent={renderEventContent}
                                viewClassNames='w-full'
                                eventClick={handleEventClick}
                            />
                        </div>
                    </Card>
                    <EventPopover
                        anchorEl={anchorEl}
                        selectedEvent={selectedEvent}
                        attachments={attachments}
                        isDarkMode={isDarkMode}
                        lang={lang}
                        t={t}
                        isLoading={isLoadingAttachments}
                        onClose={handlePopoverClose}
                    />
                </Box>
            </motion.div >
        </>
    );
} 