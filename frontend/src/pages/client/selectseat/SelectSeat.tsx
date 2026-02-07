import { useNavigate, useLocation } from "react-router-dom";
import type { Seat } from "../../../types/seat";
import { SeatGrid } from "../../../components/client/seat/SeatGrid";
import { SeatInfo } from "../../../components/client/seat/SeatInfo";
import { SeatTypes } from "../../../components/client/seat/SeatTypes";
import { MainLayout } from "../../../layouts/Layout";
import {
  useNotifications,
  NotificationContainer,
} from "../../../components/ui/notification";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store/store";
import { setBookingSeats, setBookingMeta } from "../../../store/bookingSlice";
import { useEffect, useState, useRef } from "react";
import { getScheduleSeats, getLockedSeats } from "../../../services/api/seatService";
import { SelectSeatHeader } from "../../../components/client/seat/SelectSeatHeader";

// Định nghĩa type cho ghế từ API
interface ApiSeat {
  _id: string;
  seatId: string;
  row: string;
  col: number;
  seatStatus: number;
  price?: number;
}

// Định nghĩa type cho locked seat
interface LockedSeat {
  seatId: string;
  userId: string;
  expiresAt: string;
}

const ALL_ROWS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const getSeatColor = (status: Seat["status"]) => {
  switch (status) {
    case "available":
      return "bg-white border border-gray-300 text-gray-700";
    case "booked":
      return "bg-gray-300 text-gray-700";
    case "selected":
      return "bg-orange-400 text-white";
    case "locked":
      return "bg-yellow-200 border border-yellow-400 text-yellow-700";
    default:
      return "bg-orange-50 border border-orange-300 text-orange-700";
  }
};

