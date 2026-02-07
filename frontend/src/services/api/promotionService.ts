/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type {
    PromotionResponse,
    SinglePromotionResponse,
    ShareCountResponse,
    CreatePromotionRequest,
    UpdatePromotionRequest,
} from "../../types/promotion";

const apiUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

// Get auth token from localStorage
const getAuthToken = (): string | null => {
    return localStorage.getItem("authToken");
};

// Create axios instance with auth header
const createAuthInstance = () => {
    const token = getAuthToken();
    return axios.create({
        baseURL: apiUrl,
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        }
    });
};

// Helper function to transform MongoDB data to frontend format
const transformPromotionData = (data: any): any => {
    if (!data) return data;

    // Handle MongoDB ObjectId
    if (data._id && typeof data._id === 'object' && data._id.$oid) {
        data._id = data._id.$oid;
    }

    // Handle date fields
    if (data.startDate && typeof data.startDate === 'object' && data.startDate.$numberLong) {
        data.startDate = new Date(parseInt(data.startDate.$numberLong));
    }
    if (data.endDate && typeof data.endDate === 'object' && data.endDate.$numberLong) {
        data.endDate = new Date(parseInt(data.endDate.$numberLong));
    }
    if (data.createdAt && typeof data.createdAt === 'object' && data.createdAt.$numberLong) {
        data.createdAt = new Date(parseInt(data.createdAt.$numberLong));
    }
    if (data.updatedAt && typeof data.updatedAt === 'object' && data.updatedAt.$numberLong) {
        data.updatedAt = new Date(parseInt(data.updatedAt.$numberLong));
    }

    // Handle numeric fields
    if (data.discountValue && typeof data.discountValue === 'object' && data.discountValue.$numberInt) {
        data.discountValue = parseInt(data.discountValue.$numberInt);
    }
    if (data.discountValue && typeof data.discountValue === 'object' && data.discountValue.$numberDouble) {
        data.discountValue = parseFloat(data.discountValue.$numberDouble);
    }
    if (data.maxUsage && typeof data.maxUsage === 'object' && data.maxUsage.$numberInt) {
        data.maxUsage = parseInt(data.maxUsage.$numberInt);
    }
    if (data.currentUsage && typeof data.currentUsage === 'object' && data.currentUsage.$numberInt) {
        data.currentUsage = parseInt(data.currentUsage.$numberInt);
    }
    if (data.shareCount && typeof data.shareCount === 'object' && data.shareCount.$numberInt) {
        data.shareCount = parseInt(data.shareCount.$numberInt);
    }

    // Handle content array
    if (data.content && Array.isArray(data.content)) {
        data.content = data.content.map((item: any) => {
            if (item._id && typeof item._id === 'object' && item._id.$oid) {
                item._id = item._id.$oid;
            }
            if (item.options && Array.isArray(item.options)) {
                item.options = item.options.map((option: any) => {
                    if (option._id && typeof option._id === 'object' && option._id.$oid) {
                        option._id = option._id.$oid;
                    }
                    if (option.price && typeof option.price === 'object' && option.price.$numberDouble) {
                        option.price = parseFloat(option.price.$numberDouble);
                    }
                    return option;
                });
            }
            return item;
        });
    }

    // Handle related array
    if (data.related && Array.isArray(data.related)) {
        data.related = data.related.map((item: any) => {
            if (item._id && typeof item._id === 'object' && item._id.$oid) {
                item._id = item._id.$oid;
            }
            return item;
        });
    }

    return data;
};

export const promotionService = {
    // Get all promotions with pagination and sorting
    getAllPromotions: async (
        page: number = 1,
        limit: number = 10,
        sort: string = '-createdAt'
    ): Promise<PromotionResponse> => {
        try {
            const response = await axios.get<PromotionResponse>(`${apiUrl}/promotions`, {
                params: { page, limit, sort }
            });
            // Transform the data to handle MongoDB format
            if (response.data.data) {
                response.data.data = response.data.data.map(transformPromotionData);
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching promotions:', error);
            throw error;
        }
    },

    // Get promotion by slug
    getPromotionBySlug: async (slug: string): Promise<SinglePromotionResponse> => {
        try {
            const encodedSlug = encodeURIComponent(slug);
            const response = await axios.get<SinglePromotionResponse>(`${apiUrl}/promotions/${encodedSlug}`);
            // Transform the data to handle MongoDB format
            if (response.data.data) {
                response.data.data = transformPromotionData(response.data.data);
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching promotion by slug:', error);
            throw error;
        }
    },

    // Create new promotion (Admin only)
    createPromotion: async (promotionData: CreatePromotionRequest): Promise<SinglePromotionResponse> => {
        try {
            const authInstance = createAuthInstance();
            const response = await authInstance.post<SinglePromotionResponse>('/promotions', promotionData);
            // Transform the data to handle MongoDB format
            if (response.data.data) {
                response.data.data = transformPromotionData(response.data.data);
            }
            return response.data;
        } catch (error) {
            console.error('Error creating promotion:', error);
            throw error;
        }
    },

    // Update promotion (Admin only)
    updatePromotion: async (slug: string, updateData: UpdatePromotionRequest): Promise<SinglePromotionResponse> => {
        try {
            const authInstance = createAuthInstance();
            const encodedSlug = encodeURIComponent(slug);

            const response = await authInstance.put<SinglePromotionResponse>(`/promotions/${encodedSlug}`, updateData);

            // Transform the data to handle MongoDB format
            if (response.data.data) {
                response.data.data = transformPromotionData(response.data.data);
            }
            return response.data;
        } catch (error: any) {
            console.error('Error updating promotion:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
            }
            throw error;
        }
    },

    // Delete promotion (Admin only)
    deletePromotion: async (slug: string): Promise<{ success: boolean; message: string }> => {
        try {
            const authInstance = createAuthInstance();
            const encodedSlug = encodeURIComponent(slug);
            const response = await authInstance.delete(`/promotions/${encodedSlug}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting promotion:', error);
            throw error;
        }
    },

    // Increment share count
    incrementShareCount: async (slug: string): Promise<ShareCountResponse> => {
        try {
            const encodedSlug = encodeURIComponent(slug);
            const response = await axios.post<ShareCountResponse>(`${apiUrl}/promotions/${encodedSlug}/share`);
            return response.data;
        } catch (error) {
            console.error('Error incrementing share count:', error);
            throw error;
        }
    },

    // Validate promotion code
    validatePromotionCode: async (code: string, amount: number, userId?: string) => {
        try {
            const response = await axios.post(`${apiUrl}/promotions/validate-code`, {
                code,
                amount,
                userId
            });
            return response.data;
        } catch (error) {
            console.error('Error validating promotion code:', error);
            throw error;
        }
    },

    // Get promotion by code
    getPromotionByCode: async (code: string) => {
        try {
            const response = await axios.get(`${apiUrl}/promotions/code/${encodeURIComponent(code)}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching promotion by code:', error);
            throw error;
        }
    },

    // Helper method to handle API errors
    handleError: (error: any): string => {
        if (error.response) {
            // Server responded with error status
            return error.response.data?.message || `Error: ${error.response.status}`;
        } else if (error.request) {
            // Request was made but no response received
            return "Network error: No response from server";
        } else {
            // Something else happened
            return error.message || "An unexpected error occurred";
        }
    },
};
