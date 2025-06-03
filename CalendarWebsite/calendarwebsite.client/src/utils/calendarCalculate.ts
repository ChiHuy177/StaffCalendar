import { EventInput } from "@fullcalendar/core/index.js";
import { CheckinData, WorkScheduleDetail } from "./type";
import dayjs from 'dayjs';



type TranslateFunction = (key: string) => string;
export const getDateFromString = (dateTimeString: string): string => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('vi-VI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}
export const generateUserEvent = (item: CheckinData,workScheduleDetails : WorkScheduleDetail[], t: TranslateFunction): EventInput[] => {
    const eventList: EventInput[] = [];
    if (item.attendant === 'P = Phép năm') {
        console.log('item', item);
        const adjustedStart = new Date(item.date);
        adjustedStart.setHours(adjustedStart.getHours() + 7);
        eventList.push({
            id: item.id?.toString() + '-leave',
            title: "Nghỉ phép",
            start: adjustedStart,
            extendedProps: {
                description: item.attendant,
                description2: item.ghiChu,
                staffName: item.fullName,
            },
            className: 'bg-orange-400 text-white rounded px-2',
        });
    } else {
        const adjustedStart = new Date(item.inAt);
        adjustedStart.setHours(adjustedStart.getHours() + 7);

        const adjustedEnd = new Date(item.outAt);
        adjustedEnd.setHours(adjustedEnd.getHours() + 7);

        //  (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)
        const dayOfWeek = adjustedStart.getDay();
        
        // Chuyển đổi dayOfWeek sang tên ngày trong tuần
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = dayNames[dayOfWeek];
        
        // Tìm thông tin giờ làm việc cho ngày trong tuần
        const workSchedule = workScheduleDetails.find(schedule => schedule.workweekTitle === dayName);
        
        // Giá trị mặc định
        let startTime = 7.5;
        let endTime = 16.5;
        
        // Nếu tìm thấy thông tin giờ làm việc, sử dụng thông tin đó
        if (workSchedule) {
            if (workSchedule.morningStart !== null) {
                startTime = workSchedule.morningStart;
            }
            if (workSchedule.afternoonEnd !== null) {
                endTime = workSchedule.afternoonEnd;
            }
        }

        if (isLate(adjustedStart.toString(), startTime)) {
            eventList.push({
                id: item.id?.toString(),
                title: t('InLate'),
                start: adjustedStart,
                extendedProps: {
                    description: t('InLate'),
                    staffName: item.fullName,
                },
                className: 'bg-red-400 text-black rounded px-2',
            });
        } else {
            eventList.push({
                id: item.id?.toString(),
                title: t('In time'),
                start: adjustedStart,
                extendedProps: {
                    description: t('OnTime'),
                    staffName: item.fullName,
                },
                className: 'bg-green-400 text-black rounded px-2',
            });
        }

        if (isGoHomeEarly(adjustedEnd.toString(), endTime)) {
            eventList.push({
                id: item.id?.toString() + '-out',
                title: t('OutEarly'),
                start: adjustedEnd,
                extendedProps: {
                    description: t('OutEarly'),
                    staffName: item.fullName,
                },
                className: 'bg-yellow-400 text-black rounded px-2',
            });
        } else {
            eventList.push({
                id: item.id?.toString() + '-out',
                title: t('Out time'),
                start: adjustedEnd,
                extendedProps: {
                    description: t('OnTime'),
                    staffName: item.fullName,
                },
                className: 'bg-green-400 text-black rounded px-2',
            });
        }

    }

    return eventList;
};
export const addAbsenceAndHolidayEvents = (
    monthStartDate: Date,
    monthEndDate: Date,
    eventList: EventInput[],
    holidays: string[],
    datesWithEvents: Set<string>,
    selectedName: string,
    t: (key: string) => string
): EventInput[] => {
    const current = new Date(monthStartDate.getFullYear(), monthStartDate.getMonth(), monthStartDate.getDate());

    const today = new Date();
    while (current < monthEndDate && current < today) {
        const dayOfWeek = current.getDay(); // 0: CN, 1: Thứ 2, ..., 6: Thứ 7

        const isoDate = dayjs(current).format('YYYY-MM-DD');

        const isHoliday = holidays.includes(isoDate);
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

        if (isHoliday) {
            eventList.push({
                id: '-holiday',
                title: t('holidays'),
                start: new Date(isoDate),
                extendedProps: {
                    description: t('holidays'),
                    staffName: selectedName,
                },
                className: 'bg-green-600 text-white rounded px-2',
            });
        }
        else if (isWeekday && !datesWithEvents.has(isoDate)) {
            eventList.push({
                id: `nopay-${isoDate}`,
                title: t('Absent'),
                start: new Date(isoDate),
                extendedProps: {
                    description: t('Absent'),
                    staffName: selectedName,
                },
                className: 'bg-red-600 text-white rounded px-2',
            });
        }

        current.setDate(current.getDate() + 1);
    }

    return eventList;
};

function isLate(date: string, lateTime: number): boolean {
    const parsedDate = new Date(date);
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    const lateHour = Math.floor(lateTime);
    const lateMinute = Math.round((lateTime - lateHour) * 60);

    return hours > lateHour || (hours === lateHour && minutes > lateMinute);
}
function isGoHomeEarly(date: string, earlyTime: number): boolean {
    const parsedDate = new Date(date);
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    const earlyHour = Math.floor(earlyTime);
    const earlyMinute = Math.round((earlyTime - earlyHour) * 60);

    return hours < earlyHour || (hours === earlyHour && minutes < earlyMinute);
}
