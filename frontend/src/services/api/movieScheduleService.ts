import axios from 'axios';
import type { MovieSchedule, MovieScheduleResponse } from '../../types/schedule';

const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const movieScheduleService = {
    getAllMovieSchedules: async (): Promise<MovieScheduleResponse> => {
        try {
            const response = await axios.get<MovieScheduleResponse>(`${apiUrl}/movieSchedules`);
            return response.data;
        } catch (error) {
            console.error('Error fetching movie schedules:', error);
            throw error;
        }
    },
    addMovieSchedule: async (schedule: Omit<MovieSchedule, '_id'>) => {
        try {
            const response = await axios.post(`${apiUrl}/movieSchedules`, schedule);
            return response.data;
        } catch (error) {
            console.error('Error adding movie schedule:', error);
            throw error;
        }
    },
    updateMovieSchedule: async (id: string, schedule: Partial<MovieSchedule>) => {
        try {
            const response = await axios.put(`${apiUrl}/movieSchedules/${id}`, schedule);
            return response.data;
        } catch (error) {
            console.error('Error updating movie schedule:', error);
            throw error;
        }
    },
    deleteMovieSchedule: async (id: string) => {
        try {
            const response = await axios.delete(`${apiUrl}/movieSchedules/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting movie schedule:', error);
            throw error;
        }
    },
}; 