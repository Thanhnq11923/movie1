"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Monitor, Users, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { notify } from "./././../../../lib/toast";
import type { RoomData } from "./room-management";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import { movieScheduleService } from "../../../services/api/movieScheduleService";

interface SeatingChartManagementProps {
  rooms: RoomData[];
}

interface SeatData {
  id: string;
  occupied: boolean;
  type: "standard" | "premium" | "vip";
  price: number;
  seatId?: string;
  seatStatus?: number;
}

interface SeatLayout {
  rows: SeatData[][];
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
}

const SeatingChartManagement: React.FC<SeatingChartManagementProps> = ({
  rooms,
}) => {
  const [selectedRoom, setSelectedRoom] = useState<string>(rooms[0]?._id || "");
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "reset" | "fill" | "check";
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const toastShownRef = useRef(false);

  // Use the first room from the array (which should be the specific room passed from parent)
  const selectedRoomData = rooms[0] || null;

  // Debug: Log component mount
  useEffect(() => {
    console.log(`SeatingChart - Component mounted with ${rooms.length} rooms`);
    toastShownRef.current = false; // Reset toast flag on mount
    return () => {
      console.log(`SeatingChart - Component unmounted`);
    };
  }, []);

  // Update selectedRoom when rooms array changes (when different room is selected)
  useEffect(() => {
    if (rooms.length > 0 && rooms[0]) {
      setSelectedRoom(rooms[0]._id);
    }
  }, [rooms]);

  const fetchSeatData = async () => {
    if (!selectedRoomData) return;
    
    console.log(`SeatingChart - fetchSeatData called for room: ${selectedRoomData.roomName}`);
    
    setLoading(true);
    try {
      console.log(`SeatingChart - Fetching seat data for room: ${selectedRoomData.roomName} (ID: ${selectedRoomData._id})`);
      console.log(`SeatingChart - Room capacity: ${selectedRoomData.capacity}, occupancy: ${selectedRoomData.occupancy}%`);
      
      // Debug: Log all room data
      console.log(`SeatingChart - Full room data:`, {
        _id: selectedRoomData._id,
        roomName: selectedRoomData.roomName,
        capacity: selectedRoomData.capacity,
        occupancy: selectedRoomData.occupancy,
        currentMovie: selectedRoomData.currentMovie,
        scheduleId: selectedRoomData.scheduleId,
        schedule: selectedRoomData.schedule,
        cinemaId: selectedRoomData.cinemaId
      });
      
      // Extract original room ID from combined ID (e.g., "Room 1 - Inception_cinema123_schedule456")
      let originalRoomId = selectedRoomData._id;
      
      // Handle different room ID formats
      if (selectedRoomData._id.includes('_')) {
        // Try to extract room ID from the combined format
        const parts = selectedRoomData._id.split('_');
        if (parts.length >= 2) {
          // Try different combinations to find the correct room ID
          originalRoomId = parts[1]; // Second part might be room ID
        }
      }
      
      // If we still don't have a proper room ID, try to get it from the schedule data
      if (!originalRoomId || originalRoomId === selectedRoomData.currentMovie) {
        console.log(`SeatingChart - Invalid room ID extracted: ${originalRoomId}, trying to get from schedule`);
        // Try to get room ID from schedule data
        const scheduleRoomId = selectedRoomData.schedule?.[0]?.cinemaRoomId || 
                              selectedRoomData.schedule?.[0]?.roomId ||
                              selectedRoomData.cinemaId;
        
        if (scheduleRoomId && scheduleRoomId !== selectedRoomData.currentMovie) {
          originalRoomId = scheduleRoomId;
          console.log(`SeatingChart - Using room ID from schedule: ${originalRoomId}`);
        }
      }
      
      console.log(`SeatingChart - Room ID: ${selectedRoomData._id}`);
      console.log(`SeatingChart - Extracted original room ID: ${originalRoomId}`);
      
      // Get schedules for this room to find the correct scheduleId
      const scheduleRes = await movieScheduleService.getAllMovieSchedules();
      const schedules = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || [];
      
      // Find schedules for this specific room using original room ID
      const roomSchedules = schedules.filter((schedule: any) => schedule.cinemaRoomId === originalRoomId);
      
      console.log(`SeatingChart - Looking for schedules with cinemaRoomId: ${originalRoomId}`);
      console.log(`SeatingChart - Total schedules available: ${schedules.length}`);
      console.log(`SeatingChart - Found schedules for room: ${roomSchedules.length}`);
      
      let scheduleId = selectedRoomData.scheduleId;
      let cinemaRoomId = originalRoomId;
      
      // If no scheduleId from room data, try to get from schedules
      if (!scheduleId && roomSchedules.length > 0) {
        const latestSchedule = roomSchedules[0];
        scheduleId = latestSchedule._id;
        console.log(`SeatingChart - Using schedule ID from API: ${scheduleId}`);
      }
      
      // If still no scheduleId, try alternative room ID formats
      if (!scheduleId) {
        const alternativeRoomId = selectedRoomData._id.includes('_') ? selectedRoomData._id.split('_')[1] : selectedRoomData._id;
        const alternativeSchedules = schedules.filter((schedule: any) => 
          schedule.cinemaRoomId === alternativeRoomId || 
          schedule.cinemaRoomId === selectedRoomData._id ||
          schedule.roomId === originalRoomId ||
          schedule.roomId === alternativeRoomId
        );
        
        if (alternativeSchedules.length > 0) {
          scheduleId = alternativeSchedules[0]._id;
          cinemaRoomId = alternativeRoomId;
          console.log(`SeatingChart - Using alternative schedule ID: ${scheduleId}`);
        }
      }
      
      if (scheduleId && cinemaRoomId) {
        console.log(`SeatingChart - Fetching seats for schedule: ${scheduleId}, room: ${cinemaRoomId}`);
        const seatResponse = await getSeatsByScheduleId(scheduleId, cinemaRoomId);
        console.log(`SeatingChart - Seat response:`, seatResponse);
        
        let seats: any[] = [];
        
        // Handle different response formats
        if (Array.isArray(seatResponse)) {
          if (seatResponse.length > 0 && seatResponse[0].seats) {
            seats = seatResponse[0].seats;
          } else if (seatResponse.length > 0 && Array.isArray(seatResponse[0])) {
            seats = seatResponse[0];
          } else if (seatResponse.length > 0 && seatResponse[0] && typeof seatResponse[0] === 'object') {
            seats = seatResponse[0].seats || seatResponse[0];
          }
        } else if (seatResponse && seatResponse.seats) {
          seats = seatResponse.seats;
        } else if (seatResponse && seatResponse.data && seatResponse.data.seats) {
          seats = seatResponse.data.seats;
        } else if (seatResponse && Array.isArray(seatResponse)) {
          seats = seatResponse;
        } else if (seatResponse && typeof seatResponse === 'object') {
          seats = seatResponse.seats || seatResponse;
        }

        // Additional check for the specific format
        if (seats.length === 0 && seatResponse && typeof seatResponse === 'object' && seatResponse.seats) {
          console.log(`SeatingChart - Found seats in seatResponse.seats`);
          seats = seatResponse.seats;
        }

        if (seats.length > 0) {
          const layout = generateSeatLayoutFromAPI(seats, selectedRoomData.capacity);
          setSeatLayout(layout);
          
          console.log(`SeatingChart - Generated layout from API: ${layout.totalSeats} total, ${layout.occupiedSeats} occupied, ${layout.availableSeats} available`);
          
          // Only show toast if not already shown
          if (!toastShownRef.current) {
            notify.success(`Loaded seat chart for ${selectedRoomData.roomName} - ${layout.occupiedSeats}/${layout.totalSeats} booked`);
            toastShownRef.current = true;
          }
          return;
        } else {
          console.log(`SeatingChart - No seat data available from API, using fallback`);
        }
      } else {
        console.log(`SeatingChart - No scheduleId or cinemaRoomId found, using fallback`);
      }
      
      // Fallback: Use room data if no API data available
      console.log(`SeatingChart - Using room data as fallback`);
      const layout = generateSeatChartFromRoomData(selectedRoomData);
      setSeatLayout(layout);
      console.log(`SeatingChart - Generated room-data-based layout for ${selectedRoomData.roomName}: ${layout.totalSeats} seats, ${layout.occupiedSeats} occupied`);
      
      // Only show toast if not already shown
      if (!toastShownRef.current) {
        notify.info(`Using room data for ${selectedRoomData.roomName} - ${layout.occupiedSeats}/${layout.totalSeats} booked (${selectedRoomData.occupancy}%)`);
        toastShownRef.current = true;
      }
      
    } catch (error) {
      console.error('SeatingChart - Error fetching seat data:', error);
      
      // Only show error toast if not already shown
      if (!toastShownRef.current) {
        notify.error('Failed to load seat data');
        toastShownRef.current = true;
      }
      
      // Use room data on error
      const layout = generateSeatChartFromRoomData(selectedRoomData);
      setSeatLayout(layout);
      console.log(`SeatingChart - Generated room-data-based layout on error for ${selectedRoomData.roomName}: ${layout.totalSeats} seats, ${layout.occupiedSeats} occupied`);
    } finally {
      setLoading(false);
    }
  };

  const generateSeatLayoutFromAPI = (seats: any[], capacity: number): SeatLayout => {
    const rows: SeatData[][] = [];
    let seatCount = 0;
    let occupiedCount = 0;

    const numRows = 12; // A đến L
    const seatsPerRow = 12;

    // Create a map of occupied seats from API data
    const occupiedSeats = new Set(seats.filter((seat: any) => seat.seatStatus === 1).map((seat: any) => seat.seatId));
    
    console.log(`SeatingChart - API seats data:`, seats.slice(0, 5)); // Show first 5 seats
    console.log(`SeatingChart - Occupied seats from API:`, Array.from(occupiedSeats));
    console.log(`SeatingChart - Total seats from API: ${seats.length}, Occupied: ${occupiedSeats.size}`);

    for (let i = 0; i < numRows && seatCount < capacity; i++) {
      const row: SeatData[] = [];
      const rowLetter = String.fromCharCode(65 + i); // A, B, C, ..., L

      for (let j = 1; j <= seatsPerRow && seatCount < capacity; j++) {
        const seatId = `${rowLetter}${j}`;
        const isOccupied = occupiedSeats.has(seatId);
        const seatType = "standard";
        const basePrice = 15; // Standard price

        if (isOccupied) occupiedCount++;

        row.push({
          id: seatId,
          occupied: isOccupied,
          type: seatType as "standard" | "premium" | "vip",
          price: basePrice,
          seatId: seatId,
          seatStatus: isOccupied ? 1 : 0,
        });
        seatCount++;
      }
      rows.push(row);
    }

    const layout = {
      rows,
      totalSeats: seatCount,
      availableSeats: seatCount - occupiedCount,
      occupiedSeats: occupiedCount,
    };

    console.log(`SeatingChart - Generated layout: ${layout.totalSeats} total, ${layout.occupiedSeats} occupied, ${layout.availableSeats} available`);
    
    return layout;
  };

  const generateSeatChartFromRoomData = (room: RoomData): SeatLayout => {
    const rows: SeatData[][] = [];
    let seatCount = 0;
    let occupiedCount = 0;

    const capacity = room.capacity || 144;
    const occupancy = room.occupancy || 0;
    const expectedOccupiedSeats = Math.floor(capacity * (occupancy / 100));

    const numRows = 12; // A đến L
    const seatsPerRow = 12;

    for (let i = 0; i < numRows && seatCount < capacity; i++) {
      const row: SeatData[] = [];
      const rowLetter = String.fromCharCode(65 + i); // A, B, C, ..., L

      for (let j = 1; j <= seatsPerRow && seatCount < capacity; j++) {
        const seatId = `${rowLetter}${j}`;
        
        // Distribute occupied seats randomly based on occupancy percentage
        const isOccupied = seatCount < expectedOccupiedSeats && Math.random() < (expectedOccupiedSeats / capacity);
        const seatType = "standard";
        const basePrice = 15; // Standard price

        if (isOccupied) occupiedCount++;

        row.push({
          id: seatId,
          occupied: isOccupied,
          type: seatType as "standard" | "premium" | "vip",
          price: basePrice,
          seatId: seatId,
          seatStatus: isOccupied ? 1 : 0,
        });
        seatCount++;
      }
      rows.push(row);
    }

    return {
      rows,
      totalSeats: seatCount,
      availableSeats: seatCount - occupiedCount,
      occupiedSeats: occupiedCount,
    };
  };

  useEffect(() => {
    console.log(`SeatingChart - useEffect triggered: selectedRoomData=${!!selectedRoomData}, hasInitialized=${hasInitialized}`);
    if (selectedRoomData && !hasInitialized) {
      console.log(`SeatingChart - Setting hasInitialized=true and calling fetchSeatData`);
      setHasInitialized(true);
      fetchSeatData();
    }
  }, [selectedRoomData, hasInitialized]);

  const getSeatColor = (seatData: SeatData) => {
    if (seatData.occupied) {
      return "bg-red-500 text-white"; // Occupied
    } else {
      return "bg-gray-100 text-gray-700 border border-gray-300"; // Available
    }
  };

  const handleRoomChange = (newRoomId: string) => {
    setSelectedRoom(newRoomId);
  };

  const getOccupancyPercentage = () => {
    if (!seatLayout) return 0;
    return Math.round((seatLayout.occupiedSeats / seatLayout.totalSeats) * 100);
  };

  const handleOccupancyAlert = () => {
    const percentage = getOccupancyPercentage();
    if (percentage >= 90) {
      notify.warning("Room is almost full! Only a few seats remaining.");
    } else if (percentage >= 70) {
      notify.info(`Room is ${percentage}% occupied.`);
    } else {
      notify.success(
        `Room has plenty of available seats (${percentage}% occupied).`
      );
    }
  };

  if (!selectedRoomData || !seatLayout) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          {loading ? "Loading seat data..." : "No room selected or room data not available"}
        </p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Seating Chart Management
        </h3>
        <p className="text-xs sm:text-sm text-gray-600">
          View room seating arrangements and occupancy status
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          onClick={handleOccupancyAlert}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
        >
          Check Occupancy
        </button>
        <button
          onClick={fetchSeatData}
          disabled={loading}
          className="px-3 py-2 sm:px-4 sm:py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="lg:col-span-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Selected Room
          </label>
          <select
            value={selectedRoom}
            disabled
            className="w-full px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-gray-100 text-xs sm:text-sm cursor-not-allowed"
          >
            {rooms.map((room) => (
              <option key={room._id} value={room._id}>
                {room.roomName} ({room.capacity} seats)
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Viewing seat chart for this specific room
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Total Seats</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {seatLayout.totalSeats}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Available</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {seatLayout.availableSeats}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Occupied</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {seatLayout.occupiedSeats}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-6">
        <div className="mb-4 sm:mb-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">
            {selectedRoomData.roomName} - Seating Layout
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            View current seating arrangement and occupancy status (Read-only access)
          </p>
        </div>

        <div className="bg-gray-800 text-white text-center py-2 sm:py-3 rounded mb-6 sm:mb-8 relative">
          <Monitor className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1" />
          <span className="text-xs sm:text-sm font-medium">SCREEN</span>
        </div>

        <div className="space-y-2 sm:space-y-3 flex flex-col items-center max-w-full overflow-x-auto">
          {seatLayout.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center space-x-1 sm:space-x-2 min-w-max">
              {row.map((seat) => (
                <div
                  key={seat.id}
                  className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded text-xs flex items-center justify-center font-medium ${getSeatColor(
                    seat
                  )}`}
                  title={`Seat ${seat.id} - ${seat.type} - ${seat.price} - ${
                    seat.occupied ? "Occupied" : "Available"
                  }`}
                >
                  {seat.id.slice(1)}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">Legend</h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">Available</span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Occupied</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">
          Occupancy Overview
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall Occupancy</span>
            <span className="text-sm font-medium text-gray-900">
              {getOccupancyPercentage()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                getOccupancyPercentage() > 90
                  ? "bg-red-500"
                  : getOccupancyPercentage() > 70
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${getOccupancyPercentage()}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-600">Available</p>
              <p className="font-semibold text-green-600">
                {seatLayout.availableSeats}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Occupied</p>
              <p className="font-semibold text-red-600">
                {seatLayout.occupiedSeats}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Total</p>
              <p className="font-semibold text-gray-900">
                {seatLayout.totalSeats}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 border border-gray-200 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Action
            </h3>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction.onConfirm();
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
                  confirmAction.type === "check"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatingChartManagement;
