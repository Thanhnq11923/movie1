import React from "react";
import {
  X,
} from "lucide-react";
import type { Movie } from "./movie-show";
import type { CustomerInfo, PricingInfo } from "./customer-information";
import type { WatercornApiResponse } from "../../../types/watercorn";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerInfo: CustomerInfo;
  selectedMovie: Movie | undefined;
  selectedShowtime: { time: string; room: string; date: string; format: string } | undefined;
  selectedSeats: string[];
  selectedConcessions: { product: WatercornApiResponse; quantity: number }[];
  pricing: PricingInfo;
  paymentMethod: string;
  bookingId: string;
}

export default function TicketDetailModal({
  isOpen,
  onClose,
  customerInfo,
  selectedMovie,
  selectedShowtime,
  selectedSeats,
  selectedConcessions,
  pricing,
  paymentMethod,
  bookingId,
}: TicketDetailModalProps) {
  if (!isOpen) return null;

  const getMovieTitle = (movie: Movie | undefined): string => {
    if (!movie) return 'Unknown';
    
    if (movie.versionMovieVn) {
      return movie.versionMovieVn;
    }
    
    if (movie.versionMovieEnglish) {
      return movie.versionMovieEnglish;
    }
    
    return movie._id || 'Unknown';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Print Ticket</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Minimal Ticket Content */}
        <div className="p-4 space-y-4">
          {/* Customer Information */}
          <div className="border-b border-gray-200 pb-3">
            <h3 className="font-semibold text-gray-800 mb-2">Customer Information</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{customerInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span>{customerInfo.phone}</span>
              </div>
              {customerInfo.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span>{customerInfo.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Movie Information */}
          <div className="border-b border-gray-200 pb-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Movie:</span>
                <span className="font-medium">{getMovieTitle(selectedMovie)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Showtime:</span>
                <span>{selectedShowtime?.time} - {selectedShowtime?.room}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span>{selectedShowtime?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span>{selectedShowtime?.format}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duration:</span>
                <span>{selectedMovie?.duration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Seats:</span>
                <span className="font-medium">{selectedSeats.join(", ")}</span>
              </div>
            </div>
          </div>

          {/* Concessions */}
          {selectedConcessions.length > 0 && (
            <div className="border-b border-gray-200 pb-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Concessions:</span>
                  <span>
                    {selectedConcessions.map((item, index) => (
                      <span key={index}>
                        {item.product.name} x{item.quantity}
                        {index < selectedConcessions.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-1 text-sm">
            {/* Tax removed - no longer calculated */}
            {customerInfo.promotionCode && pricing.promotionDiscount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Promotion Discount:</span>
                <span className="text-green-600">-{pricing.promotionDiscount.toLocaleString()} VND</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total Amount:</span>
              <span>{pricing.total.toLocaleString()} VND</span>
            </div>
          </div>

          {/* Booking ID */}
          <div className="text-center pt-3 border-t border-gray-200">
            <span className="text-xs text-gray-500">Booking ID: {bookingId}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
} 