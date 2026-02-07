import type React from "react";
import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  Ticket,
  CheckCircle,
  XCircle,
  AlertCircle,
  Printer,
  MapPin as AddressIcon,
  Film,
} from "lucide-react";
import type { BookingData } from "./member-booking";

interface ViewBookingModalProps {
  isOpen: boolean;
  booking: BookingData | null;
  onClose: () => void;
}

interface UserInfo {
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
}

const ViewBookingModal: React.FC<ViewBookingModalProps> = ({
  isOpen,
  booking,
  onClose,
}) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch user information when booking changes
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!booking) return;

      setLoading(true);
      try {
        // Lấy userId từ booking (giả sử có trường userId)
        const userId = (booking as any).userId;
        console.log("🔍 Debug - Booking data:", booking);
        console.log("🔍 Debug - UserId from booking:", userId);

        if (!userId) {
          console.log("❌ No userId found in booking data");
          setUserInfo({
            fullName: booking.customerName,
            email: booking.customerEmail,
            phone: booking.customerPhone,
            address: "",
          });
          return;
        }

        // Gọi trực tiếp API /api/users để lấy thông tin user
        console.log("🔍 Debug - Trying to fetch user info for userId:", userId);
        console.log("🔍 Debug - Booking data:", {
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          userId: (booking as any).userId,
        });

        // Thử gọi trực tiếp API với userId cụ thể
        console.log("🔍 Debug - Testing with specific userId:", userId);

        // Thử nhiều API endpoints khác nhau cho user cụ thể
        const individualEndpoints = [
          `http://localhost:5173/api/users/${userId}`,
          `http://localhost:5173/api/accounts/${userId}`,
          `http://localhost:5173/api/members/${userId}`,
          `http://localhost:3000/api/users/${userId}`,
          `http://localhost:3000/api/accounts/${userId}`,
          `http://localhost:3000/api/members/${userId}`,
        ];

        let userFound = false;

        for (const endpoint of individualEndpoints) {
          try {
            console.log(`🔍 Debug - Trying individual endpoint: ${endpoint}`);
            const userRes = await fetch(endpoint);
            console.log(
              `🔍 Debug - Individual response status: ${userRes.status}`
            );

            if (userRes.ok) {
              const userJson = await userRes.json();
              console.log(`🔍 Debug - Individual API response:`, userJson);

              if (userJson.success && userJson.data) {
                const individualUser = userJson.data;
                console.log("✅ Found individual user:", individualUser);
                console.log("🔍 Debug - Individual user fields:", {
                  fullName: individualUser.fullName,
                  name: individualUser.name,
                  email: individualUser.email,
                  phoneNumber: individualUser.phoneNumber,
                  phone: individualUser.phone,
                  address: individualUser.address,
                });
                setUserInfo({
                  fullName:
                    individualUser.fullName ||
                    individualUser.name ||
                    "Unknown User",
                  email: individualUser.email || "N/A",
                  phone:
                    individualUser.phoneNumber || individualUser.phone || "N/A",
                  address: individualUser.address || "",
                });
                userFound = true;
                break;
              } else {
                console.log(`❌ Individual ${endpoint} returned invalid data`);
              }
            } else {
              console.log(
                `❌ Individual ${endpoint} returned status: ${userRes.status}`
              );
            }
          } catch (individualError) {
            console.error(
              `❌ Error fetching individual user from ${endpoint}:`,
              individualError
            );
          }
        }

        if (!userFound) {
          console.log(
            "❌ User not found in any individual API, trying list APIs..."
          );

          // Thử API lấy danh sách users
          const apiEndpoints = [
            "http://localhost:5173/api/users",
            "http://localhost:5173/api/accounts",
            "http://localhost:5173/api/members",
            "http://localhost:3000/api/users",
            "http://localhost:3000/api/accounts",
            "http://localhost:3000/api/members",
          ];

          for (const endpoint of apiEndpoints) {
            try {
              console.log(`🔍 Debug - Trying list endpoint: ${endpoint}`);
              const res = await fetch(endpoint);
              console.log(`🔍 Debug - List response status: ${res.status}`);

              if (res.ok) {
                const json = await res.json();
                console.log(`🔍 Debug - ${endpoint} response:`, json);

                if (json.success && Array.isArray(json.data)) {
                  const user = json.data.find((u: any) => u._id === userId);
                  console.log(`🔍 Debug - Found user in ${endpoint}:`, user);

                  if (user) {
                    console.log("✅ Found user with data:", user);
                    console.log("🔍 Debug - User fields:", {
                      fullName: user.fullName,
                      name: user.name,
                      email: user.email,
                      phoneNumber: user.phoneNumber,
                      phone: user.phone,
                      address: user.address,
                    });
                    setUserInfo({
                      fullName: user.fullName || user.name || "Unknown User",
                      email: user.email || "N/A",
                      phone: user.phoneNumber || user.phone || "N/A",
                      address: user.address || "",
                    });
                    userFound = true;
                    break;
                  }
                } else {
                  console.log(`❌ ${endpoint} returned invalid data structure`);
                }
              } else {
                console.log(`❌ ${endpoint} returned status: ${res.status}`);
              }
            } catch (error) {
              console.error(`❌ Error fetching from ${endpoint}:`, error);
            }
          }
        }

        if (!userFound) {
          console.log("❌ User not found in any API, using fallback data");
          console.log("🔍 Debug - Using booking data as fallback:", {
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            customerPhone: booking.customerPhone,
          });
          // Fallback nếu không tìm thấy user
          setUserInfo({
            fullName: "Unknown User",
            email: "N/A",
            phone: "N/A",
            address: "",
          });
        }
      } catch (error) {
        console.error("❌ Error fetching user info:", error);
        // Fallback nếu có lỗi
        setUserInfo({
          fullName: booking.customerName,
          email: booking.customerEmail,
          phone: booking.customerPhone,
          address: "",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [booking]);

  if (!isOpen || !booking) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("vi-VN");
  };

  const formatDateTimeNoSeconds = (dateTime: string) => {
    return new Date(dateTime).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  // Removed getPaymentBadgeColor function - payment status no longer displayed

  const getPaymentMethodBadgeColor = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
        return "bg-blue-100 text-blue-800";
      case "vnpay":
        return "bg-purple-100 text-purple-800";
      case "momo":
        return "bg-pink-100 text-pink-800";
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

  // Removed calculateTicketPrice function - now using actual booking.totalAmount from API

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Booking Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Complete information for booking #{booking.id}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Simple Status Banner */}
          <div
            className={`mb-6 p-4 rounded-lg ${
              booking.status === "Confirmed"
                ? "bg-green-50 border border-green-200"
                : booking.status === "Pending"
                ? "bg-yellow-50 border border-yellow-200"
                : booking.status === "Payment_failed"
                ? "bg-red-50 border border-red-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getStatusIcon(booking.status)}
                <span className="ml-2 font-semibold text-green-800">
                  Booking {booking.status === "Payment_failed" ? "Payment Failed" : booking.status}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(
                    booking.status
                  )}`}
                >
                  {booking.status === "Payment_failed" ? "Payment Failed" : booking.status}
                </span>
                {/* Removed Payment Status badge */}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${getPaymentMethodBadgeColor(
                    booking.paymentMethod
                  )}`}
                >
                  {booking.paymentMethod === "cash" ? "Cash" : booking.paymentMethod === "momo" ? "MoMo" : "VNPAY"}
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

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading user info...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                      <p className="text-base font-semibold text-gray-900">
                        {userInfo?.fullName || booking.customerName}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-base text-gray-900">
                          {userInfo?.email || booking.customerEmail || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        <p className="text-base text-gray-900">
                          {userInfo?.phone || booking.customerPhone || "N/A"}
                        </p>
                      </div>
                    </div>

                    {userInfo?.address && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                        <div className="flex items-start">
                          <AddressIcon className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
                          <p className="text-gray-900 text-sm">{userInfo.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
                        {formatDateTimeNoSeconds(booking.bookingTime)}
                      </p>
                    </div>
                  </div>
                  {booking.status === "Confirmed" && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                        <p className="text-xs text-gray-500">
                          Payment processed via {booking.paymentMethod === "cash" ? "Cash" : booking.paymentMethod === "momo" ? "MoMo" : "VNPAY"}
                        </p>
                      </div>
                    </div>
                  )}
                  {booking.status === "Cancelled" && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Booking Cancelled</p>
                        <p className="text-xs text-gray-500">Refund processed</p>
                      </div>
                    </div>
                  )}
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
                      {booking.movieTitle}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Show Date</label>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(booking.date)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Show Time</label>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-base font-semibold text-gray-900">
                        {booking.showtime}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Cinema Room</label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-base font-semibold text-gray-900">
                        {booking.room}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Theater</label>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <p className="text-base font-semibold text-gray-900">
                        {(booking as any).theater || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Format</label>
                    <div className="flex items-center">
                      <Film className="w-5 h-5 text-gray-400 mr-2" />
                      <p className="text-base font-semibold text-gray-900">
                        {(booking as any).format || "N/A"}
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
                      {booking.seats.map((seat) => (
                        <span
                          key={seat}
                          className={`inline-flex px-3 py-1 text-sm font-semibold rounded ${
                            booking.seatType === "VIP"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Seat Type</label>
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded ${
                        booking.seatType === "VIP"
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                          : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {booking.seatType}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      {booking.seats.length} seat(s) selected
                    </p>
                  </div>
                </div>
              </div>

              {/* Concessions Information */}
              {(() => {
                const concessions = (booking as any).concessions;
                if (concessions && Array.isArray(concessions) && concessions.length > 0) {
                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <div className="w-5 h-5 mr-2 text-gray-600">🍿</div>
                        Concessions
                      </h3>

                      <div className="space-y-2">
                        {concessions.map((concession: any, index: number) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                {concession.name}
                              </span>
                              <p className="text-xs text-gray-500">
                                Quantity: {concession.quantity} × {formatCurrency(concession.price)}
                              </p>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(concession.price * concession.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

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
                        <span className="font-medium text-gray-900">{booking.seatType}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-sm text-gray-600">Number of Seats:</span>
                        <span className="font-medium text-gray-900">{booking.seats.length}</span>
                      </div>
                      {(() => {
                        const concessions = booking.concessions;
                        const concessionsTotal = concessions && Array.isArray(concessions) && concessions.length > 0 
                          ? concessions.reduce((sum: number, concession: any) => sum + (concession.price * concession.quantity), 0) 
                          : 0;
                       
                        
                        return (
                          <>
                            {/* <div className="flex justify-between items-center py-1 border-b border-gray-100">
                              <span className="text-sm text-gray-600">Seat Total:</span>
                              <span className="font-medium text-gray-900">
                                {formatCurrency(seatTotal)}
                              </span>
                            </div> */}
                            {concessionsTotal > 0 && (
                              <div className="flex justify-between items-center py-1 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Concessions Total:</span>
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(concessionsTotal)}
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      <div className="flex justify-between items-center py-2 border-t-2 border-gray-200">
                        <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(booking.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Removed Payment Status section */}

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Payment Method</label>
                      <span
                        className={`inline-flex px-2 py-1 text-sm font-medium rounded ${getPaymentMethodBadgeColor(
                          booking.paymentMethod
                        )}`}
                      >
                        {booking.paymentMethod === "cash" ? "Cash" : booking.paymentMethod === "momo" ? "MoMo" : "VNPAY"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Ticket</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBookingModal;
