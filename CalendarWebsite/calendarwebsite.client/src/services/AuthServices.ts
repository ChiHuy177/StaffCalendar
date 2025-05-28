import axios from "axios";
import { AuthUser } from "../utils/type";

export class AuthService {
    static getTokenFromUrl(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const callback = urlParams.get('callback');

        if (token && callback === 'processed') {
            localStorage.setItem('token', token);
            alert("Đang lưu token");
            alert("Token được lưu: " + token);
            window.history.replaceState({}, document.title, window.location.pathname);
            return token;
        }

        return null;
    }

    static getStoredToken(): string | null {
        return localStorage.getItem('token');
    }

    static async getCurrentUser(): Promise<AuthUser | null> {
        const token = this.getStoredToken();
        alert("token ở getCurrentUser: " + token);
        if (!token) {
            return null;
        }

        const baseUrl = import.meta.env.VITE_API_URL;
        try {
            alert("lấy user từ api với token là:" + token);
            const response = await axios.get(baseUrl + "api/auth/user", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    "Accept": 'application/json'
                },
                withCredentials: true
            });
            alert("lấy user từ api thành công + " + JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error("Error fetching user:", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                this.redirectToLogin();
            }
            alert("Lỗi khi lấy user từ api: " + error );
            return null;
            
        }
    }

    static redirectToLogin() {
        window.location.href = import.meta.env.VITE_AUTH_URL;
    }
}