import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactNode;
}
const baseUrl = import.meta.env.VITE_AUTH_URL;
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const callback = searchParams.get('callback');
    const isLogout = searchParams.get('logout');

    useEffect(() => {
        // Chỉ lưu token khi không phải đang đăng xuất và có token mới
        if (token && callback === 'processed' && !isLogout) {
            localStorage.setItem('token', token);
            // Xóa token và callback khỏi URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [token, callback, isLogout]);

    // Kiểm tra token trong localStorage
    const storedToken = localStorage.getItem('token');
    
    if (!storedToken) {
        if (!callback) {
            const loginUrl = baseUrl;
            window.location.href = loginUrl;
            return null;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute; 