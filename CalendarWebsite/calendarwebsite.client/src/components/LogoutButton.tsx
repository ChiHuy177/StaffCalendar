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

            // Xóa tất cả cookie với các options phù hợp cho Safari
            const cookies = document.cookie.split(";");
            const cookieOptions = {
                expires: new Date(0).toUTCString(),
                path: '/',
                secure: true,
                sameSite: 'Lax' as const
            };

            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
                
                // Xóa cookie cho các domain khác nhau
                document.cookie = `${name}=; ${Object.entries(cookieOptions).map(([key, value]) => `${key}=${value}`).join('; ')}`;
                document.cookie = `${name}=; ${Object.entries({...cookieOptions, domain: 'localhost'}).map(([key, value]) => `${key}=${value}`).join('; ')}`;
                document.cookie = `${name}=; ${Object.entries({...cookieOptions, domain: '.vercel.app'}).map(([key, value]) => `${key}=${value}`).join('; ')}`;
                document.cookie = `${name}=; ${Object.entries({...cookieOptions, domain: '.onrender.com'}).map(([key, value]) => `${key}=${value}`).join('; ')}`;
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