export default function SelectSeat() {
  const [allSeats, setAllSeats] = useState<ApiSeat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [lockedSeats, setLockedSeats] = useState<LockedSeat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { notifications, addNotification, removeNotification } =
    useNotifications();
  const { movie, date, time, theater, seats } = useSelector(
    (state: RootState) => state.booking
  );
  const location = useLocation();
  const scheduleId = location.state?.scheduleId || null;
  const cinemaRoomId = location.state?.cinemaRoomId || null;
  const format = movie?.format?.[0] || movie?.format?.[1];
  
  // Refs để quản lý timers
  const lockTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy userId từ localStorage
  const getUserId = () => {
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    // Kiểm tra cả _id và id vì có thể user object có cấu trúc khác nhau
    const userId = user?._id ? String(user._id) : user?.id ? String(user.id) : "";
    console.log("getUserId debug:", { userStr, user, userId });
    return userId;
  };

  // Đồng bộ state với Redux khi mount hoặc khi location.state thay đổi
  useEffect(() => {
    console.log("SelectSeat state on mount/update:", {
      movie,
      date,
      time,
      theater,
      seats,
      locationState: location.state,
      scheduleId,
      cinemaRoomId,
      format,
    });
    try {
      if (location.state?.resetSeats) {
        setSelectedSeats([]);
        dispatch(setBookingSeats([]));
      } else if (
        selectedSeats.length === 0 &&
        Array.isArray(seats) &&
        seats.length > 0
      ) {
        // Chỉ đồng bộ khi selectedSeats đang rỗng và seats có dữ liệu
        setSelectedSeats(seats.map((s) => ({ ...s, status: "selected" })));
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error("Error syncing selected seats:", error);
      setError("Failed to sync seat selection.");
    }
    // eslint-disable-next-line
  }, [location.state]);

  // Fetch booked seats from backend
  useEffect(() => {
    if (scheduleId && cinemaRoomId) {
      setError(null); // Reset error trước khi fetch
      getScheduleSeats(scheduleId, cinemaRoomId)
        .then((data) => {
          console.log("Raw API response:", data); // Log dữ liệu thô từ API
          let seats: ApiSeat[] = [];
          try {
            if (Array.isArray(data)) {
              seats = data.flatMap((item) => (item.seats ? item.seats : []));
            } else if (data.seats && Array.isArray(data.seats)) {
              seats = data.seats;
            } else if (data.error) {
              throw new Error(data.error); // Xử lý lỗi 404 từ API
            } else {
              throw new Error("Unexpected API response format");
            }
            if (seats.length === 0) {
              console.warn(
                "No seats data returned from API for scheduleId:",
                scheduleId,
                "cinemaRoomId:",
                cinemaRoomId
              );
              setError(
                "No seat data available for the selected schedule and cinema room."
              );
            } else {
              console.log("Processed seats:", seats); // Log dữ liệu đã xử lý
            }
            setAllSeats(
              seats.map((seat) => ({
                _id: seat._id,
                seatId: seat.seatId || `${seat.row}${seat.col}`, // Fallback nếu seatId thiếu
                row: seat.row,
                col: seat.col,
                seatStatus: seat.seatStatus,
                price: seat.price || 100000,
              }))
            );
          } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            console.error("Error processing API data:", error);
            setError(`Failed to process seat data: ${error.message}`);
          }
        })
        .catch((error) => {
          console.error(
            "Error fetching seats:",
            error.message,
            "Response text:",
            error.response?.text || "No response"
          );
          setError(`Failed to load seat data: ${error.message}`);
          addNotification({
            type: "error",
            title: "API Error",
            message: `Failed to load seat data: ${error.message}. Please check server or try again.`,
            duration: 4000,
          });
        });
    } else {
      console.warn("scheduleId or cinemaRoomId is missing:", {
        scheduleId,
        cinemaRoomId,
      });
    }
  }, [scheduleId, cinemaRoomId]);

  // Fetch locked seats và setup refresh timer
  useEffect(() => {
    if (scheduleId && cinemaRoomId) {
      fetchLockedSeats();
      
      // Setup timer để refresh locked seats mỗi 30 giây
      refreshTimerRef.current = setInterval(() => {
        fetchLockedSeats();
      }, 30000);

      return () => {
        if (refreshTimerRef.current) {
          clearInterval(refreshTimerRef.current);
        }
      };
    }
  }, [scheduleId, cinemaRoomId]);

  // Cleanup timers khi component unmount
  useEffect(() => {
    return () => {
      // Clear all lock timers
      lockTimersRef.current.forEach((timer) => clearTimeout(timer));
      lockTimersRef.current.clear();
      
      // Clear refresh timer
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  const fetchLockedSeats = async () => {
    try {
      const response = await getLockedSeats(scheduleId!, cinemaRoomId!);
      if (response.success) {
        setLockedSeats(response.data);
      }
    } catch (error) {
      console.error("Error fetching locked seats:", error);
    }
  };

  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    addNotification({
      type,
      title,
      message,
      duration: 4000,
    });
  };

  const getSeatWithStatus = (row: string, col: number): Seat | undefined => {
    const seat = allSeats.find((s) => s.row === row && s.col === col);
    if (!seat) return undefined;

    const seatId = seat.seatId || `${row}${col}`;
    const isSelected = selectedSeats.some(
      (s) => s.row === row && s.col === col
    );
    const isLocked = lockedSeats.some((ls) => ls.seatId === seatId);
    
    let status: Seat["status"];
    if (seat.seatStatus === 1) {
      status = "booked";
    } else if (isSelected) {
      status = "selected";
    } else if (isLocked) {
      status = "locked";
    } else {
      status = "available";
    }

    return {
      row,
      col,
      status,
    };
  };

  // Bỏ toàn bộ logic gọi lockSeat/unlockSeat khi chọn/bỏ chọn ghế
  // Sửa handleSeatClick chỉ cập nhật selectedSeats, không gọi lockSeat/unlockSeat
  const handleSeatClick = (row: string, col: number) => {
    if (false) return; // isLoading is removed, so this line is no longer needed
    const seat = getSeatWithStatus(row, col);
    if (!seat) {
      showNotification(
        "error",
        "Seat Error",
        "Seat information not available."
      );
      return;
    }
    if (seat.status === "booked") {
      showNotification(
        "error",
        "Seat Unavailable",
        "This seat has already been booked. Please select another seat."
      );
      return;
    }
    if (seat.status === "locked") {
      showNotification(
        "warning",
        "Seat Locked",
        "This seat is currently being held by another user. Please select another seat or try again later."
      );
      return;
    }
    const isCurrentlySelected = selectedSeats.some(
      (s) => s.row === row && s.col === col
    );
    let newSelectedSeats;
    if (isCurrentlySelected) {
      newSelectedSeats = selectedSeats.filter(
        (s) => !(s.row === row && s.col === col)
      );
      showNotification(
        "success",
        "Seat Unselected",
        "Seat has been unselected."
      );
    } else {
      // Validate selection rules (same row, consecutive)
      if (selectedSeats.length > 0 && selectedSeats[0].row !== row) {
        showNotification(
          "warning",
          "Same Row Required",
          "Please select seats from the same row for the best viewing experience."
        );
        return;
      }
      const cols = [...selectedSeats.map((s) => s.col), col].sort((a, b) => a - b);
      for (let i = 1; i < cols.length; i++) {
        if (cols[i] - cols[i - 1] !== 1) {
          showNotification(
            "warning",
            "Consecutive Seats Only",
            "Please select seats that are next to each other (no gaps)."
          );
          return;
        }
      }
      newSelectedSeats = [...selectedSeats, { row, col, status: "selected" as const }];
      showNotification(
        "success",
        "Seat Selected",
        "Seat has been selected."
      );
    }
    setSelectedSeats(newSelectedSeats);
    dispatch(setBookingSeats(newSelectedSeats));
  };

  const handleConfirmSelection = () => {
    if (selectedSeats.length === 0) {
      showNotification(
        "warning",
        "No Seats Selected",
        "Please select at least one seat before proceeding."
      );
      return;
    }
    
    const userId = getUserId();
    dispatch(setBookingSeats(selectedSeats));
    dispatch(setBookingMeta({ scheduleId, cinemaRoomId, userId }));
    navigate("/select-corn", {
      state: {
        scheduleId,
        cinemaRoomId,
        seats: selectedSeats,
        allSeats: allSeats, // Pass allSeats data to make seat prices available
        resetConcessions: true,
        // Pass additional movie and theater info for display in summary
        date: date,
        time: time,
        theater: typeof theater === "string" ? theater : theater?.name ?? "",
        format: format || "",
      },
    });
  };

  if (!movie || !scheduleId || !cinemaRoomId) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg text-gray-600">Loading booking details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center text-red-500">
            <p className="text-lg">{error}</p>
            <button
              onClick={() => navigate("/booking")}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Try Another Schedule
            </button>
            <button
              onClick={() => navigate("/movies")}
              className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Movies
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <NotificationContainer
          notifications={notifications}
          onClose={removeNotification}
        />
        <SelectSeatHeader
          movieTitle={"Select Seat"}
          theaterName={""}
          showtime={""}
        />

        <main className="flex-1 px-2 sm:px-8 py-8 sm:py-10 container mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
            <div className="flex-grow bg-white p-3 sm:p-6 rounded-lg shadow-md">
              <div className="flex flex-col items-center mb-6 sm:mb-10">
                <div
                  className="relative w-[95%] sm:w-[90%] md:w-3/4 h-3 sm:h-4"
                  style={{ perspective: "200px" }}
                >
                  <div
                    className="w-full h-full rounded-t-full relative"
                    style={{
                      background:
                        "linear-gradient(180deg, #fff3e0 60%, #ffb74d 100%)",
                      boxShadow:
                        "0 8px 16px 0 rgba(255,152,0,0.10), 0 1px 4px #ffe0b2",
                      transform: "rotateX(18deg)",
                      borderTop: "3px solid #ffe0b2",
                      borderBottom: "1px solid #ff9800",
                    }}
                  >
                    <div
                      className="pointer-events-none absolute left-0 top-0 w-full h-full rounded-t-full"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.25) 70%, transparent 100%)",
                        zIndex: 2,
                      }}
                    />
                  </div>
                </div>
                <span
                  className="mt-2 text-orange-400 font-semibold tracking-widest text-xs sm:text-sm"
                  style={{ letterSpacing: "0.2em" }}
                >
                  SCREEN
                </span>
              </div>

              <SeatGrid
                rows={ALL_ROWS}
                getSeat={getSeatWithStatus}
                handleSeatClick={handleSeatClick}
                getSeatColor={getSeatColor}
              />
              <div className="mt-4 sm:mt-8">
                <SeatTypes />
              </div>
            </div>
            <div className="lg:w-80 xl:w-96 flex-shrink-0">
              <SeatInfo
                selectedSeats={selectedSeats}
                onConfirm={handleConfirmSelection}
                image={movie.largeImage}
                name={
                  typeof movie.versionMovieEnglish === "string"
                    ? movie.versionMovieEnglish
                    : ""
                }
                date={date}
                time={time}
                format={format || null}
                theater={
                  typeof theater === "string" ? theater : theater?.name ?? null
                }
                allSeats={allSeats} // Pass allSeats directly as a prop
              />
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
}
