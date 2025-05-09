import React, { useEffect, useRef, useState } from 'react';
import dayGridPlugin from '@fullcalendar/daygrid';
import FullCalendar from '@fullcalendar/react';
import { EventClickArg, EventInput } from '@fullcalendar/core';
import Popover from '@mui/material/Popover';
import { Bounce, toast } from 'react-toastify';
import { User } from '../utils/type';
import { useTranslation } from 'react-i18next';
import { getAllUserName, getCheckinDataByUserId, getRecordDataByMonth } from '../apis/CheckinDataApi';
import dayjs from 'dayjs';
import { holidays } from '../utils/holidays';
import { addAbsenceAndHolidayEvents, generateUserEvent } from '../utils/calendarCalculate';

export default function CalendarComponent() {
    const [loading, setLoading] = useState(false);
    const [events, setEvents] = useState<EventInput[]>([]);
    const [nameOfUsers, setNameOfUsers] = useState<string[]>([]);
    const [filter, setFilter] = useState('');
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
            const data = await getRecordDataByMonth(month, year, valueBeforeDash);
            setWorkDays(data);
        } else {
            console.error('Calendar API is not available');
        }
    };

    const getWorkDays = async () => {
        const calendarApi = calendarRef.current?.getApi();
        if (calendarApi) {
            const currentViewDate = calendarApi.view.currentStart;
            const month = currentViewDate.getMonth() + 1;
            const year = currentViewDate.getFullYear();

            if (selectedName === '') return;

            const valueBeforeDash = selectedName.split('-')[0];
            const data = await getRecordDataByMonth(month, year, valueBeforeDash)
            setWorkDays(data);
        } else {
            console.error('Calendar API is not available');
        }
    };

    const EventPopover = () => {
        const handlePopoverClose = () => {
            setAnchorEl(null); // Đóng Popover
            setSelectedEvent(null); // Xóa thông tin sự kiện được chọn
        };

        const isOpen = Boolean(anchorEl);

        return (
            <Popover
                open={isOpen}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'top', // Hiển thị phía trên sự kiện
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom', // Điểm gốc để định vị
                    horizontal: 'center',
                }}
                sx={{
                    boxShadow: 'none', // Loại bỏ hiệu ứng bóng
                }}
            >
                <div className="p-4 max-w-xs">
                    {selectedEvent && (
                        <>
                            <h2 className="text-lg font-bold text-blue-600 mb-2">
                                {selectedEvent.title}
                            </h2>
                            <h3 className="text-base font-medium text-gray-800 mb-2">
                                <span className="font-semibold text-gray-900">{t('staff')}:</span> {selectedEvent.extendedProps?.staffName}
                            </h3>
                            <p className="text-sm text-gray-700">
                                <span className="font-semibold text-gray-900">{t('time')}:</span>{' '}
                                {new Date(selectedEvent.start as string).toLocaleString('vi-VN')}
                            </p>
                            <p
                                className={`text-sm font-medium mt-2 px-3 py-1 rounded-full ${selectedEvent.extendedProps?.description === t('InLate')
                                    || selectedEvent.extendedProps?.description === t('OutEarly')
                                    || selectedEvent.extendedProps?.description === t('Absent')

                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-green-100 text-green-600'
                                    }`}
                            >
                                {selectedEvent.extendedProps?.description}
                            </p>
                        </>
                    )}
                </div>
            </Popover>
        );
    };

    // check date in


    useEffect(() => {
        async function fetchAllUserName() {
            const data = await getAllUserName();
            data.push("huync@becawifi.vn - Nguyễn Chí Huy")
            setNameOfUsers(data);
        }
        getWorkDaysInitial('');
        fetchAllUserName();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedName('');
        setFilter(e.target.value);
    };

    const handleNameClick = (name: string) => {
        setSelectedName(name);
        setFilter('');
        fetchWorkScheduleByMonthInitial(name);
        getWorkDaysInitial(name);
    };

    const fetchWorkScheduleByMonthInitial = async (id: string): Promise<void> => {
        if (id === '') {
            toast.error('Vui lòng nhập tên!', {
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

            const valueBeforeDash = id.split('-')[0];
            try {
                const data = await getCheckinDataByUserId(month, year, valueBeforeDash);

                if (data.length === 0) {
                    toast.error('Không tìm thấy lịch làm việc của nhân viên này!', {
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
                data.forEach((item: User) => {
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
                    holidays, // Danh sách các ngày lễ
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

            if (selectedName === "") {
                return;
            }
            const valueBeforeDash = selectedName.split('-')[0];
            try {
                const data = await getCheckinDataByUserId(month, year, valueBeforeDash);

                if (data.length === 0) {
                    toast.error('Không tìm thấy lịch làm việc của nhân viên này!', {
                        position: "top-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: false,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                        transition: Bounce,
                    });
                    setLoading(false);
                    setEvents([]);
                    return;
                }
                const eventList: EventInput[] = [];

                data.forEach((item: User) => {
                    const userEvents = generateUserEvent(item, t);
                    eventList.push(...userEvents);  // Thêm các sự kiện vào danh sách eventList
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
                    holidays, // Danh sách các ngày lễ
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
    
    

    const handleEventClick = (info: EventClickArg) => {
        setAnchorEl(info.el); // Set the clicked element as anchor
        setSelectedEvent({
            id: info.event.id,
            title: info.event.title,
            start: info.event.start ? info.event.start.toISOString() : undefined,
            end: info.event.end ? info.event.end.toISOString() : undefined,
            extendedProps: info.event.extendedProps,
        });

    };

    return (
        <div className="p-6 bg-[#083B75] min-h-screen text-center max-w-screen rounded-lg">
            <h1 className="font-bold text-5xl pb-6 text-white">{t('staffCalendar')}</h1>

            <div className="mb-8 flex flex-col items-center">
                <div className="relative w-96">

                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                        <i className="fa fa-search" aria-hidden="true"></i>
                    </span>
                    <input
                        autoComplete="off"
                        id="userIdField"
                        type="text"
                        placeholder=" "
                        value={selectedName || filter}
                        onChange={handleInputChange}
                        className="block w-full pl-10 pr-10 pb-2.5 pt-2.5 text-sm text-gray-900 bg-white rounded-full border-2 border-gray-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-blue-400 focus:border-blue-400 hover:bg-gray-50 transition duration-300 ease-in-out peer"
                    />
                    <label
                        htmlFor="userIdField"
                        className="absolute ml-[15px] left-6 top-0.5 text-sm text-gray-500 transform -translate-y-1/2 scale-100 bg-white rounded-lg px-2 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-1/2 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-blue-600 transition-all duration-300 ease-in-out"
                    >
                        {t('selectName')}
                    </label>
                    <button
                        type="button"
                        onClick={() => {
                            setFilter('');
                            setSelectedName('');
                            setWorkDays(0);
                        }}
                        className="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                        ✕
                    </button>
                    {filter && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
                            {nameOfUsers
                                ?.filter((name: string) => name.toLowerCase().includes(filter.toLowerCase()))
                                .map((filteredName: string, index: number) => (
                                    <div
                                        key={index}
                                        className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md hover:shadow-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 cursor-pointer transition duration-200 ease-in-out"
                                        onClick={() => handleNameClick(filteredName)}
                                    >
                                        <p className="text-gray-800 font-medium">{filteredName}</p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>


            </div>

            <div className="relative">
                {loading && (
                    <div className="absolute inset-0 bg-opacity-100 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="mt-4 text-gray-700 font-medium">Đang tải dữ liệu...</p>
                        </div>
                    </div>
                )}
                <>
                    <div className="w-full overflow-x-auto p-5 bg-white rounded-lg shadow-md">
                        <div className="mb-4">
                            <p className="text-lg font-medium text-gray-700 mt-5">
                                {t('workingDays')} <span className='font-bold text-gray-800'>{selectedName.split('-')[1]}</span>  : <span className="font-bold text-blue-600">{workDays}</span>
                            </p>
                        </div>
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
                                getWorkDays();
                                getWorkScheduleByMonth();
                            }}
                            dayMaxEventRows={true}
                            eventContent={(arg) => (
                                <div className="flex flex-col box-border items-start whitespace-normal break-words text-xs sm:text-sm md:text-base">
                                    {arg.event.title == t('Absent') || arg.event.title == t('holidays') ?
                                        <p className="font-bold">{arg.event.title} : {arg.event.start ? new Date(arg.event.start).toLocaleDateString('vi-VN') : 'N/A'} </p>
                                        : <p className="font-bold">{arg.event.title} : {arg.event.start ? new Date(arg.event.start).toLocaleString('vi-VN') : 'N/A'} </p>
                                    }
                                    {/* <p className="font-bold">{arg.event.title} : {arg.event.start ? new Date(arg.event.start).toLocaleString('vi-VN') : 'N/A'} </p> */}
                                    <p className="text-black-600">{arg.event.extendedProps?.description}</p>
                                </div>
                            )}

                            viewClassNames='w-full'
                        />
                    </div>
                    <EventPopover />
                </>

            </div>
        </div>
    );
}


