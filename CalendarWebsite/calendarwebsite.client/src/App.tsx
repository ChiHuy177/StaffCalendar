
import './App.css';
import { ToastContainer, Bounce } from 'react-toastify';
// import DashboardLayout from './Pages/DashboardLayout';
import { Routes } from './routing/Routes';

import './i18n';
import { UserProvider } from './contexts/AuthUserContext';


function App() {

    return (
        <div>
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

        </div>

    );


}

export default App;