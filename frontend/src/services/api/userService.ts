import axios, { AxiosError } from "axios";

const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Create axios instance with default config
const userApi = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
userApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export interface ExchangeEgiftRequest {
  points: number;
  egiftType: string;
}

export interface PointHistoryItem {
  _id: string;
  itemName: string;
  pointsUsed: number;
  redeemDate: string;
  status: "completed" | "pending" | "cancelled";
}

export interface EgiftItem {
  _id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  status: "active" | "inactive";
}

export interface UserPoints {
  score: number;
  memberId: string | null;
}

// Mock data for egift items (fallback when API requires admin)
const mockEgiftItems: EgiftItem[] = [
  {
    _id: "1",
    name: "Movie Ticket 2D",
    description: "Free movie ticket for 2D screenings",
    points: 500,
    category: "Entertainment",
    status: "active",
  },
  {
    _id: "2",
    name: "Popcorn Large",
    description: "Free large popcorn",
    points: 200,
    category: "Food & Beverage",
    status: "active",
  },
  {
    _id: "3",
    name: "Soft Drink",
    description: "Free soft drink of your choice",
    points: 150,
    category: "Food & Beverage",
    status: "active",
  },
  {
    _id: "4",
    name: "20% Discount Voucher",
    description: "20% discount on your next purchase",
    points: 1000,
    category: "Discount",
    status: "active",
  },
  {
    _id: "5",
    name: "Premium Seat Upgrade",
    description: "Upgrade to premium seating",
    points: 300,
    category: "Upgrade",
    status: "active",
  },
];

// Mock data for point history (fallback when API requires admin)
const mockPointHistory: PointHistoryItem[] = [
  {
    _id: "1",
    itemName: "Movie Ticket 2D",
    pointsUsed: 500,
    redeemDate: "2024-01-15T10:30:00Z",
    status: "completed",
  },
  {
    _id: "2",
    itemName: "Popcorn Large",
    pointsUsed: 200,
    redeemDate: "2024-01-10T14:20:00Z",
    status: "completed",
  },
  {
    _id: "3",
    itemName: "Soft Drink",
    pointsUsed: 150,
    redeemDate: "2024-01-05T18:45:00Z",
    status: "completed",
  },
];

export const userService = {
  /**
   * Get current user information
   */
  getCurrentUser: async () => {
    try {
      const response = await userApi.get("/users/me");
      return response.data;
    } catch (error: unknown) {
      console.error("Get current user error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (
    profileData: Partial<{
      fullName: string;
      dateOfBirth: string;
      phoneNumber: string;
      gender: string;
    }>
  ) => {
    try {
      const response = await userApi.put("/users/me", profileData);
      return response.data;
    } catch (error: unknown) {
      console.error("Update profile error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  /**
   * Get point history - try API first, fallback to mock data
   */
  getPointHistory: async (): Promise<PointHistoryItem[]> => {
    try {
      const response = await userApi.get("/users/point-history");
      return response.data.data || response.data;
    } catch (error: unknown) {
      console.warn("Point history API failed, using mock data:", error);
      // Return mock data if API fails (e.g., admin access required)
      return mockPointHistory;
    }
  },

  /**
   * Get user's egifts - try API first, fallback to mock data
   */
  getEgifts: async (): Promise<EgiftItem[]> => {
    try {
      const response = await userApi.get("/users/egifts");
      return response.data.data || response.data;
    } catch (error: unknown) {
      console.warn("Egifts API failed, using mock data:", error);
      // Return mock data if API fails (e.g., admin access required)
      return mockEgiftItems;
    }
  },

  /**
   * Exchange points for egift
   */
  exchangeEgift: async (data: ExchangeEgiftRequest) => {
    try {
      const response = await userApi.post("/users/exchange-egift", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Exchange egift error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  /**
   * Get current user points
   */
  getCurrentUserPoints: async (): Promise<UserPoints> => {
    try {
      const response = await userApi.get("/users/points");
      return response.data.data;
    } catch (error: unknown) {
      console.error("Get user points error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  /**
   * Get user by ID with full information including avatar
   */
  getUserById: async (userId: string) => {
    try {
      const response = await userApi.get(`/users/${userId}`);
      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Get user by ID error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },
};
