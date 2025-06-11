import axios from "axios";
import { WorkSchedule, WorkScheduleApiData } from "../types/checkin/checkin_type";


const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getAllCustomWorkingTimes(){
    const apiUrl = `${API_BASE_URL}api/CustomWorkingTimes/GetAllCustomWorkingTime`;
    try{
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching custom working times:', error);
    }
}

export async function getCustomWorkingTimeByPersonalProfileId(personalProfileId: number){
    const apiUrl = `${API_BASE_URL}api/CustomWorkingTimes/GetAllCustomWorkingTimeByPersonalProfileId`;
    try{
        const response = await axios.get(apiUrl ,
            {
                params: {
                    id: personalProfileId
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching custom working time by personal profile ID:', error);
    }
    
}

export async function createCustomWorkingTime(customWorkingTime: WorkScheduleApiData) {
    const apiUrl = `${API_BASE_URL}api/CustomWorkingTimes/AddCustomWorkingTime`;
    try {
        const response = await axios.post(apiUrl, customWorkingTime);
        return response.data;
    } catch (error) {
        console.error('Error when create new custom working time:', error);
        throw error; 
    }
}

export async function updateCustomWorkingTime(customWorkingTime: WorkScheduleApiData) {
    const apiUrl = `${API_BASE_URL}api/CustomWorkingTimes/UpdateCustomWorkingTime`;
    try{
        const response = await axios.put(apiUrl, customWorkingTime);
        return response.data;
    } catch (error) {
        console.error('Error when update custom working time:', error);
    }
}

export async function softDeleteCustomWorkingTime(id: number, workSchedule: WorkSchedule | WorkScheduleApiData) {
    const apiUrl = `${API_BASE_URL}api/CustomWorkingTimes/UpdateCustomWorkingTime`;
    try {
        const updateData: WorkScheduleApiData & { id: number } = {
            id: id,
            workweekId: 'workweekId' in workSchedule 
                ? workSchedule.workweekId 
                : getDayOfWeekValue(workSchedule.workweekTitle),
            personalProfileId: workSchedule.personalProfileId,
            morningStart: workSchedule.morningStart,
            morningEnd: workSchedule.morningEnd,
            afternoonStart: workSchedule.afternoonStart,
            afternoonEnd: workSchedule.afternoonEnd,
            createdBy: workSchedule.createdBy || "",
            createdTime: workSchedule.createdTime,
            lastModified: new Date(),
            modifiedBy: "Chí Huy",
            isDeleted: true
        };

        console.log('updateData', updateData);
        
        const response = await axios.put(apiUrl, updateData);
        return response.data;
    } catch (error) {
        console.error('Error when soft deleting custom working time:', error);
        throw error;
    }
}

// Hàm chuyển đổi workweekTitle thành giá trị số ngày trong tuần
function getDayOfWeekValue(day: string): number {
    const dayMap: { [key: string]: number } = {
        'Monday': 3,
        'Tuesday': 4,
        'Wednesday': 5,
        'Thursday': 6,
        'Friday': 7,
        'Saturday': 8,
        'Sunday': 9
    };
    return dayMap[day] || 3; // Mặc định là thứ 2 nếu không xác định được
}