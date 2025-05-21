import { IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import axios from 'axios';

const LogoutButton = () => {


    const handleLogout = async () => {
        try {
            const response = await axios.get('https://localhost:44356/api/auth/logout', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            localStorage.clear();
            sessionStorage.clear();

            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            if (response.data && response.data.logoutUrl) {
                window.location.href = response.data.logoutUrl;
            } else {
                window.location.href = '/';
            }

        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    };

    return (
        <IconButton
            onClick={handleLogout}
            color="inherit"
            className="text-white transition-transform hover:scale-110"
        >
            <LogoutIcon />
        </IconButton>
    );
};

export default LogoutButton; 