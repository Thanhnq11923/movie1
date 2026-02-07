"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  Clock,
  Users,
  Film,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  X,
  Settings,
  Play,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";
import type { RoomData, ScheduleItem } from "./room-management";
import { notify } from "././../../../lib/toast"; // Import notification system

interface ScheduleManagementProps {
  rooms: RoomData[];
}

interface NewScheduleData {
  roomId: string;
  movie: string;
  startTime: string;
  endTime: string;
  date: string;
  ticketPrice: number;
}

interface ExtendedScheduleItem extends ScheduleItem {
  roomName: string;
  status: "Scheduled" | "Active" | "Cancelled" | "Completed";
}

const todaySchedule: ExtendedScheduleItem[] = [
  {
    _id: "SCH001",
    movie: "Avatar 3",
    startTime: "17:00",
    endTime: "20:00",
    ticketsSold: 102,
    totalTickets: 120,
    occupancy: 85,
    roomName: "Room 1",
    status: "Completed",
  },
  {
    _id: "SCH002",
    movie: "Avatar 3",
    startTime: "20:30",
    endTime: "23:30",
    ticketsSold: 95,
    totalTickets: 120,
    occupancy: 79,
    roomName: "Room 1",
    status: "Active",
  },
  {
    _id: "SCH003",
    movie: "Fast & Furious 11",
    startTime: "18:00",
    endTime: "20:30",
    ticketsSold: 138,
    totalTickets: 150,
    occupancy: 92,
    roomName: "Room 2",
    status: "Completed",
  },
];

const availableMovies = [
  "Avatar 3",
  "Fast & Furious 11",
  "Spider-Man: New Era",
  "The Batman Returns",
  "Jurassic World: Dominion",
  "Top Gun: Maverick",
  "Doctor Strange 3",
  "Black Panther 3",
];

