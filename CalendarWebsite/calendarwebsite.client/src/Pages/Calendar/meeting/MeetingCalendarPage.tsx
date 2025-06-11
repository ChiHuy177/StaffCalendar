import { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import FullCalendar from '@fullcalendar/react';
import Popover from '@mui/material/Popover';
import { useTranslation } from 'react-i18next';
import { Card, Typography, Chip, Paper, Box, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DownloadIcon from '@mui/icons-material/Download';

import { useThemeContext } from '../../../contexts/ThemeContext';
import { EventInput, EventClickArg } from '@fullcalendar/core/index.js';
import { getAllMeetingEvents, getEventAttachments } from '../../../apis/EventApi';

interface EventAttachment {
    id: number;
    eventId: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
}

export default function MeetingCalendarComponent() {
    const { t } = useTranslation();
    const lang = localStorage.getItem('language') === 'vi' ? 'vi' : 'en';
    const { isDarkMode } = useThemeContext();
    const calendarRef = useRef<FullCalendar>(null);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
    const [attachments, setAttachments] = useState<EventAttachment[]>([]);

    const handleEventClick = async (info: EventClickArg) => {
        setAnchorEl(info.el);
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start || undefined,
            end: info.event.end || undefined,
            extendedProps: info.event.extendedProps,
        });
        
        try {
            const eventAttachments = await getEventAttachments(Number(info.event.id));
            setAttachments(eventAttachments);
        } catch (error) {
            console.error("Error fetching attachments:", error);
            setAttachments([]);
        }
    };

    async function fetchMeetingEvents() {
        const data = await getAllMeetingEvents();
        const eventList: EventInput[] = [];
        
        if (data && Array.isArray(data)) {
            data.forEach(meeting => {
                eventList.push({
                    id: meeting.id,
                    eventType: meeting.eventType,
                    title: meeting.title,
                    start: meeting.startTime,
                    end: meeting.endTime,
                    backgroundColor: meeting.eventType === 'Personal' ? '#4CAF50' : 
                                    meeting.eventType === 'Company' ? '#2196F3' :
                                    meeting.eventType === 'Meeting' ? '#9C27B0' :
                                    meeting.eventType === 'Vehicle' ? '#FF9800' : '#4CAF50',
                    extendedProps: {
                        description: meeting.description,
                        organizer: meeting.organizer,
                        status: meeting.status
                    }
                });
            });
        }
        
        setEvents(eventList);
    }

    useEffect(() => {
        fetchMeetingEvents();
    }, []);

    const handleDownload = (filePath: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = filePath;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const EventPopover = () => {
        const handlePopoverClose = () => {
            setAnchorEl(null);
            setSelectedEvent(null);
            setAttachments([]);
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
                                    <span style={{ fontWeight: '500' }}>{t('organizer')}:</span> {selectedEvent.extendedProps?.organizer === undefined ? "None" : selectedEvent.extendedProps?.organizer}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
                                    <span style={{ fontWeight: '500' }}>{t('time')}:</span> {' '}
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
                                
                                {attachments.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" sx={{ 
                                            color: isDarkMode ? 'text.secondary' : 'text.primary',
                                            mb: 1,
                                            fontWeight: 500
                                        }}>
                                            {t('attachments')}:
                                        </Typography>
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
                                                    }}
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
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDownload(attachment.filePath, attachment.fileName)}
                                                        sx={{ 
                                                            color: isDarkMode ? 'primary.main' : 'primary.main',
                                                            '&:hover': {
                                                                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                                                            }
                                                        }}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Box>
                                )}
                            </Paper>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Popover>
        );
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
                    {t('meetingCalendar')}
                </Typography>

                <Card sx={{
                    p: { xs: 1, sm: 2, md: 3 },
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
                    position: 'relative'
                }}>
                    

                    <div className={isDarkMode ? 'dark-calendar' : 'light-calendar'}>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridDay',
                            }}
                            buttonText={{
                                today: t('today'),
                                month: t('month'),
                                day: t('day'),
                            }}
                            locale={lang}
                            events={events}
                            editable={true}
                            selectable={true}
                            aspectRatio={1.2}
                            contentHeight="auto"
                            height="auto"
                            dayMaxEventRows={true}
                            eventContent={(arg) => {
                                const startTime = arg.event.start ? new Date(arg.event.start).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                                const endTime = arg.event.end ? new Date(arg.event.end).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';
                                const timeRange = endTime !== '' && endTime !== startTime ? `${startTime}-${endTime}` : startTime;

                                return (
                                    <div className="flex w-100 flex-col p-2 box-border items-start whitespace-normal break-words text-xs sm:text-sm md:text-base" style={{ backgroundColor: arg.event.backgroundColor, borderLeft: '4px solid #083B75' }}>
                                        <p className="font-bold text-white">{timeRange}</p>
                                        <p className="font-bold text-white">{arg.event.title}</p>
                                    </div>
                                );
                            }}
                            eventBackgroundColor="#90ee90"
                            eventBorderColor="#90ee90"
                            viewClassNames='w-full'
                            eventClick={handleEventClick}
                        />
                    </div>
                </Card>
                <EventPopover />
            </Box>
        </motion.div>
    );
} 