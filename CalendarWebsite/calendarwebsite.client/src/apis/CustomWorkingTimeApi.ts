import axios from "axios";
import {  WorkScheduleApiData } from "../utils/type";

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