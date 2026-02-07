import axios, { AxiosError } from "axios";

const apiUrl = "http://localhost:3000/api";

// Create axios instance with default config
const staffApi = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
staffApi.interceptors.request.use(
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
staffApi.interceptors.response.use(
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

export interface StaffProfile {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  image: string;
  roleId: {
    _id: string;
    roleName: string;
    permissions: string[];
  };
  status: number;
  registerDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStaffProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
  image?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const staffService = {
  /**
   * Get staff profile information
   */
  getStaffProfile: async (): Promise<StaffProfile> => {
    try {
      const response = await staffApi.get("/users/me");
      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Get staff profile error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  /**
   * Update staff profile
   */
  updateStaffProfile: async (profileData: UpdateStaffProfileRequest) => {
    try {
      const response = await staffApi.put("/users/me", profileData);
      return response.data;
    } catch (error: unknown) {
      console.error("Update staff profile error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },

  /**
   * Change staff password
   */
  changePassword: async (passwordData: ChangePasswordRequest) => {
    try {
      const response = await staffApi.put("/users/change-password", passwordData);
      return response.data;
    } catch (error: unknown) {
      console.error("Change password error:", error);
      const axiosError = error as AxiosError;
      if (axiosError.response?.data) {
        throw axiosError.response.data;
      }
      throw { message: "Failed to change password. Please try again." };
    }
  },

  /**
   * Get staff by ID (for admin purposes)
   */
  getStaffById: async (staffId: string): Promise<StaffProfile> => {
    try {
      const response = await staffApi.get(`/users/${staffId}`);
      return response.data.data || response.data;
    } catch (error: unknown) {
      console.error("Get staff by ID error:", error);
      const axiosError = error as AxiosError;
      throw axiosError.response?.data || error;
    }
  },
}; 