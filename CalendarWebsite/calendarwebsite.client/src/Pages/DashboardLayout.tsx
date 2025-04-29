import { useMemo, useState } from "react";
import { Avatar, IconButton, AppBar, Toolbar, Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, Outlet } from "react-router-dom";
import LanguageSwitcherButton from "../components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import { navigationConfig, NavItemConfig } from "../interfaces/navItem";

const drawerWidth = 240;

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { t } = useTranslation();
    const navigationItems = useMemo(
        () => navigationConfig.map((item: NavItemConfig) => ({
            ...item,
            text: t(item.key),
        })),
        [t]
    );
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    return (
        <div className="flex">
            {/* AppBar */}
            <AppBar position="fixed" className="z-[1000] " >
                <Toolbar className="flex justify-between items-center w-full box-border bg-gradient-to-b from-[#0D2463] to-[#050E35] text-white">
                    {/* Logo Section */}
                    <div className="flex items-center">
                        <IconButton
                            className="mr-[5px]"
                            color="inherit"
                            aria-label="open drawer"
                            edge="end"
                            onClick={toggleSidebar}>
                            <MenuIcon />
                        </IconButton>
                        <img src={t('logo')} alt="Logo" className="max-w-full max-h-12 ml-5 p-[5px]" onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")} />

                    </div>


                    {/* Icon and Avatar */}
                    <div className="flex items-center space-x-4">
                        <LanguageSwitcherButton />

                        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
                    </div>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Drawer
                variant="temporary"
                open={isSidebarOpen}
                onClose={toggleSidebar}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        background: "linear-gradient(to bottom, #0D2463, #050E35)", // Gradient màu
                        color: "white",
                    },
                }}>
                {/* Add Toolbar to push content below AppBar */}
                {/* <Toolbar /> */}

                <div className="flex justify-center items-center py-4 border-b border-gray-700">

                    <img src={t('logo')} alt="Logo" className="max-w-full max-h-16" />
                </div>


                {/* Navigation Items */}
                <List>
                    {navigationItems.map((item, index) => (
                        <ListItem
                            key={index}
                            component={Link}
                            to={item.path}
                            onClick={toggleSidebar}
                            className="flex items-center px-4 py-2 rounded-lg transition duration-300 hover:bg-blue-700 hover:text-white"
                        >
                            <ListItemIcon className="text-white">{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Main Content */}
            <main
                className={`flex-grow p-3 transition-all duration-300 ${isSidebarOpen ? "ml-[240px]" : "ml-0"
                    }`}
            >
                <Toolbar />
                <Outlet />
            </main>
        </div>
    );
}
