import axios from "axios";
import { AuthUser } from "../utils/type";

export class AuthService {
    static getTokenFromUrl(): string | null {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const callback = urlParams.get('callback');

        if (token && callback === 'processed') {
            localStorage.setItem('token', token);

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
            return this.getIOSUserFromAPI();
        } else {
            return this.getNormalUserData();
        }
    }

    static async getIOSUserFromAPI(): Promise<AuthUser | null> {
        try {
            // Kiểm tra cache trước
            const cachedUser = localStorage.getItem("user");
            if (cachedUser) {
                // alert('Lấy từ localstorage + ' + cachedUser);
                return JSON.parse(cachedUser);
            }

            const token = this.getStoredToken();
            if (!token) {
                return null;
            }

            // Sử dụng endpoint đặc biệt cho iOS
            const baseUrl = import.meta.env.VITE_API_URL;
            const apiUrl = baseUrl.endsWith('/')
                ? `${baseUrl}api/auth/ios-user?token=${encodeURIComponent(token)}`
                : `${baseUrl}/api/auth/ios-user?token=${encodeURIComponent(token)}`;

            console.log("iOS: Đang gọi API đặc biệt:", apiUrl);
            // alert("iOS: Đang gọi API đặc biệt:" + apiUrl);

            try {
                const response = await fetch(apiUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    // const errorText = await response.text();
                    // alert(`HTTP error! Status: ${response.status}, Details: ${errorText}`);
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                // alert("iOS: Lấy dữ liệu thành công: " + JSON.stringify(data));
                localStorage.setItem("user", JSON.stringify(data));
                return data;
            } catch (fetchError) {
                // alert("iOS API fetch error: " + fetchError);
                console.error("iOS API fetch error:", fetchError);
                throw fetchError;
            }
        } catch (error) {
            console.error("iOS API error:", error);
            // alert("iOS API error: " + error);

            // Nếu lỗi, thử giải mã token
            return this.getIOSUserData();
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
                // alert("Error parsing JWT token: " + e);
                return null;
            }
        } catch (error) {
            console.error("iOS specific error:", error);
            // alert("iOS specific error: " + error);
            return null;
        }
    }

    static async getNormalUserData(): Promise<AuthUser | null> {
        const token = this.getStoredToken();
        // alert("token ở getCurrentUser: " + token);
        if (!token) {
            return null;
        }
        const connected = await this.checkConnection();

        if (!connected) {
            // alert("Không thể kết nối đến server");
            return null;
        }
        const baseUrl = import.meta.env.VITE_API_URL;
        try {
            // alert("lấy user từ api với token là:" + token + " và baseUrl là: " + baseUrl + "api/auth/user");
            const response = await axios.get(baseUrl + "api/auth/user", {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    "Accept": 'application/json',
                    'Cache-Control': 'no-cache'
                },
                withCredentials: true,
                timeout: 10000,
                validateStatus: function (status) {
                    return status >= 200 && status < 500;
                }
            });
            console.log("response.data: " + JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            console.error("Error fetching user:", error);
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    this.redirectToLogin();
                } else {
                    // Log chi tiết lỗi để debug
                    console.error("Axios error details:", {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        config: {
                            url: error.config?.url,
                            method: error.config?.method,
                            headers: error.config?.headers
                        }
                    });
                }
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

    static async getUserInfoFromIdentityServer(token: string) {
        try {
            const response = await axios('https://identity.vntts.vn/connect/userinfo', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            const data = response.data;
            return data;
        } catch (error) {
            console.error("Error fetching user info from IdentityServer:", error);
            return null;
        }
    }
}