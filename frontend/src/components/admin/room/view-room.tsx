"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import type { RoomData } from "./room-management";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import { movieScheduleService } from "../../../services/api/movieScheduleService";

interface ViewRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomData;
  modalRef?: React.RefObject<HTMLDivElement>; // Chỉnh sửa ở đây
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Maintenance":
      return "bg-red-100 text-red-800";
    case "Inactive":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "Standard":
      return "bg-blue-100 text-blue-800";
    case "Premium":
      return "bg-purple-100 text-purple-800";
    case "VIP":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ViewRoomModal: React.FC<ViewRoomModalProps> = ({
  isOpen,
  onClose,
  room,
  modalRef,
}) => {
  const [seatData, setSeatData] = useState<{
    totalSeats: number;
    bookedSeats: number;
    availableSeats: number;
    bookingPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeatData = async () => {
    if (!room._id) return;
    
    // Extract original room ID from combined ID (cinemaId_roomId format)
    const originalRoomId = room._id.includes('_') ? room._id.split('_').pop()! : room._id;
    
    // Debug: Log all room data for comparison with SeatingChart
    console.log(`ViewDetail - Full room data:`, {
      _id: room._id,
      roomName: room.roomName,
      capacity: room.capacity,
      occupancy: room.occupancy,
      currentMovie: room.currentMovie,
      scheduleId: room.scheduleId,
      schedule: room.schedule,
      cinemaId: room.cinemaId
    });
    
    try {
      setLoading(true);
      setError(null);

      // Get schedules for this room
      const scheduleRes = await movieScheduleService.getAllMovieSchedules();
      const schedules = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || [];
      
      // Find schedules for this specific room using original room ID
      const roomSchedules = schedules.filter((schedule: any) => schedule.cinemaRoomId === originalRoomId);
      
      console.log(`ViewRoom - Looking for schedules with cinemaRoomId: ${originalRoomId}`);
      console.log(`ViewRoom - Total schedules available: ${schedules.length}`);
      console.log(`ViewRoom - Found schedules for room: ${roomSchedules.length}`);
      console.log(`ViewRoom - Available cinemaRoomIds:`, [...new Set(schedules.map((s: any) => s.cinemaRoomId))]);
      
      // Debug: Log all schedules to understand the data structure
      console.log(`ViewRoom - All schedules data:`, schedules.slice(0, 3)); // Show first 3 schedules
      console.log(`ViewRoom - Room data:`, {
        roomId: room._id,
        originalRoomId,
        roomName: room.roomName,
        capacity: room.capacity,
        currentMovie: room.currentMovie
      });
      
      // Debug: Check if any schedule has matching room ID in different formats
      const allRoomIds = schedules.map((s: any) => ({
        scheduleId: s._id,
        cinemaRoomId: s.cinemaRoomId,
        roomId: s.roomId,
        movieId: s.movieId,
        cinemaId: s.cinemaId
      }));
      console.log(`ViewRoom - All schedule room IDs:`, allRoomIds.slice(0, 5)); // Show first 5
      
      if (roomSchedules.length === 0) {
        // Try alternative room ID formats
        const alternativeRoomId = room._id.includes('_') ? room._id.split('_')[1] : room._id;
        const alternativeSchedules = schedules.filter((schedule: any) => 
          schedule.cinemaRoomId === alternativeRoomId || 
          schedule.cinemaRoomId === room._id ||
          schedule.roomId === originalRoomId ||
          schedule.roomId === alternativeRoomId
        );
        
        console.log(`ViewRoom - Trying alternative room ID: ${alternativeRoomId}`);
        console.log(`ViewRoom - Alternative schedules found: ${alternativeSchedules.length}`);
        
        if (alternativeSchedules.length > 0) {
          // Use alternative schedules
          const latestSchedule = alternativeSchedules[0];
          console.log(`ViewRoom - Using alternative schedule: ${latestSchedule._id}`);
          
          console.log(`ViewRoom - Fetching seats for schedule: ${latestSchedule._id}, room: ${originalRoomId}`);
          const seatResponse = await getSeatsByScheduleId(latestSchedule._id, originalRoomId);
          console.log(`ViewRoom - Seat response:`, seatResponse);
          
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
            console.log(`ViewRoom - Found seats in seatResponse.seats`);
            seats = seatResponse.seats;
          }

          console.log(`ViewRoom - Processed seats:`, seats.length);

          if (seats.length > 0) {
            const totalSeats = seats.length;
            const bookedSeats = seats.filter((seat: any) => seat.seatStatus === 1).length;
            const availableSeats = totalSeats - bookedSeats;
            const bookingPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

            setSeatData({
              totalSeats,
              bookedSeats,
              availableSeats,
              bookingPercentage
            });

            console.log(`ViewRoom - Seat data: ${bookedSeats}/${totalSeats} booked (${bookingPercentage.toFixed(1)}%)`);
            return;
          } else {
            console.log(`ViewRoom - No seats found in alternative schedule, trying fallback`);
          }
        }
        
        // If we still can't find schedules, try to use room data directly
        console.log(`ViewRoom - No schedules found, using room data as fallback`);
        const totalSeats = room.capacity || 120;
        const bookedSeats = Math.floor(totalSeats * (room.occupancy / 100));
        const availableSeats = totalSeats - bookedSeats;
        const bookingPercentage = room.occupancy;

        setSeatData({
          totalSeats,
          bookedSeats,
          availableSeats,
          bookingPercentage
        });

        console.log(`ViewRoom - Fallback seat data: ${bookedSeats}/${totalSeats} booked (${bookingPercentage.toFixed(1)}%)`);
        return; // Don't show error, use fallback data instead
      }

      // Get the most recent schedule
      const latestSchedule = roomSchedules[0];
      
      console.log(`ViewRoom - Fetching seats for schedule: ${latestSchedule._id}, room: ${originalRoomId}`);
      const seatResponse = await getSeatsByScheduleId(latestSchedule._id, originalRoomId);
      console.log(`ViewRoom - Seat response:`, seatResponse);
      
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
        console.log(`ViewRoom - Found seats in seatResponse.seats`);
        seats = seatResponse.seats;
      }

      console.log(`ViewRoom - Processed seats:`, seats.length);

      if (seats.length > 0) {
        const totalSeats = seats.length;
        const bookedSeats = seats.filter((seat: any) => seat.seatStatus === 1).length;
        const availableSeats = totalSeats - bookedSeats;
        const bookingPercentage = totalSeats > 0 ? (bookedSeats / totalSeats) * 100 : 0;

        setSeatData({
          totalSeats,
          bookedSeats,
          availableSeats,
          bookingPercentage
        });

        console.log(`ViewRoom - Seat data: ${bookedSeats}/${totalSeats} booked (${bookingPercentage.toFixed(1)}%)`);
      } else {
        // Fallback: Use room data if no seat data available
        console.log(`ViewRoom - No seat data available, using room data as fallback`);
        const totalSeats = room.capacity || 120;
        const bookedSeats = Math.floor(totalSeats * (room.occupancy / 100));
        const availableSeats = totalSeats - bookedSeats;
        const bookingPercentage = room.occupancy;

        setSeatData({
          totalSeats,
          bookedSeats,
          availableSeats,
          bookingPercentage
        });

        console.log(`ViewRoom - Fallback seat data: ${bookedSeats}/${totalSeats} booked (${bookingPercentage.toFixed(1)}%)`);
      }
    } catch (err) {
      console.error('ViewRoom - Error fetching seat data:', err);
      setError('Failed to load seat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && room._id) {
      fetchSeatData();
    }
  }, [isOpen, room._id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-500">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Room Details</h2>
            <p className="text-sm text-gray-600 mt-1">View room information</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name
                </label>
                <p className="text-gray-900 font-medium">{room.roomName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cinema
                </label>
                <p className="text-gray-900 font-medium">Cinema Luriere Satra District 6 (HCMC)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">
                    {loading ? (
                      <span className="flex items-center">
                        <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </span>
                    ) : seatData ? (
                      `${seatData.bookedSeats}/${seatData.totalSeats} seats`
                    ) : (
                      `${room.capacity} seats`
                    )}
                  </p>
                  <button
                    onClick={fetchSeatData}
                    disabled={loading}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    title="Refresh seat data"
                  >
                    <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {seatData && (
                  <p className="text-sm text-gray-600 mt-1">
                    {seatData.availableSeats} available, {seatData.bookingPercentage.toFixed(1)}% booked
                  </p>
                )}
                {error && (
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                    room.type
                  )}`}
                >
                  {room.type}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                    room.status
                  )}`}
                >
                  {room.status}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Movie
                </label>
                <p className="text-gray-900">
                  {room.currentMovie || "No movie scheduled"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format
                </label>
                <p className="text-gray-900">
                  2D
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Showtime
                </label>
                <p className="text-gray-900">
                  {room.nextShowtime || "No showtime scheduled"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occupancy
                </label>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (seatData?.bookingPercentage || room.occupancy) > 90
                          ? "bg-red-500"
                          : (seatData?.bookingPercentage || room.occupancy) > 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${seatData?.bookingPercentage || room.occupancy}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {seatData ? `${seatData.bookingPercentage.toFixed(1)}%` : `${room.occupancy}%`}
                  </span>
                </div>
                {seatData && (
                  <p className="text-sm text-gray-600 mt-1">
                    {seatData.bookedSeats} booked out of {seatData.totalSeats} total seats
                  </p>
                )}
              </div>
            </div>
          </div>

          {room.schedule.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Today's Schedule
              </label>
              <div className="space-y-2">
                {room.schedule.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.movie}</p>
                      <p className="text-sm text-gray-600">
                        {item.startTime} - {item.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {item.ticketsSold}/{item.totalTickets}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.occupancy}% sold
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRoomModal;
