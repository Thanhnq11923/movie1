import { useState } from "react";
import { Button } from "../../ui/button";
import vnpayService from "../../../services/api/vnpayService";
import type { BookingData } from "../../../services/api/vnpayService";
import { notify } from "../../../lib/toast";

interface VNPayPaymentMethodProps {
  bookingData: Omit<BookingData, "paymentMethod">;
  onPaymentInitiated: () => void;
  onPaymentError: (error: string) => void;
}

const VNPayPaymentMethod = ({
  bookingData,
  onPaymentInitiated,
  onPaymentError,
}: VNPayPaymentMethodProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVNPayPayment = async () => {
    try {
      setIsProcessing(true);
      onPaymentInitiated();

      const response = await vnpayService.createVNPayBooking({
        ...bookingData,
        paymentMethod: "vnpay",
      });

      if (response.success && response.paymentUrl) {
        // Redirect to VNPay payment page
        vnpayService.processPayment(response.paymentUrl);
      } else {
        throw new Error("Failed to create payment URL");
      }
    } catch (error) {
      setIsProcessing(false);
      const errorMessage =
        error instanceof Error ? error.message : "Payment processing failed";
      notify.error(errorMessage);
      onPaymentError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-4 border rounded-md">
      <div className="flex items-center space-x-3">
        <img
          src="/assets/payment/vnpay-logo.png"
          alt="VNPay"
          className="h-10 object-contain"
          onError={(e) => {
            e.currentTarget.src =
              "https://vnpay.vn/assets/images/logo-icon/logo-primary.svg";
          }}
        />
        <div>
          <h3 className="font-semibold">VNPay</h3>
          <p className="text-sm text-gray-600">Secure online payment</p>
        </div>
      </div>

      <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
        <p>
          You will be redirected to VNPay's secure payment gateway to complete
          your payment.
        </p>
      </div>

      <Button
        onClick={handleVNPayPayment}
        disabled={isProcessing}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isProcessing ? "Processing..." : "Pay with VNPay"}
      </Button>
    </div>
  );
};

export default VNPayPaymentMethod;
