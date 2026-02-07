import type { Product } from "../../../types/product";
import type { SelectedSeatInfo } from "../../../types/seat";
import { OrderSummaryItem } from "./OrderSummaryItem";
import { Calendar, MapPin } from "lucide-react";

interface ApiSeat {
  _id: string;
  seatId: string;
  row: string;
  col: number;
  seatStatus: number;
  price?: number;
}

interface OrderSummaryProps {
  products: Product[];
  quantities: { [key: number]: number };
  onUpdateQuantity: (productId: number, delta: number) => void;
  // Add movie information props
  movieName?: string;
  movieImage?: string;
  format?: string;
  theater?: string;
  date?: string;
  time?: string;
  selectedSeats?: SelectedSeatInfo[];
  allSeats?: ApiSeat[];
}

export const OrderSummary = ({
  products,
  quantities,
  onUpdateQuantity,
  movieName,
  movieImage,
  format,
  theater,
  date,
  time,
  selectedSeats,
  allSeats,
}: OrderSummaryProps) => {
  const selectedProducts = products.filter(
    (product) => quantities[product.id] > 0
  );
  const concessionTotal = selectedProducts.reduce(
    (sum, product) => sum + product.price * (quantities[product.id] || 0),
    0
  );

  // Calculate ticket price
  const calculateTotalTicketPrice = () => {
    if (!selectedSeats || !allSeats) return 0;

    let total = 0;
    selectedSeats.forEach((seat) => {
      // Try by exact row and column match
      let seatData = allSeats.find(
        (s) => s.row === seat.row && s.col === seat.col
      );

      // If no match found, try by seatId
      if (!seatData) {
        const seatId = `${seat.row}${seat.col}`;
        seatData = allSeats.find((s) => s.seatId === seatId);
      }

      // Use the actual seat price from database or default to 120000
      const seatPrice = seatData?.price || 120000;
      total += seatPrice;
    });

    return total;
  };

  const ticketPrice = calculateTotalTicketPrice();
  const total = concessionTotal + ticketPrice;
  const seatNames =
    selectedSeats?.map((s) => `${s.row}${s.col}`).join(", ") || "";

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden top-24">
      {/* Header with movie poster and info - Similar to SeatInfo */}
      {movieImage && (
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4">
          <div className="flex gap-4">
            <img
              src={movieImage}
              alt={movieName || "Movie poster"}
              className="w-20 h-28 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1 text-white">
              <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                {movieName || "Movie Title"}
              </h3>
              <div className="text-sm opacity-90 mb-1">
                <span className="bg-orange-400 px-2 py-0.5 rounded text-xs font-semibold border border-white shadow-sm">
                  {format?.toUpperCase() || ""}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Cinema and showtime info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-orange-500" />
            <span className="font-semibold">{theater || "Cinema"}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                Showtime: <strong>{time || "10:45"}</strong>
              </span>
            </div>
            <span>-</span>
            <span>{formatDate(date || "")}</span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Seat selection info */}
        {selectedSeats && selectedSeats.length > 0 && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  <strong>{selectedSeats.length}x</strong> Single seat
                  {selectedSeats.length > 1 ? "s" : ""}
                </span>
                <span className="font-semibold text-gray-800">
                  {formatPrice(ticketPrice)} ₫
                </span>
              </div>

              <div className="text-sm text-gray-600">
                Seats:{" "}
                <span className="font-mono font-semibold text-red-500">
                  {seatNames}
                </span>
              </div>
            </div>

            <hr className="border-gray-200" />
          </>
        )}

        {/* Concessions section */}
        {selectedProducts.length > 0 && (
          <>
            <div className="space-y-3">
              <div className="space-y-2">
                {selectedProducts.map((product) => (
                  <OrderSummaryItem
                    key={product.id}
                    product={product}
                    quantity={quantities[product.id]}
                    onUpdateQuantity={onUpdateQuantity}
                  />
                ))}
              </div>
            </div>

            <hr className="border-gray-200" />
          </>
        )}

        {/* Total */}
        <div className="flex justify-between items-center py-2">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatPrice(total)} ₫
          </span>
        </div>
      </div>
    </div>
  );
};
