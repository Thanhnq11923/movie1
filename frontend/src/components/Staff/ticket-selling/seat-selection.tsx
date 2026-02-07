import React from "react";
import type { Movie } from "./movie-show";

// Define Seat type locally to match the one in ticket-selling
interface Seat {
  seatId: string;
  row: string;
  col: string;
  price: number;
  seatStatus: number; // 0: available, 1: occupied, 2: selected
}

// Type definitions
export type SeatRow = {
  row: string;
  seats: string[];
};

interface SeatSelectionProps {
  selectedMovie: Movie | undefined;
  selectedShowtime:
    | {
        id: string;
        movieId: string;
        theaterId: string;
        date: string;
        time: string;
        format: string;
        available: number;
        total: number;
        cinemaRoomId?: string;
      }
    | undefined;
  seatsData: Seat[];
  selectedSeats: string[];
  onSeatToggle: (seat: string) => void;
  getSeatPrice: (seat: string) => number;
  roomName?: string;
  onBack: () => void;
  onContinue: () => void;
}

export default function SeatSelection({
  selectedMovie,
  selectedShowtime,
  seatsData,
  selectedSeats,
  onSeatToggle,
  getSeatPrice,
  roomName,
  onBack,
  onContinue,
}: SeatSelectionProps) {
  // Convert seatsData to seatLayout format with 12 seats per row
  const seatLayout = React.useMemo(() => {
    const rows: { [key: string]: string[] } = {};

    // Initialize all rows with 12 seats (1-12)
    const rowLetters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
    ];
    rowLetters.forEach((rowLetter) => {
      rows[rowLetter] = [];
      for (let i = 1; i <= 12; i++) {
        rows[rowLetter].push(`${rowLetter}${i}`);
      }
    });

    // Update with actual seat data from API
    seatsData.forEach((seat) => {
      const seatId = seat.seatId;
      const row = seatId.charAt(0);
      const col = parseInt(seatId.slice(1));

      if (rows[row] && col >= 1 && col <= 12) {
        // Replace the placeholder seat with actual seat data
        rows[row][col - 1] = seatId;
      }
    });

    return Object.keys(rows).map((row) => ({
      row,
      seats: rows[row],
    }));
  }, [seatsData]);

  // Get occupied seats from seatsData
  const occupiedSeats = React.useMemo(
    () =>
      seatsData
        .filter((seat) => seat.seatStatus === 1)
        .map((seat) => seat.seatId),
    [seatsData]
  );

  // Function to check if seat selection is valid (no gaps)
  const isValidSeatSelection = (seat: string): boolean => {
    if (selectedSeats.length === 0) return true;

    // Get the row of the seat being selected
    const seatRow = seat.charAt(0);
    const seatCol = parseInt(seat.slice(1));

    // Get all selected seats in the same row
    const selectedSeatsInRow = selectedSeats.filter(
      (s) => s.charAt(0) === seatRow
    );

    if (selectedSeatsInRow.length === 0) return true;

    // Sort selected seats by column number
    const sortedSelectedSeats = selectedSeatsInRow.sort((a, b) => {
      const colA = parseInt(a.slice(1));
      const colB = parseInt(b.slice(1));
      return colA - colB;
    });

    // Check if the new seat would create a gap
    const minCol = Math.min(
      ...sortedSelectedSeats.map((s) => parseInt(s.slice(1)))
    );
    const maxCol = Math.max(
      ...sortedSelectedSeats.map((s) => parseInt(s.slice(1)))
    );

    // If the new seat is adjacent to existing selection, it's valid
    if (seatCol === minCol - 1 || seatCol === maxCol + 1) {
      return true;
    }

    // If the new seat is within the existing range, it's valid
    if (seatCol >= minCol && seatCol <= maxCol) {
      return true;
    }

    return false;
  };

  const getSeatStatus = (seat: string) => {
    if (occupiedSeats.includes(seat)) return "occupied";
    if (selectedSeats.includes(seat)) return "selected";
    return "available";
  };

  const getSeatColor = (seat: string) => {
    const status = getSeatStatus(seat);

    switch (status) {
      case "occupied":
        return "bg-gray-300 text-gray-700";
      case "selected":
        return "bg-orange-400 text-white";
      default: {
        // Check if seat is selectable (no gaps)
        const isSelectable = isValidSeatSelection(seat);
        return isSelectable
          ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          : "bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed";
      }
    }
  };

  const handleSeatClick = (seat: string) => {
    // Don't allow selection if it would create gaps
    if (!isValidSeatSelection(seat) && !selectedSeats.includes(seat)) {
      return;
    }
    onSeatToggle(seat);
  };

  const calculateSubtotal = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <main className="flex-1 py-8 sm:py-1 container mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Seat Map */}
          <div className="flex-grow bg-white p-3 sm:p-5 rounded-lg shadow-md">
            <div className="flex flex-col items-center mb-6 sm:mb-10">
              {/* Screen */}
              <div
                className="relative w-[95%] sm:w-[90%] md:w-3/4 h-3 sm:h-4"
                style={{ perspective: "200px" }}
              >
                <div
                  className="w-full h-full rounded-t-full relative"
                  style={{
                    background:
                      "linear-gradient(180deg, #fff3e0 60%, #ffb74d 100%)",
                    boxShadow:
                      "0 8px 16px 0 rgba(255,152,0,0.10), 0 1px 4px #ffe0b2",
                    transform: "rotateX(18deg)",
                    borderTop: "3px solid #ffe0b2",
                    borderBottom: "1px solid #ff9800",
                  }}
                >
                  <div
                    className="pointer-events-none absolute left-0 top-0 w-full h-full rounded-t-full"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, rgba(255,255,255,0.25) 70%, transparent 100%)",
                      zIndex: 2,
                    }}
                  />
                </div>
              </div>
              <span
                className="mt-2 text-orange-400 font-semibold tracking-widest text-xs sm:text-sm"
                style={{ letterSpacing: "0.2em" }}
              >
                SCREEN
              </span>
            </div>

            {/* Seat Layout - Grid Display */}
            <div className="flex flex-col items-center space-y-2 sm:space-y-3 max-w-full overflow-x-auto">
              {seatLayout.map((row) => (
                <div
                  key={row.row}
                  className="flex items-center gap-1 sm:gap-2 md:gap-3 min-w-max"
                >
                  {/* Left row label - hidden on small mobile */}
                  <span className="hidden sm:block w-4 sm:w-6 text-center font-medium text-gray-500 text-xs sm:text-sm">
                    {row.row}
                  </span>

                  {/* Seats grid */}
                  <div className="flex gap-1 sm:gap-2">
                    {row.seats.map((seat) => (
                      <button
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 rounded-md text-xs font-semibold transition-colors duration-200 ${getSeatColor(
                          seat
                        )}`}
                        disabled={
                          occupiedSeats.includes(seat) ||
                          (!isValidSeatSelection(seat) &&
                            !selectedSeats.includes(seat))
                        }
                      >
                        {seat.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Right row label - hidden on small mobile */}
                  <span className="hidden sm:block w-4 sm:w-6 text-center font-medium text-gray-500 text-xs sm:text-sm">
                    {row.row}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white border border-gray-300 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Available
                </span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-400 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Selected
                </span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Occupied
                </span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-50 border border-gray-200 rounded"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  Unavailable (Gap)
                </span>
              </div>
            </div>

            {/* Selection Rule Notice */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Selection Rule:</strong> You must select seats that are
                adjacent to each other. No gaps are allowed between selected
                seats.
              </p>
            </div>
          </div>

          {/* Selection Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-96 h-fit sticky top-4">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Selection Summary
                </h3>
              </div>

              <div className="p-6 space-y-5">
                {selectedMovie && (
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg overflow-hidden flex-shrink-0 border border-blue-200 shadow-sm">
                      {selectedMovie.largeImage || selectedMovie.smallImage ? (
                        <img
                          src={
                            selectedMovie.largeImage || selectedMovie.smallImage
                          }
                          alt={
                            selectedMovie.versionMovieEnglish ||
                            selectedMovie.versionMovieVn
                          }
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                          <span className="text-xs text-blue-600 font-medium">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight truncate mb-1">
                        {selectedMovie.versionMovieEnglish ||
                          selectedMovie.versionMovieVn}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">
                        {selectedMovie.duration} min
                      </p>
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedMovie.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedShowtime && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                          Time:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {selectedShowtime.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                          Room:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {roomName || selectedShowtime.theaterId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600 flex items-center">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                          Format:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {selectedShowtime.format}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-gray-700">
                      Selected Seats
                    </span>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {selectedSeats.length} seats
                    </span>
                  </div>
                  {selectedSeats.length > 0 ? (
                    <div className="space-y-2">
                      {selectedSeats.map((seat) => (
                        <div
                          key={seat}
                          className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-lg border border-blue-100"
                        >
                          <span className="font-semibold text-gray-900">
                            {seat}
                          </span>
                          <span className="text-blue-700 font-bold text-base">
                            {getSeatPrice(seat).toLocaleString()} VND
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-gray-400 text-xl">🎬</span>
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        No seats selected
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Select your preferred seats
                      </p>
                    </div>
                  )}
                </div>

                {selectedSeats.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900 text-lg">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {calculateSubtotal().toLocaleString()} VND
                      </span>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="pt-3 space-y-2">
                  <button
                    onClick={onBack}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    ← Back to Movie & Showtime
                  </button>
                  <button
                    onClick={onContinue}
                    disabled={selectedSeats.length === 0}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Continue to Concessions →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
