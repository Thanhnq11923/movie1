/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from './authService';
import { API_BASE_URL } from '../../config/api';

export interface Egift {
  _id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  isActive: boolean;
  price: number;
  material: string;
  size: string;
  design: string;
  stock: number;
  image: string;
  redeemed: number;
}

export interface EgiftResponse {
  success: boolean;
  data: Egift[];
  message?: string;
}

export const egiftService = {
  /**
   * Get all active egifts
   */
  getAllEgifts: async (): Promise<Egift[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/egifts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: EgiftResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch egifts');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching egifts:', error);
      throw error;
    }
  },

  /**
   * Get egift by ID
   */
  getEgiftById: async (id: string): Promise<Egift> => {
    try {
      const token = authService.getToken?.() || localStorage.getItem('token');

      const response = await fetch(`${API_BASE_URL}/egifts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch egift');
      }

      return result.data;
    } catch (error) {
      console.error('Error fetching egift:', error);
      throw error;
    }
  },

  /**
   * Exchange points for egift
   */
  exchangeEgift: async (egiftId: string): Promise<any> => {
    try {
      const token = authService.getToken?.() || localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_BASE_URL}/users/exchange-egift`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ egiftId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error exchanging egift:', error);
      throw error;
    }
  },
}; 