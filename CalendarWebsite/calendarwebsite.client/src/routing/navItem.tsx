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
    
    { key: 'nav.home', icon: <CalendarMonthTwoToneIcon sx={{color:'common.black'}} />, path: '/' },
    { key: 'nav.staffTable', icon: <BackupTableIcon sx={{color:'common.black'}} />, path: '/table' },
    { key: 'nav.byDay', icon: <CalendarViewMonthRoundedIcon sx={{color:'common.black'}} />, path: '/checkinbyday' },
    { key: 'nav.byDept', icon: <CalendarViewMonthRoundedIcon sx={{color:'common.black'}} />, path: '/checkintablebydepartment' },
    { key: 'nav.customWorkWeek', icon: <ScheduleIcon sx={{color:'common.black'}} />, path: '/customworkweek' },
  ];