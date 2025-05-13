import { EventInput } from "@fullcalendar/core/index.js";
import { CheckinData } from "./type";

type TranslateFunction = (key: string) => string;
export const generateUserEvent = (item: CheckinData, t: TranslateFunction): EventInput[] => {
    const eventList: EventInput[] = [];
    if (item.attendant === 'P = Phép năm') {
        console.log('item', item);
        const adjustedStart = new Date(item.date);
        adjustedStart.setHours(adjustedStart.getHours() + 7);
        eventList.push({
                id: item.id?.toString()+'-leave',
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

        if (isLate(adjustedStart.toString())) {
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

        if (isGoHomeEarly(adjustedEnd.toString())) {
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
    start: Date,
    end: Date,
    eventList: EventInput[],
    holidays: string[],
    datesWithEvents: Set<string>,
    selectedName: string,
    t: (key: string) => string
): EventInput[] => {
    const current = new Date(start);
    const today = new Date();

    // Duyệt qua các ngày trong tháng
    while (current <= end && current < today) {
        const day = current.getDay(); // 0: CN, 1: Thứ 2, ..., 6: Thứ 7
        const isoDate = current.toISOString().slice(0, 10);
        const isHoliday = holidays.includes(isoDate); // Kiểm tra ngày lễ
        const isWeekday = day > 1 && day <= 6; // Kiểm tra ngày trong tuần (Thứ 2 - Thứ 6)

        // Nếu là ngày lễ
        if (isHoliday) {
            eventList.push({
                id: `holiday-${isoDate}`,
                title: t('holidays'), // Tên sự kiện ngày lễ
                start: new Date(isoDate),
                extendedProps: {
                    description: t('holidays'),
                    staffName: selectedName,
                },
                className: 'bg-green-600 text-white rounded px-2',
            });
        }
        // Nếu là ngày trong tuần và không có sự kiện
        else if (isWeekday && !datesWithEvents.has(isoDate)) {
            eventList.push({
                id: `nopay-${isoDate}`,
                title: t('Absent'), // Tên sự kiện nghỉ không lương
                start: new Date(isoDate),
                extendedProps: {
                    description: t('Absent'),
                    staffName: selectedName,
                },
                className: 'bg-red-600 text-white rounded px-2',
            });
        }

        current.setDate(current.getDate() + 1); // Chuyển sang ngày tiếp theo
    }

    return eventList; // Trả về danh sách sự kiện đã được cập nhật
};

function isLate(date: string): boolean {
    const parsedDate = new Date(date);
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    return (hours > 8 || (hours === 7 && minutes > 30));
}
function isGoHomeEarly(date: string): boolean {
    const parsedDate = new Date(date);
    const hours = parsedDate.getHours();
    const minutes = parsedDate.getMinutes();

    return hours < 16 || (hours === 16 && minutes < 30);
}
