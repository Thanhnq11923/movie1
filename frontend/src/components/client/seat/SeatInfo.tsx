import type { SelectedSeatInfo } from "../../../types/seat";
import { Button } from "../../../components/ui/button";
import { Calendar, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Type for API seat data
interface ApiSeat {
  _id: string;
  seatId: string;
  row: string;
  col: number;
  seatStatus: number;
  price?: number;
}

interface SeatInfoProps {
  selectedSeats: SelectedSeatInfo[];
  onConfirm: () => void;
  image: string | null;
  name: string | null;
  date: string | null;
  time: string | null;
  theater: string | null;
  format: string | null;
  allSeats?: ApiSeat[]; // Add allSeats property to props interface
}

export function SeatInfo({
  selectedSeats,
  onConfirm,
  image,
  name,
  date,
  time,
  theater,
  format,
  allSeats = [], // Provide default empty array
}: SeatInfoProps) {
  const navigate = useNavigate();
  const [totalPrice, setTotalPrice] = useState(0);
  const seatNames = selectedSeats.map((s) => `${s.row}${s.col}`).join(", ");

  // Get seat prices from API seats data
  useEffect(() => {
    const calculateTotalPrice = () => {
      // Use the allSeats prop directly instead of window.history.state
      console.log("SeatInfo - Available seats data:", allSeats);
      console.log("SeatInfo - Selected seats:", selectedSeats);

      let total = 0;

      // Calculate total price based on selected seats and their actual prices
      selectedSeats.forEach((seat) => {
        // Try by exact row and column match
        let seatData = allSeats.find(
          (s: ApiSeat) => s.row === seat.row && s.col === seat.col
        );

        // If no match found, try by seatId (format: "A1", "B2", etc)
        if (!seatData) {
          const seatId = `${seat.row}${seat.col}`;
          seatData = allSeats.find((s: ApiSeat) => s.seatId === seatId);
        }

        // Use the actual seat price from database or default to 120000
        const seatPrice = seatData?.price || 120000;
        console.log(`Seat ${seat.row}${seat.col} price: ${seatPrice}`);
        total += seatPrice;
      });

      console.log("SeatInfo - Total calculated price:", total);
      setTotalPrice(total);
    };

    calculateTotalPrice();
  }, [selectedSeats, allSeats]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US").format(price);
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

  const handleConfirm = () => {
    onConfirm();
    navigate("/select-corn", {
      state: {
        resetConcessions: true,
        scheduleId: window.history.state?.usr?.scheduleId,
        cinemaRoomId: window.history.state?.usr?.cinemaRoomId,
        seats: selectedSeats,
        allSeats: allSeats, // Pass allSeats from props
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-24">
      {/* Header with movie poster and info */}
      {image && (
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4">
          <div className="flex gap-4">
            <img
              src={image}
              alt={name || "Movie poster"}
              className="w-20 h-28 object-cover rounded-lg shadow-md"
            />
            <div className="flex-1 text-white">
              <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                {name || "Movie Title"}
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
            <span>{formatDate(date) || "Sunday, 08/03/2025"}</span>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Seat selection */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">
              <strong>{selectedSeats.length}x</strong> Single seat
              {selectedSeats.length > 1 ? "s" : ""}
            </span>
            <span className="font-semibold text-gray-800">
              {formatPrice(totalPrice)} ₫
            </span>
          </div>

          {selectedSeats.length > 0 && (
            <div className="text-sm text-gray-600">
              Seats:{" "}
              <span className="font-mono font-semibold text-red-500">
                {seatNames}
              </span>
            </div>
          )}
        </div>

        <hr className="border-gray-200" />

        {/* Total */}
        <div className="flex justify-between items-center py-2">
          <span className="text-lg font-bold text-gray-800">Total</span>
          <span className="text-2xl font-bold text-orange-600">
            {formatPrice(totalPrice)} ₫
          </span>
        </div>
        <div className="flex items-center justify-between">
          {/* Confirm button */}
          <Button
            onClick={handleConfirm}
            disabled={selectedSeats.length === 0}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:text-gray-500"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