// Utility function for status badge colors
const getStatusBadgeColor = (status: ExtendedScheduleItem["status"]) => {
  switch (status) {
    case "Scheduled":
      return "bg-blue-100 text-blue-800";
    case "Active":
      return "bg-green-100 text-green-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Completed":
      return "bg-purple-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ScheduleManagement: React.FC<ScheduleManagementProps> = ({ rooms }) => {
  const [schedules, setSchedules] =
    useState<ExtendedScheduleItem[]>(todaySchedule);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [movieFilter, setMovieFilter] = useState("All Movies");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedRoom, setSelectedRoom] = useState<string>("All Rooms");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] =
    useState<ExtendedScheduleItem | null>(null);

  const [newSchedule, setNewSchedule] = useState<NewScheduleData>({
    roomId: "",
    movie: "",
    startTime: "",
    endTime: "",
    date: new Date().toISOString().split("T")[0],
    ticketPrice: 0,
  });

  const addModalRef = useRef<HTMLDivElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addModalRef.current &&
        !addModalRef.current.contains(event.target as Node) &&
        showAddModal
      ) {
        setShowAddModal(false);
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
  }, [showAddModal, showEditModal, showDropdown]);

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.movie.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schedule.roomName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoom =
      selectedRoom === "All Rooms" || schedule.roomName === selectedRoom;
    const matchesStatus =
      statusFilter === "All Status" || schedule.status === statusFilter;
    const matchesMovie =
      movieFilter === "All Movies" || schedule.movie === movieFilter;
    return matchesSearch && matchesRoom && matchesStatus && matchesMovie;
  });

  // Calculate statistics
  const stats = {
    totalShows: filteredSchedules.length,
    ticketsSold: filteredSchedules.reduce((sum, s) => sum + s.ticketsSold, 0),
    avgOccupancy: Math.round(
      filteredSchedules.reduce((sum, s) => sum + s.occupancy, 0) /
        filteredSchedules.length || 0
    ),
    activeRooms: rooms.filter((r) => r.status === "Active").length,
  };

  const validateSchedule = (schedule: NewScheduleData): boolean => {
    if (!schedule.roomId) {
      notify.warning("Please select a room");
      return false;
    }
    if (!schedule.movie) {
      notify.warning("Please select a movie");
      return false;
    }
    if (!schedule.startTime) {
      notify.warning("Please enter start time");
      return false;
    }
    if (!schedule.endTime) {
      notify.warning("Please enter end time");
      return false;
    }
    if (schedule.startTime >= schedule.endTime) {
      notify.warning("End time must be after start time");
      return false;
    }
    return true;
  };

  const handleAddSchedule = async () => {
    try {
      if (!validateSchedule(newSchedule)) {
        return;
      }

      const room = rooms.find((r) => r._id === newSchedule.roomId);
      if (!room) return;

      // Show loading notification
      const loadingToast = notify.loading(
        `Creating schedule for ${newSchedule.movie}...`
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newScheduleItem: ExtendedScheduleItem = {
        _id: `SCH${String(
          Math.max(...schedules.map((s) => Number.parseInt(s._id.slice(3)))) + 1
        ).padStart(3, "0")}`,
        movie: newSchedule.movie,
        startTime: newSchedule.startTime,
        endTime: newSchedule.endTime,
        ticketsSold: 0,
        totalTickets: room.capacity,
        occupancy: 0,
        roomName: room.roomName,
        status: "Scheduled",
      };

      setSchedules((prev) => [...prev, newScheduleItem]);

      // Dismiss loading toast
      notify.dismiss(loadingToast);

      // Show success notification
      notify.success(
        `🎬 Schedule created: ${newSchedule.movie} at ${newSchedule.startTime}`
      );

      // Reset form
      setNewSchedule({
        roomId: "",
        movie: "",
        startTime: "",
        endTime: "",
        date: new Date().toISOString().split("T")[0],
        ticketPrice: 0,
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding schedule:", error);
      notify.error("Failed to create schedule");
    }
  };

  const handleUpdateSchedule = async (
    updatedData: Partial<ExtendedScheduleItem>
  ) => {
    if (!showEditModal) return;

    try {
      const schedule = schedules.find((s) => s._id === showEditModal);

      // Show loading notification
      const loadingToast = notify.loading(
        `Updating ${schedule?.movie} schedule...`
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule._id === showEditModal
            ? { ...schedule, ...updatedData }
            : schedule
        )
      );

      // Dismiss loading toast
      notify.dismiss(loadingToast);

      // Show success notification
      notify.success(`✏️ Schedule updated successfully`);

      setShowEditModal(null);
    } catch (error) {
      console.error("Error updating schedule:", error);
      notify.error("Failed to update schedule");
    }
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const schedule = schedules.find((s) => s._id === scheduleId);
    if (schedule) {
      setScheduleToDelete(schedule);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      // Show loading notification
      const loadingToast = notify.loading(
        `Deleting ${scheduleToDelete.movie} schedule...`
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSchedules((prev) => prev.filter((s) => s._id !== scheduleToDelete._id));

      // Dismiss loading toast
      notify.dismiss(loadingToast);

      // Show success notification
      notify.success(`🗑️ Schedule deleted successfully`);

      // Reset delete modal state
      setShowDeleteModal(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      notify.error("Failed to delete schedule");
    }
  };

  const cancelDeleteSchedule = () => {
    setShowDeleteModal(false);
    setScheduleToDelete(null);
  };

  const handleStatusChange = async (
    scheduleId: string,
    newStatus: ExtendedScheduleItem["status"]
  ) => {
    try {
      const schedule = schedules.find((s) => s._id === scheduleId);

      // Show loading notification
      const loadingToast = notify.loading(
        `Updating ${schedule?.movie} status...`
      );

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule._id === scheduleId
            ? { ...schedule, status: newStatus }
            : schedule
        )
      );

      // Dismiss loading toast
      notify.dismiss(loadingToast);

      // Show appropriate success notification
      switch (newStatus) {
        case "Active":
          notify.success(`▶️ ${schedule?.movie} show started`);
          break;
        case "Completed":
          notify.success(`✅ ${schedule?.movie} show completed`);
          break;
        case "Cancelled":
          notify.warning(`❌ ${schedule?.movie} show cancelled`);
          break;
        case "Scheduled":
          notify.success(`📅 ${schedule?.movie} rescheduled`);
          break;
      }

      setShowDropdown(null);
    } catch (error) {
      console.error("Error updating schedule status:", error);
      notify.error("Failed to update schedule status");
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setMovieFilter("All Movies");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setSelectedRoom("All Rooms");
  };

  const getSelectedSchedule = (
    scheduleId: string | null
  ): ExtendedScheduleItem => {
    if (!scheduleId) return schedules[0];
    return schedules.find((s) => s._id === scheduleId) || schedules[0];
  };

  const getOccupancyColor = (occupancy: number) => {
    if (occupancy > 90) return "bg-red-500";
    if (occupancy > 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Schedule Management
          </h3>
          <p className="text-sm text-gray-600">
            Manage movie schedules and showtimes
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Schedule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search schedules..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Scheduled</option>
          <option>Active</option>
          <option>Completed</option>
          <option>Cancelled</option>
        </select>

        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          value={movieFilter}
          onChange={(e) => setMovieFilter(e.target.value)}
        >
          <option>All Movies</option>
          {availableMovies.map((movie) => (
            <option key={movie} value={movie}>
              {movie}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <button
          onClick={resetFilters}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Shows</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalShows}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Tickets Sold</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.ticketsSold}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">Avg Occupancy</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avgOccupancy}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Active Rooms</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeRooms}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-900">
            Today's Schedule
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchedules.map((schedule) => (
                <tr key={schedule._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.roomName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.movie}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.startTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.ticketsSold}/{schedule.totalTickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className={`h-2 rounded-full ${getOccupancyColor(
                            schedule.occupancy
                          )}`}
                          style={{ width: `${schedule.occupancy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {schedule.occupancy}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                        schedule.status
                      )}`}
                    >
                      {schedule.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(
                            showDropdown === schedule._id ? null : schedule._id
                          );
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                      {showDropdown === schedule._id && (
                        <div
                          ref={dropdownRef}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                        >
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowEditModal(schedule._id);
                                setShowDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Schedule
                            </button>

                            {/* Status Change Options */}
                            {schedule.status === "Scheduled" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(schedule._id, "Active")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Show
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(schedule._id, "Cancelled")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Show
                                </button>
                              </>
                            )}

                            {schedule.status === "Active" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleStatusChange(schedule._id, "Completed")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 w-full text-left"
                                >
                                  <Settings className="w-4 h-4 mr-2" />
                                  Mark Completed
                                </button>
                                <button
                                  onClick={() =>
                                    handleStatusChange(schedule._id, "Cancelled")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Show
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteSchedule(schedule._id)}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Schedule
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Show message when no schedules found */}
        {filteredSchedules.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No schedules found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={addModalRef}
            className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Schedule
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <select
                  value={newSchedule.roomId}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      roomId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Room</option>
                  {rooms
                    .filter((r) => r.status === "Active")
                    .map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.roomName} ({room.capacity} seats)
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Movie
                </label>
                <select
                  value={newSchedule.movie}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      movie: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Movie</option>
                  {availableMovies.map((movie) => (
                    <option key={movie} value={movie}>
                      {movie}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newSchedule.endTime}
                    onChange={(e) =>
                      setNewSchedule((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={newSchedule.date}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchedule}
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800"
              >
                Add Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && scheduleToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteSchedule} // Thêm sự kiện để đóng modal khi nhấp ra ngoài
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
                  Delete Schedule
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete the schedule for:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {scheduleToDelete?.movie}
                  </p>
                  <p className="text-gray-600">
                    {scheduleToDelete?.roomName} • {scheduleToDelete?.startTime} -{" "}
                    {scheduleToDelete?.endTime}
                  </p>
                  <p className="text-gray-600">
                    {scheduleToDelete?.ticketsSold} tickets sold
                  </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. All room data, schedules, and
                seating arrangements will be permanently removed.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteSchedule}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSchedule}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditModal && (
        <EditScheduleModal
          isOpen={true}
          onClose={() => setShowEditModal(null)}
          schedule={getSelectedSchedule(showEditModal)}
          rooms={rooms}
          onUpdateSchedule={handleUpdateSchedule}
          modalRef={editModalRef}
        />
      )}
    </div>
  );
};

// Edit Schedule Modal Component
interface EditScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ExtendedScheduleItem;
  rooms: RoomData[];
  onUpdateSchedule: (data: Partial<ExtendedScheduleItem>) => void;
  modalRef: React.RefObject<HTMLDivElement | null>;
}

const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
  rooms,
  onUpdateSchedule,
  modalRef,
}) => {
  const [formData, setFormData] = useState({
    movie: schedule.movie,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    roomName: schedule.roomName,
    status: schedule.status,
    ticketsSold: schedule.ticketsSold,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes whenever formData updates
  useEffect(() => {
    const hasChanges =
      formData.movie !== schedule.movie ||
      formData.startTime !== schedule.startTime ||
      formData.endTime !== schedule.endTime ||
      formData.roomName !== schedule.roomName ||
      formData.status !== schedule.status ||
      formData.ticketsSold !== schedule.ticketsSold;
    setHasChanges(hasChanges);
  }, [formData, schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.startTime >= formData.endTime) {
      notify.warning("End time must be after start time");
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate new occupancy
      const room = rooms.find((r) => r.roomName === formData.roomName);
      const totalTickets = room?.capacity || schedule.totalTickets;
      const occupancy = Math.round((formData.ticketsSold / totalTickets) * 100);

      await onUpdateSchedule({
        movie: formData.movie,
        startTime: formData.startTime,
        endTime: formData.endTime,
        roomName: formData.roomName,
        status: formData.status,
        ticketsSold: formData.ticketsSold,
        occupancy: occupancy,
        totalTickets: totalTickets,
      });

      // Modal will be closed by parent component
    } catch (error) {
      console.error("Error updating schedule:", error);
      notify.error("Failed to update schedule");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      notify.warning("Please wait for the current operation to complete");
      return;
    }

    // Check for unsaved changes
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) {
        return;
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Schedule</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update schedule for {schedule.movie}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Unsaved Changes Warning */}
        {hasChanges && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="text-yellow-700 text-sm">
              💾 You have unsaved changes. Make sure to save before closing.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Movie
              </label>
              <select
                value={formData.movie}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, movie: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                {availableMovies.map((movie) => (
                  <option key={movie} value={movie}>
                    {movie}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room
              </label>
              <select
                value={formData.roomName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, roomName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                {rooms
                  .filter((r) => r.status === "Active")
                  .map((room) => (
                    <option key={room._id} value={room.roomName}>
                      {room.roomName} ({room.capacity} seats)
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as ExtendedScheduleItem["status"],
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tickets Sold
              </label>
              <input
                type="number"
                value={formData.ticketsSold}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ticketsSold: Number.parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                max={schedule.totalTickets}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">
              Schedule Summary
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Movie:</span>
                <span className="ml-2 font-medium">{formData.movie}</span>
              </div>
              <div>
                <span className="text-gray-600">Room:</span>
                <span className="ml-2 font-medium">{formData.roomName}</span>
              </div>
              <div>
                <span className="text-gray-600">Time:</span>
                <span className="ml-2 font-medium">
                  {formData.startTime} - {formData.endTime}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span
                  className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                    formData.status
                  )}`}
                >
                  {formData.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="px-6 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleManagement;
