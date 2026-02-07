import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Users,
  Ticket,
  TrendingUp,
  Calendar,
  RefreshCw,
  Activity,
  AlertTriangle,
  Film,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import type { Movie } from "../../../types/movie";
import { getAllBookings } from "../../../services/api/bookingService";
import { movieService } from "../../../services/api/movieService";
import { movieScheduleService } from "../../../services/api/movieScheduleService";
import { cinemaService } from "../../../services/api/cinemaService";
import { getAllMembers } from "../../../services/admin_api/memberService";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import { staffBookingService } from "../../../services/api/staffBookingService";
import { API_BASE_URL } from "../../../config/api";

export default function EmployeeDashboardContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("schedule");
  const [showingMovies, setShowingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // New state for real data
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [realScheduleData, setRealScheduleData] = useState<any[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [topRevenueMovies, setTopRevenueMovies] = useState<any[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [todayBookings, setTodayBookings] = useState(0);
  const [overallSeatBookingRate, setOverallSeatBookingRate] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [schedulesPerPage] = useState(5);

  const fetchAllData = async () => {
    try {
      console.log("Starting fetchAllData..."); // Debug log
      setLoading(true);
      setError(null);
      setMetricsLoading(true);
      setScheduleLoading(true);
      setMoviesLoading(true);
      setActivitiesLoading(true);

      // Fetch bookings data from both member bookings and staff bookings
      console.log("Fetching bookings..."); // Debug log
      
      // Get member bookings
      const memberBookingResponse = await getAllBookings();
      console.log("Member Booking Response:", memberBookingResponse); // Debug log
      
      // Get staff bookings
      const staffBookingResponse = await staffBookingService.getAllStaffBookings();
      console.log("Staff Booking Response:", staffBookingResponse); // Debug log
      
      let totalRevenue = 0;
      let totalTicketsSold = 0;
      let allBookingsData: any[] = [];
      let todayBookingsCount = 0;
      
      const today = new Date();
      const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Helper function to check if booking is from today
      const isBookingFromToday = (booking: any) => {
        // Check multiple possible date fields
        const possibleDates = [
          booking.bookedAt,
          booking.createdAt,
          booking.bookingDate,
          booking.showtimeDate
        ];
        
        for (const dateField of possibleDates) {
          if (dateField) {
            try {
              const date = new Date(dateField);
              const dateString = date.toISOString().split('T')[0];
              if (dateString === todayString) {
                return true;
              }
            } catch (error) {
              console.warn("Invalid date format:", dateField);
            }
          }
        }
        return false;
      };
      
      // Process member bookings
      if (memberBookingResponse.success && Array.isArray(memberBookingResponse.data)) {
        const confirmedMemberBookings = memberBookingResponse.data.filter(
          (booking: any) =>
            booking.status === "Confirmed" || booking.status === "confirmed"
        );
        const memberRevenue = confirmedMemberBookings.reduce(
          (sum: number, booking: any) => sum + (booking.amount || 0),
          0
        );
        totalRevenue += memberRevenue;
        totalTicketsSold += memberBookingResponse.data.length;
        allBookingsData.push(...memberBookingResponse.data);
        
        // Calculate today's member bookings
        const todayMemberBookings = memberBookingResponse.data.filter((booking: any) => 
          isBookingFromToday(booking)
        ).length;
        todayBookingsCount += todayMemberBookings;
        
        console.log("Member Bookings:", memberBookingResponse.data.length); // Debug log
        console.log("Member Revenue:", memberRevenue); // Debug log
        console.log("Today's Member Bookings:", todayMemberBookings); // Debug log
        
        // Debug: Check member booking structure
        if (memberBookingResponse.data.length > 0) {
          console.log("Member booking sample:", memberBookingResponse.data[0]); // Debug log
          console.log("Member booking date fields:", {
            bookedAt: memberBookingResponse.data[0].bookedAt,
            createdAt: memberBookingResponse.data[0].createdAt,
            bookingDate: memberBookingResponse.data[0].bookingDate
          }); // Debug log
        }
      }
      
      // Process staff bookings
      if (staffBookingResponse.success && Array.isArray(staffBookingResponse.data)) {
        const confirmedStaffBookings = staffBookingResponse.data.filter(
          (booking: any) =>
            booking.status === "Confirmed" || booking.status === "confirmed"
        );
        const staffRevenue = confirmedStaffBookings.reduce(
          (sum: number, booking: any) => sum + (booking.pricing?.total || 0),
          0
        );
        totalRevenue += staffRevenue;
        totalTicketsSold += staffBookingResponse.data.length;
        allBookingsData.push(...staffBookingResponse.data);
        
        // Calculate today's staff bookings
        const todayStaffBookings = staffBookingResponse.data.filter((booking: any) => 
          isBookingFromToday(booking)
        ).length;
        todayBookingsCount += todayStaffBookings;
        
        console.log("Staff Bookings:", staffBookingResponse.data.length); // Debug log
        console.log("Staff Revenue:", staffRevenue); // Debug log
        console.log("Today's Staff Bookings:", todayStaffBookings); // Debug log
        
        // Debug: Check staff booking structure
        if (staffBookingResponse.data.length > 0) {
          console.log("Staff booking sample:", staffBookingResponse.data[0]); // Debug log
          console.log("Staff booking date fields:", {
            createdAt: staffBookingResponse.data[0].createdAt,
            bookedAt: staffBookingResponse.data[0].bookedAt,
            bookingDate: staffBookingResponse.data[0].bookingDate,
            showtimeDate: staffBookingResponse.data[0].showtimeDate
          }); // Debug log
        }
      }
      
      setTotalRevenue(totalRevenue);
      setTicketsSold(totalTicketsSold);
      setAllBookings(allBookingsData);
      setTodayBookings(todayBookingsCount);
      
      console.log("Total Revenue:", totalRevenue); // Debug log
      console.log("Total Tickets Sold:", totalTicketsSold); // Debug log
      console.log("Today's Total Bookings:", todayBookingsCount); // Debug log
      
      // Debug: Check first booking structure
      if (allBookingsData.length > 0) {
        console.log("First booking structure:", allBookingsData[0]); // Debug log
      }

      // Fetch recent activities with user information
      console.log("Fetching recent activities..."); // Debug log
      await fetchRecentActivities(allBookingsData);

      // Fetch movies with "showing" status and calculate revenue
      console.log("Fetching movies..."); // Debug log
      const movieResponse = await movieService.getAllMovies();
      console.log("Movie Response:", movieResponse); // Debug log
      if (movieResponse.success && Array.isArray(movieResponse.data)) {
        const movies = movieResponse.data as Movie[];
        const showingMovies = movies.filter(movie => 
          movie.status?.toLowerCase() === 'showing'
        );
        setShowingMovies(showingMovies);
        console.log("All Movies:", movies.length); // Debug log
        console.log("Showing Movies:", showingMovies.length); // Debug log

        // Calculate top revenue movies from real booking data (both member and staff bookings)
        const confirmedMemberBookings = memberBookingResponse.success && Array.isArray(memberBookingResponse.data)
          ? memberBookingResponse.data.filter(
              (booking: any) =>
                booking.status === "confirmed" ||
                booking.status === "Confirmed"
            )
          : [];
          
        const confirmedStaffBookings = staffBookingResponse.success && Array.isArray(staffBookingResponse.data)
          ? staffBookingResponse.data.filter(
              (booking: any) =>
                booking.status === "confirmed" ||
                booking.status === "Confirmed"
            )
          : [];

        const moviesWithRevenue = movies
          .map((movie: any) => {
            console.log("Processing movie:", movie.versionMovieEnglish || movie.versionMovieVn, "ID:", movie._id); // Debug log
            
            // Calculate revenue from member bookings
            const memberMovieBookings = confirmedMemberBookings.filter(
              (booking: any) => {
                console.log("Checking member booking movieId:", booking.movieId, "vs movie._id:", movie._id); // Debug log
                return booking.movieId && booking.movieId._id === movie._id;
              }
            );
            const memberMovieRevenue = memberMovieBookings.reduce(
              (sum: number, booking: any) => sum + (booking.amount || 0),
              0
            );
            
            // Calculate revenue from staff bookings
            const staffMovieBookings = confirmedStaffBookings.filter(
              (booking: any) => {
                console.log("Checking staff booking movieId:", booking.movieId, "vs movie._id:", movie._id); // Debug log
                return booking.movieId && booking.movieId._id === movie._id;
              }
            );
            const staffMovieRevenue = staffMovieBookings.reduce(
              (sum: number, booking: any) => sum + (booking.pricing?.total || 0),
              0
            );
            
            const totalMovieRevenue = memberMovieRevenue + staffMovieRevenue;
            const totalTicketsSold = memberMovieBookings.length + staffMovieBookings.length;
            
            console.log("Movie:", movie.versionMovieEnglish || movie.versionMovieVn, "Member Revenue:", memberMovieRevenue, "Staff Revenue:", staffMovieRevenue, "Total Revenue:", totalMovieRevenue, "Total Tickets:", totalTicketsSold); // Debug log
            
            return {
              ...movie,
              revenue: totalMovieRevenue,
              ticketsSold: totalTicketsSold
            };
          })
          .filter(movie => movie.revenue > 0) // Only show movies with revenue
          .sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
          .slice(0, 5); // Top 5 movies

        console.log("Top Revenue Movies:", moviesWithRevenue); // Debug log
        setTopRevenueMovies(moviesWithRevenue);
        console.log("Set topRevenueMovies with length:", moviesWithRevenue.length); // Debug log
      } else {
        console.error("Failed to fetch movies or invalid response:", movieResponse);
        setTopRevenueMovies([]); // Set empty array instead of fallback data
        console.log("Set topRevenueMovies to empty array"); // Debug log
      }

      console.log("All Bookings:", allBookings.length); // Debug log
      console.log("Total Revenue:", totalRevenue); // Debug log
      console.log("Showing Movies:", showingMovies.length); // Debug log

      // Fetch schedule data - use same approach as schedule-management.tsx
      console.log("Fetching schedule data..."); // Debug log
      try {
        const [scheduleRes, movieRes, cinemaRes] = await Promise.all([
          movieScheduleService.getAllMovieSchedules(),
          movieService.getAllMovies(),
          cinemaService.getAllCinemas(),
        ]);
        
        console.log("scheduleRes", scheduleRes);
        console.log("movieRes", movieRes);
        console.log("cinemaRes", cinemaRes);
        
        const schedules = Array.isArray(scheduleRes)
          ? scheduleRes
          : scheduleRes.data || [];
        const movies = Array.isArray(movieRes) ? movieRes : movieRes.data || [];
        const cinemas = Array.isArray(cinemaRes)
          ? cinemaRes
          : cinemaRes.data || [];

        console.log("Schedule data fetched:", schedules.length, "schedules"); // Debug log
        console.log("Movies for schedule:", movies.length, "movies"); // Debug log
        console.log("Cinemas for schedule:", cinemas.length, "cinemas"); // Debug log

        // Process schedule data with real seat information
        const processedSchedules = [];
        
        for (const schedule of schedules) { // Show all schedules instead of limiting to 5
          try {
            // Get seat data from scheduleSeat API
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
            const movie = movies.find(
              (m: any) => String(m._id) === String(schedule.movieId)
            );
            const cinema = cinemas.find(
              (c: any) => String(c._id) === String(schedule.cinemaId)
            );
            const room = cinema?.rooms?.find(
              (r: any) => String(r._id) === String(schedule.cinemaRoomId)
            );

            // Get first schedule time for display
            const firstScheduleTime =
              schedule.scheduleTime && schedule.scheduleTime.length > 0
                ? schedule.scheduleTime[0]
                : null;

            const time =
              firstScheduleTime &&
              firstScheduleTime.time &&
              firstScheduleTime.time.length > 0
                ? firstScheduleTime.time[0]
                : "TBD";

              // Calculate real seat data
              const bookedSeats = seats.filter((seat: any) => seat.seatStatus === 1).length;
              const totalSeats = seats.length;
              const bookingPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

              processedSchedules.push({
              time,
              title: movie?.versionMovieEnglish || movie?.versionMovieVn || "Unknown Movie",
                room: room?.roomName || `Room ${schedule.cinemaRoomId}`,
                bookingPercentage: Math.round(bookingPercentage),
                capacity: totalSeats,
                booked: bookedSeats,
              });
            }
          } catch (seatError) {
            console.error(`Error fetching seats for schedule ${schedule._id}:`, seatError);
            // Continue with other schedules even if one fails
          }
        }

        console.log("Processed schedules with real seat data:", processedSchedules.length); // Debug log
        setRealScheduleData(processedSchedules);
        
        // Calculate overall seat booking rate from all schedules
        if (processedSchedules.length > 0) {
          const totalBooked = processedSchedules.reduce((sum, schedule) => sum + schedule.booked, 0);
          const totalCapacity = processedSchedules.reduce((sum, schedule) => sum + schedule.capacity, 0);
          const overallRate = totalCapacity > 0 ? (totalBooked / totalCapacity) * 100 : 0;
          setOverallSeatBookingRate(Math.round(overallRate));
        }
      } catch (scheduleError) {
        console.error("Error fetching schedule data:", scheduleError);
        setRealScheduleData([]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error loading dashboard data');
    } finally {
      console.log("Setting loading states to false..."); // Debug log
      setLoading(false);
      setMetricsLoading(false);
      setScheduleLoading(false);
      setMoviesLoading(false);
      setActivitiesLoading(false);
      console.log("Set moviesLoading to false"); // Debug log
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const refreshDashboard = async () => {
    console.log("Refreshing dashboard data...");
    setLoading(true);
    setError(null);
    setMetricsLoading(true);
    setScheduleLoading(true);
    setMoviesLoading(true);
    setActivitiesLoading(true);
    setCurrentPage(1); // Reset to first page when refreshing
    
    // Clear any cached data
    setTopRevenueMovies([]);
    setAllBookings([]);
    setShowingMovies([]);
    setRealScheduleData([]);
    
    await fetchAllData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  const fetchRecentActivities = async (bookings: any[]) => {
    if (!bookings.length) {
      setRecentActivities([
        {
          action: "No recent activities",
          customer: "No data",
          movie: "No movies",
          time: "N/A",
          amount: "₫0",
          status: "none",
          bookingId: "none",
        }
      ]);
      return;
    }

    try {
      // Fetch user information similar to booking-management.tsx
      let userMap: Record<string, any> = {};
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const userRes = await getAllMembers(token);
          if (userRes.data && userRes.data.data) {
            userMap = userRes.data.data.reduce(
              (acc: Record<string, any>, user: any) => {
                acc[user._id] = {
                  fullName: user.fullName,
                  email: user.email,
                  phone: user.phoneNumber || user.phone,
                  address: user.address,
                };
                return acc;
              },
              {}
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }

      // Process bookings with user and movie information
      const activities = bookings
        .sort((a: any, b: any) => new Date(b.bookedAt).getTime() - new Date(a.bookedAt).getTime()) // Sort by latest first
        .slice(0, 4) // Get latest 4 bookings
        .map((booking: any, index: number) => {
          console.log(`Processing booking ${index}:`, booking); // Debug log
          console.log(`Booking ${index} - movieId:`, booking.movieId); // Debug log
          console.log(`Booking ${index} - movieId type:`, typeof booking.movieId); // Debug log
          console.log(`Booking ${index} - movieId keys:`, booking.movieId ? Object.keys(booking.movieId) : 'null'); // Debug log
          console.log(`Booking ${index} - movieTitle:`, booking.movieTitle); // Debug log
          console.log(`Booking ${index} - all booking keys:`, Object.keys(booking)); // Debug log
          
          const timeAgo = booking.bookedAt 
            ? new Date(booking.bookedAt).toLocaleString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
            : 'Unknown time';
          
          // Get customer name from userMap (similar to booking-management.tsx)
          const userInfo = userMap[booking.userId] || {};
          const customerName = userInfo.fullName || "Anonymous";
          
          // Get movie name from booking data - check if movieId is populated or just ID
          let movieName = "Unknown Movie";
          if (booking.movieId) {
            if (typeof booking.movieId === 'object' && booking.movieId !== null) {
              // If movieId is populated with movie details
              movieName = booking.movieId.versionMovieEnglish || 
                         booking.movieId.versionMovieVn || 
                         "Unknown Movie";
            } else if (typeof booking.movieId === 'string') {
              // If movieId is just a string ID, try to find movie in our movies list
              console.log(`Looking for movie with ID: ${booking.movieId}`); // Debug log
              console.log(`Available movies:`, showingMovies.map(m => ({ id: m._id, name: m.versionMovieEnglish || m.versionMovieVn }))); // Debug log
              const movie = showingMovies.find(m => m._id === booking.movieId);
              if (movie) {
                movieName = movie.versionMovieEnglish || movie.versionMovieVn || "Unknown Movie";
                console.log(`Found movie: ${movieName}`); // Debug log
              } else {
                console.log(`Movie not found for ID: ${booking.movieId}`); // Debug log
              }
            }
          }
          
          console.log(`Booking ${index} - Customer: ${customerName}, Movie: ${movieName}`); // Debug log
          console.log(`Booking ${index} - Final movie name: ${movieName}`); // Debug log
          
          return {
            action: booking.status === 'confirmed' ? "Booking confirmed" : "Ticket sold",
            customer: customerName,
            movie: movieName,
            time: timeAgo,
            amount: formatCurrency(booking.amount || 0),
            status: booking.status,
            bookingId: booking._id,
            userEmail: userInfo.email || "",
            userPhone: userInfo.phone || "",
          };
        });

      console.log("Generated activities:", activities); // Debug log
      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([
        {
          action: "Error loading activities",
          customer: "Error",
          movie: "Error",
          time: "N/A",
          amount: "₫0",
          status: "error",
          bookingId: "error",
        }
      ]);
    }
  };

  // Generate schedule data from showing movies
  const generateTodaySchedule = () => {
    if (!showingMovies.length) return [];
    
    const rooms = ["Room 1", "Room 2", "Room 3", "Room 4"];
    const times = ["09:00", "12:30", "15:45", "19:00", "21:30"];
    const statuses = ["upcoming", "ongoing"];
    
    return showingMovies.slice(0, 4).map((movie, index) => ({
      time: times[index % times.length],
      movie: movie.versionMovieEnglish || movie.versionMovieVn,
      room: rooms[index % rooms.length],
      sold: Math.floor(Math.random() * 60) + 20,
      total: Math.floor(Math.random() * 40) + 50,
      status: statuses[index % statuses.length] as "ongoing" | "upcoming",
    }));
  };

  const todaySchedule = generateTodaySchedule();

  const handleViewAllActivities = () => {
    navigate("/staff/member-booking");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "top-movies":
        console.log("Rendering Top Movies tab:"); // Debug log
        console.log("moviesLoading:", moviesLoading); // Debug log
        console.log("topRevenueMovies:", topRevenueMovies); // Debug log
        console.log("topRevenueMovies.length:", topRevenueMovies.length); // Debug log
        
        return (
          <div className="space-y-4">
            {moviesLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading top revenue movies...
              </div>
            ) : topRevenueMovies.length > 0 ? (
              topRevenueMovies.map((movie, index) => {
                const colors = ["blue", "green", "purple", "orange", "pink"];
                const color = colors[index % colors.length];
                const percentage = totalRevenue > 0 ? (movie.revenue / totalRevenue) * 100 : 0;
                
                console.log("Rendering movie:", movie.versionMovieEnglish || movie.versionMovieVn, "Revenue:", movie.revenue); // Debug log
                
                return (
                  <div key={movie._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 bg-${color}-100 rounded flex items-center justify-center`}>
                        <Film className={`h-6 w-6 text-${color}-600`} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {movie.versionMovieEnglish || movie.versionMovieVn}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movie.ticketsSold} tickets sold • {percentage.toFixed(1)}% of total revenue
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(movie.revenue)}
                      </div>
                      <div className="text-xs text-gray-500">Revenue</div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 bg-${color}-600`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No revenue data available for showing movies
              </div>
            )}
          </div>
        );
      case "schedule":
        // Calculate pagination
        const indexOfLastSchedule = currentPage * schedulesPerPage;
        const indexOfFirstSchedule = indexOfLastSchedule - schedulesPerPage;
        const currentSchedules = realScheduleData.slice(indexOfFirstSchedule, indexOfLastSchedule);
        const totalPages = Math.ceil(realScheduleData.length / schedulesPerPage);

        return (
          <div className="space-y-4">
            {scheduleLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading schedules...
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                {error}
              </div>
            ) : realScheduleData.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    Showing {indexOfFirstSchedule + 1}-{Math.min(indexOfLastSchedule, realScheduleData.length)} of {realScheduleData.length} schedules
                  </div>
                  <div className="text-sm text-gray-500">
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {currentSchedules.map((show, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[60px]">
                      <div className="text-lg font-bold text-gray-900">
                        {show.time}
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              show.bookingPercentage >= 90
                                ? "bg-red-100 text-red-800"
                                : show.bookingPercentage >= 70
                                ? "bg-orange-100 text-orange-800"
                                : show.bookingPercentage >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                        }`}
                      >
                            {show.bookingPercentage >= 90 ? "Almost Full" : 
                             show.bookingPercentage >= 70 ? "High Demand" :
                             show.bookingPercentage >= 50 ? "Moderate" : "Available"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {show.title}
                      </div>
                      <div className="text-sm text-gray-500">{show.room}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {show.booked}/{show.capacity}
                    </div>
                    <div className="text-xs text-gray-500">
                      {show.bookingPercentage}% sold
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {show.capacity - show.booked} seats available
                        </div>
                    </div>
                  </div>
                  ))}
                </div>

                {/* Enhanced Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-300 bg-white hover:bg-gray-50 h-8 w-8 p-0"
                        title="First page"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-300 bg-white hover:bg-gray-50 h-8 w-8 p-0"
                        title="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border h-8 w-8 p-0 ${
                              currentPage === pageNum
                                ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                                : "border-gray-300 bg-white hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-300 bg-white hover:bg-gray-50 h-8 w-8 p-0"
                        title="Next page"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-300 bg-white hover:bg-gray-50 h-8 w-8 p-0"
                        title="Last page"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No schedules available for showing movies
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Loading skeleton component for metrics cards
  const MetricsCardSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
        </div>
        <div className="animate-pulse bg-gray-200 p-3 rounded-full h-12 w-12"></div>
      </div>
      <div className="animate-pulse bg-gray-200 h-4 w-32 rounded"></div>
    </div>
  );

  // Full screen loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Activity className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshDashboard}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors flex items-center mx-auto space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Staff Dashboard
            </h1>
            <p className="text-gray-600">
              Monitor cinema operations and performance
            </p>
          </div>
          <button
            onClick={refreshDashboard}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors space-x-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full">
        {metricsLoading ? (
          <>
            <MetricsCardSkeleton />
            <MetricsCardSkeleton />
            <MetricsCardSkeleton />
          </>
        ) : (
          <>
            {/* Today's Sales */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Today's Sales</h3>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-gray-500 ml-1">vs yesterday</span>
                </div>
              </div>
            </div>

            {/* Tickets Sold */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Tickets Sold</h3>
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">{ticketsSold}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+8.2%</span>
                  <span className="text-gray-500 ml-1">vs yesterday</span>
                </div>
              </div>
            </div>

            {/* Bookings Today */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">
                  Bookings Today
                </h3>
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-gray-900">{todayBookings}</p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+15%</span>
                  <span className="text-gray-500 ml-1">vs yesterday</span>
                </div>
              </div>
            </div>


          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cinema Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cinema Overview
            </h3>
            <div className="flex space-x-8 text-sm border-b border-gray-200">
              <button
                className={`pb-2 -mb-px ${
                  activeTab === "schedule"
                    ? "text-blue-600 font-medium border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("schedule")}
              >
                Schedule
              </button>
              <button
                className={`pb-2 -mb-px ${
                  activeTab === "top-movies"
                    ? "text-blue-600 font-medium border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("top-movies")}
              >
                Top Movies
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>

        {/* Right Column - Recent Activities */}
        <div className="space-y-6">
        {/* Recent Activities - Separate Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full h-fit">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activities
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Latest transactions and actions
            </p>
          </div>
          <div className="space-y-4 h-96 overflow-y-auto">
            {activitiesLoading ? (
              <div className="text-center py-4 text-gray-500">
                Loading recent activities...
              </div>
            ) : (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {activity.customer} • {activity.movie}
                    </div>
                    {activity.status && (
                      <div className="text-xs text-gray-400">
                        Status: {activity.status}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-500">{activity.time}</div>
                    <div className="text-sm font-medium text-gray-900">
                      {activity.amount}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={handleViewAllActivities}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-gray-300 bg-white hover:bg-gray-50 h-10 py-2 px-4 w-full mt-4"
          >
            View All Activities
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
