import React, { useState, useEffect } from "react";
import { 
  Film, 
  Users, 
  TrendingUp,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import { movieScheduleService } from "../../../services/api/movieScheduleService";
import { movieService } from "../../../services/api/movieService";
import { cinemaService } from "../../../services/api/cinemaService";

interface MovieSeatData {
  movieId: string;
  movieName: string;
  totalSchedules: number;
  totalSeats: number;
  totalBookedSeats: number;
  totalAvailableSeats: number;
  averageBookingPercentage: number;
  totalRevenue: number;
}

export default function MovieSeatSummary() {
  const [movieData, setMovieData] = useState<MovieSeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMovieSeatData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [scheduleRes, movieRes, cinemaRes] = await Promise.all([
        movieScheduleService.getAllMovieSchedules(),
        movieService.getAllMovies(),
        cinemaService.getAllCinemas(),
      ]);

      const schedules = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || [];
      const movies = Array.isArray(movieRes) ? movieRes : movieRes.data || [];
      const cinemas = Array.isArray(cinemaRes) ? cinemaRes : cinemaRes.data || [];

      // Group schedules by movie
      const movieScheduleMap = new Map<string, any[]>();
      schedules.forEach(schedule => {
        if (!movieScheduleMap.has(schedule.movieId)) {
          movieScheduleMap.set(schedule.movieId, []);
        }
        movieScheduleMap.get(schedule.movieId)!.push(schedule);
      });

      const movieSeatData: MovieSeatData[] = [];

      // Process each movie
      for (const [movieId, movieSchedules] of movieScheduleMap) {
        const movie = movies.find((m: any) => String(m._id) === String(movieId));
        if (!movie) continue;

        let totalSeats = 0;
        let totalBookedSeats = 0;
        let totalRevenue = 0;
        let validSchedules = 0;

        // Process each schedule for this movie
        for (const schedule of movieSchedules.slice(0, 5)) { // Limit to 5 schedules per movie
          try {
            const seatResponse = await getSeatsByScheduleId(schedule._id, schedule.cinemaRoomId);
            
            let seats: any[] = [];
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
              const bookedSeats = seats.filter((seat: any) => seat.seatStatus === 1).length;
              const scheduleRevenue = bookedSeats * (seats[0]?.price || 120000);
              
              totalSeats += seats.length;
              totalBookedSeats += bookedSeats;
              totalRevenue += scheduleRevenue;
              validSchedules++;
            }
          } catch (seatError) {
            console.error(`Error fetching seats for schedule ${schedule._id}:`, seatError);
          }
        }

        if (validSchedules > 0) {
          const totalAvailableSeats = totalSeats - totalBookedSeats;
          const averageBookingPercentage = totalSeats > 0 ? (totalBookedSeats / totalSeats) * 100 : 0;

          movieSeatData.push({
            movieId,
            movieName: movie.versionMovieEnglish || movie.versionMovieVn || "Unknown Movie",
            totalSchedules: validSchedules,
            totalSeats,
            totalBookedSeats,
            totalAvailableSeats,
            averageBookingPercentage,
            totalRevenue
          });
        }
      }

      // Sort by booking percentage descending
      movieSeatData.sort((a, b) => b.averageBookingPercentage - a.averageBookingPercentage);
      setMovieData(movieSeatData);

    } catch (err) {
      console.error('Error fetching movie seat data:', err);
      setError('Failed to load movie seat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieSeatData();
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
          <span className="ml-2 text-gray-600">Loading movie seat data...</span>
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
            onClick={fetchMovieSeatData}
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
            <Film className="w-5 h-5 mr-2" />
            Movie Seat Summary
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Exact seat counts and booking percentages for each movie
          </p>
        </div>
        <button
          onClick={fetchMovieSeatData}
          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {movieData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Film className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No movie data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {movieData.map((movie) => (
            <div
              key={movie.movieId}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Film className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">{movie.movieName}</h4>
                    <span className="text-sm text-gray-500">({movie.totalSchedules} schedules)</span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    <div>
                      <span className="text-gray-500">Total Seats:</span>
                      <span className="ml-2 font-medium">{movie.totalSeats}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Booked:</span>
                      <span className="ml-2 font-medium text-green-600">{movie.totalBookedSeats}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Available:</span>
                      <span className="ml-2 font-medium text-blue-600">{movie.totalAvailableSeats}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Revenue:</span>
                      <span className="ml-2 font-medium text-green-600">{formatCurrency(movie.totalRevenue)}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${movie.averageBookingPercentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <span>Average Booking Rate: </span>
                    <span className="font-medium">{movie.averageBookingPercentage.toFixed(1)}%</span>
                    <span className="mx-2">•</span>
                    <span>Available: </span>
                    <span className="font-medium">{movie.totalAvailableSeats}</span>
                    <span className="mx-2">•</span>
                    <span>Booked: </span>
                    <span className="font-medium">{movie.totalBookedSeats}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(movie.averageBookingPercentage)}`}>
                      {getStatusText(movie.averageBookingPercentage)}
                    </div>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                      {movie.averageBookingPercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 