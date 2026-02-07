"use client";

import React, { useState, useEffect } from "react";
import MovieShowtimeSelection from "./movie-show";
import SeatSelection from "./seat-selection";
import ConcessionsSelection from "./concessions-selection";
import CustomerInformation from "./customer-information";
import PaymentConfirmation from "./payment-confirm";
import TicketDetailModal from "./ticket-detail-modal";
import SuccessNotificationModal from "./success-notification-modal";
import type { Movie as DisplayMovie } from "./movie-show";

import type { CustomerInfo, PricingInfo } from "./customer-information";
import type { PaymentMethod } from "./payment-confirm";
import { movieService } from "../../../services/api/movieService";
import { cinemaService } from "../../../services/api/cinemaService";
import { staffBookingService } from "../../../services/api/staffBookingService";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import { staffService } from "../../../services/api/staffService";
import { useAuth } from "../../../hooks/useAuth";
import type { WatercornApiResponse } from "../../../types/watercorn";

// Define Seat type locally since we're not importing from scheduleSeatService
interface Seat {
  seatId: string;
  row: string;
  col: string;
  price: number;
  seatStatus: number; // 0: available, 1: occupied, 2: selected
}

interface SelectedShowtime {
  id: string;
  movieId: string;
  theaterId: string;
  date: string;
  time: string;
  format: string;
  available: number;
  total: number;
  scheduleId?: string;
  cinemaRoomId?: string;
  room?: string; // Add room property
}

// Custom Components
const Button: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const Tabs: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
}> = ({ value, className = "", children }) => (
  <div className={`${className}`} data-value={value}>
    {children}
  </div>
);

