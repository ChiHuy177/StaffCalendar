import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CalendarComponent from "./Pages/CalendarStaffPage";
import CheckinTablePage from "./Pages/CheckinTable";
import DashboardLayout from "./layout/DashboardLayout";
import CheckInByDayTable from "./Pages/CheckInByDayTable";
import CheckInTableByDepartment from "./Pages/CheckInTableByDepartment";





const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { index: true, element: <CalendarComponent /> },
                { path: 'table', element: <CheckinTablePage /> },
                {path: 'checkinbyday', element: <CheckInByDayTable />},
                {path: 'checkintablebydepartment', element: <CheckInTableByDepartment />},
            ],
        },
    ]
);

export function Routes() {
    return <RouterProvider router={router} />;
}