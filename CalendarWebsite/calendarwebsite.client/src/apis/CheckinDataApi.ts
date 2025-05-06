import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getAllUserName() {
    const apiUrl = `${API_BASE_URL}api/personalprofiles/GetAllUsersName`;
    try {
        const response = await axios.get(apiUrl);
        return response.data;

    } catch (error) {
        console.error('Error fetching user names:', error);
    }
}
export async function getAllDepartmentName() {
    const apiUrl = `${API_BASE_URL}api/departments`;
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching departments:', error);
    }
}
export async function getRecordDataByMonth(month: number, year: number, userId: string) {
    const apiUrl = `${API_BASE_URL}api/DataOnly_APIaCheckIn/CountRecordsByMonth`
    try {
        const response = await axios.get(apiUrl, {
            params: { month, year, userId },
        })
        return response.data;
    } catch (error) {
        console.error("Error when fetching data: ", error);
    }
}
export async function getCheckinDataByUserIdPaging(month: number, year: number, userId: string, page: number,  pageSize: number) {
    const apiUrl = `${API_BASE_URL}api/DataOnly_APIaCheckIn/GetUserByUserIdPaging`;
    try {
        const response = await axios.get(apiUrl, {
            params: { month, year, userId, page, pageSize },
        })
        return response.data;
    } catch (error) {
        console.error("Error when fetching data: ", error);
    }
}
export async function getCheckinDataByUserId(month: number, year: number, userId: string) {
    const apiUrl = `${API_BASE_URL}api/DataOnly_APIaCheckIn/GetUserByUserId`;
    try {
        const response = await axios.get(apiUrl, {
            params: { month, year, userId },
        })
        return response.data;
    } catch (error) {
        console.error("Error when fetching data: ", error);
    }
}
export async function getCheckinDataByDayRange(
    day: number,
    month: number,
    year: number,
    dayTo: number,
    monthTo: number,
    yearTo: number,
    page: number,
    pageSize: number) {
    const apiUrl = `${API_BASE_URL}api/dataonly_apiacheckin/GetAllCheckinInDayRange`;
    try {
        const response = await axios.get(apiUrl, {
            params: {
                day: day,
                month: month,
                year: year,
                dayTo: dayTo,
                monthTo: monthTo,
                yearTo: yearTo,
                page: page,
                pageSize: pageSize
            }
        })
        return response.data
    } catch (error) {
        console.error("Error when fetching data: ", error);
    }
}

export async function getCheckinDataByDepartmentId(
    id: number,
    day: number,
    month: number,
    year: number,
    dayTo: number,
    monthTo: number,
    yearTo: number,
    page: number,
    pageSize: number) {
    const apiUrl = `${API_BASE_URL}api/dataonly_apiacheckin/GetCheckInByDepartmentId`;
    try {
        const response = await axios.get(apiUrl, {
            params: {
                id: id,
                day: day,
                month: month,
                year: year,
                dayTo: dayTo,
                monthTo: monthTo,
                yearTo: yearTo,
                page: page,
                pageSize: pageSize
            }
        })
        return response.data
    } catch (error) {
        console.error("Error when fetching data: ", error);
    }
}