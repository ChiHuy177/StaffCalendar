import { IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

import axios from 'axios';

const LogoutButton = () => {


    const handleLogout = async () => {
        try {
            // Xóa token và dữ liệu local trước
            localStorage.clear();
            sessionStorage.clear();

            // Xóa tất cả cookie
            document.cookie.split(";").forEach(function (c) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.vercel.app");
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=.onrender.com");
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });

            // Gọi API logout
            const response = await axios.get('https://staffcalendarserver-may.onrender.com/api/auth/logout', {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.data && response.data.logoutUrl) {
                // Chuyển hướng đến trang logout của Identity Server
                window.location.href = response.data.logoutUrl;
            } else {
                window.location.href = '/';
            }

        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            // Vẫn xóa token và chuyển hướng về trang chủ nếu có lỗi
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