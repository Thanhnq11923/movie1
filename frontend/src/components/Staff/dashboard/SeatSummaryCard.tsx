import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  RefreshCw
} from "lucide-react";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import { movieScheduleService } from "../../../services/api/movieScheduleService";

interface SeatSummary {
  totalSchedules: number;
  totalSeats: number;
  totalBookedSeats: number;
  totalAvailableSeats: number;
  overallBookingPercentage: number;
  totalRevenue: number;
  averageRevenuePerSchedule: number;
}

export default function SeatSummaryCard() {
  const [summary, setSummary] = useState<SeatSummary>({
    totalSchedules: 0,
    totalSeats: 0,
    totalBookedSeats: 0,
    totalAvailableSeats: 0,
    overallBookingPercentage: 0,
    totalRevenue: 0,
    averageRevenuePerSchedule: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const scheduleRes = await movieScheduleService.getAllMovieSchedules();
      const schedules = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || [];

      console.log("SeatSummaryCard - Total schedules found:", schedules.length);

      let totalSeats = 0;
      let totalBookedSeats = 0;
      let totalRevenue = 0;
      let processedSchedules = 0;

      // Process first 10 schedules for performance
      for (const schedule of schedules.slice(0, 10)) {
        try {
          console.log(`SeatSummaryCard - Processing schedule: ${schedule._id}, room: ${schedule.cinemaRoomId}`);
          
          const seatResponse = await getSeatsByScheduleId(schedule._id, schedule.cinemaRoomId);
          console.log(`SeatSummaryCard - Seat response for schedule ${schedule._id}:`, seatResponse);
          console.log(`SeatSummaryCard - Seat response type:`, typeof seatResponse);
          console.log(`SeatSummaryCard - Seat response is array:`, Array.isArray(seatResponse));
          if (seatResponse && typeof seatResponse === 'object') {
            console.log(`SeatSummaryCard - Seat response keys:`, Object.keys(seatResponse));
          }
          
          let seats: any[] = [];
          
          // Handle different response formats
          if (Array.isArray(seatResponse)) {
            if (seatResponse.length > 0 && seatResponse[0].seats) {
              seats = seatResponse[0].seats;
            } else if (seatResponse.length > 0 && Array.isArray(seatResponse[0])) {
              seats = seatResponse[0];
            } else if (seatResponse.length > 0 && seatResponse[0] && typeof seatResponse[0] === 'object') {
              // Handle case where response is array of objects with seats property
              seats = seatResponse[0].seats || seatResponse[0];
            }
          } else if (seatResponse && seatResponse.seats) {
            seats = seatResponse.seats;
          } else if (seatResponse && seatResponse.data && seatResponse.data.seats) {
            seats = seatResponse.data.seats;
          } else if (seatResponse && Array.isArray(seatResponse)) {
            seats = seatResponse;
          } else if (seatResponse && typeof seatResponse === 'object') {
            // Handle case where response is a single object with seats property
            seats = seatResponse.seats || seatResponse;
          }

          // Additional check for the specific format shown in user data
          if (seats.length === 0 && seatResponse && typeof seatResponse === 'object' && seatResponse.seats) {
            console.log(`SeatSummaryCard - Found seats in seatResponse.seats for schedule ${schedule._id}`);
            seats = seatResponse.seats;
          }

          console.log(`SeatSummaryCard - Processed seats for schedule ${schedule._id}:`, seats.length);
          console.log(`SeatSummaryCard - Seat data structure:`, seats.length > 0 ? seats[0] : 'No seats');

          if (seats.length > 0) {
            const bookedSeats = seats.filter((seat: any) => seat.seatStatus === 1).length;
            const scheduleRevenue = bookedSeats * (seats[0]?.price || 120000);
            
            console.log(`SeatSummaryCard - Schedule ${schedule._id}: ${bookedSeats}/${seats.length} seats booked`);
            
            totalSeats += seats.length;
            totalBookedSeats += bookedSeats;
            totalRevenue += scheduleRevenue;
            processedSchedules++;
          } else {
            console.log(`SeatSummaryCard - No seats found for schedule ${schedule._id}`);
          }
        } catch (seatError) {
          console.error(`SeatSummaryCard - Error fetching seats for schedule ${schedule._id}:`, seatError);
        }
      }

      console.log(`SeatSummaryCard - Final summary:`, {
        processedSchedules,
        totalSeats,
        totalBookedSeats,
        totalRevenue
      });

      // Fallback to sample data if no real data is available
      if (processedSchedules === 0 && schedules.length > 0) {
        console.log("SeatSummaryCard - No seat data available, using sample data");
        setUsingFallback(true);
        const sampleSeats = 120; // Average seats per room
        const sampleBooked = Math.floor(Math.random() * 80) + 20; // Random booking between 20-100
        const sampleRevenue = sampleBooked * 120000;
        
        setSummary({
          totalSchedules: Math.min(schedules.length, 5),
          totalSeats: sampleSeats * Math.min(schedules.length, 5),
          totalBookedSeats: sampleBooked * Math.min(schedules.length, 5),
          totalAvailableSeats: (sampleSeats - sampleBooked) * Math.min(schedules.length, 5),
          overallBookingPercentage: Math.round((sampleBooked / sampleSeats) * 100),
          totalRevenue: sampleRevenue * Math.min(schedules.length, 5),
          averageRevenuePerSchedule: sampleRevenue
        });
      } else {
        setUsingFallback(false);
        const totalAvailableSeats = totalSeats - totalBookedSeats;
        const overallBookingPercentage = totalSeats > 0 ? (totalBookedSeats / totalSeats) * 100 : 0;
        const averageRevenuePerSchedule = processedSchedules > 0 ? totalRevenue / processedSchedules : 0;

        setSummary({
          totalSchedules: processedSchedules,
          totalSeats,
          totalBookedSeats,
          totalAvailableSeats,
          overallBookingPercentage,
          totalRevenue,
          averageRevenuePerSchedule
        });
      }

    } catch (err) {
      console.error('SeatSummaryCard - Error fetching summary data:', err);
      setError('Failed to load summary data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  const getTrendIcon = (percentage: number) => {
    if (percentage > 50) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (percentage > 25) {
      return <TrendingUp className="w-4 h-4 text-yellow-500" />;
    } else {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading seat summary...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="text-center text-red-500">
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchSummaryData}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Seat Booking Summary
          {usingFallback && (
            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              Sample Data
            </span>
          )}
        </h3>
        <button
          onClick={fetchSummaryData}
          className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.totalSchedules}</div>
          <div className="text-sm text-gray-500">Active Schedules</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.totalBookedSeats}</div>
          <div className="text-sm text-gray-500">Booked Seats</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.totalAvailableSeats}</div>
          <div className="text-sm text-gray-500">Available Seats</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            {getTrendIcon(summary.overallBookingPercentage)}
          </div>
          <div className="text-2xl font-bold text-gray-900">{summary.overallBookingPercentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Booking Rate</div>
        </div>
      </div>
    </div>
  );
} 