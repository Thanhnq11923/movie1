import React, { useState, useEffect } from "react";
import { 
  Grid, 
  Eye, 
  EyeOff,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { getSeatsByScheduleId } from "../../../services/api/seatService";

interface SeatData {
  _id: string;
  seatId: string;
  row: string;
  col: number;
  seatStatus: number;
  price: number;
}

interface SeatVisualizationProps {
  scheduleId: string;
  cinemaRoomId?: string;
  movieName?: string;
  roomName?: string;
}

export default function SeatVisualization({ 
  scheduleId, 
  cinemaRoomId, 
  movieName = "Unknown Movie",
  roomName = "Unknown Room"
}: SeatVisualizationProps) {
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getSeatsByScheduleId(scheduleId, cinemaRoomId);
      
      let seatsData: SeatData[] = [];
      if (Array.isArray(response)) {
        if (response.length > 0 && response[0].seats) {
          seatsData = response[0].seats;
        }
      } else if (response.seats) {
        seatsData = response.seats;
      } else if (response.data && response.data.seats) {
        seatsData = response.data.seats;
      }

      setSeats(seatsData);
    } catch (err) {
      console.error('Error fetching seats:', err);
      setError('Failed to load seat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scheduleId) {
      fetchSeats();
    }
  }, [scheduleId, cinemaRoomId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  const getSeatStatus = () => {
    const bookedSeats = seats.filter(seat => seat.seatStatus === 1).length;
    const totalSeats = seats.length;
    const availableSeats = totalSeats - bookedSeats;
    const bookingPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;
    const totalRevenue = bookedSeats * (seats[0]?.price || 120000);

    return {
      bookedSeats,
      availableSeats,
      totalSeats,
      bookingPercentage,
      totalRevenue
    };
  };

  const status = getSeatStatus();

  // Group seats by row for better visualization
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {} as Record<string, SeatData[]>);

  // Sort rows alphabetically
  const sortedRows = Object.keys(seatsByRow).sort();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading seat layout...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <span className="ml-2 text-red-600">{error}</span>
          <button 
            onClick={fetchSeats}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Grid className="w-5 h-5 mr-2" />
            Seat Layout
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {movieName} - {roomName}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLegend(!showLegend)}
            className="flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
          >
            {showLegend ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showLegend ? 'Hide' : 'Show'} Legend
          </button>
          <button
            onClick={fetchSeats}
            className="flex items-center px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{status.totalSeats}</div>
          <div className="text-sm text-gray-500">Total Seats</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{status.availableSeats}</div>
          <div className="text-sm text-gray-500">Available</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{status.bookedSeats}</div>
          <div className="text-sm text-gray-500">Booked</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{status.bookingPercentage.toFixed(1)}%</div>
          <div className="text-sm text-gray-500">Occupancy</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{formatCurrency(status.totalRevenue)}</div>
          <div className="text-sm text-gray-500">Revenue</div>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="mb-4">
        <div className="text-center mb-2 text-sm font-medium text-gray-700">Screen</div>
        <div className="w-full h-2 bg-gray-300 rounded mb-6"></div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedRows.map((row) => (
          <div key={row} className="flex items-center space-x-2">
            <div className="w-8 text-sm font-medium text-gray-600">{row}</div>
            <div className="flex space-x-1">
              {seatsByRow[row]
                .sort((a, b) => a.col - b.col)
                .map((seat) => (
                  <div
                    key={seat._id}
                    className={`w-8 h-8 text-xs flex items-center justify-center border rounded ${
                      seat.seatStatus === 1 
                        ? 'bg-red-500 text-white border-red-600' 
                        : 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                    } transition-colors cursor-pointer`}
                    title={`${seat.seatId} - ${seat.seatStatus === 1 ? 'Booked' : 'Available'} - ${formatCurrency(seat.price)}`}
                  >
                    {seat.col}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded mr-2"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
              <span>Screen</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 