import axios from 'axios';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Sử dụng biến môi trường cho URL đăng nhập
        const loginUrl = import.meta.env.VITE_AUTH_URL;
        window.location.href = loginUrl;
        return null;
    }

    // Thêm token vào header của axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return <>{children}</>;
};

export default ProtectedRoute; 