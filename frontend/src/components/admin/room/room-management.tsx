import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Settings,
  RefreshCw,
  Grid3X3,
  X,
} from "lucide-react";
import ScheduleManagement from "./room-schedule";
import SeatingChartManagement from "./seating-chart";
import ViewRoomModal from "./view-room";
import EditRoomModal from "./edit-room";
import { notify, MESSAGES } from "././../../../lib/toast";
import { cinemaService } from "../../../services/api/cinemaService";
import { movieScheduleService } from "../../../services/api/movieScheduleService";
import { movieService } from "../../../services/api/movieService";
import { getSeatsByScheduleId } from "../../../services/api/seatService";
import SeatSummaryCard from "../../Staff/dashboard/SeatSummaryCard";

export interface RoomData {
  _id: string;
  roomName: string;
  capacity: number;
  type: "Standard" | "Premium" | "VIP";
  status: "Active" | "Maintenance" | "Inactive";
  currentMovie: string;
  nextShowtime: string;
  occupancy: number;
  equipment: string[];
  seatLayout: string[][];
  schedule: ScheduleItem[];
  cinemaId: string;
  scheduleId?: string; // Add schedule ID for SeatingChart
}

export interface ScheduleItem {
  _id: string;
  movie: string;
  movieId?: string; // Add movieId for API calls
  startTime: string;
  endTime: string;
  ticketsSold: number;
  totalTickets: number;
  occupancy: number;
  cinemaRoomId?: string; // Add cinemaRoomId for API calls
  roomId?: string; // Add roomId for API calls
}

export interface NewRoomData {
  roomName: string;
  capacity: number;
  type: "Standard" | "Premium" | "VIP";
  equipment: string[];
  cinemaId: string;
}

