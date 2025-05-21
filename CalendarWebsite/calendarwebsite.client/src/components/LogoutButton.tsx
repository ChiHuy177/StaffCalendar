import { IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const LogoutButton = () => {
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/';
                return;
            }

            // Xóa dữ liệu local trước
            localStorage.removeItem('token');
            sessionStorage.clear();

            // Xóa tất cả cookie
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost";
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.vercel.app";
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.onrender.com";
            }

            // Gọi API logout
            const response = await axios.get(getApiUrl('/api/auth/logout'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            // Chuyển hướng đến trang đăng xuất của Identity Server
            if (response.data && response.data.logoutUrl) {
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