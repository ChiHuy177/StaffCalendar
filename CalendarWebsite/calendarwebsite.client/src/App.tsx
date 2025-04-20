
import './App.css';
import { ToastContainer, Bounce } from 'react-toastify';
// import DashboardLayout from './Pages/DashboardLayout';
import { Routes } from './Routes';



function App() {

    return (
        <div>
            <Routes/>

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
        </div>

    );


}

export default App;