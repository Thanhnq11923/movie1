import { Button } from "../../ui/button";
import { PaymentSummary } from "./PaymentSummary";
import type { BookingInfo, ConcessionItem } from "../../../types/payment";

interface PaymentDetailsProps {
    bookingInfo: BookingInfo;
    selectedSeats: string[];
    concessions: ConcessionItem[];
    subtotal: number;
    discount: number;
    total: number;
    selectedMethod: "credit" | "vnpay" | null;
    onPayment: () => void;
}

export function PaymentDetails({
    bookingInfo,
    selectedSeats,
    concessions,
    subtotal,
    discount,
    total,
    selectedMethod,
    onPayment
}: PaymentDetailsProps) {
    return (
        <div className="space-y-6">
            <PaymentSummary
                movieInfo={{
                    title: bookingInfo.movie.title,
                    date: bookingInfo.date,
                    time: bookingInfo.time,
                    room: bookingInfo.theater.name,
                    seats: selectedSeats
                }}
                concessions={concessions}
                subtotal={subtotal}
                discount={discount}
                total={total}
            />

            <Button
                onClick={onPayment}
                disabled={!selectedMethod}
                className="w-full bg-[#FF9800] hover:bg-[#F57C00] text-white h-12 text-lg"
            >
                Pay ${total.toFixed(2)}
            </Button>
        </div>
    );
} 