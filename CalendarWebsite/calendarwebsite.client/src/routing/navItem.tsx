import CalendarMonthTwoToneIcon from "@mui/icons-material/CalendarMonthTwoTone";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import CalendarViewMonthRoundedIcon from '@mui/icons-material/CalendarViewMonthRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import GroupsIcon from '@mui/icons-material/Groups';


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
            { key: 'nav.staffCalendar', icon: <PersonIcon sx={{ color: 'common.black' }} />, path: '/calendar/staff' },
            {key: 'nav.meetingCalendar', icon: <GroupsIcon sx={{ color: 'common.black' }} />, path: '/calendar/meeting'},
            { key: 'nav.companyCalendar', icon: <BusinessIcon sx={{ color: 'common.black' }} />, path: '/calendar/company' },
            {key: 'nav.vehicleCalendar', icon: <LocalTaxiIcon sx={{ color: 'common.black' }} />, path: '/calendar/vehicle'},
            
        ]
    }
];