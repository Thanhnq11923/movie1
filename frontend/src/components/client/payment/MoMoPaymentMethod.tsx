import { useState } from "react";
import { Button } from "../../ui/button";
import momoService from "../../../services/api/momoService";
import type { BookingData } from "../../../services/api/momoService";
import { notify } from "../../../lib/toast";

interface MoMoPaymentMethodProps {
  bookingData: Omit<BookingData, "paymentMethod">;
  onPaymentInitiated: () => void;
  onPaymentError: (error: string) => void;
}

const MoMoPaymentMethod = ({
  bookingData,
  onPaymentInitiated,
  onPaymentError,
}: MoMoPaymentMethodProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMoMoPayment = async () => {
    try {
      setIsProcessing(true);
      onPaymentInitiated();

      const response = await momoService.createMoMoBooking({
        ...bookingData,
        paymentMethod: "momo",
      });

      if (response.success && response.paymentUrl) {
        // Redirect to MoMo payment page
        momoService.processPayment(response.paymentUrl);
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
          src="/assets/payment/momo-logo.png"
          alt="MoMo"
          className="h-10 object-contain"
          onError={(e) => {
            e.currentTarget.src =
              "https://developers.momo.vn/v3/assets/images/square-logo.svg";
          }}
        />
        <div>
          <h3 className="font-semibold">MoMo</h3>
          <p className="text-sm text-gray-600">Secure mobile payment</p>
        </div>
      </div>

      <div className="p-3 bg-pink-50 text-pink-800 rounded-md text-sm">
        <p>
          You will be redirected to MoMo's secure payment gateway to complete
          your payment.
        </p>
      </div>

      <Button
        onClick={handleMoMoPayment}
        disabled={isProcessing}
        className="w-full bg-pink-600 hover:bg-pink-700"
      >
        {isProcessing ? "Processing..." : "Pay with MoMo"}
      </Button>
    </div>
  );
};

export default MoMoPaymentMethod;
