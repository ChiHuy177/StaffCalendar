

import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getAllMeetingEvents() {
    const apiUrl = `${API_BASE_URL}api/events/allMeetings`;
    try {
        const response = await axios.get(apiUrl);
        return response.data;
    } catch (error) {
        console.error("Error when fetching meeting events: " + error);
    }
}