const TabsContent: React.FC<{
  value: string;
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => {
  return <div className={`${className}`}>{children}</div>;
};

export default function TicketSelling() {
  const { user } = useAuth();
  const [staffInfo, setStaffInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // State for movies
  const [movies, setMovies] = useState<DisplayMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [selectedShowtime, setSelectedShowtime] =
    useState<SelectedShowtime | null>(null);
  const [seatsData, setSeatsData] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedConcessions, setSelectedConcessions] = useState<
    { product: WatercornApiResponse; quantity: number }[]
  >([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    email: "",
    promotionCode: "",
  });
  // Set payment method to cash by default
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [currentStep, setCurrentStep] = useState(1);

  const [isProcessing, setIsProcessing] = useState(false);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [seatsError, setSeatsError] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    bookingId: string;
    totalAmount: number;
    movieTitle: string;
    seats: string;
    concessionsCount: number;
    customerName: string;
  } | null>(null);
  const [currentBookingId, setCurrentBookingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string>("");
  const [promotionValidation, setPromotionValidation] = useState<{
    isValid: boolean | null;
    discount: number;
    message: string;
  }>({
    isValid: null,
    discount: 0,
    message: "",
  });

  // Payment method is now fixed to cash
  const paymentMethods: PaymentMethod[] = [
    {
      id: "cash",
      name: "Cash",
      icon: "💵",
    },
  ];

  // Get staff info on component mount
  useEffect(() => {
    const getStaffInfo = async () => {
      try {
        if (user) {
          // Use user info from auth context
          setStaffInfo({
            id: user.id,
            name: user.fullName,
          });
        } else {
          // Fallback to staffService if user not in context
          const staffProfile = await staffService.getStaffProfile();
          setStaffInfo({
            id: staffProfile._id,
            name: staffProfile.fullName,
          });
        }
      } catch (error) {
        console.error("Error getting staff info:", error);
        // Fallback to hardcoded values
        setStaffInfo({
          id: "STAFF001",
          name: "Cinema Staff",
        });
      }
    };

    getStaffInfo();
  }, [user]);

  // Fetch movies on component mount
  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        setError(null);

        const response = await movieService.getAllMovies();

        // Filter for showing movies and map to our Movie type
        const nowShowingMovies = response.data
          .filter((movie: { status: string }) => {
            return (
              movie.status.toLowerCase() === "showing" ||
              movie.status.toLowerCase() === "now showing"
            );
          })
          .map(
            (movie: {
              _id: string;
              versionMovieVn: string;
              versionMovieEnglish: string;
              duration: number;
              movieTypes?: Array<{ typeName: string }>;
              rating: string;
              largeImage?: string;
              smallImage?: string;
              status: string;
            }) => {
              // Convert movieTypes array to genre string
              const genre =
                movie.movieTypes && movie.movieTypes.length > 0
                  ? movie.movieTypes.map((type) => type.typeName).join(", ")
                  : "Unknown";

              return {
                _id: movie._id,
                versionMovieVn: movie.versionMovieVn,
                versionMovieEnglish: movie.versionMovieEnglish,
                duration: movie.duration.toString(),
                genre: genre,
                rating: movie.rating,
                largeImage: movie.largeImage,
                smallImage: movie.smallImage,
                status: movie.status,
              };
            }
          );

        setMovies(nowShowingMovies);
      } catch (err) {
        console.error("Error fetching movies:", err);
        setError("Failed to load movies. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  // Seat data will be loaded from API when moving to step 2

  // Functions
  const toggleSeat = (seat: string) => {
    // Check if seat is occupied from seatsData
    const seatData = seatsData.find((s) => s.seatId === seat);
    if (seatData && seatData.seatStatus === 1) {
      alert(`Seat ${seat} is already occupied. Please select another seat.`);
      return;
    }

    setSelectedSeats((prev) => {
      if (prev.includes(seat)) {
        // Remove seat if already selected
        return prev.filter((s) => s !== seat);
      } else {
        // Check if trying to select more than 8 seats
        if (prev.length >= 8) {
          alert("Maximum 8 seats can be selected per booking.");
          return prev;
        }

        // Add seat if it doesn't create gaps
        const newSelection = [...prev, seat];

        // Group seats by row
        const seatsByRow: { [key: string]: string[] } = {};
        newSelection.forEach((s) => {
          const row = s.charAt(0);
          if (!seatsByRow[row]) seatsByRow[row] = [];
          seatsByRow[row].push(s);
        });

        // Check each row for gaps
        for (const row in seatsByRow) {
          const seatsInRow = seatsByRow[row].sort((a, b) => {
            const colA = parseInt(a.slice(1));
            const colB = parseInt(b.slice(1));
            return colA - colB;
          });

          // Check for gaps in this row
          for (let i = 0; i < seatsInRow.length - 1; i++) {
            const currentCol = parseInt(seatsInRow[i].slice(1));
            const nextCol = parseInt(seatsInRow[i + 1].slice(1));
            if (nextCol - currentCol > 1) {
              // Gap detected, don't allow this selection
              alert("Seats must be adjacent. Please select consecutive seats.");
              return prev;
            }
          }
        }

        return newSelection;
      }
    });
  };

  const toggleConcession = (
    product: WatercornApiResponse,
    quantity: number
  ) => {
    setSelectedConcessions((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product._id === product._id
      );

      if (quantity === 0) {
        // Remove item if quantity is 0
        return prev.filter((item) => item.product._id !== product._id);
      } else if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...prev];
        updated[existingIndex] = { product, quantity };
        return updated;
      } else {
        // Add new item
        return [...prev, { product, quantity }];
      }
    });
  };

  const getSeatPrice = (seat: string): number => {
    const seatData = seatsData.find((s) => s.seatId === seat);
    return seatData ? seatData.price : 120000; // Default price if not found
  };

  const calculateTotal = (): PricingInfo => {
    const subtotal = selectedSeats.reduce((sum, seat) => {
      return sum + getSeatPrice(seat);
    }, 0) + selectedConcessions.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const promotionDiscount = promotionValidation.discount || 0;
    const total = subtotal - promotionDiscount; // Removed tax calculation

    return {
      subtotal,
      tax: 0, // Tax removed, keeping for interface compatibility
      promotionDiscount,
      total,
    };
  };

  const selectedMovieData = movies.find((m) => m._id === selectedMovie);
  const pricing = calculateTotal();

  const handleNextStep = async () => {
    if (currentStep === 1 && selectedShowtime) {
      // Extract scheduleId from selectedShowtime.id (format: "scheduleId-time-cinemaRoomId")
      const parts = selectedShowtime.id.split("-");
      const scheduleId = parts[0];
      const cinemaRoomId = selectedShowtime.cinemaRoomId;

      try {
        setSeatsLoading(true);
        setSeatsError(null);
        
        const response = await getSeatsByScheduleId(
          scheduleId,
          cinemaRoomId
        );

        // Handle different response structures
        let seatsData = [];
        if (Array.isArray(response)) {
          // Response is array of ScheduleSeat documents
          if (response.length > 0 && response[0].seats) {
            seatsData = response[0].seats;
          }
        } else if (response.seats) {
          // Response is object with seats property
          seatsData = response.seats;
        } else if (response.data && response.data.seats) {
          // Response is wrapped in data property
          seatsData = response.data.seats;
        }

        setSeatsData(seatsData);
        setCurrentStep(currentStep + 1);
      } catch (error) {
        console.error("Error fetching seats:", error);
        setSeatsError("Failed to fetch seats data");
        alert("Failed to load seats. Please try again.");
      } finally {
        setSeatsLoading(false);
      }
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 1:
        return selectedMovie !== "" && selectedShowtime !== null;
      case 2:
        return selectedSeats.length > 0;
      case 3:
        return true; // Concessions are optional
      case 4:
        return (
          customerInfo.name !== "" &&
          customerInfo.phone !== "" &&
          selectedMovie !== "" &&
          selectedShowtime !== null &&
          selectedSeats.length > 0
        );
      case 5:
        return true; // Always true since payment method is fixed to cash
      default:
        return false;
    }
  };

  const handlePrintTicket = async () => {
    try {
      setIsProcessing(true);

      // Validate required data
      if (!selectedShowtime) {
        alert("Missing showtime information. Please select a showtime.");
        return;
      }

      if (!customerInfo.name || !customerInfo.phone) {
        alert("Customer name and phone are required.");
        return;
      }

      if (selectedSeats.length === 0) {
        alert("Please select at least one seat.");
        return;
      }

      // Use staffInfo if available, otherwise fallback to hardcoded values
      const staffId = staffInfo?.id || "STAFF001";
      const staffName = staffInfo?.name || "Cinema Staff";

      // Create staff booking in database
      const bookingData = {
        staffId: staffId,
        staffName: staffName,
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || "",
          promotionCode: customerInfo.promotionCode || "",
        },
        movieId: selectedMovieData?._id || "",
        movieTitle:
          selectedMovieData?.versionMovieVn ||
          selectedMovieData?.versionMovieEnglish ||
          "Unknown",
        movieDuration: selectedMovieData?.duration || "",
        movieGenre: selectedMovieData?.genre || "",
        movieRating: selectedMovieData?.rating || "",
        scheduleId: selectedShowtime?.scheduleId || "",
        cinemaRoomId: selectedShowtime?.cinemaRoomId || "",
        roomName: roomName,
        showtimeDate: selectedShowtime?.date || "",
        showtimeTime: selectedShowtime?.time || "",
        showtimeFormat: selectedShowtime?.format || "",
        selectedSeats: selectedSeats.map((seat) => {
          const seatData = seatsData.find((s) => s.seatId === seat);
          // Extract row and column from seatId (e.g., "A1" -> row: "A", col: 1)
          const row = seatData?.row || seat.charAt(0);
          const colMatch = seat.match(/\d+/);
          const col = colMatch
            ? parseInt(colMatch[0])
            : parseInt(seat.substring(1)) || 0;

          return {
            seatId: seat,
            row: row,
            col: col,
            price: seatData?.price || 120000,
          };
        }),
        selectedConcessions: selectedConcessions.map((item) => {
          // Validate that product has all required fields
          if (
            !item.product ||
            !item.product._id ||
            !item.product.name ||
            typeof item.quantity !== "number" ||
            typeof item.product.price !== "number"
          ) {
            throw new Error(`Invalid concession data: ${JSON.stringify(item)}`);
          }

          return {
            productId: item.product._id.toString(), // Convert number to string for API
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            totalPrice: item.product.price * item.quantity,
          };
        }),
        paymentMethod: paymentMethod,
        pricing: {
          subtotal: pricing.subtotal,
          tax: pricing.tax,
          promotionDiscount: pricing.promotionDiscount,
          total: pricing.total,
        },
        status: "confirmed", // Add booking status
        notes: "Staff booking",
      };

      const response = await staffBookingService.createStaffBooking(
        bookingData
      );

      if (response.success) {
        setCurrentBookingId(response.data.bookingId);
        setShowTicketModal(true);
        alert("Ticket printed successfully!");
      } else {
        alert(`Failed to create booking: ${response.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating staff booking:", error);
      alert(`Error creating booking: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSale = async () => {
    console.log("✅ Starting confirm sale process...");
    console.log("📊 Current state:", {
      selectedShowtime,
      staffInfo,
      customerInfo,
      selectedSeats,
      roomName
    });

    if (!selectedShowtime) {
      alert("Missing showtime information. Please select a showtime.");
      return;
    }

    // Validate required fields
    if (!customerInfo.name || !customerInfo.phone) {
      alert("Customer name and phone are required.");
      return;
    }

    if (selectedSeats.length === 0) {
      alert("Please select at least one seat.");
      return;
    }

    if (!roomName || roomName === "Unknown Room") {
      alert("Room information is missing. Please refresh and try again.");
      return;
    }

    try {
      setIsProcessing(true);

      // Use staffInfo if available, otherwise fallback to hardcoded values
      const staffId = staffInfo?.id || "STAFF001";
      const staffName = staffInfo?.name || "Cinema Staff";

      // Create staff booking in database
      const bookingData = {
        staffId: staffId,
        staffName: staffName,
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || "",
          promotionCode: customerInfo.promotionCode || "",
        },
        movieId: selectedMovieData?._id || "",
        movieTitle:
          selectedMovieData?.versionMovieVn ||
          selectedMovieData?.versionMovieEnglish ||
          "Unknown",
        movieDuration: selectedMovieData?.duration || "",
        movieGenre: selectedMovieData?.genre || "",
        movieRating: selectedMovieData?.rating || "",
        scheduleId: selectedShowtime?.scheduleId || "",
        cinemaRoomId: selectedShowtime?.cinemaRoomId || "",
        roomName: selectedShowtime?.room || roomName || "Unknown Room",
        showtimeDate: selectedShowtime?.date || "",
        showtimeTime: selectedShowtime?.time || "",
        showtimeFormat: selectedShowtime?.format || "",
        selectedSeats: selectedSeats.map((seat) => {
          const seatData = seatsData.find((s) => s.seatId === seat);
          // Extract row and column from seatId (e.g., "A1" -> row: "A", col: 1)
          const row = seatData?.row || seat.charAt(0);
          const colMatch = seat.match(/\d+/);
          const col = colMatch
            ? parseInt(colMatch[0])
            : parseInt(seat.substring(1)) || 0;

          return {
            seatId: seat,
            row: row,
            col: col,
            price: seatData?.price || 120000,
          };
        }),
        selectedConcessions: selectedConcessions.map((item) => {
          // Validate that product has all required fields
          if (
            !item.product ||
            !item.product._id ||
            !item.product.name ||
            typeof item.quantity !== "number" ||
            typeof item.product.price !== "number"
          ) {
            throw new Error(`Invalid concession data: ${JSON.stringify(item)}`);
          }

          return {
            productId: item.product._id.toString(), // Convert number to string for API
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            totalPrice: item.product.price * item.quantity,
          };
        }),
        paymentMethod: paymentMethod,
        pricing: {
          subtotal: pricing.subtotal,
          tax: pricing.tax,
          promotionDiscount: pricing.promotionDiscount,
          total: pricing.total,
        },
        status: "confirmed", // Add booking status
        notes: "Staff booking confirmed",
      };

      const response = await staffBookingService.createStaffBooking(
        bookingData
      );

      if (response.success) {
        // Set success data for the beautiful notification
        setSuccessData({
          bookingId: response.data.bookingId,
          totalAmount: pricing.total,
          movieTitle:
            selectedMovieData?.versionMovieVn ||
            selectedMovieData?.versionMovieEnglish ||
            "Unknown",
          seats: selectedSeats.join(", "),
          concessionsCount: selectedConcessions.length,
          customerName: customerInfo.name,
        });

        // Show success modal
        setShowSuccessModal(true);

        // Reset form after successful sale
        setSelectedMovie("");
        setSelectedShowtime(null);
        setSelectedSeats([]);
        setSelectedConcessions([]);
        setCustomerInfo({ 
          name: "",
          phone: "",
          email: "",
          promotionCode: "",
        });
        setPaymentMethod("cash"); // Reset to cash
        setPromotionValidation({
          isValid: null,
          discount: 0,
          message: "",
        });
        setCurrentStep(1);
      } else {
        alert(`Failed to confirm sale: ${response.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error confirming sale:", error);
      alert(`Error confirming sale: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Ticket Selling System
          </h2>
          <p className="text-gray-600">
            Complete ticket sale process step by step
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 5 && (
                <div
                  className={`w-8 h-0.5 ${
                    step < currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex justify-between text-sm">
          <span
            className={
              currentStep === 1 ? "font-medium text-blue-600" : "text-gray-500"
            }
          >
            1. Select Movie & Showtime
          </span>
          <span
            className={
              currentStep === 2 ? "font-medium text-blue-600" : "text-gray-500"
            }
          >
            2. Choose Seats
          </span>
          <span
            className={
              currentStep === 3 ? "font-medium text-blue-600" : "text-gray-500"
            }
          >
            3. Concessions
          </span>
          <span
            className={
              currentStep === 4 ? "font-medium text-blue-600" : "text-gray-500"
            }
          >
            4. Customer Info
          </span>
          <span
            className={
              currentStep === 5 ? "font-medium text-blue-600" : "text-gray-500"
            }
          >
            5. Payment
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={currentStep === 1}
        >
          Previous Step
        </Button>

        <div className="flex space-x-2">
          {currentStep < 5 && (
            <Button
              onClick={handleNextStep}
              disabled={!canProceedToNext() || isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : "Next Step"}
            </Button>
          )}
        </div>
      </div>

      <Tabs value={currentStep.toString()} className="space-y-6">
        {/* Step 1: Movie & Showtime Selection */}
        {currentStep === 1 && (
          <TabsContent value="1">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Loading movies...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-red-600">{error}</div>
              </div>
            ) : (
              <MovieShowtimeSelection
                movies={movies}
                selectedMovie={selectedMovie}
                selectedShowtime={selectedShowtime?.id || ""}
                onMovieSelect={(movieId) => {
                  // Only reset if selecting a different movie
                  if (movieId !== selectedMovie) {
                    setSelectedSeats([]);
                    setSelectedConcessions([]);
                    setCustomerInfo({
                      name: "",
                      phone: "",
                      email: "",
                      promotionCode: "",
                    });
                    setPromotionValidation({
                      isValid: null,
                      discount: 0,
                      message: "",
                    });
                  }
                  setSelectedMovie(movieId);
                }}
                onShowtimeSelect={async (showtimeData) => {
                  // Create showtime object with API data
                  const showtime = {
                    id: showtimeData.id,
                    movieId: selectedMovie,
                    theaterId: showtimeData.cinemaRoomId,
                    date: showtimeData.date,
                    time: showtimeData.time,
                    format: showtimeData.format,
                    available: 45, // Default values - these should come from API
                    total: 120,
                    scheduleId: showtimeData.scheduleId,
                    cinemaRoomId: showtimeData.cinemaRoomId,
                  };

                  // Only reset if selecting a different showtime
                  if (showtimeData.id !== selectedShowtime?.id) {
                    setSelectedSeats([]);
                    setSelectedConcessions([]);
                    setCustomerInfo({
                      name: "",
                      phone: "",
                      email: "",
                      promotionCode: "",
                    });
                    setPromotionValidation({
                      isValid: null,
                      discount: 0,
                      message: "",
                    });
                  }

                  setSelectedShowtime(showtime);

                  // Get room name
                  try {
                    const roomData = await cinemaService.getCinemaRoomById(
                      showtimeData.cinemaRoomId
                    );
                    setRoomName(roomData.roomName);
                  } catch (error) {
                    console.error("Error fetching room name:", error);
                    setRoomName("Unknown Room");
                  }
                }}
                onContinue={handleNextStep}
              />
            )}
          </TabsContent>
        )}

        {/* Step 2: Seat Selection */}
        {currentStep === 2 && selectedShowtime && (
          <TabsContent value="2">
            {seatsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Loading seats...</div>
              </div>
            ) : seatsError ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-red-600">{seatsError}</div>
              </div>
            ) : (
              <SeatSelection
                selectedMovie={selectedMovieData}
                selectedShowtime={selectedShowtime}
                seatsData={seatsData}
                selectedSeats={selectedSeats}
                onSeatToggle={toggleSeat}
                getSeatPrice={getSeatPrice}
                roomName={roomName}
                onBack={() => setCurrentStep(1)}
                onContinue={() => setCurrentStep(3)}
              />
            )}
          </TabsContent>
        )}

        {/* Step 3: Concessions Selection */}
        {currentStep === 3 && selectedShowtime && (
          <TabsContent value="3">
            <ConcessionsSelection
              selectedMovie={selectedMovieData}
              selectedShowtime={selectedShowtime}
              selectedSeats={selectedSeats}
              selectedConcessions={selectedConcessions}
              onConcessionToggle={toggleConcession}
              onBack={() => setCurrentStep(2)}
              onContinue={() => setCurrentStep(4)}
              roomName={roomName}
              getSeatPrice={getSeatPrice}
            />
          </TabsContent>
        )}

        {/* Step 4: Customer Information */}
        {currentStep === 4 && selectedShowtime && (
          <TabsContent value="4">
            <CustomerInformation
              customerInfo={customerInfo}
              selectedMovie={selectedMovieData}
              selectedShowtime={{
                time: selectedShowtime.time,
                room: selectedShowtime.room || roomName || "Unknown",
                date: selectedShowtime.date,
                format: selectedShowtime.format,
              }}
              selectedSeats={selectedSeats}
              selectedConcessions={selectedConcessions}
              pricing={pricing}
              onCustomerInfoChange={setCustomerInfo}
              onPromotionValidation={setPromotionValidation}
              onPreviousStep={() => setCurrentStep(3)}
              onNextStep={() => setCurrentStep(5)}
            />
          </TabsContent>
        )}

        {/* Step 5: Payment & Confirmation */}
        {currentStep === 5 && selectedShowtime && (
          <TabsContent value="5">
            <PaymentConfirmation
              paymentMethods={paymentMethods}
              paymentMethod={paymentMethod}
              customerInfo={customerInfo}
              selectedMovie={selectedMovieData}
              selectedShowtime={{
                time: selectedShowtime.time,
                room: selectedShowtime.room || roomName || "Unknown",
                date: selectedShowtime.date,
                format: selectedShowtime.format,
              }}
              selectedSeats={selectedSeats}
              selectedConcessions={selectedConcessions}
              pricing={pricing}
              onPaymentMethodSelect={setPaymentMethod}
              onPrintTicket={handlePrintTicket}
              onConfirmSale={handleConfirmSale}
              isProcessing={isProcessing}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        customerInfo={customerInfo}
        selectedMovie={selectedMovieData}
        selectedShowtime={
          selectedShowtime
            ? {
                time: selectedShowtime.time,
                room: selectedShowtime.room || roomName || "Unknown",
                date: selectedShowtime.date,
                format: selectedShowtime.format,
              }
            : undefined
        }
        selectedSeats={selectedSeats}
        selectedConcessions={selectedConcessions}
        pricing={pricing}
        paymentMethod={paymentMethod}
        bookingId={currentBookingId}
      />

      {/* Success Notification Modal */}
      <SuccessNotificationModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        successData={successData}
      />

      {/* Toast Notification */}
      {/* The toast notification state and showToast function were removed,
          so this block will no longer render. */}
    </div>
  );
}