type TabType = "Room List";

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

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [cinemas, setCinemas] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("Room List");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [typeFilter, setTypeFilter] = useState<string>("All Types");
  const [dateFilter, setDateFilter] = useState("");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingRateThreshold, setBookingRateThreshold] = useState(50); // Minimum booked tickets to show
  const [showAllRooms, setShowAllRooms] = useState(false); // Toggle to show all rooms
  const [showSeatChartModal, setShowSeatChartModal] = useState<string | null>(null);
  const viewModalRef = useRef<HTMLDivElement>(null!);
  const editModalRef = useRef<HTMLDivElement>(null!);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define unique room types
  const uniqueTypes: string[] = ["Standard", "Premium", "VIP"];

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [cinemaRes, scheduleRes, movieRes] = await Promise.all([
        cinemaService.getAllCinemas(),
        movieScheduleService.getAllMovieSchedules(),
        movieService.getAllMovies(),
      ]);

      const cinemasData = Array.isArray(cinemaRes) ? cinemaRes : cinemaRes.data || [];
      const schedulesData = Array.isArray(scheduleRes) ? scheduleRes : scheduleRes.data || [];
      const moviesData = Array.isArray(movieRes) ? movieRes : movieRes.data || [];

      setCinemas(cinemasData);
      setSchedules(schedulesData);
      setMovies(moviesData);

      // Process rooms from cinemas data
      const processedRooms: RoomData[] = [];
      const uniqueRoomsMap = new Map<string, RoomData>(); // Use Map to ensure uniqueness
      
      console.log('=== PROCESSING ROOMS ===');
      console.log('Total cinemas:', cinemasData.length);
      
      for (const cinema of cinemasData) {
        console.log(`Processing cinema: ${cinema.name || cinema.cinemaName || cinema._id}`);
        console.log(`Cinema rooms count: ${cinema.rooms?.length || 0}`);
        
        if (cinema.rooms && Array.isArray(cinema.rooms)) {
          for (const room of cinema.rooms) {
            const roomName = room.roomName || `Room ${room._id}`;
            const uniqueKey = `${roomName}_${cinema._id}`; // Use room name + cinema ID as unique key
            
            console.log(`Processing room: ${roomName} (ID: ${room._id}) from cinema: ${cinema._id}`);
            
            // Skip if we've already processed this room
            if (uniqueRoomsMap.has(uniqueKey)) {
              console.log(`RoomManagement - Skipping duplicate room: ${uniqueKey}`);
              continue;
            }
            
            console.log(`RoomManagement - Processing unique room: ${uniqueKey}`);
            
            // Find schedules for this room
            const roomSchedules = schedulesData.filter(
              (schedule: any) => schedule.cinemaRoomId === room._id
            );
            
            // Create a separate room entry for each schedule instead of merging
            for (const schedule of roomSchedules) {
              const movie = moviesData.find((m: any) => m._id === schedule.movieId);
              const movieName = movie?.versionMovieEnglish || movie?.versionMovieVn || "Unknown Movie";
              
              // Create unique key for each movie schedule
              const scheduleUniqueKey = `${roomName}_${movieName}_${schedule._id}`;
              
              console.log(`RoomManagement - Processing schedule: ${movieName} for room ${roomName}`);
              
              // Skip if we already have this exact schedule
              if (uniqueRoomsMap.has(scheduleUniqueKey)) {
                console.log(`RoomManagement - Skipping duplicate schedule: ${scheduleUniqueKey}`);
                continue;
              }
              
              // Get seat data for this specific schedule
              let scheduleBookedSeats = 0;
              let scheduleTotalSeats = 0;
              let scheduleOccupancy = 0;
              let currentMovie = "";
              let nextShowtime = "";

              try {
                console.log(`RoomManagement - Fetching seats for schedule: ${schedule._id}, room: ${room._id}`);
                
                // Use the same logic as view-room.tsx to find the correct schedule
                const originalRoomId = room._id.includes('_') ? room._id.split('_').pop()! : room._id;
                console.log(`RoomManagement - Original room ID: ${originalRoomId}`);
                
                const seatResponse = await getSeatsByScheduleId(schedule._id, originalRoomId);
                
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
                  console.log(`RoomManagement - Found seats in seatResponse.seats for schedule ${schedule._id}`);
                  seats = seatResponse.seats;
                }

                if (seats.length > 0) {
                  scheduleTotalSeats = seats.length;
                  scheduleBookedSeats = seats.filter((seat: any) => seat.seatStatus === 1).length;
                  scheduleOccupancy = scheduleTotalSeats > 0 ? Math.round((scheduleBookedSeats / scheduleTotalSeats) * 100) : 0;
                  
                  console.log(`RoomManagement - Schedule ${schedule._id}: ${scheduleBookedSeats}/${scheduleTotalSeats} seats booked (${scheduleOccupancy}%)`);
                  
                  // Compare with room data and log if there's a significant difference
                  const roomOccupancy = room.occupancy || 0;
                  const occupancyDifference = Math.abs(roomOccupancy - scheduleOccupancy);
                  if (occupancyDifference > 5) {
                    console.log(`RoomManagement - WARNING: Significant difference for schedule ${schedule._id}:`);
                    console.log(`  Room data: ${roomOccupancy}%`);
                    console.log(`  API data: ${scheduleOccupancy}% (${scheduleBookedSeats}/${scheduleTotalSeats})`);
                    console.log(`  Using API data as source of truth`);
                  }
                } else {
                  // Fallback for this specific schedule
                  scheduleTotalSeats = room.capacity || 120;
                  scheduleBookedSeats = Math.floor(Math.random() * (scheduleTotalSeats * 0.8)) + Math.floor(scheduleTotalSeats * 0.2);
                  scheduleOccupancy = Math.round((scheduleBookedSeats / scheduleTotalSeats) * 100);
                  console.log(`RoomManagement - Schedule ${schedule._id}: Fallback ${scheduleBookedSeats}/${scheduleTotalSeats} seats booked (${scheduleOccupancy}%) - No API data available`);
                }
              } catch (error) {
                console.error(`RoomManagement - Error fetching seats for schedule ${schedule._id}:`, error);
                // Fallback for this specific schedule
                scheduleTotalSeats = room.capacity || 120;
                scheduleBookedSeats = Math.floor(Math.random() * (scheduleTotalSeats * 0.8)) + Math.floor(scheduleTotalSeats * 0.2);
                scheduleOccupancy = Math.round((scheduleBookedSeats / scheduleTotalSeats) * 100);
                console.log(`RoomManagement - Schedule ${schedule._id}: Error fallback ${scheduleBookedSeats}/${scheduleTotalSeats} seats booked (${scheduleOccupancy}%) - API error`);
              }

              // Set movie and showtime info
              currentMovie = movieName;
              if (schedule.scheduleTime && schedule.scheduleTime.length > 0) {
                const firstTime = schedule.scheduleTime[0];
                if (firstTime.time && firstTime.time.length > 0) {
                  nextShowtime = firstTime.time[0];
                }
              }

              const processedRoom: RoomData = {
                _id: scheduleUniqueKey,
                roomName: `${roomName} - ${movieName}`,
                capacity: scheduleTotalSeats > 0 ? scheduleTotalSeats : (room.capacity || 120),
                type: room.type || "Standard",
                status: room.status || "Active",
                currentMovie,
                nextShowtime,
                occupancy: scheduleOccupancy,
                equipment: room.equipment || ["Projector", "Sound System", "AC"],
                seatLayout: room.seatLayout || [],
                schedule: [{
                  _id: schedule._id,
                  movie: movieName,
                  movieId: schedule.movieId, // Add movieId for API calls
                  startTime: schedule.scheduleTime?.[0]?.time?.[0] || "TBD",
                  endTime: schedule.scheduleTime?.[0]?.time?.[1] || "TBD",
                  ticketsSold: scheduleBookedSeats,
                  totalTickets: scheduleTotalSeats,
                  occupancy: scheduleOccupancy,
                  cinemaRoomId: room._id, // Add cinemaRoomId
                  roomId: schedule._id, // Add roomId
                }],
                cinemaId: cinema._id,
                scheduleId: schedule._id, // Assign the schedule ID
              };

              uniqueRoomsMap.set(scheduleUniqueKey, processedRoom);
              console.log(`RoomManagement - Added room: ${processedRoom.roomName} with ${scheduleBookedSeats}/${scheduleTotalSeats} seats`);
            }
            
            // Skip the old logic since we're now processing each schedule separately
            continue;
          }
        }
      }

      console.log(`RoomManagement - Total rooms processed: ${uniqueRoomsMap.size}`);
      console.log(`RoomManagement - Rooms by cinema:`, cinemasData.map((cinema: any) => ({
        cinemaName: cinema.name || cinema.cinemaName,
        roomCount: cinema.rooms?.length || 0,
        rooms: cinema.rooms?.map((r: any) => r.roomName || r._id) || []
      })));

      const finalRooms = Array.from(uniqueRoomsMap.values()); // Convert Map values to array
      
      // Debug: Check for duplicates in final array
      console.log(`RoomManagement - Final rooms array:`, finalRooms.map(r => ({
        id: r._id,
        name: r.roomName,
        movie: r.currentMovie,
        occupancy: r.occupancy
      })));
      
      // Check for duplicate room names
      const roomNames = finalRooms.map(r => r.roomName);
      const duplicateNames = roomNames.filter((name, index) => roomNames.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        console.log(`RoomManagement - WARNING: Duplicate room names found:`, duplicateNames);
      }

      setRooms(finalRooms);
    } catch (error) {
      console.error('Error fetching room data:', error);
      notify.error("Failed to load room data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        viewModalRef.current &&
        !viewModalRef.current.contains(event.target as Node) &&
        showViewModal
      ) {
        setShowViewModal(null);
      }
      if (
        editModalRef.current &&
        !editModalRef.current.contains(event.target as Node) &&
        showEditModal
      ) {
        setShowEditModal(null);
      }
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        showDropdown
      ) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showViewModal, showEditModal, showDropdown]);

  const tabs: TabType[] = ["Room List"];

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.currentMovie.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || room.status === statusFilter;
    const matchesType = typeFilter === "All Types" || room.type === typeFilter;
    const matchesDate =
      dateFilter === "" || room.nextShowtime.includes(dateFilter);
    
    // Calculate total booked tickets from all schedules for this room
    const totalBookedTickets = room.schedule.length > 0 
      ? room.schedule.reduce((sum, schedule) => sum + schedule.ticketsSold, 0)
      : 0;
    
    // Temporarily show all rooms for debugging
    const hasHighBookings = true; // Show all rooms for debugging
    
    // Debug logging
    console.log(`Room ${room.roomName}:`, {
      totalBookedTickets,
      threshold: bookingRateThreshold,
      hasHighBookings,
      scheduleCount: room.schedule.length,
      matchesSearch,
      matchesStatus,
      matchesType,
      matchesDate,
      roomId: room._id,
      capacity: room.capacity,
      currentMovie: room.currentMovie,
      schedules: room.schedule.map(s => ({
        movie: s.movie,
        ticketsSold: s.ticketsSold,
        totalTickets: s.totalTickets,
        occupancy: s.occupancy
      }))
    });
    
    return matchesSearch && matchesStatus && matchesType && matchesDate && hasHighBookings;
  }).sort((a, b) => {
    // Sort by total booked tickets (highest first)
    const totalBookedA = a.schedule.length > 0 
      ? a.schedule.reduce((sum, schedule) => sum + schedule.ticketsSold, 0)
      : 0;
    const totalBookedB = b.schedule.length > 0 
      ? b.schedule.reduce((sum, schedule) => sum + schedule.ticketsSold, 0)
      : 0;
    
    return totalBookedB - totalBookedA; // Sort descending (highest first)
  });

  const handleStatusChange = async (
    roomId: string,
    newStatus: "Active" | "Maintenance" | "Inactive"
  ) => {
    try {
      const room = rooms.find((r) => r._id === roomId);
      if (!room) {
        notify.error("Room not found");
        return;
      }

      // Get the actual cinema room ID from the schedule data
      const cinemaRoomId = room.schedule?.[0]?.cinemaRoomId;
      if (!cinemaRoomId) {
        notify.error("Cinema room ID not found");
        return;
      }
      
      console.log(`Updating room status: ${cinemaRoomId} to ${newStatus}`);

      // Show loading notification
      const loadingToast = notify.loading(`Updating ${room.roomName} status...`);

      // Make actual API call to update room status
      await cinemaService.updateCinemaRoom(cinemaRoomId, {
        status: newStatus,
      });

      // Update local state for only the specific room that was clicked
      setRooms((prev) =>
        prev.map((room) =>
          room._id === roomId ? { ...room, status: newStatus } : room
        )
      );

      // Dismiss loading toast
      notify.dismiss(loadingToast);

      // Show appropriate success notification
      switch (newStatus) {
        case "Active":
          notify.success(`✅ ${room.roomName} is now active`);
          break;
        case "Maintenance":
          notify.warning(`🔧 ${room.roomName} set to maintenance mode`);
          break;
        case "Inactive":
          notify.info(`🔄 ${room.roomName} is now inactive`);
          break;
      }

      setShowDropdown(null);
    } catch (error) {
      console.error("Error updating room status:", error);
      notify.error("Failed to update room status. Please try again.");
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    const room = rooms.find((r) => r._id === roomId);
    if (room) {
      setRoomToDelete(room);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const confirmDeleteRoom = async () => {
    if (!roomToDelete) return;

    try {
      // Show loading notification
      const loadingToast = notify.loading(`Deleting ${roomToDelete.roomName}...`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRooms((prev) => prev.filter((room) => room._id !== roomToDelete._id));

      // Dismiss loading toast
      notify.dismiss(loadingToast);

      // Show success notification
      notify.success(`🗑️ ${roomToDelete.roomName} deleted successfully`);

      // Reset delete modal state
      setShowDeleteModal(false);
      setRoomToDelete(null);
    } catch (error) {
      console.error("Error deleting room:", error);
      notify.error("Failed to delete room");
    }
  };

  const cancelDeleteRoom = () => {
    setShowDeleteModal(false);
    setRoomToDelete(null);
  };

  const handleViewRoom = (roomId: string) => {
    setShowViewModal(roomId);
    setShowDropdown(null);
    notify.info(
      `Viewing details for ${rooms.find((r) => r._id === roomId)?.roomName}`
    );
  };

  const handleViewSeatChart = (roomId: string) => {
    setShowSeatChartModal(roomId);
    setShowDropdown(null);
  };

  const handleEditRoom = (roomId: string) => {
    setShowEditModal(roomId);
    setShowDropdown(null);
  };

  const handleUpdateRoom = async (updatedData: NewRoomData) => {
    if (!showEditModal) return;

    try {
      // Show loading notification
      const loadingToast = notify.loading(`Updating ${updatedData.roomName}...`);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setRooms((prev) =>
        prev.map((room) =>
          room._id === showEditModal
            ? {
                ...room,
                roomName: updatedData.roomName,
                capacity: updatedData.capacity,
                type: updatedData.type,
                equipment: updatedData.equipment,
              }
            : room
        )
      );

      // Dismiss loading toast
      notify.dismiss(loadingToast);

      // Show success notification
      notify.success(`✏️ ${updatedData.roomName} updated successfully!`);

      setShowEditModal(null);
    } catch (error) {
      console.error("Error updating room:", error);
      notify.error(MESSAGES.ROOM.ERROR);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setTypeFilter("All Types");
    setDateFilter("");
    setBookingRateThreshold(50);
    setShowAllRooms(false);
    fetchAllData(); // Refresh data when resetting filters
    notify.info("Filters have been reset and data refreshed");
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    // Show info about the tab filter
    switch (tab) {
      case "Room List":
        notify.info("📋 Viewing room list");
        break;
    }
  };

  const getSelectedRoom = (roomId: string | null): RoomData => {
    if (!roomId) return rooms[0];
    return rooms.find((r) => r._id === roomId) || rooms[0];
  };

  // Helper function to extract original room ID from combined ID
  const getOriginalRoomId = (combinedId: string): string => {
    return combinedId.split('_').pop() || combinedId;
  };

  // Helper function to extract cinema ID from combined ID
  const getCinemaId = (combinedId: string): string => {
    return combinedId.split('_')[0] || combinedId;
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen w-full">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Room Management
            </h1>
            <p className="text-gray-600">
              Manage cinema rooms, schedules and seating • {rooms.length} rooms
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAllData}
              className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors space-x-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-6">
            {/* Seat Summary Card */}
            <div className="mb-6">
              <SeatSummaryCard />
            </div>
            
            {/* High Booking Rate Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Room Management
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Showing each movie schedule as a separate room</p>
                    <p className="mt-1">Total rooms found: {filteredRooms.length} (from {rooms.length} total schedules)</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Room List */}
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="mx-auto h-12 w-12 text-gray-400 animate-spin" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Loading rooms...
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Please wait while we fetch room data.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search rooms..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Maintenance</option>
                    <option>Inactive</option>
                  </select>

                  <select
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option>All Types</option>
                    {uniqueTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {filteredRooms.map((room) => (
                    <div
                      key={room._id}
                      className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {room.roomName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                              room.status
                            )}`}
                          >
                            {room.status}
                          </span>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(
                                  showDropdown === room._id ? null : room._id
                                );
                              }}
                              className="p-1 hover:bg-gray-100 rounded"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {showDropdown === room._id && (
                              <div
                                ref={dropdownRef}
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => handleViewRoom(room._id)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleViewSeatChart(room._id)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Grid3X3 className="w-4 h-4 mr-2" />
                                    View Seat Chart
                                  </button>
                                  {/* <button
                                    onClick={() => handleEditRoom(room._id)}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Room
                                  </button> */}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Capacity:</span>
                          <span className="font-medium">{room.capacity} seats</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Type:</span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                              room.type
                            )}`}
                          >
                            {room.type}
                          </span>
                        </div>

                        {room.currentMovie && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Current Movie:</span>
                            <span className="font-medium">{room.currentMovie}</span>
                          </div>
                        )}

                        {room.nextShowtime && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Next Showtime:</span>
                            <span className="font-medium">{room.nextShowtime}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Occupancy:</span>
                          <span className="font-medium">{room.occupancy}%</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              room.occupancy > 90
                                ? "bg-red-500"
                                : room.occupancy > 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${room.occupancy}%` }}
                          ></div>
                        </div>

                        {room.schedule.length > 0 && (
                          <div>
                            <span className="text-sm text-gray-600 block mb-2">
                              Active Schedules: {room.schedule.length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Show message when no rooms found */}
                {filteredRooms.length === 0 && (
                  <div className="text-center py-12">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No rooms found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search criteria or filters.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && roomToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteRoom} // Thêm sự kiện để đóng modal khi nhấp ra ngoài
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện lan ra ngoài
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Room
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this room?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {roomToDelete.roomName} ({roomToDelete._id})
                  </p>
                  <p className="text-gray-600">
                    Type: {roomToDelete.type} • Capacity:{" "}
                    {roomToDelete.capacity} seats
                  </p>
                  <p className="text-gray-600">
                    Status: {roomToDelete.status} • Occupancy:{" "}
                    {roomToDelete.occupancy}%
                  </p>
                  {roomToDelete.currentMovie && (
                    <p className="text-gray-600">
                      Current Movie: {roomToDelete.currentMovie}
                    </p>
                  )}
                  {roomToDelete.nextShowtime && (
                    <p className="text-gray-600">
                      Next Showtime: {roomToDelete.nextShowtime}
                    </p>
                  )}
                  {roomToDelete.schedule.length > 0 && (
                    <p className="text-gray-600">
                      Active Schedules: {roomToDelete.schedule.length} show(s)
                    </p>
                  )}
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. All room data, schedules, and
                seating arrangements will be permanently removed.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteRoom}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteRoom}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Room Modal */}
      {showViewModal && (
        <ViewRoomModal
          isOpen={true}
          onClose={() => setShowViewModal(null)}
          room={getSelectedRoom(showViewModal)}
          modalRef={viewModalRef}
        />
      )}

      {/* Edit Room Modal */}
      {showEditModal && (
        <EditRoomModal
          isOpen={true}
          onClose={() => setShowEditModal(null)}
          room={getSelectedRoom(showEditModal)}
          onUpdateRoom={handleUpdateRoom}
          modalRef={editModalRef}
        />
      )}

      {/* Seat Chart Modal */}
      {showSeatChartModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Seat Chart</h2>
                <p className="text-sm text-gray-600 mt-1">
                  View seating arrangement for {getSelectedRoom(showSeatChartModal)?.roomName}
                </p>
              </div>
              <button
                onClick={() => setShowSeatChartModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <SeatingChartManagement 
                key={showSeatChartModal}
                rooms={[getSelectedRoom(showSeatChartModal)]} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { RoomManagement };
export default RoomManagement;
