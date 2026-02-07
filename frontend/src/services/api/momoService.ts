import { authService } from './authService';

export interface BookingData {
    scheduleId: string;
    movieId: string;
    cinemaRoomId: string;
    seats: Array<{
        row: string;
        col: number;
        seatId?: string;
    }>;
    seatStatus: number;
    userId: string;
    concessions?: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    amount?: number;
    promotion?: string;
    date: string;
    time: string;
    theater: string;
    format: string;
    paymentMethod: 'cash' | 'vnpay' | 'momo';
}

interface BookingResponseData {
    id: string;
    scheduleId: string;
    movieId: string;
    cinemaRoomId: string;
    seats: Array<{
        row: string;
        col: number;
        seatId?: string;
    }>;
    seatStatus: number;
    userId: string;
    concessions?: Array<{
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    amount: number;
    status: 'pending' | 'confirmed' | 'cancelled' | 'payment_failed';
    paymentMethod: 'cash' | 'vnpay' | 'momo';
    paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentDetails?: {
        transactionId?: string;
        paymentMethod?: string;
        amount?: number;
        bankCode?: string;
        cardType?: string;
        date?: string;
        responseCode?: string;
    };
    data?: BookingResponseData;
}

interface BookingResponse {
    success: boolean;
    data?: BookingResponseData;
    paymentUrl?: string;
}

const momoService = {
    /**
     * Create a booking with MoMo payment method
     * @param bookingData Booking information
     * @returns Response with booking data and payment URL
     */
    createMoMoBooking: async (bookingData: BookingData): Promise<BookingResponse> => {
        // Set payment method to MoMo
        const bookingWithMoMo = {
            ...bookingData,
            paymentMethod: 'momo'
        };

        const token = authService.getToken?.() || localStorage.getItem('token');
        if (!token) throw new Error('No token provided');

        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(bookingWithMoMo)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData?.message || 'Failed to create booking');
        }

        return res.json();
    },

    /**
     * Process the payment by redirecting to MoMo
     * @param paymentUrl The URL returned from the backend to redirect to MoMo
     */
    processPayment: (paymentUrl: string): void => {
        window.location.href = paymentUrl;
    },

    /**
     * Get booking status after payment
     * @param bookingId The ID of the booking
     * @returns Booking data with updated status
     */
    getBookingStatus: async (bookingId: string): Promise<BookingResponse> => {
        const token = authService.getToken?.() || localStorage.getItem('token');
        if (!token) throw new Error('No token provided');

        const res = await fetch(`/api/bookings/${bookingId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData?.message || 'Failed to get booking status');
        }

        return res.json();
    },

    /**
     * Update payment status after MoMo payment completion
     * @param bookingId The ID of the booking to update
     * @param status The new payment status ('completed' | 'failed')
     * @param transactionInfo Optional transaction information from MoMo
     * @returns Updated booking data
     */
    updatePaymentStatus: async (
        bookingId: string,
        status: 'completed' | 'failed',
        transactionInfo?: {
            transactionId?: string;
            bankCode?: string;
            cardType?: string;
            responseCode?: string;
        }
    ): Promise<BookingResponse> => {
        const token = authService.getToken?.() || localStorage.getItem('token');
        if (!token) throw new Error('No token provided');

        const res = await fetch(`/api/bookings/${bookingId}/payment-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                paymentStatus: status,
                status: status === 'completed' ? 'confirmed' : 'payment_failed',
                paymentDetails: {
                    ...transactionInfo,
                    date: new Date().toISOString()
                }
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData?.message || `Failed to update payment status to ${status}`);
        }

        return res.json();
    }
};

export default momoService; 