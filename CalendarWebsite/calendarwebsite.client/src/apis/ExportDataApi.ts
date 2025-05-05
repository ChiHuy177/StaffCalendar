import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getExportDataByDayRange(
    day: number,
    month: number,
    year: number,
    dayTo: number,
    monthTo: number,
    yearTo: number) {
    const apiUrl = `${API_BASE_URL}api/Export/ExportDataByDateRange`;
    try{
        const response = await axios.get(apiUrl, {
            params: {
                day: day,
                month: month,
                year: year,
                dayTo: dayTo,
                monthTo: monthTo,
                yearTo: yearTo
            },
            responseType: 'blob',
        });
        return response.data
    } catch (error){
        console.error("Error when fetching data: ", error);
    } 
}