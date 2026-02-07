import { useState } from "react";
import { Button } from "../../ui/button";
import vnpayService from "../../../services/api/vnpayService";
import momoService from "../../../services/api/momoService";
import type { BookingData } from "../../../services/api/vnpayService";
import { notify } from "../../../lib/toast";

interface PaymentButtonProps {
  paymentMethod: "vnpay" | "momo";
  bookingData: Omit<BookingData, "paymentMethod">;
  totalAmount: number;
}

export function PaymentButton({
  paymentMethod,
  bookingData,
  totalAmount,
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      let response;
      if (paymentMethod === "vnpay") {
        response = await vnpayService.createVNPayBooking({
          ...bookingData,
          paymentMethod: "vnpay",
        });
      } else {
        response = await momoService.createMoMoBooking({
          ...bookingData,
          paymentMethod: "momo",
        });
      }

      if (response.success && response.paymentUrl) {
        // Redirect to payment gateway
        if (paymentMethod === "vnpay") {
          vnpayService.processPayment(response.paymentUrl);
        } else {
          momoService.processPayment(response.paymentUrl);
        }
      } else {
        throw new Error("Failed to create payment URL");
      }
    } catch (error) {
      setIsProcessing(false);
      const errorMessage =
        error instanceof Error ? error.message : "Payment processing failed";
      notify.error(errorMessage);
    }
  };

  const formatCurrency = (amount: number) =>
    amount.toLocaleString("vi-VN") + " ₫";

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-3 rounded-lg text-base transition-transform transform hover:scale-105"
    >
      {isProcessing
        ? "Processing..."
        : `Total amount: ${formatCurrency(totalAmount)}`}
    </Button>
  );
}
