import React from "react";
import {
  CheckCircle,
  X,
  FileText,
  DollarSign,
  Film,
  Ticket,
  Popcorn,
  User,
  CreditCard,
} from "lucide-react";

interface SuccessData {
  bookingId: string;
  totalAmount: number;
  movieTitle: string;
  moviePoster?: string;
  seats: string;
  concessionsCount: number;
  customerName: string;
  showtime?: string;
  room?: string;
  date?: string;
}

interface SuccessNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  successData: SuccessData | null;
}

export default function SuccessNotificationModal({
  isOpen,
  onClose,
  successData,
}: SuccessNotificationModalProps) {
  if (!isOpen || !successData) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white text-gray-900 rounded-3xl max-w-sm w-full shadow-2xl border-0 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Background */}
        <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 p-8 text-center relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-green-100 rounded-full -translate-x-16 -translate-y-16 opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-blue-100 rounded-full translate-x-12 translate-y-12 opacity-30"></div>
          
          {/* Success Icon with Animation */}
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mb-6 shadow-lg animate-pulse">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
          
          {/* Success Message */}
          <div className="relative z-10">
            <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
              Sale Confirmed!
            </h3>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Your booking has been processed successfully
            </p>
          </div>

          {/* Done Button */}
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 