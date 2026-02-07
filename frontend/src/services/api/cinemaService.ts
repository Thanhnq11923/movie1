import axios from 'axios';

const apiUrl = "http://localhost:3000/api";

export const cinemaService = {
    getAllCinemas: async () => {
        try {
            const response = await axios.get(`${apiUrl}/cinemas`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cinemas:', error);
            throw error;
        }
    },
    
    getCinemaRoomById: async (roomId: string) => {
        try {
            const response = await axios.get(`${apiUrl}/cinemarooms/${roomId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cinema room:', error);
            throw error;
        }
    },
    
    getAllCinemaRooms: async () => {
        try {
            const response = await axios.get(`${apiUrl}/cinemarooms`);
            return response.data;
        } catch (error) {
            console.error('Error fetching cinema rooms:', error);
            throw error;
        }
    },

    updateCinemaRoom: async (roomId: string, updateData: {
        roomName?: string;
        capacity?: number;
        type?: string;
        equipment?: string[];
        status?: string;
    }) => {
        try {
            const response = await axios.put(`${apiUrl}/cinemarooms/${roomId}`, updateData);
            return response.data;
        } catch (error) {
            console.error('Error updating cinema room:', error);
            throw error;
        }
    },
}; 