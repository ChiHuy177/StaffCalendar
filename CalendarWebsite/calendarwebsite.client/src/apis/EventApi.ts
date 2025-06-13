import axios from "axios";
import {  RoomAvailabilityCheck } from "../types/meetingEvent/meetingEvent_type";

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

export async function uploadTempFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_BASE_URL}api/events/uploadTempAttachment`,
            formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;

    } catch (error) {
        console.error("Error uploading file: ", error);
        throw error;
    }
}


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createEventWithAttachments(eventData : any) {
    try {
        console.log("Data gửi đi:", JSON.stringify(eventData, null, 2));
        const response = await axios.post(`${API_BASE_URL}api/events/addNew`, eventData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Chi tiết lỗi:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                requestData: eventData
            });
        }
        console.error("Error creating event: ", error);
        throw error;
    }
}

export async function getEventAttachments(eventId: number) {
    try {
        const response = await axios.get(`${API_BASE_URL}api/events/attachments/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting event attachments: ", error);
        throw error;
    }
}

export async function checkRoomAvailabilityApi(event: RoomAvailabilityCheck) {
    const apiUrl = `${API_BASE_URL}api/MeetingRoom/CheckAvailability`;
    try {
        const response = await axios.post(apiUrl, event);
        return response.data;
    } catch (error) {
        console.error('Error checking room availability');
        throw error;
    }
}

