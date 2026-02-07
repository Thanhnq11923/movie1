import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { notify } from "../../../lib/toast";
import vnpayService from "../../../services/api/vnpayService";
import { Button } from "../../ui/button";
import { CircleCheckBig, AlertTriangle, Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearBooking } from "../../../store/bookingSlice";

interface BookingDetails {
  id: string;
  paymentMethod: "vnpay";
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  status: "pending" | "confirmed" | "cancelled" | "payment_failed";
  amount: number;
  [key: string]: unknown;
}

const VNPayPaymentStatus = () => {
  const { status, bookingId } = useParams<{
    status: string;
    bookingId: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        if (!bookingId) {
          throw new Error("No booking ID provided");
        }

        // Get VNPay transaction info from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const vnpResponseCode = searchParams.get("vnp_ResponseCode");
        const vnpTransactionId =
          searchParams.get("vnp_TransactionNo") ||
          searchParams.get("vnp_TxnRef");
        const vnpBankCode = searchParams.get("vnp_BankCode");
        const vnpCardType = searchParams.get("vnp_CardType");

        // Check if this is a VNPay return with a response code
        if (vnpResponseCode) {
          const isPaymentSuccess = vnpResponseCode === "00"; // VNPay success code
          const paymentStatus = isPaymentSuccess ? "completed" : "failed";

          // Update payment status in the database
          try {
            await vnpayService.updatePaymentStatus(bookingId, paymentStatus, {
              transactionId: vnpTransactionId || undefined,
              bankCode: vnpBankCode || undefined,
              cardType: vnpCardType || undefined,
              responseCode: vnpResponseCode,
            });

            if (isPaymentSuccess) {
              // Clear the booking from Redux store on successful payment
              dispatch(clearBooking());
              notify.success("Payment status updated successfully");
            } else {
              notify.error(`Payment failed with code: ${vnpResponseCode}`);
            }
          } catch (updateError) {
            console.error("Failed to update payment status:", updateError);
          }
        }

        // Now fetch the updated booking details
        const response = await vnpayService.getBookingStatus(bookingId);

        if (response.success) {
          setBookingDetails(response.data as BookingDetails);

          // Check the actual payment status from the booking
          if (response.data.paymentStatus === "completed") {
            notify.success("Payment completed successfully");
          } else if (response.data.paymentStatus === "failed") {
            notify.error(
              "Payment failed. Please try again or contact support."
            );
          }
        } else {
          throw new Error("Failed to fetch booking details");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to verify payment status";
        setError(errorMessage);
        notify.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [bookingId, location.search, dispatch]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
        <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
        <p className="text-gray-600 text-center max-w-md">
          We're confirming your payment status. Please wait a moment...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 text-center max-w-md mb-6">{error}</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
          <Button
            variant="outline"
            onClick={() => navigate("/profile/tickets")}
          >
            View My Bookings
          </Button>
        </div>
      </div>
    );
  }

  if (status === "success" && bookingDetails?.paymentStatus === "completed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <CircleCheckBig className="w-16 h-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Your payment has been processed successfully. Your booking is now
          confirmed.
        </p>

        <div className="bg-gray-50 p-6 rounded-lg border w-full max-w-md mb-6">
          <h3 className="font-semibold mb-3 text-lg">Booking Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium">{bookingDetails.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">
                {bookingDetails.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("vi-VN").format(bookingDetails.amount)} đ
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">
                {bookingDetails.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate("/profile/tickets")}>
            View My Tickets
          </Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <AlertTriangle className="w-16 h-16 text-red-600 mb-4" />
      <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Your payment could not be processed. The booking has been cancelled.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => navigate("/tickets")}>Try Again</Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Return to Homepage
        </Button>
      </div>
    </div>
  );
};

export default VNPayPaymentStatus;
