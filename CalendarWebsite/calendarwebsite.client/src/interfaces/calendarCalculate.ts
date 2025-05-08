import { EventInput } from "@fullcalendar/core/index.js";
import { User } from "./type";
type TranslateFunction = (key: string) => string;
export const generateUserEvent = (item: User, t: TranslateFunction): EventInput[] => {
    const eventList: EventInput[] = [];

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

    return eventList;
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
