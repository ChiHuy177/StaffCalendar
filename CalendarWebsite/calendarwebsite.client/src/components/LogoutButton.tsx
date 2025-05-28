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
            const response = await axios.get(getApiUrl('/api/auth/logout'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });
            
            // Xóa tất cả dữ liệu trong localStorage và redirect ngay lập tức với tham số logout
            localStorage.clear();
            alert("Đã xóa tất cả dữ liệu trong localStorage");

            if (response.data && response.data.logoutUrl) {
                window.location.href = response.data.logoutUrl;
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            localStorage.clear();
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