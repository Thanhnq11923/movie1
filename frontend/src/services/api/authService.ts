import axios, { AxiosError } from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../../types/user';

const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Create axios instance with default config
const authApi = axios.create({
    baseURL: apiUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
authApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
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
authApi.interceptors.response.use(
    (response) => response,
    (error) => {
        // Chỉ redirect khi có token nhưng token hết hạn (401)
        // Không redirect khi đăng nhập sai (401 từ login endpoint)
        if (error.response?.status === 401 && 
            localStorage.getItem('authToken') && 
            !error.config?.url?.includes('/auth/login')) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authService = {
    /**
     * Login user with username and password
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await authApi.post<AuthResponse>('/auth/login', credentials);

            // Store token and user data in localStorage
            if (response.data.success && response.data.data) {
                localStorage.setItem('authToken', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }

            return response.data;
        } catch (error: unknown) {
            console.error('Login error:', error);
            const axiosError = error as AxiosError;
            throw axiosError.response?.data || error;
        }
    },

    /**
     * Register new user
     */
    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
        try {
            const response = await authApi.post<AuthResponse>('/auth/register', userData);

            // Store token and user data in localStorage if registration is successful
            if (response.data.success && response.data.data) {
                localStorage.setItem('authToken', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
            }

            return response.data;
        } catch (error: unknown) {
            console.error('Registration error:', error);
            const axiosError = error as AxiosError;
            throw axiosError.response?.data || error;
        }
    },

    /**
     * Logout user
     */
    logout: (): void => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        // Redirect to login page
        window.location.href = '/login';
    },

    /**
     * Get current user from localStorage
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        const user = JSON.parse(userStr);
        // Map user data to match User interface
        return {
            ...user,
            name: user.fullName || user.name // Map fullName to name
        };
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('authToken');
    },

    /**
     * Get auth token
     */
    getToken: (): string | null => {
        return localStorage.getItem('authToken');
    },

    /**
     * Refresh token (if needed in the future)
     */
    refreshToken: async (): Promise<AuthResponse> => {
        try {
            const response = await authApi.post<AuthResponse>('/auth/refresh');

            if (response.data.success && response.data.data) {
                localStorage.setItem('authToken', response.data.data.token);
            }

            return response.data;
        } catch (error: unknown) {
            console.error('Token refresh error:', error);
            const axiosError = error as AxiosError;
            throw axiosError.response?.data || error;
        }
    },

    /**
     * Forgot password - Send OTP to email
     */
    forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await authApi.post('/auth/forgot-password', { email });
            return response.data;
        } catch (error: unknown) {
            console.error('Forgot password error:', error);
            const axiosError = error as AxiosError;
            throw axiosError.response?.data || error;
        }
    },

    /**
     * Reset password with OTP verification
     */
    resetPassword: async (email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await authApi.post('/auth/reset-password', { email, newPassword });
            return response.data;
        } catch (error: unknown) {
            console.error('Reset password error:', error);
            const axiosError = error as AxiosError;
            throw axiosError.response?.data || error;
        }
    },

    /**
     * Get user profile (thông tin user)
     */
    getProfile: async () => {
        try {
            const response = await authApi.get('users/me'); // hoặc '/profile' tuỳ backend
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            throw axiosError.response?.data || error;
        }
    },

    /**
     * Update user profile
     */
    updateProfile: async (profileData: Partial<{ fullName: string; dateOfBirth: string; phoneNumber: string; gender: string; }>) => {
        try {
            const response = await authApi.put('users/me', profileData); // hoặc PATCH tuỳ backend
            return response.data;
        } catch (error: unknown) {
            const axiosError = error as AxiosError;
            throw axiosError.response?.data || error;
        }
    },

    verifyOTP: async (email: string, otp: string) => {
        // Trả về response.data luôn để dễ dùng ở frontend
        const response = await authApi.post('/auth/verify-otp', { email, otp });
        return response.data;
    },
};