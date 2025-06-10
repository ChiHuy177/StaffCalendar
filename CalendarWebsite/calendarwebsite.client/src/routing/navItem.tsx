import CalendarMonthTwoToneIcon from "@mui/icons-material/CalendarMonthTwoTone";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import CalendarViewMonthRoundedIcon from '@mui/icons-material/CalendarViewMonthRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';

import GroupsIcon from '@mui/icons-material/Groups';
import AddIcon from '@mui/icons-material/Add';

export type NavItemConfig = {
    key: string;
    icon: React.ReactNode;
    path: string;
    children?: NavItemConfig[];
};

export const navigationConfig: NavItemConfig[] = [

    { key: 'nav.home', icon: <CalendarMonthTwoToneIcon sx={{ color: 'common.black' }} />, path: '/' },
    { key: 'nav.staffTable', icon: <BackupTableIcon sx={{ color: 'common.black' }} />, path: '/table' },
    { key: 'nav.byDay', icon: <CalendarViewMonthRoundedIcon sx={{ color: 'common.black' }} />, path: '/checkinbyday' },
    { key: 'nav.byDept', icon: <CalendarViewMonthRoundedIcon sx={{ color: 'common.black' }} />, path: '/checkintablebydepartment' },
    { key: 'nav.customWorkWeek', icon: <ScheduleIcon sx={{ color: 'common.black' }} />, path: '/customworkweek' },
    {
        key: 'nav.calendarEvents',
        icon: <CalendarViewMonthRoundedIcon sx={{ color: 'common.black' }} />,
        path: '/calendar',
        children: [
            { key: 'nav.addNewEvent', icon: <AddIcon sx={{ color: 'common.black' }} />, path: '/calendar/addnew' },

            { key: 'nav.meetingCalendar', icon: <GroupsIcon sx={{ color: 'common.black' }} />, path: '/calendar/meeting' },


        ]
    }
];