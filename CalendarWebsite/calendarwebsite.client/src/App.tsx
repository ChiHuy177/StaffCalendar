import './App.css';
import { ToastContainer, Bounce } from 'react-toastify';
// import DashboardLayout from './Pages/DashboardLayout';
import { Routes } from './routing/Routes';

import './i18n';
import { UserProvider } from './contexts/AuthUserContext';
import { TokenInitializer } from './components/TokenInitializer';
import { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoadingProvider } from './contexts/LoadingContext';

function App() {
    const [tokenInitialized, setTokenInitialized] = useState(false);

    useEffect(() => {
        localStorage.setItem('language', 'vi');
    })

    return (
        <div>
            <ThemeProvider>
                <LoadingProvider>
                    <TokenInitializer onComplete={() => setTokenInitialized(true)} />
                    {tokenInitialized && (
                        <UserProvider>
                            <Routes />
                            <ToastContainer
                                position="top-center"
                                autoClose={5000}
                                hideProgressBar={false}
                                newestOnTop={false}
                                closeOnClick={false}
                                rtl={false}
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme="light"
                                transition={Bounce}
                            />
                        </UserProvider>
                    )}
                </LoadingProvider>
            </ThemeProvider>
        </div>
    );
}

export default App;