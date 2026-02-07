import { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Ticket,
  Film,
  Users,
  BarChart3,
  Activity,
  Star,
  Play,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { movieService } from "../../../services/api/movieService";
import { getAllBookings } from "../../../services/api/bookingService";
import { userService } from "../../../services/admin_api/userService";
import { staffBookingService } from "../../../services/api/staffBookingService";
import { getAllMembers } from "../../../services/admin_api/memberService";

// Unified ticket interface from ticket management
interface UnifiedTicketData {
  id: string;
  ticketCode: string;
  source: "customer_booking" | "staff_booking" | "direct_sale";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  movieTitle: string;
  showtime: string;
  date: string;
  room: string;
  seats: string[];
  totalPrice: number;
  paymentMethod: string;
  status: string;
  bookingTime: string;
  staffName?: string;
  concessions?: any[];
  memberDiscount?: number;
  promotionDiscount?: number;
  subtotal?: number;
  tax?: number;
}

type TabType = "overview" | "movies";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [revenueFilter, setRevenueFilter] = useState<"week" | "month" | "year">("month");
  const [selectedRevenueYear, setSelectedRevenueYear] = useState<number>(new Date().getFullYear());
  const [selectedRevenueMonth, setSelectedRevenueMonth] = useState<number>(new Date().getMonth() + 1);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [showingMovies, setShowingMovies] = useState<any[]>([]);
  const [genreDistribution, setGenreDistribution] = useState<any[]>([]);
  const [timeSlotData, setTimeSlotData] = useState<any[]>([]);
  const [tickets, setTickets] = useState<UnifiedTicketData[]>([]); // Add tickets state
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [staffWorking, setStaffWorking] = useState(0);
  const [totalStaff, setTotalStaff] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);
  const [activeMembers, setActiveMembers] = useState(0);
  const [lockedMembers, setLockedMembers] = useState(0);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [movieRevenueData, setMovieRevenueData] = useState<any[]>([]);
  const [highestRevenueMovie, setHighestRevenueMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [timeSlotMode, setTimeSlotMode] = useState<"week" | "year">("week");

  // Add error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Dashboard Error:', error);
      setError('An error occurred while loading the dashboard');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Data for various charts - REMOVED OLD SAMPLE DATA
  // const revenueData = [
  //   { day: "Mon", value: 45, tickets: 120 },
  //   { day: "Tue", value: 52, tickets: 135 },
  //   { day: "Wed", value: 48, tickets: 128 },
  //   { day: "Thu", value: 65, tickets: 172 },
  //   { day: "Fri", value: 75, tickets: 198 },
  //   { day: "Sat", value: 85, tickets: 225 },
  //   { day: "Sun", value: 95, tickets: 250 },
  // ];

  // Function to generate revenue data based on filter
  const getRevenueData = (filter: "week" | "month" | "year", year?: number, month?: number) => {
    console.log("getRevenueData called with filter:", filter, "year:", year, "month:", month);
    
    // Use ticket management data instead of allBookings
    const ticketData = tickets;
    console.log("ticketData:", ticketData);
    
    if (!ticketData || ticketData.length === 0) {
      console.log("No ticket data available");
      return [];
    }

    // Filter confirmed tickets
    const confirmedTickets = ticketData.filter((ticket: UnifiedTicketData) => {
      const isCompleted = ticket.status === "Confirmed" || ticket.status === "confirmed";
      return isCompleted;
    });
    
    console.log("Confirmed tickets:", confirmedTickets);

    let revenueData: any[] = [];

    if (filter === "week") {
      const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      
      // Use bookingTime for accurate booking date
      const ticketsWithValidDates = confirmedTickets.filter((ticket: UnifiedTicketData) => {
        const ticketDate = ticket.bookingTime; // Use bookingTime instead of date
        if (!ticketDate) return false;
        
        try {
          const parsedDate = new Date(ticketDate);
          return !isNaN(parsedDate.getTime()) && 
                   parsedDate.getMonth() === (month || 1) - 1 && 
                   parsedDate.getFullYear() === (year || 2024);
        } catch (error) {
          return false;
        }
      });

      console.log("Tickets with valid booking times:", ticketsWithValidDates.length);

      if (ticketsWithValidDates.length === 0) {
        // If no valid dates for this month/year, show 0 for all days
        revenueData = daysOfWeek.map((day) => ({
          day,
          value: 0, // Show 0 instead of distributing
          tickets: 0,
        }));
        
        console.log("No data for selected month/year, showing 0:", revenueData);
      } else {
        // Use actual booking time data
        revenueData = daysOfWeek.map((day) => {
          const dayTickets = ticketsWithValidDates.filter((ticket: UnifiedTicketData) => {
            const ticketDate = ticket.bookingTime; // Use bookingTime
            
            try {
              const parsedDate = new Date(ticketDate);
              const dayName = parsedDate.toLocaleDateString("en-US", {
                weekday: "short",
              });
              console.log(`Ticket booking time: ${ticketDate}, parsed: ${parsedDate}, dayName: ${dayName}, target: ${day}`);
              return dayName === day;
            } catch (error) {
              console.error("Error parsing ticket booking time:", ticketDate);
              return false;
            }
          });

          // Calculate revenue: use actual totalPrice if available, otherwise estimate from tickets
          const actualRevenue = dayTickets.reduce(
            (sum: number, ticket: UnifiedTicketData) => sum + (ticket.totalPrice || 0),
            0
          );

          const tickets = dayTickets.length; // Count tickets, not seats
          
          // Only use actual revenue, don't estimate when actual revenue is 0
          const finalRevenue = actualRevenue;
          
          console.log(`Day ${day}: ${dayTickets.length} tickets, actual revenue: ${actualRevenue}, tickets: ${tickets}`);

          return {
            day,
            value: Math.round(finalRevenue / 1000000), // Convert to millions
            tickets,
          };
        });
      }
    } else if (filter === "month") {
      const daysInMonth = new Date(year || 2024, month || 1, 0).getDate();
      
      // Use bookingTime for accurate booking date
      const ticketsWithValidDates = confirmedTickets.filter((ticket: UnifiedTicketData) => {
        const ticketDate = ticket.bookingTime; // Use bookingTime instead of date
        if (!ticketDate) return false;
        
        try {
          const parsedDate = new Date(ticketDate);
          return !isNaN(parsedDate.getTime()) && 
                   parsedDate.getMonth() === (month || 1) - 1 && 
                   parsedDate.getFullYear() === (year || 2024);
        } catch (error) {
          return false;
        }
      });

      console.log("Tickets with valid booking times for month:", ticketsWithValidDates.length);

      if (ticketsWithValidDates.length === 0) {
        // If no valid dates for this month, show 0 for all days
        revenueData = Array.from({ length: daysInMonth }, (_, index) => ({
          day: (index + 1).toString(),
          value: 0, // Show 0 instead of distributing
          tickets: 0,
        }));
        
        console.log("No data for selected month, showing 0:", revenueData);
      } else {
        // Use actual booking time data
        revenueData = Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const dayTickets = ticketsWithValidDates.filter((ticket: UnifiedTicketData) => {
            const ticketDate = ticket.bookingTime; // Use bookingTime
            
            try {
              const parsedDate = new Date(ticketDate);
              return parsedDate.getDate() === day;
            } catch (error) {
              console.error("Error parsing ticket booking time:", ticketDate);
              return false;
            }
          });

          const actualRevenue = dayTickets.reduce(
            (sum: number, ticket: UnifiedTicketData) => sum + (ticket.totalPrice || 0),
            0
          );
          
          const tickets = dayTickets.length; // Count tickets, not seats
          
          // Only use actual revenue, don't estimate when actual revenue is 0
          const finalRevenue = actualRevenue;

          return {
            day: day.toString(),
            value: Math.round(finalRevenue / 1000000), // Convert to millions
            tickets,
          };
        });
      }
    } else {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      
      // Use bookingTime for accurate booking date
      const ticketsWithValidDates = confirmedTickets.filter((ticket: UnifiedTicketData) => {
        const ticketDate = ticket.bookingTime; // Use bookingTime instead of date
        if (!ticketDate) return false;
        
        try {
          const parsedDate = new Date(ticketDate);
          return !isNaN(parsedDate.getTime()) && 
                   parsedDate.getFullYear() === (year || 2024);
        } catch (error) {
          return false;
        }
      });

      console.log("Tickets with valid booking times for year:", ticketsWithValidDates.length);

      if (ticketsWithValidDates.length === 0) {
        // If no valid dates for this year, show 0 for all months
        revenueData = months.map((month) => ({
          day: month,
          value: 0, // Show 0 instead of distributing
          tickets: 0,
        }));
        
        console.log("No data for selected year, showing 0:", revenueData);
      } else {
        // Use actual booking time data
        revenueData = months.map((month, index) => {
          const monthTickets = ticketsWithValidDates.filter((ticket: UnifiedTicketData) => {
            const ticketDate = ticket.bookingTime; // Use bookingTime
            
            try {
              const parsedDate = new Date(ticketDate);
              return parsedDate.getMonth() === index;
            } catch (error) {
              console.error("Error parsing ticket booking time:", ticketDate);
              return false;
            }
          });

          const actualRevenue = monthTickets.reduce(
            (sum: number, ticket: UnifiedTicketData) => sum + (ticket.totalPrice || 0),
            0
          );
          
          const tickets = monthTickets.length; // Count tickets, not seats
          
          // Only use actual revenue, don't estimate when actual revenue is 0
          const finalRevenue = actualRevenue;

          return {
            day: month,
            value: Math.round(finalRevenue / 1000000), // Convert to millions
            tickets,
          };
        });
      }
    }
    
    console.log("Revenue data calculated:", revenueData);
    return revenueData;
  };

  const topMovies = [
    {
      id: 1,
      title: "Avatar 3",
      rating: 4.8,
      duration: "2h 45m",
      viewers: 1250,
      revenue: 31200000,
      status: "Now Showing",
      genre: "Sci-Fi",
    },
    {
      id: 2,
      title: "Spider-Man: Across the Spider-Verse",
      rating: 4.6,
      duration: "2h 20m",
      viewers: 980,
      revenue: 24500000,
      status: "Now Showing",
      genre: "Animation",
    },
    {
      id: 3,
      title: "The Batman",
      rating: 4.7,
      duration: "2h 55m",
      viewers: 1100,
      revenue: 27500000,
      status: "Now Showing",
      genre: "Action",
    },
    {
      id: 4,
      title: "Fast & Furious 11",
      rating: 4.5,
      duration: "2h 15m",
      viewers: 875,
      revenue: 21800000,
      status: "Now Showing",
      genre: "Action",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + " ₫";
  };

  const calculateGenreDistribution = (movies: any[]) => {
    console.log("Calculating genre distribution from movies:", movies);
    console.log("Number of movies:", movies.length);
    
    if (movies.length > 0) {
      console.log("First movie keys:", Object.keys(movies[0]));
      console.log("First movie full structure:", JSON.stringify(movies[0], null, 2));
    }
    
    const genreCount: { [key: string]: number } = {};
    const colors = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"];
    let colorIndex = 0;

    movies.forEach((movie, index) => {
      console.log(`Processing movie ${index + 1}:`, movie.title || movie.versionMovieEnglish);
      console.log("Movie types:", movie.movieTypes);
      console.log("Movie genre:", movie.genre);
      console.log("Movie type:", movie.type);
      
      // Try different possible genre fields
      let genre = null;
      if (movie.movieTypes && movie.movieTypes.length > 0) {
        genre = movie.movieTypes[0].typeName;
      } else if (movie.genre) {
        genre = movie.genre;
      } else if (movie.type) {
        genre = movie.type;
      }
      
      if (genre) {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
        console.log("Added genre:", genre, "count:", genreCount[genre]);
      } else {
        console.log("No genre found for movie:", movie.title || movie.versionMovieEnglish);
      }
    });

    // If no genres found, provide fallback data
    if (Object.keys(genreCount).length === 0) {
      console.log("No genres found, using fallback data");
      genreCount["Action"] = 3;
      genreCount["Drama"] = 2;
      genreCount["Comedy"] = 2;
      genreCount["Sci-Fi"] = 1;
      genreCount["Horror"] = 1;
    }

    const result = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([name, value]) => ({
        name,
        value,
        color: colors[colorIndex++ % colors.length]
      }));
    
    console.log("Final genre distribution:", result);
    return result;
  };

  const calculateTimeSlotData = (bookings: any[]) => {
    const timeSlots = {
      "Morning": { revenue: 0, bookings: 0 },
      "Afternoon": { revenue: 0, bookings: 0 },
      "Evening": { revenue: 0, bookings: 0 },
      "Night": { revenue: 0, bookings: 0 }
    };

    bookings.forEach((booking) => {
      const showtime = booking.showtimeTime || booking.createdAt;
      const hour = new Date(showtime).getHours();
      
      let timeSlot: string;
      if (hour >= 6 && hour < 12) {
        timeSlot = "Morning";
      } else if (hour >= 12 && hour < 18) {
        timeSlot = "Afternoon";
      } else if (hour >= 18 && hour < 22) {
        timeSlot = "Evening";
      } else {
        timeSlot = "Night";
      }

      const revenue = booking.amount || booking.pricing?.total || 0;
      const tickets = booking.selectedSeats?.length || 1;

      timeSlots[timeSlot as keyof typeof timeSlots].revenue += revenue;
      timeSlots[timeSlot as keyof typeof timeSlots].bookings += tickets;
    });

    return Object.entries(timeSlots).map(([time, data]) => ({
      time,
      revenue: data.revenue,
      bookings: data.bookings
    }));
  };

  // Function to analyze booking data and find movie with highest revenue
  const analyzeMovieRevenue = (bookingData: any[]) => {
    const movieRevenueMap = new Map();
    
    bookingData.forEach((booking) => {
      // Check payment status
      const isCompleted = booking.paymentStatus === "completed" || 
                         booking.status === "confirmed" || 
                         booking.status === "Confirmed";
      
      if (isCompleted && booking.movieId && booking.amount) {
        const movieId = booking.movieId._id;
        const movieName = booking.movieId.versionMovieEnglish;
        const amount = booking.amount;
        
        if (!movieRevenueMap.has(movieId)) {
          movieRevenueMap.set(movieId, {
            id: movieId,
            name: movieName,
            totalRevenue: 0,
            bookingCount: 0
          });
        }
        
        const movieData = movieRevenueMap.get(movieId);
        movieData.totalRevenue += amount;
        movieData.bookingCount += 1;
      }
    });
    
    // Convert to array and sort by revenue
    const movieRevenueArray = Array.from(movieRevenueMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    console.log('Movie Revenue Analysis:', movieRevenueArray);
    
    return movieRevenueArray;
  };

  const fetchStaffData = async () => {
    try {
      const response = await userService.getUsersByRoleId("684f84c7a2c60b9b2be5e315");
      const allUsers = response.data || response;
      const staffMembers = allUsers.filter(
        (user: any) => user.roleId === "684f84c7a2c60b9b2be5e315"
      );
      const activeStaff = staffMembers.filter(
        (user: any) => user.status === 1
      ).length;
      setTotalStaff(staffMembers.length);
      setStaffWorking(activeStaff);
    } catch (error) {
      console.error("Error fetching staff data:", error);
    }
  };

  const fetchMemberData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No auth token found");
        return;
      }
      
      const response = await getAllMembers(token);
      const allUsers = response.data.data || [];
      
      // Filter only users with memberId starting with "MEM"
      const membersOnly = allUsers.filter((user: any) => {
        return user.member && user.member.memberId && user.member.memberId.startsWith("MEM");
      });
      
      console.log("All users from API:", allUsers.length);
      console.log("Members with MEM prefix:", membersOnly.length);
      console.log("Sample member data:", membersOnly.slice(0, 3).map(m => ({
        id: m._id,
        name: m.fullName,
        memberId: m.member?.memberId,
        status: m.status
      })));
      
      const activeMembers = membersOnly.filter((user: any) => user.status === 1).length;
      const lockedMembers = membersOnly.filter((user: any) => user.status === 0).length;
      
      setTotalMembers(membersOnly.length);
      setActiveMembers(activeMembers);
      setLockedMembers(lockedMembers);
    } catch (error) {
      console.error("Error fetching member data:", error);
    }
  };

  const fetchTopRatedMovies = async () => {
    try {
      setMoviesLoading(true);
      const [movieResponse, bookingResponse, staffBookingResponse] = await Promise.all([
        movieService.getAllMovies(),
        getAllBookings(),
        staffBookingService.getAllStaffBookings(),
      ]);

      console.log("Movie Response:", movieResponse);
      console.log("Booking Response:", bookingResponse);
      console.log("Staff Booking Response:", staffBookingResponse);

      if (movieResponse.success && Array.isArray(movieResponse.data)) {
        console.log("Movie API Response:", movieResponse.data);
        console.log("First movie structure:", movieResponse.data[0]);
        
        // Get confirmed bookings for revenue calculation
        const confirmedBookings =
          bookingResponse.success && Array.isArray(bookingResponse.data)
            ? bookingResponse.data.filter(
                (booking: any) =>
                  booking.status === "confirmed" ||
                  booking.status === "Confirmed"
              )
            : [];

        // Get staff bookings for revenue calculation
        const staffBookings = 
          staffBookingResponse.success && Array.isArray(staffBookingResponse.data)
            ? staffBookingResponse.data
            : [];

        console.log("Confirmed Bookings:", confirmedBookings);
        console.log("Staff Bookings:", staffBookings);
        console.log("Booking Response:", bookingResponse);
        console.log("Staff Booking Response:", staffBookingResponse);

        // Combine member and staff bookings for analysis
        const allBookings = [...confirmedBookings, ...staffBookings];
        console.log("All bookings combined:", allBookings);
        setAllBookings(allBookings);

        // Analyze movie revenue from all booking data
        const movieRevenueAnalysis = analyzeMovieRevenue(allBookings);

        // Get the movie with highest revenue
        const highestRevenueMovie = movieRevenueAnalysis[0];

        setHighestRevenueMovie(highestRevenueMovie);

        // Calculate genre distribution from real movie data
        console.log("About to calculate genre distribution...");
        try {
          const realGenreDistribution = calculateGenreDistribution(movieResponse.data);
          console.log("Setting genre distribution:", realGenreDistribution);
          setGenreDistribution(realGenreDistribution);
        } catch (error) {
          console.error("Error calculating genre distribution:", error);
        }

        // Calculate revenue for all movies and sort by revenue
        const moviesWithRevenue = movieResponse.data
          .map((movie: any) => {
            const avgRating =
              movie.userReviews && movie.userReviews.length > 0
                ? movie.userReviews.reduce(
                    (sum: number, review: any) => sum + review.score,
                    0
                  ) / movie.userReviews.length
                : 0;

            // Calculate revenue for this movie from member bookings
            const memberMovieBookings = confirmedBookings.filter(
              (booking: any) =>
                booking.movieId && booking.movieId._id === movie._id
            );
            const memberMovieRevenue = memberMovieBookings.reduce(
              (sum: number, booking: any) => sum + (booking.amount || 0),
              0
            );

            // Calculate revenue for this movie from staff bookings
            const staffMovieBookings = staffBookings.filter(
              (booking: any) =>
                booking.movieId === movie._id
            );
            const staffMovieRevenue = staffMovieBookings.reduce(
              (sum: number, booking: any) => sum + (booking.pricing?.total || 0),
              0
            );

            // Total revenue from both member and staff bookings
            const totalMovieRevenue = memberMovieRevenue + staffMovieRevenue;

            console.log(
              `Movie: ${movie.versionMovieEnglish}, ID: ${movie._id}, Member Revenue: ${memberMovieRevenue}, Staff Revenue: ${staffMovieRevenue}, Total Revenue: ${totalMovieRevenue}`
            );

            return {
              id: movie._id,
              title: movie.versionMovieEnglish,
              rating: avgRating > 0 ? parseFloat(avgRating.toFixed(1)) : 0,
              duration: `${Math.floor(movie.duration / 60)}h ${
                movie.duration % 60
              }m`,
              viewers: movie.userReviews ? movie.userReviews.length : 0,
              revenue: totalMovieRevenue, // Total revenue from both member and staff bookings
              status:
                movie.status === "showing" ? "Now Showing" : "Coming Soon",
              genre:
                movie.movieTypes && movie.movieTypes.length > 0
                  ? movie.movieTypes[0].typeName
                  : "Unknown",
              poster: movie.largeImage || movie.smallImage,
            };
          })
          .filter((movie) => movie.revenue !== 0) // Show all movies with any revenue (positive or negative)
          .sort((a, b) => b.revenue - a.revenue) // Sort by revenue descending
          // Filter unique movies by title to avoid duplicates
          .filter(
            (movie, index, self) =>
              index === self.findIndex((m) => m.title === movie.title)
          )
          .slice(0, 10); // Show top 10 movies instead of 5

        console.log("Final Movies with Revenue:", moviesWithRevenue);
        console.log("Movies count:", moviesWithRevenue.length);
        console.log(
          "Movies details:",
          moviesWithRevenue.map((m) => ({
            title: m.title,
            revenue: m.revenue,
            rating: m.rating,
            viewers: m.viewers,
          }))
        );
        setTopRatedMovies(moviesWithRevenue);

        // Get currently showing movies
        const currentlyShowing = movieResponse.data.filter(
          (movie: any) => movie.status === "showing"
        );
        setShowingMovies(currentlyShowing);

        // Calculate movie revenue data for pie chart
        const colors = [
          "#EF4444",
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#8B5CF6",
          "#EC4899",
          "#06B6D4",
          "#84CC16",
          "#F97316",
          "#6366F1",
        ];

        const pieChartData = moviesWithRevenue.slice(0, 5).map((movie, index) => ({
          name: movie.title,
          value: movie.revenue,
          color: colors[index % colors.length],
        }));

        setMovieRevenueData(pieChartData);
      }
    } catch (error) {
      console.error("Error fetching movie data:", error);
      setError("Failed to fetch movie data");
    } finally {
      setMoviesLoading(false);
    }
  };

  // Function to fetch data from ticket management
  const fetchTicketManagementData = async (): Promise<UnifiedTicketData[]> => {
    try {
      const allTickets: UnifiedTicketData[] = [];
      let userMap: Record<string, string> = {};

      // Get user data for customer bookings
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const userRes = await getAllMembers(token);
          if (userRes.data && userRes.data.data) {
            userMap = userRes.data.data.reduce(
              (acc: Record<string, string>, user: any) => {
                acc[user._id] = user.fullName;
                return acc;
              },
              {}
            );
          }
        }
      } catch (error) {
        console.warn("Failed to fetch user data:", error);
      }

      // 1. Fetch customer bookings (only confirmed ones) - SAME LOGIC AS TICKET MANAGEMENT
      try {
        const customerRes = await getAllBookings();
        
        if (customerRes.success && Array.isArray(customerRes.data)) {
          const customerTickets = customerRes.data
            .filter((item: any) => {
              // Only include confirmed bookings
              const status = item.status?.toLowerCase() || "confirmed";
              return status === "confirmed";
            })
            .map((item: any) => {
              let seats: string[] = [];
              if (Array.isArray(item.seats)) {
                seats = item.seats.map((s: any) => `${s.row}${s.col}`);
              } else if (item.row && item.col) {
                seats = [`${item.row}${item.col}`];
              }

              return {
                id: item._id,
                ticketCode: item._id,
                source: "customer_booking" as const,
                customerName: userMap[item.userId] || "Unknown",
                customerEmail: "",
                customerPhone: "",
                movieTitle: item.movieId?.versionMovieEnglish || "",
                showtime: item.time || "",
                date: item.date || "", // SAME AS TICKET MANAGEMENT
                room: item.cinemaRoomId?.roomName || "",
                seats,
                totalPrice: item.amount || 0, // SAME AS TICKET MANAGEMENT
                paymentMethod: "Momo", // Customer bookings use Momo
                status: "Confirmed", // All customer bookings in ticket management are confirmed
                bookingTime: item.bookedAt || "", // SAME AS TICKET MANAGEMENT
                concessions: item.concessions || [],
              };
            });
          allTickets.push(...customerTickets);
        }
      } catch (error) {
        console.warn("Failed to fetch customer bookings:", error);
      }

      // 2. Fetch staff bookings - SAME LOGIC AS TICKET MANAGEMENT
      try {
        const staffRes = await staffBookingService.getAllStaffBookings();
        if (staffRes.success && Array.isArray(staffRes.data)) {
          const staffTickets = staffRes.data.map((item: any) => {
            const seats = item.selectedSeats?.map((seat: any) => 
              `${seat.row}${seat.col}`
            ) || [];

            return {
              id: item._id,
              ticketCode: item._id,
              source: "staff_booking" as const,
              customerName: item.customerInfo?.name || "Unknown",
              customerEmail: item.customerInfo?.email || "",
              customerPhone: item.customerInfo?.phone || "",
              movieTitle: item.movieTitle || "",
              showtime: item.showtimeTime || "",
              date: item.showtimeDate || "", // SAME AS TICKET MANAGEMENT
              room: item.roomName || "",
              seats,
              totalPrice: item.pricing?.total || 0, // SAME AS TICKET MANAGEMENT
              paymentMethod: "Cash", // Staff bookings use Cash
              status: "Confirmed", // All staff bookings in ticket management are confirmed
              bookingTime: item.createdAt || "", // SAME AS TICKET MANAGEMENT
              staffName: item.staffName || "",
              concessions: item.selectedConcessions || [],
              memberDiscount: item.pricing?.memberDiscount || 0,
              promotionDiscount: item.pricing?.promotionDiscount || 0,
              subtotal: item.pricing?.subtotal || 0,
              tax: item.pricing?.tax || 0,
            };
          });
          allTickets.push(...staffTickets);
        }
      } catch (error) {
        console.warn("Failed to fetch staff bookings:", error);
      }

      // Sort by booking time (newest first) - SAME AS TICKET MANAGEMENT
      allTickets.sort((a, b) => 
        new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()
      );

      console.log("Ticket Management Data (Dashboard):", allTickets);
      return allTickets;
    } catch (error) {
      console.error("Error fetching ticket management data:", error);
      return [];
    }
  };

  // Function to debug ticket data
  const debugTicketData = (tickets: UnifiedTicketData[]) => {
    console.log("=== DEBUG TICKET DATA (DASHBOARD) ===");
    console.log("Total tickets:", tickets.length);
    
    const confirmedTickets = tickets.filter(ticket => 
      ticket.status === "Confirmed" || ticket.status === "confirmed"
    );
    console.log("Confirmed tickets:", confirmedTickets.length);
    
    // Show sample tickets for debugging
    console.log("Sample tickets:", confirmedTickets.slice(0, 3).map(ticket => ({
      id: ticket.id,
      movieTitle: ticket.movieTitle,
      date: ticket.date,
      bookingTime: ticket.bookingTime,
      totalPrice: ticket.totalPrice,
      seats: ticket.seats,
      source: ticket.source
    })));
    
    // Group by day of week
    const ticketsByDay: { [key: string]: UnifiedTicketData[] } = {};
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    daysOfWeek.forEach(day => {
      ticketsByDay[day] = [];
    });
    
    confirmedTickets.forEach(ticket => {
      const ticketDate = ticket.bookingTime; // Use bookingTime instead of date
      if (ticketDate) {
        try {
          const parsedDate = new Date(ticketDate);
          const dayName = parsedDate.toLocaleDateString("en-US", {
            weekday: "short",
          });
          if (ticketsByDay[dayName]) {
            ticketsByDay[dayName].push(ticket);
          }
        } catch (error) {
          console.error("Error parsing booking time:", ticketDate);
        }
      }
    });
    
    console.log("Tickets by day:", ticketsByDay);
    
    // Calculate revenue and tickets for each day
    daysOfWeek.forEach(day => {
      const dayTickets = ticketsByDay[day];
      const revenue = dayTickets.reduce((sum, ticket) => sum + (ticket.totalPrice || 0), 0);
      const ticketCount = dayTickets.length; // Count tickets, not seats
      
      console.log(`${day}: ${ticketCount} tickets, ${revenue} revenue`);
    });
    
    // Group by movie for pie chart
    const movieRevenueMap = new Map<string, { name: string; revenue: number; tickets: number }>();
    
    confirmedTickets.forEach((ticket: UnifiedTicketData) => {
      const movieTitle = ticket.movieTitle || "Unknown Movie";
      const revenue = ticket.totalPrice || 0;
      const ticketCount = ticket.seats?.length || 1;
      
      if (!movieRevenueMap.has(movieTitle)) {
        movieRevenueMap.set(movieTitle, {
          name: movieTitle,
          revenue: 0,
          tickets: 0
        });
      }
      
      const movieData = movieRevenueMap.get(movieTitle)!;
      movieData.revenue += revenue;
      movieData.tickets += ticketCount;
    });
    
    console.log("Movie revenue data:", Array.from(movieRevenueMap.values()));
    
    console.log("=== END DEBUG ===");
  };

  // Function to calculate pie chart data from ticket management
  const calculatePieChartDataFromTickets = (tickets: UnifiedTicketData[]) => {
    console.log("Calculating pie chart data from tickets:", tickets);
    
    // Filter confirmed tickets
    const confirmedTickets = tickets.filter((ticket: UnifiedTicketData) => 
      ticket.status === "Confirmed" || ticket.status === "confirmed"
    );
    
    // Group by movie title and calculate total revenue
    const movieRevenueMap = new Map<string, { name: string; revenue: number; tickets: number }>();
    
    confirmedTickets.forEach((ticket: UnifiedTicketData) => {
      const movieTitle = ticket.movieTitle || "Unknown Movie";
      const revenue = ticket.totalPrice || 0;
      const ticketCount = 1; // Each ticket = 1, not seats.length
      
      if (!movieRevenueMap.has(movieTitle)) {
        movieRevenueMap.set(movieTitle, {
          name: movieTitle,
          revenue: 0,
          tickets: 0
        });
      }
      
      const movieData = movieRevenueMap.get(movieTitle)!;
      movieData.revenue += revenue;
      movieData.tickets += ticketCount;
    });
    
    // Convert to array and sort by revenue
    const movieRevenueArray = Array.from(movieRevenueMap.values())
      .filter(movie => movie.revenue > 0) // Only include movies with revenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5); // Top 5 movies
    
    // Create pie chart data with colors
    const colors = [
      "#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6",
      "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
    ];
    
    const pieChartData = movieRevenueArray.map((movie, index) => ({
      name: movie.name,
      value: movie.revenue,
      tickets: movie.tickets,
      color: colors[index % colors.length],
    }));
    
    console.log("Pie chart data from tickets:", pieChartData);
    return pieChartData;
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Reset filter state to current date
        const now = new Date();
        setSelectedRevenueYear(now.getFullYear());
        setSelectedRevenueMonth(now.getMonth() + 1);
        
        // Fetch ticket management data first
        const ticketData = await fetchTicketManagementData();
        setTickets(ticketData);
        
        // Debug ticket data
        debugTicketData(ticketData);
        
        // Calculate metrics from ticket data - SAME LOGIC AS TICKET MANAGEMENT
        const confirmedTickets = ticketData.filter((ticket: UnifiedTicketData) => 
          ticket.status === "Confirmed" || ticket.status === "confirmed"
        );
        
        console.log("=== DASHBOARD METRICS CALCULATION ===");
        console.log("Total tickets from API:", ticketData.length);
        console.log("Confirmed tickets:", confirmedTickets.length);
        
        // Calculate total revenue - SAME AS TICKET MANAGEMENT
        const totalRevenue = confirmedTickets.reduce(
          (sum: number, ticket: UnifiedTicketData) => sum + (ticket.totalPrice || 0),
          0
        );
        
        // Calculate total tickets - SAME AS TICKET MANAGEMENT
        const totalTickets = confirmedTickets.length; // Count tickets, not seats
        
        console.log("Calculated total revenue:", totalRevenue);
        console.log("Calculated total tickets:", totalTickets);
        console.log("=== END METRICS CALCULATION ===");
        
        setTotalRevenue(totalRevenue);
        setTicketsSold(totalTickets);
        
        // Calculate pie chart data from ticket management
        const pieChartData = calculatePieChartDataFromTickets(ticketData);
        setMovieRevenueData(pieChartData);
        
        // Fetch other data
        await Promise.all([
          fetchStaffData(),
          fetchMemberData(),
          fetchTopRatedMovies(),
        ]);
      } catch (error) {
        console.error("Error fetching all data:", error);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Fetch bookings by month/year - moved outside the main useEffect
  useEffect(() => {
    const fetchBookingsByMonthYear = async () => {
      try {
        setMetricsLoading(true);
        // Use ticket data instead of API call
        if (tickets.length > 0) {
          // Filter by month/year if needed
          const filteredTickets = tickets.filter((ticket: UnifiedTicketData) => {
            if (!ticket.date) return false;
            const ticketDate = new Date(ticket.date);
            return ticketDate.getMonth() === selectedMonth - 1 && 
                   ticketDate.getFullYear() === selectedYear;
          });
          setAllBookings(filteredTickets as any[]); // Convert to any[] for compatibility
        } else {
          setAllBookings([]);
        }
      } catch (err) {
        console.error("Error fetching bookings by month/year:", err);
        setAllBookings([]);
      } finally {
        setMetricsLoading(false);
      }
    };
    fetchBookingsByMonthYear();
  }, [selectedMonth, selectedYear, tickets]);

  const getTimeSlotChartData = (bookings: any[], mode: "week" | "year") => {
      if (!bookings || bookings.length === 0) {
        return timeSlotData;
      }

      // Filter confirmed bookings with payment status check
      const confirmedBookings = bookings.filter((booking: any) => {
        const isCompleted = booking.paymentStatus === "completed" || 
                           booking.status === "confirmed" || 
                           booking.status === "Confirmed";
        return isCompleted;
      });

      if (mode === "week") {
        const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        return daysOfWeek.map((day) => {
          const dayBookings = confirmedBookings.filter((booking: any) => {
            // Try different date fields
            const bookingDate = booking.bookedAt || booking.createdAt || booking.date || booking.bookingDate;
            if (!bookingDate) return false;
            
            try {
              const parsedDate = new Date(bookingDate);
              const dayName = parsedDate.toLocaleDateString("en-US", {
                weekday: "short",
              });
              return dayName === day;
            } catch (error) {
              console.error("Error parsing booking date:", bookingDate);
              return false;
            }
          });

          const revenue = dayBookings.reduce(
            (sum: number, booking: any) => sum + (booking.amount || 0),
            0
          );

          return {
            time: day,
            revenue: Math.round(revenue / 1000000), // Convert to millions
            bookings: dayBookings.length,
          };
        });
      } else {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months.map((month, index) => {
          const monthBookings = confirmedBookings.filter((booking: any) => {
            // Try different date fields
            const bookingDate = booking.bookedAt || booking.createdAt || booking.date || booking.bookingDate;
            if (!bookingDate) return false;
            
            try {
              const parsedDate = new Date(bookingDate);
              return parsedDate.getMonth() === index;
            } catch (error) {
              console.error("Error parsing booking date:", bookingDate);
              return false;
            }
          });

          const revenue = monthBookings.reduce(
            (sum: number, booking: any) => sum + (booking.amount || 0),
            0
          );

          return {
            time: month,
            revenue: Math.round(revenue / 1000000), // Convert to millions
            bookings: monthBookings.length,
          };
        });
      }
    };

    function getWeekNumber(date: Date) {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

  const tabConfig = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "movies", label: "Movies", icon: Film },
  ];

  // Loading skeletons
  const MetricsCardSkeleton = () => (
    <div className="bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
    </div>
  );

  const MovieCardSkeleton = () => (
    <div className="bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gray-200 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Modern Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {metricsLoading ? (
          <>
            <MetricsCardSkeleton />
            <MetricsCardSkeleton />
            <MetricsCardSkeleton />
            <MetricsCardSkeleton />
            <MetricsCardSkeleton />
          </>
        ) : (
          <>
            {/* Total Revenue Card */}
            <div className="group relative bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-1">Total Revenue</h3>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                </div>
                <div className="bg-green-500 p-3 rounded-xl shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-gray-600 font-medium">From confirmed bookings</span>
              </div>
            </div>

            {/* Tickets Sold Card */}
            <div className="group relative bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-1">Tickets Sold</h3>
                  <p className="text-2xl font-bold text-gray-900">{ticketsSold}</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-xl shadow-lg">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <Activity className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-gray-600 font-medium">All tickets</span>
              </div>
            </div>

            {/* Currently Showing Card */}
            <div className="group relative bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-1">Currently Showing</h3>
                  <p className="text-2xl font-bold text-gray-900">{showingMovies.length}</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-xl shadow-lg">
                  <Film className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <Play className="h-3 w-3 text-purple-500 mr-1" />
                <span className="text-gray-600 font-medium">Movies in theaters</span>
              </div>
            </div>

            {/* Staff Working Card */}
            <div className="group relative bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-1">Staff Working</h3>
                  <p className="text-2xl font-bold text-gray-900">{`${staffWorking}/${totalStaff}`}</p>
                </div>
                <div className="bg-orange-500 p-3 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                {totalStaff - staffWorking > 0 ? (
                  <>
                    <AlertTriangle className="h-3 w-3 text-orange-500 mr-1" />
                    <span className="text-gray-600 font-medium">{totalStaff - staffWorking} staff absent</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-gray-600 font-medium">All staff present</span>
                  </>
                )}
              </div>
            </div>

            {/* Total Members Card */}
            <div className="group relative bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-700 mb-1">Total Members</h3>
                  <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
                </div>
                <div className="bg-indigo-500 p-3 rounded-xl shadow-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex items-center text-xs">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-gray-600 font-medium">{activeMembers} active</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-gray-600 font-medium">{lockedMembers} locked</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

             {/* Charts Section */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Revenue Trend Chart */}
         <div className="bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
             <div className="flex items-center space-x-2">
               <TrendingUp className="h-5 w-5 text-green-500" />
               <span className="text-sm text-green-600 font-medium">+12.5%</span>
             </div>
           </div>
           
           {/* Filter Controls */}
           <div className="mb-6 p-4 bg-transparent rounded-xl border-2 border-gray-200">
             <div className="flex flex-col sm:flex-row gap-4 items-end">
               {/* Filter Type */}
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Time Period
                 </label>
                 <select
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                   value={revenueFilter}
                   onChange={(e) => setRevenueFilter(e.target.value as "week" | "month" | "year")}
                 >
                   <option value="week">This Week</option>
                   <option value="month">This Month</option>
                   <option value="year">This Year</option>
                 </select>
               </div>

               {/* Year Selector */}
               <div className="flex-1">
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Year
                 </label>
                 <select
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                   value={selectedRevenueYear}
                   onChange={(e) => setSelectedRevenueYear(Number(e.target.value))}
                 >
                   {[2022, 2023, 2024, 2025].map((year) => (
                     <option key={year} value={year}>
                       {year}
                     </option>
                   ))}
                 </select>
               </div>

               {/* Month Selector (show for month and week filter) */}
               {(revenueFilter === "month" || revenueFilter === "week") && (
                 <div className="flex-1">
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Month
                   </label>
                   <select
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                     value={selectedRevenueMonth}
                     onChange={(e) => setSelectedRevenueMonth(Number(e.target.value))}
                   >
                     {[
                       { value: 1, label: "January" },
                       { value: 2, label: "February" },
                       { value: 3, label: "March" },
                       { value: 4, label: "April" },
                       { value: 5, label: "May" },
                       { value: 6, label: "June" },
                       { value: 7, label: "July" },
                       { value: 8, label: "August" },
                       { value: 9, label: "September" },
                       { value: 10, label: "October" },
                       { value: 11, label: "November" },
                       { value: 12, label: "December" },
                     ].map((month) => (
                       <option key={month.value} value={month.value}>
                         {month.label}
                       </option>
                     ))}
                   </select>
                 </div>
               )}

               {/* Reset Button */}
               <button
                 onClick={() => {
                   setRevenueFilter("week");
                   setSelectedRevenueYear(new Date().getFullYear());
                   setSelectedRevenueMonth(new Date().getMonth() + 1);
                 }}
                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 text-sm font-medium"
               >
                 <RefreshCw className="w-4 h-4" />
                 <span>Reset</span>
               </button>
             </div>
           </div>

           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={getRevenueData(revenueFilter, selectedRevenueYear, selectedRevenueMonth)}>
                 {console.log("Chart data:", getRevenueData(revenueFilter, selectedRevenueYear, selectedRevenueMonth))}
                 <defs>
                   <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                 <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                 <YAxis stroke="#6B7280" fontSize={12} />
                 <Tooltip 
                   contentStyle={{
                     backgroundColor: 'white',
                     border: '1px solid #E5E7EB',
                     borderRadius: '8px',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                   }}
                   formatter={(value) => [`${formatCurrency(Number(value) * 1000000)}`, "Revenue"]}
                 />
                 <Area 
                   type="monotone" 
                   dataKey="value" 
                   stroke="#3B82F6" 
                   strokeWidth={3}
                   fill="url(#revenueGradient)"
                   fillOpacity={1}
                 />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </div>

         {/* Ticket Sales Chart */}
         <div className="bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-gray-900">Ticket Sales</h3>
             <div className="flex items-center space-x-2">
               <Ticket className="h-5 w-5 text-blue-500" />
               <span className="text-sm text-blue-600 font-medium">{ticketsSold} tickets</span>
             </div>
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={getRevenueData(revenueFilter, selectedRevenueYear, selectedRevenueMonth)}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                 <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                 <YAxis stroke="#6B7280" fontSize={12} />
                 <Tooltip 
                   contentStyle={{
                     backgroundColor: 'white',
                     border: '1px solid #E5E7EB',
                     borderRadius: '8px',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                   }}
                   formatter={(value) => [`${value} tickets`, "Sales"]}
                 />
                 <Bar dataKey="tickets" fill="#10B981" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>
       </div>

       {/* Additional Charts Row */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Movie Revenue Distribution */}
         <div className="bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-gray-900">Movie Revenue (from Tickets)</h3>
             <Film className="h-5 w-5 text-purple-500" />
           </div>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={movieRevenueData.slice(0, 5)}
                   cx="50%"
                   cy="50%"
                   innerRadius={40}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {movieRevenueData.slice(0, 5).map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip 
                   formatter={(value, name, props) => {
                     return [`${formatCurrency(Number(value))}`, "Revenue"];
                   }}
                   contentStyle={{
                     backgroundColor: 'white',
                     border: '1px solid #E5E7EB',
                     borderRadius: '8px',
                     boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                   }}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 space-y-2">
             {movieRevenueData.slice(0, 3).map((item, index) => (
               <div key={index} className="flex items-center justify-between text-sm">
                 <div className="flex items-center">
                   <div
                     className="w-3 h-3 rounded-full mr-2"
                     style={{ backgroundColor: item.color }}
                   ></div>
                   <span className="text-gray-600 truncate">{item.name}</span>
                 </div>
                 <div className="text-right">
                   <div className="font-medium text-gray-900">{formatCurrency(item.value)}</div>
                
                 </div>
               </div>
             ))}
           </div>
         </div>

         {/* Genre Distribution */}
         <div className="bg-transparent p-6 rounded-2xl shadow-sm border-2 border-gray-200">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-gray-900">Genre Distribution</h3>
             <BarChart3 className="h-5 w-5 text-orange-500" />
           </div>
           <div className="h-64">
             {moviesLoading ? (
               <div className="flex items-center justify-center h-full">
                 <div className="text-center">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                   <p className="text-gray-500 text-sm">Loading genre data...</p>
                 </div>
               </div>
             ) : genreDistribution.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={genreDistribution.slice(0, 5)}
                     cx="50%"
                     cy="50%"
                     innerRadius={40}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {genreDistribution.slice(0, 5).map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} />
                     ))}
                   </Pie>
                   <Tooltip 
                     formatter={(value, name, props) => {
                       const data = props.payload;
                       return [`${value} movies`, "Count"];
                     }}
                     contentStyle={{
                       backgroundColor: 'white',
                       border: '1px solid #E5E7EB',
                       borderRadius: '8px',
                       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                     }}
                   />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full">
                 <div className="text-center">
                   <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                   <p className="text-gray-500 text-sm">No genre data available</p>
                 </div>
               </div>
             )}
           </div>
           {/* Legend */}
           {!moviesLoading && genreDistribution.length > 0 && (
             <div className="mt-4 grid grid-cols-2 gap-2">
               {genreDistribution.slice(0, 6).map((item, index) => (
                 <div key={index} className="flex items-center space-x-2 text-xs">
                   <div
                     className="w-3 h-3 rounded-full"
                     style={{ backgroundColor: item.color }}
                   ></div>
                   <span className="text-gray-600 truncate">{item.name}</span>
                   <span className="text-gray-900 font-medium">({item.value})</span>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
    </div>
  );

  const renderMoviesTab = () => {
    if (moviesLoading) {
      return (
        <div className="space-y-6">
          <MovieCardSkeleton />
          <MovieCardSkeleton />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Top Movies Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Top Performing Movies</h3>
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-600">By Revenue</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedMovies.slice(0, 6).map((movie) => (
              <div key={movie.id} className="group bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-3">
                  {movie.poster && (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-16 h-20 object-cover rounded-lg shadow-sm"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{movie.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{movie.rating}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{movie.duration}</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(movie.revenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">{movie.genre}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        movie.status === "Now Showing" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {movie.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "movies":
        return renderMoviesTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="mb-6">
      <div className="min-h-screen p-4 sm:p-6 relative bg-gray-50">
        {/* Test Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cinema Dashboard</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Monitor your cinema's performance and operations</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Simple Test Content */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-red-500 mb-4">
              <XCircle className="w-12 h-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Analytics Overview</h3>
                
                {/* Modern Tab Navigation */}
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                  {tabConfig.map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${
                        activeTab === key
                          ? "bg-white text-blue-600 shadow-sm border border-blue-200"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveTab(key as TabType)}
                      type="button"
                      role="tab"
                      aria-selected={activeTab === key}
                      aria-controls={`tabpanel-${key}`}
                      tabIndex={activeTab === key ? 0 : -1}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="p-6"
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
            >
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

