/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  RefreshCw,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ViewDetailModal from "./view-detail";
import { getAllMembers } from "../../../services/admin_api/memberService";
import { staffBookingService } from "../../../services/api/staffBookingService";
import { notify } from "../../../lib/toast";

// Unified ticket interface that can handle all ticket types
interface UnifiedTicketData {
  id: string;
  ticketCode: string;
  source: "customer_booking" | "staff_booking" | "direct_sale";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  movieTitle: string;
  showtime: string;
  date: string;
  room: string;
  seats: string[];
  totalPrice: number;
  paymentMethod: string;
  status: string; // Add status field
  bookingTime: string;
  staffName?: string; // For staff bookings
  concessions?: any[]; // For concessions data
  memberDiscount?: number;
  promotionDiscount?: number;
  subtotal?: number;
  tax?: number;
}

interface TicketStats {
  total: number;
  totalRevenue: number;
  customerBookings: number;
  staffBookings: number;
  cashRevenue: number;
  momoRevenue: number;
  vnpayRevenue: number;
}

const TicketManagement: React.FC = () => {
  const [tickets, setTickets] = useState<UnifiedTicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("All Payments");

  const [dateFilter, setDateFilter] = useState<string>("");
  const [movieFilter, setMovieFilter] = useState<string>("All Movies");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<UnifiedTicketData | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<UnifiedTicketData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 10;

  // Fetch all tickets from different sources
  const fetchAllTickets = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const allTickets: UnifiedTicketData[] = [];
      let userMap: Record<string, string> = {};

      // Get user data for customer bookings
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          const userRes = await getAllMembers(token);
          if (userRes.data && userRes.data.data) {
            userMap = userRes.data.data.reduce(
              (acc: Record<string, string>, user: any) => {
                acc[user._id] = user.fullName;
                return acc;
              },
              {}
            );
          }
        }
      } catch (error) {
        console.warn("Failed to fetch user data:", error);
      }

      // 1. Fetch customer bookings (only confirmed ones)
      try {
        const customerRes = await fetch("http://localhost:5173/api/bookings");
        const customerJson = await customerRes.json();
        
        if (customerJson.success && Array.isArray(customerJson.data)) {
          const customerTickets = customerJson.data
            .filter((item: any) => {
              // Only include confirmed bookings
              const status = item.status?.toLowerCase() || "confirmed";
              return status === "confirmed";
            })
            .map((item: any) => {
              let seats: string[] = [];
              if (Array.isArray(item.seats)) {
                seats = item.seats.map((s: any) => `${s.row}${s.col}`);
              } else if (item.row && item.col) {
                seats = [`${item.row}${item.col}`];
              }

              return {
                id: item._id,
                ticketCode: item._id,
                source: "customer_booking" as const,
                customerName: userMap[item.userId] || "Unknown",
                customerEmail: "",
                customerPhone: "",
                movieTitle: item.movieId?.versionMovieEnglish || "",
                showtime: item.time || "",
                date: item.date || "",
                room: item.cinemaRoomId?.roomName || "",
                seats,
                totalPrice: item.amount || 0,
                paymentMethod: item.paymentMethod || "Momo", // Get from API or default to Momo
                status: "Confirmed", // All customer bookings in ticket management are confirmed
                bookingTime: item.bookedAt || "",
                concessions: item.concessions || [],
              };
            });
          allTickets.push(...customerTickets);
        }
      } catch (error) {
        console.warn("Failed to fetch customer bookings:", error);
      }

      // 2. Fetch staff bookings
      try {
        const staffRes = await staffBookingService.getAllStaffBookings();
        if (staffRes.success && Array.isArray(staffRes.data)) {
          const staffTickets = staffRes.data.map((item: any) => {
            const seats = item.selectedSeats?.map((seat: any) => 
              `${seat.row}${seat.col}`
            ) || [];

                         return {
               id: item._id,
               ticketCode: item._id,
               source: "staff_booking" as const,
               customerName: item.customerInfo?.name || "Unknown",
               customerEmail: item.customerInfo?.email || "",
               customerPhone: item.customerInfo?.phone || "",
               movieTitle: item.movieTitle || "",
               showtime: item.showtimeTime || "",
               date: item.showtimeDate || "",
               room: item.roomName || "",
               seats,
               totalPrice: item.pricing?.total || 0,
               paymentMethod: item.paymentMethod || "Cash", // Get from API or default to Cash
               status: "Confirmed", // All staff bookings in ticket management are confirmed
               bookingTime: item.createdAt || "",
               staffName: item.staffName || "",
               concessions: item.selectedConcessions || [],
               memberDiscount: item.pricing?.memberDiscount || 0,
               promotionDiscount: item.pricing?.promotionDiscount || 0,
               subtotal: item.pricing?.subtotal || 0,
               tax: item.pricing?.tax || 0,
             };
          });
          allTickets.push(...staffTickets);
        }
      } catch (error) {
        console.warn("Failed to fetch staff bookings:", error);
      }

      // Sort by booking time (newest first)
      allTickets.sort((a, b) => 
        new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime()
      );

      setTickets(allTickets);
      setCurrentPage(1);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to fetch tickets");
      notify.error(`Failed to fetch tickets: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.staffName && ticket.staffName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPayment =
      paymentFilter === "All Payments" || ticket.paymentMethod.toUpperCase() === paymentFilter;
    
    
    
    const matchesDate = !dateFilter || ticket.date === dateFilter;
    const matchesMovie =
      movieFilter === "All Movies" || ticket.movieTitle === movieFilter;

         return matchesSearch && matchesPayment && matchesDate && matchesMovie;
  });

  const getTicketStats = (): TicketStats => {
    const total = tickets.length;
    const totalRevenue = tickets.reduce((sum, t) => sum + t.totalPrice, 0);
    const customerBookings = tickets.filter((t) => t.source === "customer_booking").length;
    const staffBookings = tickets.filter((t) => t.source === "staff_booking").length;
    const cashRevenue = tickets
      .filter((t) => t.paymentMethod.toLowerCase() === "cash")
      .reduce((sum, t) => sum + t.totalPrice, 0);
    const momoRevenue = tickets
      .filter((t) => t.paymentMethod.toLowerCase() === "momo")
      .reduce((sum, t) => sum + t.totalPrice, 0);
    
    const vnpayRevenue = tickets
      .filter((t) => t.paymentMethod.toLowerCase() === "vnpay")
      .reduce((sum, t) => sum + t.totalPrice, 0);

    return { 
      total, 
      totalRevenue, 
      customerBookings, 
      staffBookings,
      cashRevenue,
      momoRevenue,
      vnpayRevenue
    };
  };

  const stats = getTicketStats();



  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const getPaymentMethodColor = (paymentMethod: string) => {
    switch (paymentMethod.toLowerCase()) {
      case "cash":
        return "text-green-600 font-medium";
      case "momo":
        return "text-purple-600 font-medium";
      case "vnpay":
        return "text-blue-600 font-medium";
      default:
        return "text-gray-500";
    }
  };



  const handleDeleteTicket = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket) {
      setTicketToDelete(ticket);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const deleteTicketFromDB = async (ticketId: string, source: string) => {
    try {
      if (source === "customer_booking") {
        const res = await fetch(`http://localhost:5173/api/bookings/${ticketId}`, {
          method: "DELETE",
        });
        const json = await res.json();
        return json.success;
      } else if (source === "staff_booking") {
        const res = await staffBookingService.deleteStaffBooking(ticketId);
        return res.success;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const confirmDeleteTicket = async () => {
    if (!ticketToDelete) return;

    try {
      const loadingToast = notify.loading("Deleting ticket...");
      const success = await deleteTicketFromDB(ticketToDelete.id, ticketToDelete.source);
      
      if (!success) throw new Error("Delete failed");

      setTickets((prev) =>
        prev.filter((ticket) => ticket.id !== ticketToDelete.id)
      );

      notify.dismiss(loadingToast);
      notify.success(`Ticket ${ticketToDelete.ticketCode} deleted successfully!`);

      setShowDeleteModal(false);
      setTicketToDelete(null);
    } catch (error) {
      notify.error("Failed to delete ticket");
      console.error("Error deleting ticket:", error);
    }
  };

  const cancelDeleteTicket = () => {
    setShowDeleteModal(false);
    setTicketToDelete(null);
  };

  const handleViewDetails = (ticket: UnifiedTicketData) => {
    setSelectedTicket(ticket);
    setShowDetailModal(true);
    setShowDropdown(null);
  };

     const resetFilters = () => {
     setSearchTerm("");
     setPaymentFilter("All Payments");
     setDateFilter("");
     setMovieFilter("All Movies");
     setCurrentPage(1);
   };

  const uniqueMovies = [...new Set(tickets.map((t) => t.movieTitle))];

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
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
            Failed to load tickets
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAllTickets}
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
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
               Ticket Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage tickets from customer bookings, staff bookings, and direct sales
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Stats */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">tickets only</p>
            </div>
            <Ticket className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">CASH Revenue</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(stats.cashRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Cash payments</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">MOMO Revenue</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(stats.momoRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Momo payments</p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">VNPAY Revenue</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats.vnpayRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">VNPAY payments</p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Ticket List
            </h2>
            <button
              onClick={fetchAllTickets}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Enhanced Filters */}
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
            <option>All Payments</option>
                            <option>CASH</option>
                            <option>MOMO</option>
                            <option>VNPAY</option>
            </select>

            

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              value={movieFilter}
              onChange={(e) => {
                setMovieFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Movies</option>
              {uniqueMovies.map((movie) => (
                <option key={movie} value={movie}>
                  {movie}
                </option>
              ))}
            </select>

            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
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

        {/* Enhanced Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NO.
                </th>
                
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Show Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTickets.map((ticket, index) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {indexOfFirstTicket + index + 1}
                    </div>
                  </td>

                  

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.customerName}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {ticket.movieTitle}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      {ticket.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1 text-gray-400" />
                      {ticket.showtime}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                      {ticket.room}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {ticket.seats.map((seat) => (
                        <span
                          key={seat}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {ticket.seats.length} seat(s)
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(ticket.totalPrice)}
                    </div>
                    <div className={`text-sm ${getPaymentMethodColor(ticket.paymentMethod)}`}>
                      {ticket.paymentMethod.toUpperCase()}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="relative">
                      <button
                        data-ticket-id={ticket.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(
                            showDropdown === ticket.id ? null : ticket.id
                          );
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {Math.ceil(filteredTickets.length / ticketsPerPage) > 1 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {indexOfFirstTicket + 1} to{" "}
              {Math.min(indexOfLastTicket, filteredTickets.length)} of{" "}
              {filteredTickets.length} tickets
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
                { length: Math.ceil(filteredTickets.length / ticketsPerPage) },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    currentPage === page
                      ? "bg-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredTickets.length / ticketsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredTickets.length / ticketsPerPage)
                }
                className={`p-2 rounded-lg ${
                  currentPage ===
                  Math.ceil(filteredTickets.length / ticketsPerPage)
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

      {/* Dropdown Menu Portal */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-ticket-id="${showDropdown}"]`
              );
              if (!buttonElement) return {};

              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120;
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;

              const shouldAppearAbove =
                spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;

              const left = Math.min(
                window.innerWidth - 170,
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
                  const ticket = tickets.find((t) => t.id === showDropdown);
                  if (ticket) handleViewDetails(ticket);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              
              <button
                onClick={() => handleDeleteTicket(showDropdown)}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && ticketToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={cancelDeleteTicket}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Ticket
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this ticket?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {ticketToDelete.ticketCode} - {ticketToDelete.customerName}
                  </p>
                  <p className="text-gray-600">
                    {ticketToDelete.date} at {ticketToDelete.showtime} - Room{" "}
                    {ticketToDelete.room}
                  </p>
                  <p className="text-gray-600">
                    Seats: {ticketToDelete.seats.join(", ")} •{" "}
                    {formatCurrency(ticketToDelete.totalPrice)}
                  </p>
                                     <p className="text-gray-600">
                     Source: {ticketToDelete.source.replace("_", " ")} • Payment: {ticketToDelete.paymentMethod}
                   </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. The ticket booking will be
                permanently removed.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteTicket}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteTicket}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {showDetailModal && selectedTicket && (
        <ViewDetailModal
          ticket={selectedTicket}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTicket(null);
          }}
        />
      )}
    </div>
  );
};

export default TicketManagement; 