import { useMemo, useState, useEffect } from "react";
import {
    Avatar,
    IconButton,
    AppBar,
    Toolbar,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    useMediaQuery,
    useTheme,
    Tooltip,
    Container,
    Breadcrumbs,
    LinearProgress,
    Paper
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import HomeIcon from "@mui/icons-material/Home";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
// import LogoutIcon from '@mui/icons-material/Logout';
import { Link, Outlet, useLocation } from "react-router-dom";
import LanguageSwitcherButton from "../components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import { navigationConfig, NavItemConfig } from "../routing/navItem";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import LogoutButton from '../components/LogoutButton';
import { useUser } from "../contexts/AuthUserContext";
import { useThemeContext } from "../contexts/ThemeContext";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";

const drawerWidth = 260;
type NavItemWithState = NavItemConfig & {
    isActive?: boolean;
    text?: string;
    children?: NavItemWithState[];
}

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // const [darkMode, setDarkMode] = useState(false);
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});
    const { t } = useTranslation();
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useThemeContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Simulate page loading
    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, [location]);

    // Close sidebar on mobile when navigating to a new page
    useEffect(() => {
        // console.log("Navigation effect: path changed or mobile status changed");
        setIsSidebarOpen(false);
    }, [location.pathname, isMobile]);

    // Đảm bảo đóng menu khi nhấn ra ngoài trên thiết bị di động
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (isMobile && isSidebarOpen) {
                // Kiểm tra nếu click không phải trong Drawer và không phải nút menu
                const drawerElement = document.querySelector('.MuiDrawer-paper');
                const menuButton = document.querySelector('[aria-label="toggle drawer"]');

                if (drawerElement && menuButton) {
                    const target = event.target as Node;
                    if (!drawerElement.contains(target) && !menuButton.contains(target)) {
                        setIsSidebarOpen(false);
                    }
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside, { passive: true });

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isMobile, isSidebarOpen]);

    // Log mỗi khi isSidebarOpen thay đổi
    useEffect(() => {
        // console.log("isSidebarOpen changed to:", isSidebarOpen);
    }, [isSidebarOpen]);

    const handleToggleMenu = (key: string) => {
        setOpenMenus(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    function renderNavItems(items: NavItemWithState[], level = 0) {
        return items.map((item) => {
            const hasChildren = !!item.children && item.children.length > 0;
            const isOpen = openMenus[item.key] || false;

            return (
                <React.Fragment key={item.key}>
                    <motion.div
                        whileHover={{ x: 6 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        style={{ width: '100%' }}
                    >
                        <ListItem
                            component={hasChildren ? 'div' : Link}
                            to={hasChildren ? undefined : item.path}
                            onClick={() => {
                                if (hasChildren) {
                                    handleToggleMenu(item.key);
                                } else {
                                    toggleSidebar();
                                }
                            }}
                            className={`mx-2 mb-1 rounded-lg transition-all duration-300 ${item.isActive
                                ? `${isDarkMode ? 'bg-blue-800' : 'bg-blue-700'} bg-opacity-80 shadow-md`
                                : `hover:${isDarkMode ? 'bg-slate-800' : 'bg-blue-900'} hover:bg-opacity-50`
                                }`}
                            sx={{
                                py: 1.5,
                                pl: 2 + level * 2,
                                position: 'relative',
                                width: 'calc(100% - 16px)',
                                '&::before': item.isActive ? {
                                    content: '""',
                                    position: 'absolute',
                                    left: -8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 4,
                                    height: '60%',
                                    backgroundColor: isDarkMode ? '#60A5FA' : '#60A5FA',
                                    borderRadius: '0 4px 4px 0',
                                    transition: 'all 0.3s ease'
                                } : {}
                            }}
                        >
                            <ListItemIcon sx={{

                                minWidth: 45,
                                // color: item.isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                                color: '#ffff',
                                transition: 'all 0.3s ease'
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    sx: {
                                        fontWeight: item.isActive ? 600 : 400,
                                        fontSize: '0.95rem',
                                        transition: 'all 0.3s ease'
                                    }
                                }}
                            />
                            {hasChildren ? (isOpen ? <ExpandLess /> : <ExpandMore />) : null}
                        </ListItem>
                    </motion.div>
                    {hasChildren && (
                        <Collapse in={isOpen} timeout='auto' unmountOnExit>
                            <List component='div' disablePadding >
                                {renderNavItems(item.children!, level + 1)}
                            </List>
                        </Collapse>
                    )}
                </React.Fragment>
            )
        })
    }

    const navigationItems: NavItemWithState[] = useMemo(
        () => navigationConfig.map((item: NavItemConfig) => ({
            ...item,
            text: t(item.key),
            isActive: location.pathname === item.path,
            children: item.children ? item.children.map(child => ({
                ...child,
                text: t(child.key),
                isActive: location.pathname === child.path
            })) : undefined
        })),
        [t, location.pathname]
    );

    const toggleSidebar = () => {
        setIsSidebarOpen(prev => !prev);
    };


    // Get breadcrumb items from path
    const getBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/')
            .filter(segment => segment !== '');

        // If we're at the home page, return only Home
        if (pathSegments.length === 0) {
            return [{ text: t('home'), icon: <HomeIcon fontSize="small" sx={{ color: "text.primary !important" }} />, path: '/' }];
        }

        // Start with home
        const breadcrumbs = [{ text: t('home'), icon: <HomeIcon fontSize="small" sx={{ color: 'text.primary' }} />, path: '/' }];

        // Add additional path segments
        let currentPath = '';
        pathSegments.forEach(segment => {
            currentPath += `/${segment}`;
            const navItem = navigationItems.find(item => item.path === currentPath);

            breadcrumbs.push({
                text: navItem?.text ?? segment.charAt(0).toUpperCase() + segment.slice(1),
                path: currentPath,
                icon: navItem?.icon ? React.cloneElement(navItem.icon as React.ReactElement) : <HomeIcon fontSize="small" sx={{ color: 'text.primary' }} />
            });
        });

        return breadcrumbs;
    };

    const breadcrumbItems = getBreadcrumbs();

    return (
        <Box
            className={`flex min-h-screen transition-all duration-300 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
            sx={{
                color: isDarkMode ? 'white' : 'black'
            }}
        >
            {/* Top Loading Bar */}
            {loading && (
                <LinearProgress
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        height: 3,
                        background: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                    }}
                />
            )}

            {/* AppBar */}
            <AppBar
                position="fixed"
                elevation={0}
                className="z-[1000]"
                sx={{
                    backdropFilter: 'blur(10px)',
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(13, 36, 99, 0.95)',
                    borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`
                }}
            >
                <Toolbar className={`flex justify-between items-center w-full box-border ${isDarkMode ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A]' : 'bg-gradient-to-b from-[#0D2463] to-[#050E35]'} text-white`}>
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <button
                            onClick={toggleSidebar}
                            className="p-2 mr-2 rounded-full hover:bg-blue-800 focus:outline-none"
                            style={{ zIndex: 2000 }}
                        >
                            <MenuIcon style={{ color: 'white' }} />
                        </button>

                        <Link to="/" className="flex items-center">
                            <motion.img
                                src={t('logo')}
                                alt="Logo"
                                className="max-w-full max-h-12 ml-5 p-[5px]"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            />
                            {!isMobile && (
                                <Typography
                                    variant="h6"
                                    component="div"
                                    sx={{
                                        ml: 2,
                                        fontWeight: 'bold',
                                        background: isDarkMode
                                            ? 'linear-gradient(to right, #fff, #94a3b8)'
                                            : 'linear-gradient(to right, #fff, #b8c7ff)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    Staff Calendar
                                </Typography>
                            )}
                        </Link>
                    </div>

                    {/* Icon and Avatar */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Dark Mode Toggle */}
                        <Tooltip title={isDarkMode ? t('lightMode') : t('darkMode')}>
                            <IconButton
                                onClick={toggleTheme}
                                color="inherit"
                                className="text-white transition-transform hover:scale-110"
                            >
                                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>

                        <LanguageSwitcherButton />

                        <LogoutButton title={t('logout')} />

                        <Tooltip title={t('profile')}>
                            <IconButton className="p-0 transition-transform hover:scale-110">
                                <Avatar
                                    alt="User Profile"
                                    src="/static/images/avatar/1.jpg"
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        border: '2px solid rgba(255,255,255,0.2)',
                                        boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                    </div>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer
                variant="temporary"
                anchor="left"
                open={isSidebarOpen}
                onClose={toggleSidebar}
                ModalProps={{
                    keepMounted: true,
                }}
                className="mobile-drawer"
                PaperProps={{
                    className: "mobile-drawer-paper",
                    sx: {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        background: isDarkMode
                            ? 'linear-gradient(to bottom, #1E293B, #0F172A)'
                            : 'linear-gradient(to bottom, #0D2463, #050E35)',
                        color: 'white',
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)',
                        zIndex: 1400,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        overflowX: 'hidden'
                    }
                }}
            >
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col h-full"
                        style={{
                            height: '100vh',
                            width: '100%',
                            overflowX: 'hidden'
                        }}
                    >
                        {/* Close button visible at the top for easy access */}
                        <Box className="flex justify-end p-2 flex-shrink-0" sx={{ width: '100%' }}>
                            <IconButton
                                onClick={toggleSidebar}
                                color="inherit"
                                size="medium"
                                style={{
                                    color: 'white',
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    zIndex: 1500
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {/* Logo section */}
                        <Box className="flex justify-center items-center py-4 border-b border-gray-700 flex-shrink-0">
                            <motion.img
                                src={t('logo')}
                                alt="Logo"
                                className="max-w-full max-h-16"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            />
                        </Box>

                        {/* User section */}
                        <Box className="flex items-center p-4 border-b border-gray-700 flex-shrink-0">
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    backgroundColor: isDarkMode ? '#60A5FA' : '#1E40AF',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <AccountCircleIcon />
                            </Avatar>
                            <Box ml={2}>
                                <Typography variant="subtitle1" className="font-medium">{user === null ? "Undefined user" : user.fullName}</Typography>
                                <Typography variant="body2" className="text-gray-300">{user === null ? "Undefined email" : user.email}</Typography>
                            </Box>
                        </Box>

                        {/* Navigation Items */}
                        <List
                            className="py-4 flex-1 overflow-y-auto hide-scrollbar"
                            style={{
                                minHeight: 0,
                                width: '100%',
                                overflowX: 'hidden'
                            }}
                        >
                            {/* {navigationItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ x: 6 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                    style={{ width: '100%' }}
                                >
                                    <ListItem
                                        component={Link}
                                        to={item.path}
                                        onClick={() => {
                                            toggleSidebar();
                                        }}
                                        className={`mx-2 mb-1 rounded-lg transition-all duration-300 ${item.isActive
                                            ? `${isDarkMode ? 'bg-blue-800' : 'bg-blue-700'} bg-opacity-80 shadow-md`
                                            : `hover:${isDarkMode ? 'bg-slate-800' : 'bg-blue-900'} hover:bg-opacity-50`
                                            }`}
                                        sx={{
                                            py: 1.5,
                                            position: 'relative',
                                            width: 'calc(100% - 16px)',
                                            '&::before': item.isActive ? {
                                                content: '""',
                                                position: 'absolute',
                                                left: -8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 4,
                                                height: '60%',
                                                backgroundColor: isDarkMode ? '#60A5FA' : '#60A5FA',
                                                borderRadius: '0 4px 4px 0',
                                                transition: 'all 0.3s ease'
                                            } : {}
                                        }}
                                    >
                                        <ListItemIcon sx={{

                                            minWidth: 45,
                                            // color: item.isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                                            color: '#ffff',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{
                                                sx: {
                                                    fontWeight: item.isActive ? 600 : 400,
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.3s ease'
                                                }
                                            }}
                                        />
                                    </ListItem>
                                </motion.div>
                            ))} */}
                            {renderNavItems(navigationItems)}
                        </List>

                        {/* Footer */}
                        <Box p={2} className="text-center border-t border-gray-700 flex-shrink-0">
                            <Typography variant="caption" display="block" className="text-gray-400">
                                © 2024 Staff Calendar
                            </Typography>
                            <Typography variant="caption" display="block" className="text-gray-400">
                                Version 1.0.0
                            </Typography>
                        </Box>
                    </motion.div>
                </AnimatePresence>
            </Drawer>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: '100%',
                    transition: theme.transitions.create(['margin', 'width', 'background-color'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                    marginLeft: 0,
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.98)' : 'inherit'
                }}
            >
                <Toolbar /> {/* Spacer to push content below AppBar */}

                {/* Breadcrumbs */}
                <Paper
                    elevation={0}
                    className="mb-4 px-4 py-2 rounded-lg"
                    sx={{
                        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : 'white',
                        borderBottom: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                        boxShadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="breadcrumb"
                        sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'inherit' }}
                    >
                        {breadcrumbItems.map((item, index) => {
                            const isLast = index === breadcrumbItems.length - 1;
                            return isLast ? (
                                <Typography
                                    key={index}
                                    className="flex items-center"
                                    sx={{
                                        color: 'text.primary',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {item.icon && (
                                        <Box component="span"
                                            sx={{
                                                mr: 0.5,
                                                display: 'flex',
                                                alignItems: 'center',
                                                color: "common.black"

                                            }}>
                                            {item.icon}
                                        </Box>
                                    )}
                                    {item.text}
                                </Typography>
                            ) : (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="flex items-center hover:underline"
                                    style={{
                                        color: 'common.black',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {item.icon && (
                                        <Box component="span" sx={{ mr: 0.5, display: 'flex', alignItems: 'center' }}>
                                            {item.icon}
                                        </Box>
                                    )}
                                    {item.text}
                                </Link>
                            );
                        })}
                    </Breadcrumbs>
                </Paper>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    // color="text.primary"
                    >
                        <Container
                            maxWidth="xl"
                            sx={{
                                mt: 2,
                                backgroundColor: 'transparent'
                            }}
                        >
                            <Outlet />
                        </Container>
                    </motion.div>
                </AnimatePresence>
            </Box>
        </Box>
    );
}
