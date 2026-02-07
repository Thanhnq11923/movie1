import type { TicketTransaction } from "../../../types/account";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "../../ui/dialog";
import { X } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { promotionService } from "../../../services/api/promotionService";

// Extended interface for backward compatibility with database fields
interface ExtendedTransaction extends TicketTransaction {
  seatStatus?: number;
}

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: ExtendedTransaction | null;
}

const DetailSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="py-4 border-b border-gray-200 last:border-b-0">
    <h4 className="text-md font-semibold text-gray-800 mb-2">{title}</h4>
    <div className="space-y-2 text-sm text-gray-600">{children}</div>
  </div>
);

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-start">
    <span className="font-medium text-gray-500">{label}:</span>
    <span className="text-right">{value}</span>
  </div>
);

export const TransactionDetailModal = ({
  isOpen,
  onClose,
  transaction,
}: TransactionDetailModalProps) => {
  // Move hooks outside of conditional return to fix React hooks rule
  const [discountValue, setDiscountValue] = useState<number | null>(null);

  useEffect(() => {
    if (transaction?.promotion) {
      promotionService.getPromotionByCode(transaction.promotion).then((res) => {
        if (res.success && res.data) {
          setDiscountValue(res.data.discountValue);
        }
      });
    }
  }, [transaction?.promotion]);

  if (!transaction) return null;

  // Debug: log dữ liệu transaction thực tế
  console.log("Transaction detail data:", transaction);

  // Map lại các trường dữ liệu với proper type checking
  const bookingDate =
    transaction.bookedAt && !isNaN(new Date(transaction.bookedAt).getTime())
      ? format(new Date(transaction.bookedAt), "PPpp")
      : "N/A";

  // Handle movieId properly - check if it's an object or string
  const movieName =
    typeof transaction.movieId === "object" &&
    transaction.movieId?.versionMovieEnglish
      ? transaction.movieId.versionMovieEnglish
      : transaction.movieName || "N/A";

  // Handle cinemaRoomId properly - check if it's an object or string
  const cinemaRoomName =
    typeof transaction.cinemaRoomId === "object" &&
    transaction.cinemaRoomId?.roomName
      ? transaction.cinemaRoomId.roomName
      : transaction.cinemaRoomName || "N/A";

  const seat =
    Array.isArray(transaction.seats) && transaction.seats.length > 0
      ? transaction.seats
          .map((s) => `${s.row}${s.col || s.number || ""}`)
          .join(", ")
      : "N/A";

  const concessionStr =
    Array.isArray(transaction.concessions) && transaction.concessions.length > 0
      ? transaction.concessions
          .map((item) => `${item.name} x${item.quantity}`)
          .join(", ")
      : "N/A";

  // Use totalMoney from TicketTransaction type
  const amount = transaction.totalMoney ?? 0;

  // Use the correct status field from TicketTransaction type
  let status: string = transaction.status || "pending";

  // Fallback to seatStatus mapping if needed (for backward compatibility)
  if (!transaction.status && typeof transaction.seatStatus === "number") {
    if (transaction.seatStatus === 1) status = "confirmed";
    else if (transaction.seatStatus === 0) status = "cancelled";
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">Transaction Details</DialogTitle>
          <DialogDescription>ID: {transaction._id}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[70vh] overflow-y-auto pr-2">
          <DetailSection title="Booking Information">
            <DetailRow label="Booking Date" value={bookingDate} />
            <DetailRow
              label="Status"
              value={
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {status}
                </span>
              }
            />
          </DetailSection>

          <DetailSection title="Movie & Showtime">
            <DetailRow label="Movie" value={movieName} />
            <DetailRow label="Cinema Room" value={cinemaRoomName} />
            <DetailRow label="Seat" value={seat} />
            <DetailRow label="Concessions" value={concessionStr} />
            <DetailRow
              label="Promotion CODE"
              value={transaction.promotion || "N/A"}
            />
          </DetailSection>

          <DetailSection title="Payment Summary">
            <DetailRow
              label="Payment Method"
              value={
                transaction.paymentMethod
                  ? transaction.paymentMethod.replace("_", " ").toUpperCase()
                  : "ONLINE"
              }
            />
            {discountValue !== null && (
              <DetailRow label="Discount Value" value={discountValue} />
            )}
            <DetailRow
              label="Points Added"
              value={
                typeof transaction.addScore === "number"
                  ? transaction.addScore
                  : "0"
              }
            />
            <hr className="my-2 border-dashed" />
            <div className="flex justify-between font-bold text-lg text-gray-800">
              <span>Total</span>
              <span>{amount ? amount.toLocaleString() + " ₫" : " 0 đ"}</span>
            </div>
          </DetailSection>
        </div>
        <DialogClose asChild>
          <button className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
