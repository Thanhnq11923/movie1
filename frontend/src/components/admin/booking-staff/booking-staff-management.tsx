"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Eye, 
  User,
  Film,
  Ticket,
  X,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  RefreshCw,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Printer,
  Mail,
  Phone,
} from "lucide-react";
import { staffBookingService } from "../../../services/api/staffBookingService";
import toast from "react-hot-toast";

interface StaffBooking {
  _id: string;
  staffId: string;
  staffName: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
    isMember: boolean;
    memberId?: string;
    promotionCode?: string;
  };
  movieId: string;
  movieTitle: string;
  movieDuration: string;
  movieGenre: string;
  movieRating: string;
  scheduleId: string;
  cinemaRoomId: string;
  roomName: string;
  showtimeDate: string;
  showtimeTime: string;
  showtimeFormat: string;
  selectedSeats: Array<{
    seatId: string;
    row: string;
    col: number;
    price: number;
  }>;
  selectedConcessions: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    totalPrice: number;
  }>;
  paymentMethod: string;
  pricing: {
    subtotal: number;
    tax: number;
    promotionDiscount: number;
    memberDiscount: number;
    total: number;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  staffName: string;
  minAmount: string;
  maxAmount: string;
  hasConcessions: boolean | null;
}

export default function StaffBookingManagement() {
  const [bookings, setBookings] = useState<StaffBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [staffFilter, setStaffFilter] = useState<string>("All Staff");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [selectedBooking, setSelectedBooking] = useState<StaffBooking | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateFrom: "",
    dateTo: "",
    staffName: "",
    minAmount: "",
    maxAmount: "",
    hasConcessions: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const bookingsPerPage = 10;

  // Fetch staff bookings
  useEffect(() => {
    fetchStaffBookings();
  }, []);

  const fetchStaffBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await staffBookingService.getAllStaffBookings();
      if (response.success) {
        // Sort bookings from newest to oldest by createdAt
        const sortedBookings = response.data.sort((a: StaffBooking, b: StaffBooking) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBookings(sortedBookings);
      } else {
        setError("Failed to fetch staff bookings");
      }
    } catch (err) {
      console.error("Error fetching staff bookings:", err);
      setError("Error loading staff bookings");
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on search term and filter options
  const filteredBookings = bookings.filter(booking => {
    // Search term filter
    const searchMatch = 
      booking.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerInfo.phone.toLowerCase().includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;

    // Staff filter
    const matchesStaff = staffFilter === "All Staff" || booking.staffName === staffFilter;
    
    // Date filter
    const matchesDate = !dateFilter || booking.showtimeDate === dateFilter;

    if (!matchesStaff || !matchesDate) return false;

    // Date range filter
    if (filterOptions.dateFrom) {
      const bookingDate = new Date(booking.createdAt);
      const fromDate = new Date(filterOptions.dateFrom);
      if (bookingDate < fromDate) return false;
    }

    if (filterOptions.dateTo) {
      const bookingDate = new Date(booking.createdAt);
      const toDate = new Date(filterOptions.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      if (bookingDate > toDate) return false;
    }

    // Staff name filter
    if (filterOptions.staffName && !booking.staffName.toLowerCase().includes(filterOptions.staffName.toLowerCase())) {
      return false;
    }

    // Amount range filter
    if (filterOptions.minAmount && booking.pricing.total < parseFloat(filterOptions.minAmount)) {
      return false;
    }

    if (filterOptions.maxAmount && booking.pricing.total > parseFloat(filterOptions.maxAmount)) {
      return false;
    }

    // Concessions filter
    if (filterOptions.hasConcessions !== null) {
      const hasConcessions = booking.selectedConcessions.length > 0;
      if (filterOptions.hasConcessions !== hasConcessions) {
        return false;
      }
    }

    return true;
  });

  // Handle delete booking
  const handleDeleteBooking = async (bookingId: string) => {
    try {
      console.log("Attempting to delete booking:", bookingId);
      
      // Show loading toast
      const loadingToast = toast.loading("Deleting booking...");
      
      const response = await staffBookingService.deleteStaffBooking(bookingId);
      
      console.log("Delete response:", response);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.success) {
        // Remove booking from state
        setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
        setShowDeleteModal(false);
        setSelectedBooking(null);
        setShowDropdown(null);
        
        // Show success toast
        toast.success("Booking deleted successfully!");
      } else {
        // Show error toast with response message
        console.error("Delete failed:", response);
        toast.error(response.message || "Failed to delete booking");
      }
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      
      // Show error toast with detailed message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Error deleting booking. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterOptions({
      dateFrom: "",
      dateTo: "",
      staffName: "",
      minAmount: "",
      maxAmount: "",
      hasConcessions: null,
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Reset basic filters (search, staff, date)
  const resetFilters = () => {
    setSearchTerm("");
    setStaffFilter("All Staff");
    setDateFilter("");
    setCurrentPage(1);
  };

  // Get unique staff names for dropdown
  const uniqueStaffNames = Array.from(new Set(bookings.map(booking => booking.staffName))).sort();

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterOptions).some(value => 
    value !== "" && value !== null
  );

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Format time
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + " đ";
  };

  // Calculate stats
  const stats = {
    total: filteredBookings.length,
    totalRevenue: filteredBookings.reduce((sum, booking) => sum + booking.pricing.total, 0),
    uniqueCustomers: new Set(filteredBookings.map(b => b.customerInfo.name)).size,
    uniqueMovies: new Set(filteredBookings.map(b => b.movieTitle)).size,
  };

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstBooking, indexOfLastBooking);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Ticket className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load staff bookings
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStaffBookings}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 relative">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Staff Booking Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage all staff-created bookings
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">All bookings</p>
            </div>
            <Ticket className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From all bookings
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Customers</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.uniqueCustomers}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Different customers
              </p>
            </div>
            <User className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Movies Booked</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.uniqueMovies}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Different movies
              </p>
            </div>
            <Film className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Staff Booking List
            </h2>
            <button
              onClick={fetchStaffBookings}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search bookings..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={staffFilter}
              onChange={(e) => {
                setStaffFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Staff</option>
              {uniqueStaffNames.map((staffName) => (
                <option key={staffName} value={staffName}>
                  {staffName}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />

            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px] sm:min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    NO.
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Movie
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Show Details
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Seats
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Staff
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBookings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base"
                    >
                      {searchTerm || hasActiveFilters ? "No bookings found matching your search or filters." : "No staff bookings found."}
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking, index) => (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {indexOfFirstBooking + index + 1}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerInfo.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerInfo.phone}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.movieTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.showtimeFormat}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {formatDate(booking.showtimeDate)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {formatTime(booking.showtimeTime)}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {booking.roomName}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {booking.selectedSeats.map((seat, seatIndex) => (
                            <span
                              key={seatIndex}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                            >
                              {seat.row}{seat.col}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.selectedSeats.length} seat(s)
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {booking.staffName}
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.pricing.total)}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="relative">
                          <button
                            data-booking-id={booking._id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(
                                showDropdown === booking._id ? null : booking._id
                              );
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {Math.ceil(filteredBookings.length / bookingsPerPage) > 1 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstBooking + 1} to{" "}
              {Math.min(indexOfLastBooking, filteredBookings.length)} of{" "}
              {filteredBookings.length} bookings
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from(
                {
                  length: Math.ceil(filteredBookings.length / bookingsPerPage),
                },
                (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredBookings.length / bookingsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredBookings.length / bookingsPerPage)
                }
                className={`p-2 rounded-lg ${
                  currentPage ===
                  Math.ceil(filteredBookings.length / bookingsPerPage)
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu Portal - Positioned outside table */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-booking-id="${showDropdown}"]`
              );
              if (!buttonElement) return {};

              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120; // Approximate height of dropdown with 3 items
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;

              // Check if dropdown should appear above or below
              const shouldAppearAbove =
                spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;

              const left = Math.min(
                window.innerWidth - 170, // dropdown width + padding
                Math.max(10, buttonRect.right - 160)
              );

              const top = shouldAppearAbove
                ? buttonRect.top - dropdownHeight - 5
                : buttonRect.bottom + 5;

              return {
                left: `${left}px`,
                top: `${Math.max(
                  10,
                  Math.min(top, viewportHeight - dropdownHeight - 10)
                )}px`,
              };
            })()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  const booking = bookings.find((b) => b._id === showDropdown);
                  if (booking) {
                    setSelectedBooking(booking);
                    setShowViewModal(true);
                  }
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>          
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Filter Bookings</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">From</label>
                    <input
                      type="date"
                      value={filterOptions.dateFrom}
                      onChange={(e) => setFilterOptions({...filterOptions, dateFrom: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">To</label>
                    <input
                      type="date"
                      value={filterOptions.dateTo}
                      onChange={(e) => setFilterOptions({...filterOptions, dateTo: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Staff Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Staff Name</label>
                <input
                  type="text"
                  placeholder="Filter by staff name..."
                  value={filterOptions.staffName}
                  onChange={(e) => setFilterOptions({...filterOptions, staffName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range (VND)</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Amount</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filterOptions.minAmount}
                      onChange={(e) => setFilterOptions({...filterOptions, minAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Amount</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={filterOptions.maxAmount}
                      onChange={(e) => setFilterOptions({...filterOptions, maxAmount: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Concessions Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Concessions</label>
                <select
                  value={filterOptions.hasConcessions === null ? "" : filterOptions.hasConcessions.toString()}
                  onChange={(e) => setFilterOptions({
                    ...filterOptions, 
                    hasConcessions: e.target.value === "" ? null : e.target.value === "true"
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All bookings</option>
                  <option value="true">With concessions</option>
                  <option value="false">Without concessions</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedBooking && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowViewModal(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Staff Booking Details
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Complete information for booking #{selectedBooking._id.slice(-8)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Simple Status Banner */}
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-semibold text-green-800">Booking Confirmed</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      Confirmed
                    </span>
                    {/* Removed Payment Status badge */}
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                      Cash
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Customer & Timeline */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Customer Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-gray-600" />
                      Customer Information
                    </h3>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedBooking.customerInfo.name}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-base text-gray-900">
                            {selectedBooking.customerInfo.email || "Not provided"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-base text-gray-900">
                            {selectedBooking.customerInfo.phone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking Timeline */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-600" />
                      Booking Timeline
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Booking Created</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(selectedBooking.createdAt)} at {formatTime(selectedBooking.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                          <p className="text-xs text-gray-500">Cash payment processed successfully</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Movie & Booking Details */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Movie Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Ticket className="w-5 h-5 mr-2 text-gray-600" />
                      Movie & Show Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Movie Title</label>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedBooking.movieTitle}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Show Date</label>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-base font-semibold text-gray-900">
                            {formatDate(selectedBooking.showtimeDate)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Show Time</label>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-base font-semibold text-gray-900">
                            {formatTime(selectedBooking.showtimeTime)}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Cinema Room</label>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-base font-semibold text-gray-900">
                            {selectedBooking.roomName}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Format</label>
                        <div className="flex items-center">
                          <Film className="w-5 h-5 text-gray-400 mr-2" />
                          <p className="text-base font-semibold text-gray-900">
                            {selectedBooking.showtimeFormat}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Staff Name</label>
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <p className="text-base font-semibold text-gray-900">
                            {selectedBooking.staffName}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seat Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-5 h-5 mr-2 text-gray-600">🎬</div>
                      Seat Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Selected Seats</label>
                        <div className="flex flex-wrap gap-2">
                          {selectedBooking.selectedSeats.map((seat, index) => (
                            <span
                              key={index}
                              className="inline-flex px-3 py-1 text-sm font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {seat.row}{seat.col}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Seat Type</label>
                        <span className="inline-flex px-3 py-1 text-sm font-semibold rounded bg-blue-100 text-blue-800 border border-blue-200">
                          Standard
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedBooking.selectedSeats.length} seat(s) selected
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Concessions Information */}
                  {selectedBooking.selectedConcessions.length > 0 && (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-5 h-5 mr-2 text-gray-600">🍿</div>
                        Concessions
                      </h3>

                      <div className="space-y-2">
                        {selectedBooking.selectedConcessions.map((concession, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {concession.productName}
                              </span>
                              <p className="text-xs text-gray-500">
                                Quantity: {concession.quantity} × {formatCurrency(concession.price)}
                              </p>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(concession.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                      Payment Summary
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Seat Type:</span>
                            <span className="font-medium text-gray-900">Standard</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Number of Seats:</span>
                            <span className="font-medium text-gray-900">{selectedBooking.selectedSeats.length}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-sm text-gray-600">Seat Total:</span>
                            <span className="font-medium text-gray-900">{formatCurrency(selectedBooking.selectedSeats.reduce((sum, seat) => sum + seat.price, 0))}</span>
                          </div>

                          {selectedBooking.selectedConcessions.length > 0 && (
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Concessions Total:</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(selectedBooking.selectedConcessions.reduce((sum, c) => sum + c.totalPrice, 0))}
                              </span>
                            </div>
                          )}
                          {selectedBooking.pricing.promotionDiscount > 0 && (
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                              <span className="text-sm text-green-600">Promotion Discount:</span>
                              <span className="font-medium text-green-600">-{formatCurrency(selectedBooking.pricing.promotionDiscount)}</span>
                            </div>
                          )}
                          {selectedBooking.pricing.memberDiscount > 0 && (
                            <div className="flex justify-between items-center py-1 border-b border-gray-100">
                              <span className="text-sm text-green-600">Member Discount:</span>
                              <span className="font-medium text-green-600">-{formatCurrency(selectedBooking.pricing.memberDiscount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center py-2 border-t-2 border-gray-200">
                            <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                            <span className="text-xl font-bold text-gray-900">{formatCurrency(selectedBooking.pricing.total)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Removed Payment Status section */}

                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Payment Method</label>
                          <span className="inline-flex px-2 py-1 text-sm font-medium rounded bg-purple-100 text-purple-800">
                            Cash
                          </span>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Booking ID</label>
                          <p className="text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded border">
                            {selectedBooking._id}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}