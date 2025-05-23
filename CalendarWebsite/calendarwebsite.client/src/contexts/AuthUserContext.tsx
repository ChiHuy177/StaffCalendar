
import { createContext, useContext, useEffect, useState } from "react";
import { AuthUser } from "../utils/type";
import axios from "axios";

interface AuthUserContextType {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
}

const UserContext = createContext<AuthUserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
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
    }, []);

    return (
        <UserContext.Provider value={{ user, loading, error }}>
            {children}
        </UserContext.Provider>
    )
}
export function useUser(){
    const context = useContext(UserContext);
    if(context === undefined){
        throw new Error("useUser must be used within a UserProvider")
    }
    return context;
}
