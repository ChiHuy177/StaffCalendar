import { useUser } from '../contexts/AuthUserContext';
import { AuthService } from '../services/authService';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const {user} = useUser();

    if (!user) {
        const token = AuthService.getStoredToken();
        if (!token) {
            AuthService.redirectToLogin();
            return null;
        }
    }
    return <>{children}</>;
};

export default ProtectedRoute; 