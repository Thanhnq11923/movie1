/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Function for staff to get seats by scheduleId and cinemaRoomId (using the correct endpoint)
export const getSeatsByScheduleId = async (scheduleId: string, cinemaRoomId?: string) => {
    try {
        // Start with simple format - just scheduleId
        const params: any = {
            scheduleId: scheduleId
        };

        // Add cinemaRoomId if provided
        if (cinemaRoomId) {
            params.cinemaRoomId = cinemaRoomId;
        }

        console.log("Staff API Request URL:", `${API_BASE}/scheduleSeat?scheduleId=${scheduleId}${cinemaRoomId ? `&cinemaRoomId=${cinemaRoomId}` : ''}`);
        console.log("Staff API Request params:", params);

        const response = await axios.get(`${API_BASE}/scheduleSeat`, { params });
        console.log("Staff API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error in getSeatsByScheduleId:", error);
        console.error("Error details:", {
            scheduleId,
            cinemaRoomId,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            errorResponse: error instanceof AxiosError ? error.response?.data : null
        });
        if (error instanceof AxiosError && error.response) {
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
        }
        throw error;
    }
};

// Function for user to get seats with both scheduleId and cinemaRoomId (existing function)
export const getScheduleSeats = async (scheduleId: string, cinemaRoomId: string) => {
    try {
        console.log("User API Request URL:", `${API_BASE}/scheduleSeat?cinemaRoomId=${cinemaRoomId}&scheduleId=${scheduleId}`);
        const response = await axios.get(`${API_BASE}/scheduleSeat`, {
            params: {
                scheduleId,
                cinemaRoomId,
            },
        });
        console.log("User API Response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error in getScheduleSeats:", error, "Request URL:", `${API_BASE}/scheduleSeat?cinemaRoomId=${cinemaRoomId}&scheduleId=${scheduleId}`);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
};

// Function to update seat status (for staff booking)
export const updateSeatStatus = async (scheduleId: string, seatId: string, seatStatus: number) => {
    try {
        console.log("Update seat status:", { scheduleId, seatId, seatStatus });
        const response = await axios.put(`${API_BASE}/scheduleSeat/updateSeatStatus`, {
            scheduleId,
            seatId,
            seatStatus
        });
        console.log("Update seat response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error updating seat status:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
};

// Helper function to get auth token
const getAuthToken = (): string | null => {
    return localStorage.getItem("authToken");
};

// Seat Locking APIs
export const lockSeat = async (scheduleId: string, cinemaRoomId: string, seatId: string, userId: string) => {
    try {
        console.log("Locking seat:", { scheduleId, cinemaRoomId, seatId, userId });
        const token = getAuthToken();
        const response = await axios.post(`${API_BASE}/seatlocks/lock`, {
            scheduleId,
            cinemaRoomId,
            seatId,
            userId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Lock seat response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error locking seat:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
};

export const unlockSeat = async (scheduleId: string, cinemaRoomId: string, seatId: string, userId: string) => {
    try {
        console.log("Unlocking seat:", { scheduleId, cinemaRoomId, seatId, userId });
        const token = getAuthToken();
        const response = await axios.post(`${API_BASE}/seatlocks/unlock`, {
            scheduleId,
            cinemaRoomId,
            seatId,
            userId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Unlock seat response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error unlocking seat:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
};

export const getLockedSeats = async (scheduleId: string, cinemaRoomId: string) => {
    try {
        console.log("Getting locked seats:", { scheduleId, cinemaRoomId });
        const token = getAuthToken();
        const headers: any = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await axios.get(`${API_BASE}/seatlocks/locked`, {
            params: {
                scheduleId,
                cinemaRoomId
            },
            headers
        });
        console.log("Get locked seats response:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error getting locked seats:", error);
        if (error.response) {
            console.error("Response data:", error.response.data);
        }
        throw error;
    }
};

export const getSeatTypes = async () => {
    const res = await axios.get(`${API_BASE}/seattypes`);
    return res.data;
};

export const getBookings = async () => {
    const res = await axios.get(`${API_BASE}/bookings`);
    return res.data;
};

type BookingPayload = {
    scheduleId: string;
    movieId: string;
    cinemaRoomId: string;
    seats: { row: string; col: number }[];
    seatStatus: number;
    bookedAt: Date;
    userId: string;
    amount: number;
    concessions: any[];
    promotion?: string;
    date?: string;
    time?: string;
    theater?: string;
    format?: string;
};

export const createBooking = async (bookingData: BookingPayload) => {
    try {
        const res = await axios.post(`${API_BASE}/bookings`, bookingData, {
            headers: { "Content-Type": "application/json" },
        });
        return res.data;
    } catch (error: any) {
        console.error("[DEBUG] Axios error:", error.response?.data || error.message);
        throw error;
    }
};