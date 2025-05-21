
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

    useEffect(() => {
        if (token && callback === 'processed') {
            localStorage.setItem('token', token);
            // Xóa token và callback khỏi URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [token, callback]);

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