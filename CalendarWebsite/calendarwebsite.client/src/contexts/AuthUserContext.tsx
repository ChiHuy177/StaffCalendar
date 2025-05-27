import { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, UserInfo } from "../utils/type";
// import axios from "axios";
import { getAllUserName } from "../apis/CheckinDataApi";
import { AuthService } from "../services/AuthServices";

interface AuthUserContextType {
    user: AuthUser | null;
    nameOfUsers: UserInfo[];
    loadingUsername: boolean;
    loading: boolean;
    error: string | null;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<AuthUserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [nameOfUsers, setNameOfUsers] = useState<UserInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingUsername, setLoadingUsername] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    async function fetchUser() {
        try {
            const userFromStorage = localStorage.getItem("user");
            if (userFromStorage && userFromStorage !== "null") {
                setUser(JSON.parse(userFromStorage));
                setLoading(false);
                return;
            }

            const userData = await AuthService.getCurrentUser();
            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }
    
    useEffect(() => {
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

    const refreshUser = async () => {
        setLoading(true);
        await fetchUser();
    }

    return (
        <UserContext.Provider value={{ user, nameOfUsers, loadingUsername, loading, error, refreshUser }}>
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

// function getUserFromLocalStorage() {
//     const userJson = localStorage.getItem("user");
//     if (!userJson) {
//         return null;
//     }
//     try {
//         const userData = JSON.parse(userJson) as AuthUser;
//         return userData;
//     } catch (err) {
//         console.error("Error parsing user data from localStorage:", err);
//         return null;
//     }
// }
