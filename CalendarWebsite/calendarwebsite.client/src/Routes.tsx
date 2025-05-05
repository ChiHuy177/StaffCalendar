import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CalendarComponent from "./Pages/CalendarStaffPage";
import ExportCustomToolbar from "./Pages/CheckinTable";
import DashboardLayout from "./Pages/DashboardLayout";
import CheckInByDayTable from "./Pages/CheckInByDayTable";
import CheckInTableByDepartment from "./Pages/CheckInTableByDepartment";





const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { index: true, element: <CalendarComponent /> },
                { path: 'table', element: <ExportCustomToolbar /> },
                {path: 'checkinbyday', element: <CheckInByDayTable />},
                {path: 'checkintablebydepartment', element: <CheckInTableByDepartment />},
            ],
        },
    ]
);

export function Routes() {
    return <RouterProvider router={router} />;
}