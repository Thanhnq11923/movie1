/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TicketTransaction } from '../../types/account';
import { authService } from './authService';

export async function getTransactionHistoryByUser(userId: string): Promise<TicketTransaction[]> {
  try {
    const res = await fetch(`/api/bookings/user/${userId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch transaction history: ${res.status} ${res.statusText}`);
    }

    const response = await res.json();
    console.log('Raw API response:', response);

    // Handle different possible response structures
    const data = response.data || response.bookings || response;

    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.warn('API response is not an array:', data);
      return [];
    }

    console.log('Processed transaction data:', data);

    // Map and validate the data
    const mappedData = data.map((transaction: any) => {
      // Map status properly - convert seatStatus to standard status if needed
      let status: "confirmed" | "cancelled" | "pending" = "pending";
      if (transaction.status) {
        status = transaction.status.toLowerCase();
      } else if (typeof transaction.seatStatus === 'number') {
        if (transaction.seatStatus === 1) status = "confirmed";
        else if (transaction.seatStatus === 0) status = "cancelled";
      }

      // Ensure required fields exist
      return {
        _id: transaction._id || transaction.id || `temp-${Date.now()}-${Math.random()}`,
        accountId: transaction.accountId || transaction.userId || userId,
        bookedAt: transaction.bookedAt || transaction.bookingDate || transaction.createdAt,
        bookingDate: transaction.bookingDate || transaction.bookedAt || transaction.date,
        movieId: transaction.movieId,
        movieName: transaction.movieName || transaction.movieTitle,
        scheduleId: transaction.scheduleId,
        scheduleShowTime: transaction.scheduleShowTime || transaction.showTime,
        cinemaId: transaction.cinemaId,
        cinemaRoomId: transaction.cinemaRoomId,
        cinemaRoomName: transaction.cinemaRoomName,
        seats: transaction.seats || [],
        concessions: transaction.concessions || [],
        tickets: transaction.tickets || [],
        totalMoney: transaction.totalMoney || transaction.amount || transaction.totalAmount || 0,
        addScore: transaction.addScore || 0,
        useScore: transaction.useScore || 0,
        paymentMethod: transaction.paymentMethod || 'online',
        status: status, // Use the properly mapped status
        promotion: transaction.promotion || transaction.promotionCode,
        promotionId: transaction.promotionId,
        // Keep seatStatus for backward compatibility
        seatStatus: transaction.seatStatus,
        ...transaction // Include any additional fields
      };
    });

    return mappedData;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}

// Lấy tất cả booking (admin)
export async function getAllBookings() {
  const token = authService.getToken?.() || localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error('No token provided');
  
  console.log("=== BOOKING SERVICE DEBUG ===");
  console.log("Token available:", !!token);
  console.log("Token type:", typeof token);
  
  try {
    const res = await fetch('http://localhost:5173/api/bookings', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("API Error:", errorText);
      throw new Error(`Failed to fetch bookings: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log("API Response data:", data);
    return data;
  } catch (error) {
    console.error("Service error:", error);
    throw error;
  }
}

// Lấy tất cả booking cho staff 
export async function getStaffBookings() {
  const token = authService.getToken?.() || localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error('No token provided');
  const res = await fetch('http://localhost:5173/api/staff/bookings', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

// Lấy chi tiết booking cho staff (chỉ xem)
export async function getStaffBookingById(id: string) {
  const token = authService.getToken?.() || localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error('No token provided');
  const res = await fetch(`http://localhost:5173/api/staff/bookings/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch booking details');
  return res.json();
}

// In vé cho booking (staff)
export async function printTicket(bookingId: string) {
  const token = authService.getToken?.() || localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error('No token provided');
  const res = await fetch(`http://localhost:5173/api/staff/bookings/${bookingId}/print`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to print ticket');
  return res.json();
}

// Tạo mới booking
export async function createBooking(data: any) {
  const token = authService.getToken?.() || localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error('No token provided');
  const res = await fetch('http://localhost:5173/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

// Cập nhật booking
export async function updateBooking(id: string, data: any) {
  const token = authService.getToken?.() || localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error('No token provided');
  const res = await fetch(`http://localhost:5173/api/bookings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update booking');
  return res.json();
}

// Xóa booking
export async function deleteBooking(id: string) {
  const token = authService.getToken?.() || localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error('No token provided');
  const res = await fetch(`http://localhost:5173/api/bookings/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete booking');
  return res.json();
} 