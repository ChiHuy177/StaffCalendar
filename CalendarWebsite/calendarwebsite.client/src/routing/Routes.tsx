import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CalendarComponent from "../Pages/CalendarStaffPage";
import CheckinTablePage from "../Pages/CheckinTable";
import DashboardLayout from "../layout/DashboardLayout";
import CheckInByDayTable from "../Pages/CheckInByDayTable";
import CheckInTableByDepartment from "../Pages/CheckInTableByDepartment";
import CustomWorkWeek from "../Pages/CustomWorkWeek";
import ProtectedRoute from "../components/ProtectedRoute";
import MeetingCalendarComponent from "../Pages/Calendar/meeting/MeetingCalendarPage";
import AddNewEvent from "../Pages/Calendar/AddNewEvent";

const router = createBrowserRouter(
    [
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                { 
                    index: true, 
                    element: <ProtectedRoute><CalendarComponent /></ProtectedRoute> 
                },
                { 
                    path: 'table', 
                    element: <ProtectedRoute><CheckinTablePage /></ProtectedRoute> 
                },
                { 
                    path: 'checkinbyday', 
                    element: <ProtectedRoute><CheckInByDayTable /></ProtectedRoute> 
                },
                { 
                    path: 'checkintablebydepartment', 
                    element: <ProtectedRoute><CheckInTableByDepartment /></ProtectedRoute> 
                },
                { 
                    path: 'customworkweek', 
                    element: <ProtectedRoute><CustomWorkWeek /></ProtectedRoute> 
                },
                {
                    path: "calendar/meeting",
                    element: <ProtectedRoute><MeetingCalendarComponent/></ProtectedRoute>
                },
                {
                    path: 'calendar/addnew',
                    element: <ProtectedRoute><AddNewEvent/></ProtectedRoute>
                }
            ],
        },
    ]
);

export function Routes() {
    return <RouterProvider router={router} />;
}