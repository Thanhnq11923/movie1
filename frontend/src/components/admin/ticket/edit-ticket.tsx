import type React from "react";
import { XCircle } from "lucide-react";

// ✨ IMPORT NOTIFICATION
import { notify } from "../../../lib/toast";

interface TicketData {
  id: string;
  movieTitle: string;
  customerName: string;
  customerEmail: string;
  showtime: string;
  date: string;
  room: number;
  seats: string[];
  totalPrice: number;
  paymentMethod: "Credit Card" | "Cash" | "Bank Transfer";
  status: "Confirmed" | "Cancelled" | "Pending" | "Used";
  bookingTime: string;
  ticketCode: string;
}

interface EditTicketModalProps {
  ticket: TicketData;
  onClose: () => void;
  onSave: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSeatsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: { [key: string]: string };
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({
  ticket,
  onClose,
  onSave,
  onChange,
  onSeatsChange,
  errors,
}) => {
  // ✨ HANDLE CLOSE với unsaved changes check (có thể bỏ)
  const handleClose = () => {
    // ❌ BỎ: Unsaved changes confirmation
    onClose();
  };

  // ✨ HANDLE SAVE với validation check
  const handleSave = () => {
    // Check if there are validation errors
    if (Object.keys(errors).length > 0) {
      // ✅ VALIDATION ERROR NOTIFICATION
      notify.warning("Please fix all validation errors before saving");
      return;
    }

    // ✅ Call parent save function (sẽ có loading notification ở parent)
    onSave();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Ticket</h2>
          <button
            onClick={handleClose}
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
                <label className="text-sm font-medium text-gray-500">
                  Ticket Code
                </label>
                <input
                  type="text"
                  value={ticket.ticketCode}
                  disabled
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Movie Title
                </label>
                <input
                  type="text"
                  value={ticket.movieTitle}
                  disabled
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={ticket.date}
                  onChange={onChange}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <p className="text-xs text-red-500 mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Showtime
                </label>
                <input
                  type="time"
                  name="showtime"
                  value={ticket.showtime}
                  onChange={onChange}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.showtime ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.showtime && (
                  <p className="text-xs text-red-500 mt-1">{errors.showtime}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Room
                </label>
                <input
                  type="number"
                  name="room"
                  value={ticket.room}
                  onChange={onChange}
                  min="1"
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.room ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.room && (
                  <p className="text-xs text-red-500 mt-1">{errors.room}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Seats (comma-separated, e.g., A1,A2)
                </label>
                <input
                  type="text"
                  value={ticket.seats.join(", ")}
                  onChange={onSeatsChange}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.seats ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., A1, A2, A3"
                />
                {errors.seats && (
                  <p className="text-xs text-red-500 mt-1">{errors.seats}</p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Customer Name
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={ticket.customerName}
                  onChange={onChange}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.customerName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.customerName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.customerName}
                  </p>
                )}
              </div>



              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Price (VNĐ)
                </label>
                <input
                  type="number"
                  name="totalPrice"
                  value={ticket.totalPrice}
                  onChange={onChange}
                  min="0"
                  step="1000"
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.totalPrice ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., 100000"
                />
                {errors.totalPrice && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.totalPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={ticket.paymentMethod}
                  onChange={onChange}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.paymentMethod ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                {errors.paymentMethod && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.paymentMethod}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <select
                  name="status"
                  value={ticket.status}
                  onChange={onChange}
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.status ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Used">Used</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-red-500 mt-1">{errors.status}</p>
                )}
              </div>

              {/* ✨ INFO về ticket */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="text-blue-700 text-sm">
                  <p className="font-medium">Ticket Information:</p>
                  <p className="text-xs mt-1">
                    • Ticket Code: {ticket.ticketCode}
                  </p>
                  <p className="text-xs">
                    • Booked:{" "}
                    {new Date(ticket.bookingTime).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                Object.keys(errors).length > 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
              disabled={Object.keys(errors).length > 0}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTicketModal;
