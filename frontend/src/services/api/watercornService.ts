import axios from 'axios';
import type { WatercornApiResponse } from '../../types/watercorn';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const watercornService = {
  getAll: async (): Promise<WatercornApiResponse[]> => {
    const response = await axios.get<WatercornApiResponse[]>(`${apiUrl}/watercorn/all`);
    // Return the original API data with _id
    return response.data;
  },
}; 