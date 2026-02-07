/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface StaffBookingData {
  staffId: string;
  staffName: string;
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
    promotionCode?: string;
  };
  movieId: string;
  movieTitle: string;
  movieDuration: string;
  movieGenre: string;
  movieRating: string;
  scheduleId: string;
  cinemaRoomId: string;
  roomName: string;
  showtimeDate: string;
  showtimeTime: string;
  showtimeFormat: string;
  selectedSeats: Array<{
    seatId: string;
    row: string;
    col: number;
    price: number;
  }>;
  selectedConcessions: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  paymentMethod: string;
  pricing: {
    subtotal: number;
    tax: number;
    promotionDiscount: number;
    total: number;
  };
  status?: string; // Add status field
  notes?: string;
}

export interface StaffBookingResponse {
  success: boolean;
  message: string;
  data: any;
}

class StaffBookingService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/staff-bookings`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      const token = authService.getToken?.() || localStorage.getItem('token');
      if (!token) throw new Error('No token provided');

      const url = `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (parseError) {
          // If we can't parse the error response, use the status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Staff Booking API Error:', error);
      throw error;
    }
  }

  // Create a new staff booking
  async createStaffBooking(bookingData: StaffBookingData): Promise<StaffBookingResponse> {
    return this.makeRequest('', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  // Get all staff bookings with pagination and filters
  async getAllStaffBookings(params: {
    page?: number;
    limit?: number;
    status?: string;
    staffId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<StaffBookingResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.staffId) queryParams.append('staffId', params.staffId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return this.makeRequest(endpoint);
  }

  // Get staff booking by booking ID
  async getStaffBookingById(bookingId: string): Promise<StaffBookingResponse> {
    return this.makeRequest(`/${bookingId}`);
  }

  // Get staff bookings by staff ID
  async getStaffBookingsByStaffId(staffId: string, params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<StaffBookingResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);

    const endpoint = `/staff/${staffId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Get staff bookings by customer phone
  async getStaffBookingsByCustomerPhone(phone: string, params: {
    page?: number;
    limit?: number;
  } = {}): Promise<StaffBookingResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/customer/${phone}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Update staff booking status
  async updateStaffBookingStatus(bookingId: string, status: string, notes?: string): Promise<StaffBookingResponse> {
    return this.makeRequest(`/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Delete staff booking
  async deleteStaffBooking(bookingId: string): Promise<StaffBookingResponse> {
    return this.makeRequest(`/${bookingId}`, {
      method: 'DELETE',
    });
  }

  // Get staff booking statistics
  async getStaffBookingStats(params: {
    staffId?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<StaffBookingResponse> {
    const queryParams = new URLSearchParams();

    if (params.staffId) queryParams.append('staffId', params.staffId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);

    const endpoint = `/stats/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.makeRequest(endpoint);
  }

  // Handle errors
  handleError(error: any): string {
    if (error.response) {
      // Server responded with error status
      return error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Network error
      return 'Network error: Unable to connect to server';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred';
    }
  }
}

export const staffBookingService = new StaffBookingService(); 