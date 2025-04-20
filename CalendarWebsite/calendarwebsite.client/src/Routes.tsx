import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CalendarComponent from "./Pages/CalendarComponent";
import ExportCustomToolbar from "./Pages/CheckinTable";
import DashboardLayout from "./Pages/DashboardLayout";
import CheckInByDayTable from "./Pages/CheckInByDayTable";





const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { index: true, element: <CalendarComponent /> },
                { path: 'table', element: <ExportCustomToolbar /> },
                {path: 'checkinbyday', element: <CheckInByDayTable />},
            ],
        },
    ]
);

export function Routes() {
    return <RouterProvider router={router} />;
}