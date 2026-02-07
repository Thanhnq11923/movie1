/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react";
import { useState, useEffect, useRef } from "react";
import {
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ViewBookingModal from "./view-booking";
import { notify } from "../../../lib/toast";
import { getAllMembers } from "../../../services/admin_api/memberService";

// Types
export interface BookingData {
  id: string; 
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  movieTitle: string;
  showtime: string;
  date: string;
  room: string; // đổi sang string để đồng bộ với ticket-management
  seats: string[];
  seatType: "Standard" | "VIP";
  totalAmount: number;
  originalAmount?: number; // Tổng tiền gốc (chưa giảm giá)
  seatPrice?: number; // Giá ghế gốc
  status: "Confirmed" | "Pending" | "Cancelled" | "Payment_failed";
  paymentStatus: "completed" | "pending" | "failed";
  paymentMethod: "cash" | "vnpay" | "momo";
  bookingTime: string;
  promotion?: string;
  promotionDiscount?: number;
  concessions?: any[]; // Thêm trường concessions
  theater?: string;
  format?: string;
}

export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
  cashRevenue: number;
  vnpayRevenue: number;
}

// Utility functions
const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Confirmed":
      return "bg-green-100 text-green-800";
    case "Pending":
      return "bg-yellow-100 text-yellow-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Payment_failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Confirmed":
      return <CheckCircle className="w-4 h-4" />;
    case "Pending":
      return <AlertCircle className="w-4 h-4" />;
    case "Cancelled":
      return <XCircle className="w-4 h-4" />;
    case "Payment_failed":
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const getBookingStats = (bookings: BookingData[]): BookingStats => {
  const total = bookings.length;
  const confirmed = bookings.filter((b) => b.status === "Confirmed").length;
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const cancelled = bookings.filter((b) => b.status === "Cancelled").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "Confirmed")
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const cashRevenue = bookings
    .filter((b) => b.status === "Confirmed" )
    .reduce((sum, b) => sum + b.totalAmount, 0);
  const vnpayRevenue = bookings
    .filter((b) => b.status === "Confirmed" && b.paymentMethod === "vnpay")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return {
    total,
    confirmed,
    pending,
    cancelled,
    totalRevenue,
    cashRevenue,
    vnpayRevenue,
  };
};

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(
    null
  );
  const [showViewModal, setShowViewModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false); // BỎ
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<BookingData | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const bookingsPerPage = 10;

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:5173/api/bookings");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        // Lấy toàn bộ user/account giống ticket-management
        let userMap: Record<string, any> = {};
        try {
          const token = localStorage.getItem("authToken");
          if (token) {
            const userRes = await getAllMembers(token);
            if (userRes.data && userRes.data.data) {
              userMap = userRes.data.data.reduce(
                (acc: Record<string, any>, user: any) => {
                  acc[user._id] = {
                    fullName: user.fullName,
                    email: user.email,
                    phone: user.phoneNumber || user.phone,
                    address: user.address,
                  };
                  return acc;
                },
                {}
              );
            }
          }
        } catch {
          // Nếu lỗi, userMap sẽ rỗng, fallback Unknown bên dưới
        }

        // Map lại dữ liệu booking, gán thông tin khách hàng đầy đủ
        const mapped = json.data.map((item: any) => {
          // Xử lý seats
          let seats: string[] = [];
          if (Array.isArray(item.seats)) {
            seats = item.seats.map((s: any) => `${s.row}${s.col}`);
          } else if (item.row && item.col) {
            seats = [`${item.row}${item.col}`];
          }

          // Lấy ngày và giờ từ bookedAt
          const bookingDate = new Date(item.bookedAt);
          const date = bookingDate.toLocaleDateString("en-CA");
          const showtime = bookingDate.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          });

          // Lấy thông tin user từ userMap
          const userInfo = userMap[item.userId] || {};

          // Debug: Log API response structure to see available fields
          if (item._id === json.data[0]?._id) {
            console.log("🔍 Debug - Full API item structure:", item);
            console.log("🔍 Debug - Available fields:", Object.keys(item));
          }

          return {
            id: item._id,
            customerName: userInfo.fullName || "Unknown",
            customerEmail: userInfo.email || "",
            customerPhone: userInfo.phone || "",
            movieTitle: item.movieId?.versionMovieEnglish || "",
            showtime: item.time,
            date: item.date,
            room: item.cinemaRoomId?.roomName || "",
            seats,
            seatType: "Standard" as const,
            totalAmount: item.amount,
            originalAmount: item.originalAmount || item.subtotal || item.baseAmount || 0, // Try different field names
            seatPrice: item.seatPrice || item.ticketPrice || 0,
            status: item.status
              ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
              : "Confirmed",
            paymentStatus: item.paymentStatus || (item.status === "confirmed" ? "completed" : item.status === "pending" ? "pending" : "failed"),
            paymentMethod: item.paymentMethod || "vnpay",
            bookingTime: item.bookedAt,
            promotion: item.promotion || "",
            promotionDiscount: item.promotionDiscount || item.discountValue || item.discount || 0,
            concessions: item.concessions || [],
            theater: item.theater || "",
            format: item.format || "",
          };
        });
        // Sắp xếp từ mới nhất đến cũ nhất
        mapped.sort(
          (a: any, b: any) =>
            new Date(b.bookingTime).getTime() -
            new Date(a.bookingTime).getTime()
        );
        setBookings(mapped);
        setCurrentPage(1);
      } else {
        throw new Error("No data returned from API");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch bookings");
      notify.error(`Failed to fetch bookings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.movieTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || booking.status === statusFilter;
    const matchesDate = !dateFilter || booking.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const stats = getBookingStats(bookings);

  // Thêm hàm gọi API xóa booking
  const deleteBookingFromDB = async (bookingId: string) => {
    try {
      const res = await fetch(
        `http://localhost:5173/api/bookings/${bookingId}`,
        {
          method: "DELETE",
        }
      );
      const json = await res.json();
      if (json.success) {
        return true;
      } else {
        throw new Error(json.message || "Delete failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      return false;
    }
  };

  // Removed handleStatusChange function - no longer allowing manual status changes

  const handleDeleteBooking = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (booking) {
      setBookingToDelete(booking);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const confirmDeleteBooking = async () => {
    if (!bookingToDelete) return;

    try {
      const loadingToast = notify.loading("Deleting booking...");

      // Gọi API xóa booking trong DB
      const success = await deleteBookingFromDB(bookingToDelete.id);
      if (!success) throw new Error("Delete failed");

      setBookings((prev) =>
        prev.filter((booking) => booking.id !== bookingToDelete.id)
      );

      notify.dismiss(loadingToast);
      notify.success("Booking deleted successfully!");
      setShowDeleteModal(false);
      setBookingToDelete(null);
    } catch (error) {
      console.error("Error deleting booking:", error);
      notify.error("Failed to delete booking!");
    }
  };

  const cancelDeleteBooking = () => {
    setShowDeleteModal(false);
    setBookingToDelete(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setDateFilter("");
    setCurrentPage(1);
    notify.info("Filters have been reset");
  };

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
    setShowDropdown(null);
  };

  // BỎ toàn bộ các hàm edit booking
  // const handleEditBooking = (booking: BookingData) => { ... }
  // const handleUpdateBooking = (updatedBooking: BookingData) => { ... }

  const indexOfLastBooking = currentPage * bookingsPerPage;
  const indexOfFirstBooking = indexOfLastBooking - bookingsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstBooking,
    indexOfLastBooking
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Ticket className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load bookings
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
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
              Booking Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage customer bookings and reservations
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
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.confirmed}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently confirmed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Awaiting confirmation
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-yellow-400" />
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
                From confirmed bookings
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Booking List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Booking List
            </h2>
            <button
              onClick={fetchBookings}
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
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
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
                    Amount
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
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
                      No bookings found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentBookings.map((booking, index) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {indexOfFirstBooking + index + 1}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.customerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.customerEmail}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.movieTitle}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                          {booking.date}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {booking.showtime}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          {booking.room}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {booking.seats.map((seat) => (
                            <span
                              key={seat}
                              className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                            >
                              {seat}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {booking.seats.length} seat(s)
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            booking.status
                          )}`}
                        >
                          {getStatusIcon(booking.status)}
                          <span className="ml-1">{booking.status}</span>
                        </span>
                      </td>

                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="relative">
                          <button
                            data-booking-id={booking.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(
                                showDropdown === booking.id ? null : booking.id
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
                  const booking = bookings.find((b) => b.id === showDropdown);
                  if (booking) handleViewDetails(booking);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              {/* Removed Confirm button - no longer allowing manual status changes */}
              <button
                onClick={() => handleDeleteBooking(showDropdown)}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && bookingToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteBooking}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Booking
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this booking?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {bookingToDelete.id} - {bookingToDelete.customerName}
                  </p>
                  <p className="text-gray-600">
                    {bookingToDelete.date} at {bookingToDelete.showtime} - Room{" "}
                    {bookingToDelete.room}
                  </p>
                  <p className="text-gray-600">
                    Seats: {bookingToDelete.seats.join(", ")} •{" "}
                    {formatCurrency(bookingToDelete.totalAmount)}
                  </p>
                  <p className="text-gray-600">
                    Status: {bookingToDelete.status}
                  </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. The booking will be permanently
                removed.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteBooking}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBooking}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Booking Modal */}
      {showViewModal && selectedBooking && (
        <ViewBookingModal
          isOpen={showViewModal}
          booking={selectedBooking}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
};

export default BookingManagement;