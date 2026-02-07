/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../../layouts/Layout";
import { Button } from "../../../components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../../store/store";
import { ArrowLeft } from "lucide-react";
import { notify } from "../../../lib/toast";
import { setBookingMeta } from "../../../store/bookingSlice";
import { authService } from "../../../services/api/authService";
import { promotionService } from "../../../services/api/promotionService";
import { userService } from "../../../services/api/userService";
import { useState, useMemo } from "react";
import { PaymentOptions } from "../../../components/client/payment/PaymentOptions";
import { PromotionSection } from "../../../components/client/payment/PromotionSection";
import { PaymentSuccessModal } from "../../../components/client/payment/PaymentSuccessModal";
import { unlockSeat, getLockedSeats } from '../../../services/api/seatService';

// Define a simplified PaymentSummary props interface for our use case
interface SimpleSummaryItem {
  label: string;
  value: string;
}

interface SimplePaymentSummaryProps {
  items: SimpleSummaryItem[];
  total: string;
}

// Create a simplified PaymentSummary component
const SimplePaymentSummary = ({ items }: SimpleSummaryItem[]) => (
  <div className="space-y-4">
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex justify-between border-b border-gray-300 p-2"
        >
          <span className="text-gray-600">{item.label}:</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  </div>
);

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const {
    movie,
    date,
    time,
    theater,
    seats,
    concessions,
    format,
    scheduleId,
    cinemaRoomId,
    userId,
  } = useSelector((state: RootState) => state.booking);

  // Payment method state
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "vnpay" | "momo" | null
  >("vnpay");

  // State for promotion code
  const [promotionCode, setPromotionCode] = useState("");
  const [discountVND, setDiscountVND] = useState(0);
  const [promotionError, setPromotionError] = useState("");
  const [, setIsApplyingPromotion] = useState(false);

  // State for user points
  const [userPoints, setUserPoints] = useState<{ score: number; memberId: string | null } | null>(null);

  // State for payment success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    bookingId: string;
    amount: number;
    paymentMethod: string;
    pointsEarned: number;
    newTotalPoints: number;
  } | null>(null);

  // Get allSeats from location.state for correct price calculation
  const allSeats = location.state?.allSeats || [];

  // Calculate correct pricing in VND with fallback logic
  const ticketsTotal = useMemo(() => {
    if (!seats || seats.length === 0) {
      return 0;
    }

    // If allSeats available, calculate using real prices from database
    if (allSeats && allSeats.length > 0) {
      let total = 0;
      seats.forEach((seat) => {
        // Find seat data from allSeats similar to OrderSummary logic
        let seatData = allSeats.find(
          (s: any) => s.row === seat.row && s.col === seat.col
        );

        // Fallback search by seatId
        if (!seatData) {
          const seatId = `${seat.row}${seat.col}`;
          seatData = allSeats.find((s: any) => s.seatId === seatId);
        }

        // Use price from database or default 120000 VND
        const seatPrice = seatData?.price || 120000;
        total += seatPrice;
      });
      return total;
    }

    // Fallback: If no allSeats, use default price
    else {
      console.warn("No allSeats data, using default price 120000 VND per seat");
      return seats.length * 120000; // Default 120k VND per seat
    }
  }, [seats, allSeats]);

  const concessionsTotal = useMemo(() => {
    const total = concessions.reduce((sum, item) => {
      const itemTotal = item.price * item.quantity;
      console.log(
        `Concession ${item.name}: ${item.price} × ${item.quantity} = ${itemTotal}`
      );
      return sum + itemTotal;
    }, 0);
    console.log("Total concessions:", total);
    return total;
  }, [concessions]);

  const subtotalVND = useMemo(() => {
    return ticketsTotal + concessionsTotal;
  }, [ticketsTotal, concessionsTotal]);

  const totalVND = useMemo(() => {
    return Math.max(0, subtotalVND - discountVND); // Ensure non-negative
  }, [subtotalVND, discountVND]);

  // Prepare booking data with correct VND pricing
  const bookingData = useMemo(() => {
    if (!movie || !userId || !scheduleId || !cinemaRoomId) return undefined;

    return {
      scheduleId: String(scheduleId),
      movieId: String(movie._id),
      cinemaRoomId: String(cinemaRoomId),
      seats: seats.map((seat) => ({ row: seat.row, col: seat.col })),
      seatStatus: 1,
      userId: String(userId),
      concessions: concessions.map((item) => ({
        productId: String(item.id),
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      amount: totalVND, // Correct VND price
      promotion: promotionCode || undefined,
      date: date || "",
      time: time || "",
      theater: typeof theater === "string" ? theater : theater?.name || "",
      format: format || "",
    };
  }, [
    movie,
    scheduleId,
    cinemaRoomId,
    seats,
    userId,
    concessions,
    totalVND, // Use totalVND
    promotionCode,
    date,
    time,
    theater,
    format,
  ]);

  const expiresAt = location.state?.expiresAt || null;
  const [timeLeft, setTimeLeft] = useState<number>(expiresAt ? Math.max(0, expiresAt - Date.now()) : 0);
  const [lockTimer, setLockTimer] = useState<NodeJS.Timeout | null>(null);
  const [isCheckingLock, setIsCheckingLock] = useState(false);

  // Countdown dựa trên expiresAt
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const left = expiresAt - Date.now();
      setTimeLeft(left > 0 ? left : 0);
      if (left <= 0) {
        clearInterval(interval);
        // Hết giờ, unlock tất cả ghế
        (async () => {
          if (!seats || !scheduleId || !cinemaRoomId || !userId) return;
          for (const seat of seats) {
            await unlockSeat(scheduleId, cinemaRoomId, `${seat.row}${seat.col}`, userId);
          }
          notify.error('Hết thời gian giữ ghế! Vui lòng chọn lại.');
          navigate('/select-seat', { state: { scheduleId, cinemaRoomId, resetSeats: true } });
        })();
      }
    }, 1000);
    setLockTimer(interval);
    return () => clearInterval(interval);
  }, [expiresAt, seats, scheduleId, cinemaRoomId, userId, navigate]);

  // Khi reload hoặc quay lại, kiểm tra lại trạng thái ghế với backend
  useEffect(() => {
    if (!seats || !scheduleId || !cinemaRoomId) return;
    getLockedSeats(scheduleId, cinemaRoomId).then((res) => {
      const lockedSeatIds = res.data?.map((s: any) => s.seatId) || [];
      const allLocked = seats.every((seat: any) => lockedSeatIds.includes(`${seat.row}${seat.col}`));
      if (!allLocked) {
        notify.error('Hết thời gian giữ ghế hoặc ghế đã bị người khác đặt! Vui lòng chọn lại.');
        navigate('/select-seat', { state: { scheduleId, cinemaRoomId, resetSeats: true } });
      }
      // Nếu có expiresAt mới từ backend, cập nhật lại countdown
      const seatExpires = res.data?.map((s: any) => new Date(s.expiresAt).getTime()) || [];
      const maxExpires = seatExpires.length > 0 ? Math.max(...seatExpires) : null;
      if (maxExpires && maxExpires !== expiresAt) {
        setTimeLeft(Math.max(0, maxExpires - Date.now()));
      }
    });
  }, [seats, scheduleId, cinemaRoomId, navigate, expiresAt]);

  // Khi thanh toán thành công, clear timer giữ ghế
  useEffect(() => {
    if (showSuccessModal && lockTimer) {
      clearInterval(lockTimer);
    }
  }, [showSuccessModal, lockTimer]);

  // Khi thanh toán thất bại (nếu có callback), unlock ghế tương tự như hết giờ

  useEffect(() => {
    if (!movie) {
      navigate("/");
    }
    // Get userId from localStorage if not in booking state
    if (!userId) {
      const user = authService.getCurrentUser();
      const resolvedUserId = user ? user._id || user.id : null;
      if (resolvedUserId) {
        dispatch(setBookingMeta({ userId: resolvedUserId }));
      }
    }

    // Auto-select VNPay as the default payment method
    if (!selectedPaymentMethod) {
      setSelectedPaymentMethod("vnpay");
    }

    // Check for payment success parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('status');
    const bookingId = urlParams.get('bookingId');
    const amount = urlParams.get('amount');
    const paymentMethod = urlParams.get('paymentMethod');

    if (paymentStatus === 'success' && bookingId && amount && paymentMethod) {
      // Show success modal
      setSuccessData({
        bookingId,
        amount: parseInt(amount),
        paymentMethod,
        pointsEarned: 50,
        newTotalPoints: (userPoints?.score || 0) + 50
      });
      setShowSuccessModal(true);
      
      // Refresh user points to get updated score
      if (userId) {
        userService.getCurrentUserPoints()
          .then((points) => {
            setUserPoints(points);
            // Update success data with real points
            setSuccessData(prev => prev ? {
              ...prev,
              newTotalPoints: points.score
            } : null);
          })
          .catch((err) => {
            console.error("Get updated user points error:", err);
          });
      }
    }

    // Call API to get promotions (log to console)
    promotionService
      .getAllPromotions(1, 10, "-createdAt")
      .then((res) => {
        console.log("Promotion list:", res.data);
      })
      .catch((err) => {
        console.error("Promotion API error:", err);
      });

    // Get user points
    if (userId) {
      userService
        .getCurrentUserPoints()
        .then((points) => {
          setUserPoints(points);
          console.log("Current user points:", points);
        })
        .catch((err) => {
          console.error("Get user points error:", err);
        });
    }

    if (allSeats && allSeats.length > 0) {
      seats.forEach((seat, index) => {
        const seatData = allSeats.find(
          (s: any) => s.row === seat.row && s.col === seat.col
        );
        console.log(`Seat ${index + 1} (${seat.row}${seat.col}):`, {
          seatData,
          price: seatData?.price || 120000,
        });
      });
    }
  }, [
    movie,
    navigate,
    userId,
    dispatch,
    seats,
    allSeats,
    ticketsTotal,
    concessionsTotal,
    subtotalVND,
    discountVND,
    totalVND,
  ]);

  if (!movie) {
    return null;
  }

  // Handle promotion code application
  const handleApplyPromotion = async (code: string) => {
    setIsApplyingPromotion(true);
    setPromotionError("");
    setPromotionCode(code);

    try {
      if (!code) {
        setPromotionError("Please enter a promotion code!");
        notify.error("Please enter a promotion code!");
        setIsApplyingPromotion(false);
        return;
      }

      // Call API with VND amount
      const res = await promotionService.validatePromotionCode(
        code,
        subtotalVND,
        userId || undefined
      );
      console.log("API response:", res);

      if (res && res.success && res.data) {
        const calculatedDiscount = res.data.discount || 0;

        // Check discount with VND
        if (calculatedDiscount >= subtotalVND) {
          setPromotionError(
            "Discount value cannot be greater than or equal to total amount!"
          );
          setDiscountVND(0);
          notify.error(
            "Discount value cannot be greater than or equal to total amount!"
          );
          return;
        }

        setDiscountVND(calculatedDiscount);
        setPromotionError("");
        notify.success("Promotion code applied successfully!");
      } else {
        setPromotionError(res.message || "Invalid or expired promotion code!");
        setDiscountVND(0);
        notify.error(res.message || "Invalid or expired promotion code!");
      }
    } catch {
      setPromotionError("Invalid or expired promotion code!");
      setDiscountVND(0);
      notify.error("Invalid or expired promotion code!");
    } finally {
      setIsApplyingPromotion(false);
    }
  };

  const formatVND = (amount: number) => amount.toLocaleString("vi-VN") + " ₫";

  return (
    <MainLayout>
      <header className="bg-white shadow-sm py-3 sm:py-4 sticky top-0 z-20 sm:mt-10">
        <div className="container mx-auto px-3 sm:px-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="p-1 sm:p-2"
            onClick={() => {
              navigate("/select-corn", {
                state: {
                  scheduleId,
                  cinemaRoomId,
                  seats,
                  concessions,
                  allSeats, // ✅ Truyền allSeats về lại
                  resetConcessions: false,
                },
              });
            }}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">
              Checkout
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Please confirm your order and proceed with payment
            </p>
          </div>
          <div className="w-8 sm:w-10"></div>
        </div>
      </header>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center">
          <div className="w-full max-w-5xl">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              <div className="flex-1 bg-white rounded-lg shadow p-4 sm:p-6">
                {/* Movie Poster and Title */}
                <div className="flex justify-start mb-6">
                  <img
                    src={movie.smallImage}
                    alt={movie.versionMovieVn}
                    className="w-32 sm:w-40 h-48 sm:h-60 object-cover rounded-lg shadow-lg mb-4"
                  />
                  <div className="ml-5">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 text-start mb-2">
                      {movie.versionMovieEnglish}
                    </h2>
                    <div className="text-sm text-gray-600  text-start">
                      {format ||
                        (Array.isArray(movie?.movieTypes)
                          ? movie.movieTypes.map((t) => t.typeName).join(", ")
                          : movie?.format || "Standard")}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Booking Details
                  </h3>

                  {/* Cinema & Showtime */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Cinema:</span>
                      <span className="text-gray-900 font-semibold">
                        {typeof theater === "string"
                          ? theater
                          : theater?.name ?? "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Date:</span>
                      <span className="text-gray-900 font-semibold">
                        {date}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Time:</span>
                      <span className="text-gray-900 font-semibold">
                        {time}
                      </span>
                    </div>
                  </div>

                  {/* Selected Seats */}
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-600 font-medium">Seats:</span>
                      <div className="text-right">
                        <div className="text-gray-900 font-semibold">
                          {seats
                            .map((seat) => `${seat.row}${seat.col}`)
                            .join(", ")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {seats.length} ticket{seats.length > 1 ? "s" : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Concessions */}
                  {concessions.length > 0 && (
                    <div className="border-t pt-3 flex item-center justify-between">
                      <h4 className="text-gray-600 font-medium mb-2">
                        Concessions:
                      </h4>
                      <div className="space-y-2">
                        {concessions.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-end items-center text-sm"
                          >
                            <span className="text-gray-700">
                              {item.quantity}× {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* User Points Info */}
                  {userPoints && (
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Current score:</span>
                        <div className="text-right">
                          <div className="text-green-600 font-semibold">
                            {userPoints.score} points
                          </div>
                          <div className="text-xs text-gray-500">
                            After payment: +50 points
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 max-h-[80vh] overflow-auto">
                  {/* Payment methods section */}

                  <PromotionSection
                    onApplyPromotion={handleApplyPromotion}
                    error={promotionError}
                  />
                  {/* Payment summary section */}
                  <div className="p-3 sm:p-4">
                    <SimplePaymentSummary
                      items={[
                        { label: "Tickets", value: formatVND(ticketsTotal) },
                        {
                          label: "Concessions",
                          value: formatVND(concessionsTotal),
                        },
                        {
                          label: "Discount",
                          value: `-${formatVND(discountVND)}`,
                        },
                      ]}
                      total={formatVND(totalVND)}
                    />
                  </div>
                  <div className="p-3 sm:p-4 mb-4">
                    <PaymentOptions
                      selectedMethod={selectedPaymentMethod}
                      onMethodSelect={setSelectedPaymentMethod}
                      onApplyPromotion={handleApplyPromotion}
                      promoError={promotionError}
                      onPaymentSubmit={() => {}}
                      bookingData={bookingData}
                      totalAmount={totalVND}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Success Modal */}
      {showSuccessModal && successData && (
        <PaymentSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          bookingId={successData.bookingId}
          amount={successData.amount}
          paymentMethod={successData.paymentMethod}
          pointsEarned={successData.pointsEarned}
          newTotalPoints={successData.newTotalPoints}
        />
      )}
    </MainLayout>
  );
}
