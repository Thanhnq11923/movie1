import { PaymentMethod } from "./PaymentMethod";
import { PaymentButton } from "./PaymentButton";
import type { CardData } from "../../../types/payment";
import type { BookingData } from "../../../services/api/vnpayService";

interface PaymentOptionsProps {
  selectedMethod: "vnpay" | "momo" | null;
  onMethodSelect: (method: "vnpay" | "momo") => void;
  onApplyPromotion: (code: string) => void;
  promoError: string;
  onPaymentSubmit: (cardData?: CardData) => void;
  bookingData?: Omit<BookingData, "paymentMethod">;
  totalAmount: number;
}

export function PaymentOptions({
  selectedMethod,
  onMethodSelect,
  bookingData,
  totalAmount,
}: PaymentOptionsProps) {
  return (
    <div className="space-y-6">
      <PaymentMethod
        selectedMethod={selectedMethod}
        onMethodSelect={onMethodSelect}
      />

      {bookingData && selectedMethod && (
        <PaymentButton
          paymentMethod={selectedMethod}
          bookingData={bookingData}
          totalAmount={totalAmount}
        />
      )}
    </div>
  );
}
