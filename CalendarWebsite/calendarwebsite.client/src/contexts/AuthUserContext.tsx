import { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, UserInfo } from "../utils/type";
import axios from "axios";
import { getAllUserName } from "../apis/CheckinDataApi";

interface AuthUserContextType {
    user: AuthUser | null;
    nameOfUsers: UserInfo[];
    loadingUsername: boolean;
    loading: boolean;
    error: string | null;
}

const UserContext = createContext<AuthUserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [nameOfUsers, setNameOfUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingUsername, setLoadingUsername] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const baseUrl = import.meta.env.VITE_API_URL;

                const token = localStorage.getItem('token');

                if (!token) {
                    window.location.href = import.meta.env.VITE_AUTH_URL;
                    alert('Không có token ' + token)
                    return;
                }

                const apiUrl = baseUrl + "api/auth/user";
                const userFromLocalStorageData = localStorage.getItem("user");
                if (!userFromLocalStorageData || userFromLocalStorageData === "null") {
                    try {
                        const response = await axios.get(apiUrl, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            withCredentials: true
                        });
                        console.log("response User: ", JSON.stringify(response.data));
                        localStorage.setItem("user", JSON.stringify(response.data));
                        alert(JSON.stringify(response.data));
                        if (!response.data) {
                            setUser(null);
                            throw new Error('Fail to get auth user');
                        };
                        console.log("response User data: ", response.data);
                        const authUserData = getUserFromLocalStorage();
                        setUser(authUserData);
                        
                        return;
                    } catch (err) {
                        console.error("Error:", err);
                    }
                } else {
                    const authUserData = getUserFromLocalStorage();
                    setUser(authUserData);
                }
            }
            catch (err) {
                console.error("Chi tiết lỗi:", err);
                if (axios.isAxiosError(err)) {
                    console.error("Response data:", err.response?.data);
                    console.error("Response status:", err.response?.status);
                    console.error("Response headers:", err.response?.headers);
                    console.error("Request config:", err.config);

                    if (err.response?.status === 401) {
                        const baseUrl = import.meta.env.VITE_AUTH_URL;
                        window.location.href = baseUrl;
                        return;
                    }
                }
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
        async function fetchNameOfUsers() {
            try {
                const userNameData = await getAllUserName();
                userNameData.push({
                    emailAndName: "huync@becawifi.vn - Nguyễn Chí Huy",
                    personalProfileId: '-1',
                })
                setNameOfUsers(userNameData);
                setLoadingUsername(false);
            }
            catch (err) {
                console.error('Error fetching usernames:', err);
                setLoadingUsername(false);
            }

        }
        fetchNameOfUsers();
    }, []);

    return (
        <UserContext.Provider value={{ user, nameOfUsers, loadingUsername, loading, error }}>
            {children}
        </UserContext.Provider>
    )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider")
    }
    return context;
}

function getUserFromLocalStorage() {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
        return null;
    }
    try {
        const userData = JSON.parse(userJson) as AuthUser;
        return userData;
    } catch (err) {
        console.error("Error parsing user data from localStorage:", err);
        return null;
    }
}
