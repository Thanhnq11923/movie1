import type React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface TicketData {
  id: string;
  movieTitle: string;
  customerName: string;
  customerEmail: string;
  showtime: string;
  date: string;
  room: string;
  seats: string[];
  totalPrice: number;
  paymentMethod: string;
  status: string;
  bookingTime: string;
  ticketCode: string;
}

interface ViewDetailModalProps {
  ticket: TicketData;
  onClose: () => void;
}

const ViewDetailModal: React.FC<ViewDetailModalProps> = ({
  ticket,
  onClose,
}) => {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Used":
        return "bg-blue-100 text-blue-800";
      case "Cancelled":
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
      case "Used":
        return <CheckCircle className="w-4 h-4" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

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
        return "text-gray-900";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Ticket Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Ticket Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-gray-900">
                    {ticket.ticketCode}
                  </p>
                  <p className="text-sm text-gray-600">ID: {ticket.id}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Movie Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">

                  <p className="font-semibold text-gray-900">
                    {ticket.movieTitle}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {ticket.date}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {ticket.showtime}
                  </div>
                  <div className="flex items-center mt-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                   {ticket.room}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Seats
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {ticket.seats.map((seat) => (
                      <span
                        key={seat}
                        className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg"
                      >
                        {seat}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {ticket.seats.length} seat(s) selected
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Customer Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <p className="font-semibold text-gray-900">
                      {ticket.customerName}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Payment Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(ticket.totalPrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Payment Method:
                    </span>
                    <span className={`text-sm ${getPaymentMethodColor(ticket.paymentMethod)}`}>
                      {ticket.paymentMethod.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Status & Timing
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                        ticket.status
                      )}`}
                    >
                      {getStatusIcon(ticket.status)}
                      <span className="ml-1">{ticket.status}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Booked:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(ticket.bookingTime).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailModal;
