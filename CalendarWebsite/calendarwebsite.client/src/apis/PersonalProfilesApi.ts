import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getNameByPersonalProfileId(personalProfileId: number) {
    const apiUrl = `${API_BASE_URL}api/personalprofiles/GetNameById`;
    try {
        const response = await axios.get(apiUrl,
            {
                params: { id: personalProfileId },
            }
        );
        console.log("getNameByPersonalProfileId", response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching custom working times:', error);
    }
}