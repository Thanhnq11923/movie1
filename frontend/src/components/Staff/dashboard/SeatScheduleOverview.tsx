import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Users, 
  Film, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  RefreshCw,
  Eye
} from "lucide-react";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import { movieScheduleService } from "../../../services/api/movieScheduleService";
import { movieService } from "../../../services/api/movieService";
import { cinemaService } from "../../../services/api/cinemaService";
import SeatVisualization from "./SeatVisualization";

interface SeatData {
  _id: string;
  seatId: string;
  row: string;
  col: number;
  seatStatus: number;
  price: number;
}

interface ScheduleSeatInfo {
  _id: string;
  movieId: string;
  cinemaRoomId: string;
  seats: SeatData[];
}

interface MovieInfo {
  _id: string;
  versionMovieEnglish?: string;
  versionMovieVn?: string;
}

interface CinemaRoomInfo {
  _id: string;
  roomName?: string;
  capacity?: number;
}

interface ProcessedScheduleData {
  scheduleId: string;
  movieName: string;
  roomName: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  bookingPercentage: number;
  totalRevenue: number;
}

export default function SeatScheduleOverview() {
  const [scheduleData, setScheduleData] = useState<ProcessedScheduleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [detailedSeats, setDetailedSeats] = useState<SeatData[]>([]);
  const [showSeatDetails, setShowSeatDetails] = useState(false);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all schedules, movies, and cinemas
      const [scheduleRes, movieRes, cinemaRes] = await Promise.all([
        movieScheduleService.getAllMovieSchedules(),
        movieService.getAllMovies(),
        cinemaService.getAllCinemas(),
      ]);

      const schedules = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || [];
      const movies = Array.isArray(movieRes) ? movieRes : movieRes.data || [];
      const cinemas = Array.isArray(cinemaRes) ? cinemaRes : cinemaRes.data || [];

      console.log("Fetched data:", { 
        schedules: schedules.length, 
        movies: movies.length, 
        cinemas: cinemas.length 
      });

      // Process each schedule to get seat information
      const processedData: ProcessedScheduleData[] = [];

      for (const schedule of schedules.slice(0, 10)) { // Limit to 10 schedules for performance
        try {
          const seatResponse = await getSeatsByScheduleId(schedule._id, schedule.cinemaRoomId);
          
          let seats: SeatData[] = [];
          if (Array.isArray(seatResponse)) {
            if (seatResponse.length > 0 && seatResponse[0].seats) {
              seats = seatResponse[0].seats;
            }
          } else if (seatResponse.seats) {
            seats = seatResponse.seats;
          } else if (seatResponse.data && seatResponse.data.seats) {
            seats = seatResponse.data.seats;
          }

          if (seats.length > 0) {
            const movie = movies.find((m: any) => String(m._id) === String(schedule.movieId));
            const cinema = cinemas.find((c: any) => String(c._id) === String(schedule.cinemaId));
            const room = cinema?.rooms?.find((r: any) => String(r._id) === String(schedule.cinemaRoomId));

            const bookedSeats = seats.filter(seat => seat.seatStatus === 1).length;
            const totalSeats = seats.length;
            const availableSeats = totalSeats - bookedSeats;
            const bookingPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
            const totalRevenue = bookedSeats * (seats[0]?.price || 120000);

            processedData.push({
              scheduleId: schedule._id,
              movieName: movie?.versionMovieEnglish || movie?.versionMovieVn || "Unknown Movie",
              roomName: room?.roomName || `Room ${schedule.cinemaRoomId}`,
              totalSeats,
              bookedSeats,
              availableSeats,
              bookingPercentage,
              totalRevenue
            });
          }
        } catch (seatError) {
          console.error(`Error fetching seats for schedule ${schedule._id}:`, seatError);
          // Continue with other schedules even if one fails
        }
      }

      setScheduleData(processedData);
      console.log("Processed schedule data:", processedData);

    } catch (err) {
      console.error('Error fetching schedule data:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSeats = async (scheduleId: string) => {
    try {
      setSelectedSchedule(scheduleId);
      setShowSeatDetails(true);
      
      const seatResponse = await getSeatsByScheduleId(scheduleId);
      let seats: SeatData[] = [];
      
      if (Array.isArray(seatResponse)) {
        if (seatResponse.length > 0 && seatResponse[0].seats) {
          seats = seatResponse[0].seats;
        }
      } else if (seatResponse.seats) {
        seats = seatResponse.seats;
      } else if (seatResponse.data && seatResponse.data.seats) {
        seats = seatResponse.data.seats;
      }

      setDetailedSeats(seats);
    } catch (error) {
      console.error('Error fetching detailed seats:', error);
      setError('Failed to load seat details');
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 bg-red-100";
    if (percentage >= 70) return "text-orange-600 bg-orange-100";
    if (percentage >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getStatusText = (percentage: number) => {
    if (percentage >= 90) return "Almost Full";
    if (percentage >= 70) return "High Demand";
    if (percentage >= 50) return "Moderate";
    return "Available";
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading seat schedule data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="ml-2 text-red-600">{error}</span>
          <button 
            onClick={fetchScheduleData}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Seat Schedule Overview
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Real-time seat booking status for all schedules
          </p>
        </div>
        <button
          onClick={fetchScheduleData}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {scheduleData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Film className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No schedule data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduleData.map((schedule) => (
            <div
              key={schedule.scheduleId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Film className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{schedule.movieName}</h4>
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{schedule.roomName}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Total Seats:</span>
                      <span className="ml-2 font-medium">{schedule.totalSeats}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Booked:</span>
                      <span className="ml-2 font-medium text-green-600">{schedule.bookedSeats}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Available:</span>
                      <span className="ml-2 font-medium text-blue-600">{schedule.availableSeats}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-2 font-medium text-green-600">{formatCurrency(schedule.totalRevenue)}</span>
                    </div>
                  </div>
                  
                  {/* Additional seat details */}
                  <div className="mt-3 text-xs text-gray-500">
                    <span>Booking Rate: </span>
                    <span className="font-medium">{schedule.bookingPercentage.toFixed(1)}%</span>
                    <span className="mx-2">•</span>
                    <span>Available Seats: </span>
                    <span className="font-medium">{schedule.availableSeats}</span>
                    <span className="mx-2">•</span>
                    <span>Booked Seats: </span>
                    <span className="font-medium">{schedule.bookedSeats}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.bookingPercentage)}`}>
                      {getStatusText(schedule.bookingPercentage)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {schedule.bookingPercentage.toFixed(1)}%
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewSeats(schedule.scheduleId)}
                    className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Seats
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Seat Details Modal */}
      {showSeatDetails && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Seat Details</h3>
              <button
                onClick={() => setShowSeatDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <SeatVisualization 
              scheduleId={selectedSchedule}
              movieName={scheduleData.find(s => s.scheduleId === selectedSchedule)?.movieName}
              roomName={scheduleData.find(s => s.scheduleId === selectedSchedule)?.roomName}
            />
          </div>
        </div>
      )}
    </div>
  );
} 