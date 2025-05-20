import axios from 'axios';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Kiểm tra token trong localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Luôn sử dụng localhost cho authentication
        const loginUrl = 'https://localhost:44356/api/auth/login';
        window.location.href = loginUrl;
        return null;
    }

    // Thêm token vào header của axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return <>{children}</>;
};

export default ProtectedRoute; 