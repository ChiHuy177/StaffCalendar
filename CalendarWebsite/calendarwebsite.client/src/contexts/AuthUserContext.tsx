
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
                const baseUrl = import.meta.env.VITE_API_URL
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = import.meta.env.VITE_AUTH_URL;
                    return;
                }
                const response = await axios.get(baseUrl + "api/auth/user", {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        "Content-Type": 'application/json'
                    },
                    withCredentials: true
                })
                if (!response.data) {
                    setUser(null);
                    throw new Error('Fail to get auth user');
                }

                const authUserData = response.data;
                setUser(authUserData);
            }
            catch (err) {
                if (axios.isAxiosError(err) && err.response?.status === 401) {
                    const baseUrl = import.meta.env.VITE_AUTH_URL;
                    window.location.href = baseUrl;
                    return;
                }
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
        async function fetchNameOfUsers() {
            try{
                const userNameData = await getAllUserName();
                userNameData.push({
                    emailAndName: "huync@becawifi.vn - Nguyễn Chí Huy",
                    personalProfileId: '-1',
                })
                setNameOfUsers(userNameData);
                setLoadingUsername(false);
            }
            catch(err){
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
