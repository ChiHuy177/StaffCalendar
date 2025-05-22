import { IconButton } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import axios from 'axios';
import { getApiUrl } from '../config/api';

const LogoutButton = () => {
    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Xóa token và redirect ngay lập tức
            localStorage.removeItem('token');
            window.location.href = '/';

            // Xử lý cleanup ở background
            if (token) {
                try {
                    await axios.get(getApiUrl('/api/auth/logout'), {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        withCredentials: true
                    });
                } catch (error) {
                    console.error('Lỗi khi cleanup:', error);
                }
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