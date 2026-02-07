import React from "react";

import type { Movie } from "./movie-show";
import type { CustomerInfo, PricingInfo } from "./customer-information";
import type { WatercornApiResponse } from "../../../types/watercorn";

// Custom Components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
  >
    {children}
  </h3>
);

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  onClick,
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};



const Separator: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`border-b border-gray-200 ${className}`} />
);

// Type definitions
export type PaymentMethod = {
  id: string;
  name: string;
  icon: string;
};

interface PaymentConfirmationProps {
  paymentMethods: PaymentMethod[];
  paymentMethod: string;
  customerInfo: CustomerInfo;
  selectedMovie: Movie | undefined;
  selectedShowtime: { time: string; room: string; date: string; format: string } | undefined;
  selectedSeats: string[];
  selectedConcessions: { product: WatercornApiResponse; quantity: number }[];
  pricing: PricingInfo;
  onPaymentMethodSelect: (methodId: string) => void;
  onPrintTicket: () => void;
  onConfirmSale: () => void;
  isProcessing?: boolean;
}

export default function PaymentConfirmation({
  customerInfo,
  selectedMovie,
  selectedShowtime,
  selectedSeats,
  selectedConcessions,
  pricing,
  onPrintTicket,
  onConfirmSale,
  isProcessing = false,
}: PaymentConfirmationProps) {
  const getMovieTitle = (movie: Movie | undefined): string => {
    if (!movie) return 'Unknown';
    return movie.versionMovieVn || movie.versionMovieEnglish || movie._id || 'Unknown';
  };

  return (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Payment & Customer Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Method */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Payment Method</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-lg">💵</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">Cash Payment</h4>
                      <p className="text-sm text-green-600">Payment will be collected in cash</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Customer Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Name:</span>
                  <span className="font-semibold text-gray-900">{customerInfo.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Phone:</span>
                  <span className="font-semibold text-gray-900">{customerInfo.phone}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="font-semibold text-gray-900">{customerInfo.email || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Movie & Showtime */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Movie & Showtime</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-20 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg overflow-hidden flex-shrink-0 border border-purple-200 shadow-sm">
                    {selectedMovie?.largeImage || selectedMovie?.smallImage ? (
                      <img 
                        src={selectedMovie.largeImage || selectedMovie.smallImage} 
                        alt={getMovieTitle(selectedMovie)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                        <span className="text-xs text-purple-600 font-medium">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-base leading-tight mb-2">
                      {getMovieTitle(selectedMovie)}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold ml-1">{selectedMovie?.duration} min</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Genre:</span>
                        <span className="font-semibold ml-1">{selectedMovie?.genre}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-semibold ml-1">{selectedMovie?.rating}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Seats:</span>
                        <span className="font-semibold ml-1">{selectedSeats.length}</span>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Showtime:</span>
                        <span className="font-semibold">{selectedShowtime?.time} - {selectedShowtime?.room}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-semibold">{selectedShowtime?.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-semibold">{selectedShowtime?.format}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-700">Selected Seats</span>
                    <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {selectedSeats.length} seats
                    </span>
                  </div>
                  {selectedSeats.length > 0 ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-lg border border-blue-100">
                      <div className="flex flex-wrap gap-1.5 items-start">
                        {selectedSeats.map((seat) => (
                          <span
                            key={seat}
                            className="inline-flex px-2.5 py-0.5 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200 whitespace-nowrap"
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500">No seats selected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-xl">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Final Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Movie Details */}
                {selectedMovie && (
                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                    <div className="w-16 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg overflow-hidden flex-shrink-0 border border-orange-200 shadow-sm">
                      {selectedMovie.largeImage || selectedMovie.smallImage ? (
                        <img 
                          src={selectedMovie.largeImage || selectedMovie.smallImage} 
                          alt={getMovieTitle(selectedMovie)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                          <span className="text-xs text-orange-600 font-medium">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-base leading-tight mb-1">
                        {getMovieTitle(selectedMovie)}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold ml-1">{selectedMovie.duration} min</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Genre:</span>
                          <span className="font-semibold ml-1">{selectedMovie.genre}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rating:</span>
                          <span className="font-semibold ml-1">{selectedMovie.rating}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Seats:</span>
                          <span className="font-semibold ml-1">{selectedSeats.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seats Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-blue-800 text-sm">Selected Seats</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full ml-auto">
                      {selectedSeats.length} seats
                    </span>
                  </div>
                  {selectedSeats.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 items-start">
                      {selectedSeats.map((seat) => (
                        <span
                          key={seat}
                          className="inline-flex px-2.5 py-0.5 text-sm font-semibold bg-blue-100 text-blue-800 rounded-full border border-blue-200 whitespace-nowrap"
                        >
                          {seat}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500">No seats selected</p>
                    </div>
                  )}
                </div>

                {/* Concessions Section */}
                {selectedConcessions.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-semibold text-green-800 text-sm">Concessions</span>
                    </div>
                    <div className="space-y-1">
                      {selectedConcessions.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">
                            {item.product.name} x{item.quantity}
                          </span>
                          <span className="font-semibold text-green-700">
                            {(item.product.price * item.quantity).toLocaleString()} VND
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-semibold border-t border-green-200 pt-1 mt-1">
                        <span className="text-green-800 text-sm">Concessions Total:</span>
                        <span className="text-green-700 text-sm">
                          {selectedConcessions.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString()} VND
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Breakdown */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-blue-800 text-sm">Pricing Breakdown</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-900">{pricing.subtotal.toLocaleString()} VND</span>
                    </div>
                    
                    {pricing.memberDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Member Discount:</span>
                        <span className="font-semibold">-{pricing.memberDiscount.toLocaleString()} VND</span>
                      </div>
                    )}
                    
                    {pricing.promotionDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Promotion Discount:</span>
                        <span className="font-semibold">-{pricing.promotionDiscount.toLocaleString()} VND</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between text-base font-bold border-t border-blue-200 pt-1 mt-1">
                      <span className="text-blue-800">Total:</span>
                      <span className="text-green-600">{pricing.total.toLocaleString()} VND</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={onPrintTicket}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <span>🖨️</span>
                        <span>Print Ticket</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={onConfirmSale}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <>
                        <span>✅</span>
                        <span>Confirm Sale</span>
                      </>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
     
  );
}
