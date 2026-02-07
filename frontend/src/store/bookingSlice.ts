import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Movie } from "../types/movie";
import type { SelectedSeatInfo } from "../types/seat";
import type { Product } from "../types/product";

// Define more specific types
type Showtime = string;
type Theater = { id: string; name: string } | string | null; // Expanded to support object or string
type BookingDate = string;

export interface OrderItem extends Product {
  quantity: number;
}

interface BookingState {
  movie: Movie | null;
  date: BookingDate | null;
  time: Showtime | null;
  theater: Theater;
  theaterId: string | null;
  format: string | null;
  seats: SelectedSeatInfo[];
  concessions: OrderItem[];
  city: string | null;
  scheduleId: string | null;
  cinemaRoomId: string | null;
  userId: string | null;
}

const initialState: BookingState = {
  movie: null,
  date: null,
  time: null,
  theater: null,
  theaterId: null,
  format: null,
  seats: [],
  concessions: [],
  city: null,
  scheduleId: null,
  cinemaRoomId: null,
  userId: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setBookingScheduleAndRoom: (
      state,
      action: PayloadAction<{ scheduleId: string; cinemaRoomId: string }>
    ) => {
      state.scheduleId = action.payload.scheduleId;
      state.cinemaRoomId = action.payload.cinemaRoomId;
    },
    setBookingSeats: (state, action: PayloadAction<SelectedSeatInfo[]>) => {
      state.seats = action.payload;
    },
    setBookingMovie: (state, action: PayloadAction<Movie>) => {
      state.movie = action.payload;
    },
    setBookingDetails: (
      state,
      action: PayloadAction<{
        date: BookingDate;
        time: Showtime;
        theater: Theater;
        theaterId?: string;
        format?: string;
      }>
    ) => {
      state.date = action.payload.date;
      state.time = action.payload.time;
      state.theater = action.payload.theater;
      state.theaterId = action.payload.theaterId || null;
      state.format = action.payload.format || null;
    },
    updateConcession: (state, action: PayloadAction<OrderItem>) => {
      const { id, quantity } = action.payload;
      const existingIndex = state.concessions.findIndex((item) => item.id === id);

      if (existingIndex >= 0) {
        if (quantity === 0) {
          state.concessions.splice(existingIndex, 1);
        } else {
          state.concessions[existingIndex] = { ...state.concessions[existingIndex], quantity };
        }
      } else if (quantity > 0) {
        state.concessions.push(action.payload);
      }
    },
    clearBooking: (state) => {
      state.movie = null;
      state.date = null;
      state.time = null;
      state.theater = null;
      state.theaterId = null;
      state.format = null;
      state.seats = [];
      state.concessions = [];
      state.city = null;
      state.scheduleId = null;
      state.cinemaRoomId = null;
      state.userId = null;
    },
    clearConcessions: (state) => {
      state.concessions = [];
    },
    setBookingCity: (state, action: PayloadAction<string>) => {
      state.city = action.payload;
    },
    setBookingMeta: (
      state,
      action: PayloadAction<{ scheduleId?: string; cinemaRoomId?: string; userId?: string }>
    ) => {
      const { scheduleId, cinemaRoomId, userId } = action.payload;
      if (scheduleId !== undefined) state.scheduleId = scheduleId;
      if (cinemaRoomId !== undefined) state.cinemaRoomId = cinemaRoomId;
      if (userId !== undefined) state.userId = userId;
    },
  },
});

export const {
  setBookingMovie,
  setBookingDetails,
  setBookingSeats,
  updateConcession,
  clearBooking,
  clearConcessions,
  setBookingCity,
  setBookingScheduleAndRoom,
  setBookingMeta,
} = bookingSlice.actions;
export type { BookingState };
export default bookingSlice.reducer;