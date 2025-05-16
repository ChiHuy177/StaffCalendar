import CalendarMonthTwoToneIcon from "@mui/icons-material/CalendarMonthTwoTone";
import BackupTableIcon from "@mui/icons-material/BackupTable";
import CalendarViewMonthRoundedIcon from '@mui/icons-material/CalendarViewMonthRounded';
import ScheduleIcon from '@mui/icons-material/Schedule';

export type NavItemConfig = {
    key: string;           
    icon: React.ReactNode;
    path: string;
};

export const navigationConfig: NavItemConfig[] = [
    
    { key: 'nav.home', icon: <CalendarMonthTwoToneIcon className="text-amber-50" />, path: '/' },
    { key: 'nav.staffTable', icon: <BackupTableIcon className="text-amber-50" />, path: '/table' },
    { key: 'nav.byDay', icon: <CalendarViewMonthRoundedIcon className="text-amber-50" />, path: '/checkinbyday' },
    { key: 'nav.byDept', icon: <CalendarViewMonthRoundedIcon className="text-amber-50" />, path: '/checkintablebydepartment' },
    { key: 'nav.customWorkWeek', icon: <ScheduleIcon className="text-amber-50" />, path: '/customworkweek' },
  ];