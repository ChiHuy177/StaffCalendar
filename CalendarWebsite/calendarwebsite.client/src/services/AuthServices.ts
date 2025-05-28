import axios from "axios";
import { AuthUser } from "../utils/type";

export class AuthService {
    static getTokenFromUrl(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const callback = urlParams.get('callback');

        if (token && callback === 'processed') {
            localStorage.setItem('token', token);
            // alert("Đang lưu token");
            // alert("Token được lưu: " + token);
            window.history.replaceState({}, document.title, window.location.pathname);
            return token;
        }

        return null;
    }

    static getStoredToken(): string | null {
        return localStorage.getItem('token');
    }

    static async getCurrentUser(): Promise<AuthUser | null> {
        // Kiểm tra iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as Record<string, unknown>).MSStream;
        
        if (isIOS) {
            return this.getIOSUserData();
        } else {
            return this.getNormalUserData();
        }
    }

    static async getIOSUserData(): Promise<AuthUser | null> {
        try {
            // Kiểm tra cache trước
            const cachedUser = localStorage.getItem("user");
            if (cachedUser) {
                return JSON.parse(cachedUser);
            }
            
            // Nếu không có cache, tạo dữ liệu giả với thông tin tối thiểu từ token
            const token = this.getStoredToken();
            if (!token) {
                return null;
            }
            
            // Phân tích JWT token (không cần gọi API)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                return null;
            }
            
            try {
                // Giải mã phần payload của JWT
                const base64Url = tokenParts[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const payload = JSON.parse(atob(base64));
                
                // Tạo user từ thông tin trong token
                const user: AuthUser = {
                    id: payload.sub || payload.nameid || '',
                    fullName: payload.name || 'iOS User',
                    email: payload.email || payload.preferred_username || ''
                };
                
                localStorage.setItem("user", JSON.stringify(user));
                return user;
            } catch (e) {
                console.error("Error parsing JWT token:", e);
                alert("Error parsing JWT token: " + e);
                return null;
            }
        } catch (error) {
            console.error("iOS specific error:", error);
            alert("iOS specific error: " + error);
            return null;
        }
    }

    static async getNormalUserData(): Promise<AuthUser | null> {
        const token = this.getStoredToken();
        alert("token ở getNormalUserData: " + token);
        if (!token) {
            return null;
        }

        const baseUrl = import.meta.env.VITE_API_URL;
        try {
            alert("lấy user từ api với token là:" + token + " và baseUrl là: " + baseUrl+ "api/auth/user");
            const response = await axios.get(baseUrl + "api/auth/user", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    "Accept": 'application/json'
                },
                // withCredentials: true
                timeout: 10000
            });
            alert("lấy user từ api thành công + " + JSON.stringify(response.data));
            
            // Lưu vào cache
            localStorage.setItem("user", JSON.stringify(response.data));
            
            return response.data;
        } catch (error) {
            console.error("Error fetching user:", error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                this.redirectToLogin();
            }

            if (axios.isAxiosError(error)) {
                alert("Error type: " + error.name +
                    "\nMessage: " + error.message +
                    "\nStatus: " + (error.response?.status || 'N/A') +
                    "\nURL: " + baseUrl + "api/auth/user");
            }
            return null;
        }
    }

    static redirectToLogin() {
        window.location.href = import.meta.env.VITE_AUTH_URL;
    }

    static async checkConnection(): Promise<boolean> {
        try {
            const baseUrl = import.meta.env.VITE_API_URL;
            await axios.get(baseUrl + "api/auth/public");
            return true;
        } catch (error) {
            console.error("Lỗi khi kiểm tra kết nối: " + error);
            return false;
        }
    }
}