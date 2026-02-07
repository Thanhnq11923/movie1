import axios from 'axios';
import { authService } from './authService';

// Define the feedback interface based on the actual API response
export interface Feedback {
    _id: string;
    review: string;
    status: 'New' | 'Approved' | 'Rejected';
    respondMessage: string | null;
    createdAt: string;
    updatedAt: string;
    bookingId: string;
    userId: {
        _id: string;
        username: string;
        fullName: string;
        image?: string;
    };
    score: number;
    movieId: {
        _id: string;
        versionMovieEnglish: string;
        versionMovieVn: string;
    };
}

// API response types
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string; // Add optional message property for error responses
}

// Feedback creation payload type
interface CreateFeedbackPayload {
    review: string;
    score: number;
    movieId: string;
    status: 'New' | 'Approved' | 'Rejected';
    bookingId?: string; // Make bookingId optional in type
}

const API_URL = 'http://localhost:3000/api';

// Create axios instance with auth header
const feedbackApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor to include auth token
feedbackApi.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const feedbackService = {
    // Get all feedbacks
    getAllFeedbacks: async (): Promise<Feedback[]> => {
        try {
            console.log('Fetching all feedbacks...');
            const response = await feedbackApi.get<ApiResponse<Feedback[]>>('/feedbacks');

            if (!response.data.success) {
                throw new Error('Failed to fetch feedbacks: API returned error');
            }

            const feedbacks = response.data.data || [];
            console.log('Feedbacks fetched successfully:', feedbacks.length);
            return feedbacks;
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            throw error;
        }
    },

    // Get a specific feedback by ID
    getFeedbackById: async (id: string): Promise<Feedback> => {
        try {
            console.log(`Fetching feedback by ID: ${id}`);
            const response = await feedbackApi.get<ApiResponse<Feedback>>(`/feedbacks/${id}`);

            if (!response.data.success) {
                throw new Error(`Failed to fetch feedback ${id}: API returned error`);
            }

            return response.data.data;
        } catch (error) {
            console.error(`Error fetching feedback ${id}:`, error);
            throw error;
        }
    },

    // Get approved feedbacks by movie ID
    getApprovedFeedbacksByMovieId: async (movieId: string): Promise<Feedback[]> => {
        try {
            console.log(`Fetching approved feedbacks for movie: ${movieId}`);
            const response = await feedbackApi.get<ApiResponse<Feedback[]>>(`/feedbacks/movie/${movieId}?status=Approved`);

            if (!response.data.success) {
                throw new Error(`Failed to fetch feedbacks for movie ${movieId}: API returned error`);
            }

            const feedbacks = response.data.data || [];
            console.log(`Approved feedbacks fetched for movie ${movieId}:`, feedbacks.length);
            return feedbacks;
        } catch (error) {
            console.error(`Error fetching approved feedbacks for movie ${movieId}:`, error);
            throw error;
        }
    },

    // Create a new feedback
    createFeedback: async (feedback: Omit<Feedback, '_id' | 'createdAt' | 'updatedAt' | 'userId' | 'movieId'>): Promise<Feedback> => {
        try {
            console.log('Creating new feedback:', feedback);
            const response = await feedbackApi.post<ApiResponse<Feedback>>('/feedbacks', feedback);

            if (!response.data.success) {
                throw new Error('Failed to create feedback: API returned error');
            }

            return response.data.data;
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw error;
        }
    },

    // Update a feedback
    updateFeedback: async (id: string, feedback: Partial<Feedback>): Promise<Feedback> => {
        try {
            console.log(`Updating feedback ${id}:`, feedback);
            const response = await feedbackApi.put<ApiResponse<Feedback>>(`/feedbacks/${id}`, feedback);

            if (!response.data.success) {
                throw new Error(`Failed to update feedback ${id}: API returned error`);
            }

            return response.data.data;
        } catch (error) {
            console.error(`Error updating feedback ${id}:`, error);
            throw error;
        }
    },

    // Delete a feedback
    deleteFeedback: async (id: string): Promise<void> => {
        try {
            console.log(`Deleting feedback ${id}`);
            const response = await feedbackApi.delete<ApiResponse<void>>(`/feedbacks/${id}`);

            if (!response.data.success) {
                throw new Error(`Failed to delete feedback ${id}: API returned error`);
            }

            console.log(`Feedback ${id} deleted successfully`);
        } catch (error) {
            console.error(`Error deleting feedback ${id}:`, error);
            throw error;
        }
    },

    // Update feedback status - only allow the three valid status values
    updateFeedbackStatus: async (id: string, status: 'New' | 'Approved' | 'Rejected'): Promise<Feedback> => {
        try {
            console.log(`Updating feedback ${id} status to ${status}`);
            const response = await feedbackApi.put<ApiResponse<Feedback>>(`/feedbacks/${id}`, { status });

            if (!response.data.success) {
                throw new Error(`Failed to update feedback status ${id}: API returned error`);
            }

            return response.data.data;
        } catch (error) {
            console.error(`Error updating feedback status ${id}:`, error);
            throw error;
        }
    },

    // Add response to feedback without changing status
    respondToFeedback: async (id: string, respondMessage: string): Promise<Feedback> => {
        try {
            console.log(`Adding response to feedback ${id}`);
            const response = await feedbackApi.put<ApiResponse<Feedback>>(`/feedbacks/${id}`, {
                respondMessage
                // Don't change status here, let the caller decide the status
            });

            if (!response.data.success) {
                throw new Error(`Failed to respond to feedback ${id}: API returned error`);
            }

            return response.data.data;
        } catch (error) {
            console.error(`Error responding to feedback ${id}:`, error);
            throw error;
        }
    },

    // Create movie feedback (simplified for client usage)
    createMovieFeedback: async (movieId: string, review: string, score: number, bookingId?: string): Promise<Feedback> => {
        try {
            console.log(`Creating feedback for movie ${movieId}`);

            // Prepare feedback data, including optional bookingId if provided
            const feedbackData: CreateFeedbackPayload = {
                review,
                score,
                movieId,
                status: 'Approved', // Automatically approve feedbacks
            };

            // Add bookingId if provided
            if (bookingId) {
                feedbackData.bookingId = bookingId;
            }

            console.log("Sending feedback data to API:", feedbackData);
            const response = await feedbackApi.post<ApiResponse<Feedback>>('/feedbacks', feedbackData);

            console.log("API Response:", response.data);

            if (!response.data.success) {
                const errorMsg = response.data.message || 'API returned error without details';
                console.error("API Error:", errorMsg);
                throw new Error(`Failed to create feedback: ${errorMsg}`);
            }

            return response.data.data;
        } catch (error) {
            console.error('Error creating feedback:', error);
            if (axios.isAxiosError(error)) {
                console.error('API error details:', error.response?.data);
                if (error.response?.data?.message === 'bookingId is required') {
                    throw new Error('A booking is required to submit feedback. Please book this movie first.');
                }
            }
            throw error;
        }
    },

    // Helper function to handle API errors
    handleError: (error: unknown): string => {
        if (axios.isAxiosError(error) && error.response) {
            // Server responded with error status
            return error.response.data?.message || `Error: ${error.response.status}`;
        } else if (axios.isAxiosError(error) && error.request) {
            // Request was made but no response received
            return "Network error: No response from server";
        } else {
            // Something else happened
            const err = error as Error;
            return err.message || "An unexpected error occurred";
        }
    }
}; 