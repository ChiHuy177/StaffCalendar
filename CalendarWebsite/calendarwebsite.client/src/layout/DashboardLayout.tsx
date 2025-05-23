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

const drawerWidth = 260;

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const {user} = useUser();
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation();
    const location = useLocation();
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

    

    const navigationItems = useMemo(
        () => navigationConfig.map((item: NavItemConfig) => ({
            ...item,
            text: t(item.key),
            isActive: location.pathname === item.path
        })),
        [t, location.pathname]
    );

    const toggleSidebar = () => {
        // console.log("toggleSidebar called, current state:", isSidebarOpen);
        setIsSidebarOpen(prev => !prev);
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    // Get breadcrumb items from path
    const getBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/')
            .filter(segment => segment !== '');

        // If we're at the home page, return only Home
        if (pathSegments.length === 0) {
            return [{ text: t('home'), icon: <HomeIcon fontSize="small" />, path: '/' }];
        }

        // Start with home
        const breadcrumbs = [{ text: t('home'), icon: <HomeIcon fontSize="small" />, path: '/' }];

        // Add additional path segments
        let currentPath = '';
        pathSegments.forEach(segment => {
            currentPath += `/${segment}`;
            const navItem = navigationItems.find(item => item.path === currentPath);

            breadcrumbs.push({
                text: navItem ? navItem.text : segment.charAt(0).toUpperCase() + segment.slice(1),
                path: currentPath,
                icon: navItem?.icon ? React.cloneElement(navItem.icon as React.ReactElement) : <HomeIcon fontSize="small" />
            });
        });

        return breadcrumbs;
    };

    const breadcrumbItems = getBreadcrumbs();

    return (
        <Box
            className={`flex min-h-screen transition-all duration-300 ${darkMode ? 'bg-slate-900' : 'bg-gray-50'}`}
            sx={{
                color: darkMode ? 'white' : 'inherit'
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
                        background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
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
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(13, 36, 99, 0.95)',
                    borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)'}`
                }}
            >
                <Toolbar className={`flex justify-between items-center w-full box-border ${darkMode ? 'bg-gradient-to-b from-[#1E293B] to-[#0F172A]' : 'bg-gradient-to-b from-[#0D2463] to-[#050E35]'} text-white`}>
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
                                        background: darkMode
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
                        <Tooltip title={darkMode ? t('lightMode') : t('darkMode')}>
                            <IconButton
                                onClick={toggleDarkMode}
                                color="inherit"
                                className="text-white transition-transform hover:scale-110"
                            >
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>

                        <LanguageSwitcherButton />

                        <Tooltip title={t('logout')}>
                            <LogoutButton />
                        </Tooltip>

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
                        background: darkMode
                            ? 'linear-gradient(to bottom, #1E293B, #0F172A)'
                            : 'linear-gradient(to bottom, #0D2463, #050E35)',
                        color: 'white',
                        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '4px 0 15px rgba(0, 0, 0, 0.2)',
                        zIndex: 1400,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
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
                    >
                        {/* Close button visible at the top for easy access */}
                        <Box className="flex justify-end p-2">
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
                        <Box className="flex justify-center items-center py-4 border-b border-gray-700">
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
                        <Box className="flex items-center p-4 border-b border-gray-700">
                            <Avatar
                                sx={{
                                    width: 48,
                                    height: 48,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    backgroundColor: darkMode ? '#60A5FA' : '#1E40AF',
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
                        <List className="py-4 flex-grow">
                            {navigationItems.map((item, index) => (
                                <motion.div
                                    key={index}
                                    whileHover={{ x: 6 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <ListItem
                                        component={Link}
                                        to={item.path}
                                        onClick={() => {
                                            // console.log("Clicked on menu item:", item.path);
                                            toggleSidebar();
                                        }}
                                        className={`mx-2 mb-1 rounded-lg transition-all duration-300 ${item.isActive
                                                ? `${darkMode ? 'bg-blue-800' : 'bg-blue-700'} bg-opacity-80 shadow-md`
                                                : `hover:${darkMode ? 'bg-slate-800' : 'bg-blue-900'} hover:bg-opacity-50`
                                            }`}
                                        sx={{
                                            py: 1.5,
                                            position: 'relative',
                                            '&::before': item.isActive ? {
                                                content: '""',
                                                position: 'absolute',
                                                left: -8,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 4,
                                                height: '60%',
                                                backgroundColor: darkMode ? '#60A5FA' : '#60A5FA',
                                                borderRadius: '0 4px 4px 0',
                                                transition: 'all 0.3s ease'
                                            } : {}
                                        }}
                                    >
                                        <ListItemIcon sx={{
                                            minWidth: 45,
                                            color: item.isActive ? '#fff' : 'rgba(255,255,255,0.7)',
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
                            ))}
                        </List>

                        {/* Footer */}
                        <Box p={2} className="text-center border-t border-gray-700 mt-auto">
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
                    backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.98)' : 'inherit'
                }}
            >
                <Toolbar /> {/* Spacer to push content below AppBar */}

                {/* Breadcrumbs */}
                <Paper
                    elevation={0}
                    className="mb-4 px-4 py-2 rounded-lg"
                    sx={{
                        backgroundColor: darkMode ? 'rgba(30, 41, 59, 0.5)' : 'white',
                        borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                        boxShadow: darkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
                    }}
                >
                    <Breadcrumbs
                        separator={<NavigateNextIcon fontSize="small" />}
                        aria-label="breadcrumb"
                        sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit' }}
                    >
                        {breadcrumbItems.map((item, index) => {
                            const isLast = index === breadcrumbItems.length - 1;
                            return isLast ? (
                                <Typography
                                    key={index}
                                    className="flex items-center"
                                    sx={{
                                        color: darkMode ? 'white' : 'primary.main',
                                        fontWeight: 'bold',
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
                                </Typography>
                            ) : (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className="flex items-center hover:underline"
                                    style={{
                                        color: darkMode ? 'rgba(255,255,255,0.7)' : 'inherit',
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
