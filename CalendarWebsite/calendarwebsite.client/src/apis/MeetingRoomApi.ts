import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getAllMeetingRoom() {
    const apiUrl = `${API_BASE_URL}api/MeetingRoom/GetAllMeetingRoom`;
    try {
        const response = await axios.get(apiUrl);
        // console.log("getNameByPersonalProfileId", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching meeting room:', error);
    }
}