import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export async function uploadFile(file: File){
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_BASE_URL}api/file/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading file: ', error);
        throw error;
    }
}

export async function getFile(fileId: string, thumbnail: boolean = false) {
    try {
        const response = await axios.get(`${API_BASE_URL}api/file/${fileId}`, {
            params: {thumbnail}
        });
        return response.data;
    } catch (error) {
        console.error('Error getting file: ', error);
        throw error;
    }
}