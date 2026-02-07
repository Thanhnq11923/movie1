import React, { useState, useEffect } from "react";
import { ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import type { Movie } from "./movie-show";
import type { WatercornApiResponse } from "../../../types/watercorn";
import { watercornService } from "../../../services/api/watercornService";

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

interface ConcessionsSelectionProps {
  selectedMovie: Movie | undefined;
  selectedShowtime: {
    id: string;
    movieId: string;
    theaterId: string;
    date: string;
    time: string;
    format: string;
    available: number;
    total: number;
    cinemaRoomId?: string;
  } | undefined;
  selectedSeats: string[];
  selectedConcessions: { product: WatercornApiResponse; quantity: number }[];
  onConcessionToggle: (product: WatercornApiResponse, quantity: number) => void;
  onBack: () => void;
  onContinue: () => void;
  roomName?: string;
  getSeatPrice: (seat: string) => number;
}

export default function ConcessionsSelection({
  selectedMovie,
  selectedShowtime,
  selectedSeats,
  selectedConcessions,
  onConcessionToggle,
  onBack,
  onContinue,
  roomName,
  getSeatPrice,
}: ConcessionsSelectionProps) {
  const [concessions, setConcessions] = useState<WatercornApiResponse[]>([]);
  const [concessionsLoading, setConcessionsLoading] = useState(true);
  const [concessionsError, setConcessionsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConcessions = async () => {
      try {
        setConcessionsLoading(true);
        setConcessionsError(null);
        const response = await watercornService.getAll();
        setConcessions(response);
      } catch (error) {
        console.error("Error fetching concessions:", error);
        setConcessionsError("Failed to load concessions");
      } finally {
        setConcessionsLoading(false);
      }
    };

    fetchConcessions();
  }, []);

  const handleConcessionToggle = (product: WatercornApiResponse, newQuantity: number) => {
    onConcessionToggle(product, newQuantity);
  };

  const calculateSubtotal = () => {
    const seatsTotal = selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0);
    const concessionsTotal = selectedConcessions.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    return seatsTotal + concessionsTotal;
  };

  const categories = Array.from(new Set(concessions.map(p => p.category)));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Concessions Selection */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Available Concessions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {concessionsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-gray-600">Loading concessions...</div>
                </div>
              ) : concessionsError ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-red-600">{concessionsError}</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                        {category}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {concessions
                          .filter(product => product.category === category)
                          .map((product) => {
                            const selectedItem = selectedConcessions.find(
                              (selected) => selected.product._id === product._id
                            );
                            const quantity = selectedItem?.quantity || 0;
                            
                            return (
                              <div
                                key={product._id}
                                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                  quantity > 0
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => handleConcessionToggle(product, quantity + 1)}
                              >
                                                                 <div className="aspect-square bg-gray-100 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                                   {product.image ? (
                                     <img 
                                       src={product.image} 
                                       alt={product.name}
                                       className="w-full h-full object-cover"
                                       onError={(e) => {
                                         const target = e.target as HTMLImageElement;
                                         target.style.display = 'none';
                                         target.nextElementSibling?.classList.remove('hidden');
                                       }}
                                     />
                                   ) : (
                                     <span className="text-xs text-gray-500">No Image</span>
                                   )}
                                 </div>
                                <h4 className="font-medium text-sm text-gray-900 mb-1">
                                  {product.name}
                                </h4>
                                <p className="text-xs text-gray-600 mb-2">
                                  {product.description}
                                </p>
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {product.price.toLocaleString()} VND
                                  </span>
                                </div>
                                
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-center">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (quantity > 0) {
                                          handleConcessionToggle(product, quantity - 1);
                                        }
                                      }}
                                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-medium"
                                      disabled={quantity === 0}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="text-sm font-medium w-8 text-center">
                                      {quantity}
                                    </span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleConcessionToggle(product, quantity + 1);
                                      }}
                                      className="w-6 h-6 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center text-sm font-medium"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-96 h-fit sticky top-4">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                Order Summary
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {selectedMovie && (
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg overflow-hidden flex-shrink-0 border border-green-200 shadow-sm">
                    {selectedMovie.largeImage || selectedMovie.smallImage ? (
                      <img 
                        src={selectedMovie.largeImage || selectedMovie.smallImage} 
                        alt={selectedMovie.versionMovieEnglish || selectedMovie.versionMovieVn}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                        <span className="text-xs text-green-600 font-medium">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-base leading-tight truncate mb-1">
                      {selectedMovie.versionMovieEnglish || selectedMovie.versionMovieVn}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium">{selectedMovie.duration} min</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {selectedMovie.rating}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {selectedShowtime && (
                <div className="pt-3 border-t border-gray-100">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        Time:
                      </span>
                      <span className="font-semibold text-gray-900">{selectedShowtime.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        Room:
                      </span>
                      <span className="font-semibold text-gray-900">{roomName || selectedShowtime.theaterId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 flex items-center">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        Format:
                      </span>
                      <span className="font-semibold text-gray-900">{selectedShowtime.format}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-gray-100">
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
                  <div className="text-center py-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-400 text-lg">🎬</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No seats selected</p>
                    <p className="text-xs text-gray-400 mt-1">Select your preferred seats</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Selected Concessions</span>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {selectedConcessions.length} items
                  </span>
                </div>
                {selectedConcessions.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedConcessions.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg border border-green-100"
                      >
                        <span className="font-semibold text-gray-900 text-sm">{item.product.name} x{item.quantity}</span>
                        <span className="text-green-700 font-bold text-sm">
                          {(item.product.price * item.quantity).toLocaleString()} VND
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-400 text-lg">🍿</span>
                    </div>
                    <p className="text-sm text-gray-500 font-medium">No concessions selected</p>
                    <p className="text-xs text-gray-400 mt-1">Add snacks and drinks</p>
                  </div>
                )}
              </div>

              {(selectedSeats.length > 0 || selectedConcessions.length > 0) && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-base">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      {calculateSubtotal().toLocaleString()} VND
                    </span>
                  </div>
          
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="pt-3 space-y-2">
                <button
                  onClick={onBack}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  ← Back to Seats
                </button>
                <button
                  onClick={onContinue}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Continue to Customer Info →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 