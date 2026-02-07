import React from "react";
import { User, Calculator, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { Movie } from "./movie-show";
import type { WatercornApiResponse } from "../../../types/watercorn";
import { promotionService } from "../../../services/api/promotionService";

// Define Showtime type locally since it's not exported from movie-show
type Showtime = {
  time: string;
  room: string;
  date: string;
  format: string;
};

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

const Input: React.FC<{
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ className = "", ...props }) => (
  <input
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Label: React.FC<{
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
}> = ({ children, htmlFor, className = "" }) => (
  <label
    htmlFor={htmlFor}
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
  >
    {children}
  </label>
);

const Separator: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`border-b border-gray-200 ${className}`} />
);

// Type definitions
export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  promotionCode: string;
};

export type PricingInfo = {
  subtotal: number;
  tax: number; // Always 0 - tax calculation removed
  promotionDiscount: number;
  total: number;
};

interface CustomerInformationProps {
  customerInfo: CustomerInfo;
  selectedMovie: Movie | undefined;
  selectedShowtime: Showtime | undefined;
  selectedSeats: string[];
  selectedConcessions: { product: WatercornApiResponse; quantity: number }[];
  pricing: PricingInfo;
  onCustomerInfoChange: (info: CustomerInfo) => void;
  onPromotionValidation?: (validation: {
    isValid: boolean | null;
    discount: number;
    message: string;
  }) => void;
  onNextStep?: () => void;
  onPreviousStep?: () => void;
}

export default function CustomerInformation({
  customerInfo,
  selectedMovie,
  selectedShowtime,
  selectedSeats,
  selectedConcessions,
  pricing,
  onCustomerInfoChange,
  onPromotionValidation,
  onNextStep,
  onPreviousStep,
}: CustomerInformationProps) {
  // Helper function to get movie title
  const getMovieTitle = (movie: Movie | undefined): string => {
    if (!movie) return 'Unknown';
    
    // Try Vietnamese version name first
    if (movie.versionMovieVn) {
      return movie.versionMovieVn;
    }
    
    // Try English version name
    if (movie.versionMovieEnglish) {
      return movie.versionMovieEnglish;
    }
    
    // Fallback to ID
    return movie._id || 'Unknown';
  };
  // State for promotion validation
  const [promotionValidation, setPromotionValidation] = React.useState<{
    isValid: boolean | null;
    message: string;
    discount: number;
    loading: boolean;
  }>({
    isValid: null,
    message: "",
    discount: 0,
    loading: false,
  });

  // State for email validation
  const [emailValidation, setEmailValidation] = React.useState<{
    isValid: boolean | null;
    message: string;
  }>({
    isValid: null,
    message: "",
  });

  const handleInputChange = (
    field: keyof CustomerInfo,
    value: string | boolean
  ) => {
    onCustomerInfoChange({
      ...customerInfo,
      [field]: value,
    });

    // Validate email when it changes
    if (field === "email") {
      validateEmail(value as string);
    }
  };

  // Email validation function
  const validateEmail = (email: string) => {
    if (!email.trim()) {
      setEmailValidation({
        isValid: null,
        message: "",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const gmailRegex = /^[^\s@]+@gmail\.com$/;

    if (!emailRegex.test(email)) {
      setEmailValidation({
        isValid: false,
        message: "Email must contain @ symbol and valid domain",
      });
    } else if (!gmailRegex.test(email)) {
      setEmailValidation({
        isValid: false,
        message: "Please use a Gmail address (@gmail.com)",
      });
    } else {
      setEmailValidation({
        isValid: true,
        message: "Valid Gmail address",
      });
    }
  };

  // Validate promotion code when it changes
  const validatePromotionCode = React.useCallback(async (code: string) => {
    if (!code.trim()) {
      setPromotionValidation({
        isValid: null,
        message: "",
        discount: 0,
        loading: false,
      });
      return;
    }

    setPromotionValidation(prev => ({ ...prev, loading: true }));

    try {
      console.log("Validating promotion code:", code.toUpperCase());
      console.log("Subtotal amount:", pricing.subtotal);
      
      const response = await promotionService.validatePromotionCode(
        code.toUpperCase(),
        pricing.subtotal
      );

      console.log("Promotion validation response:", response);

      if (response.success) {
        setPromotionValidation({
          isValid: true,
          message: `Valid promotion! Discount: ${response.data.discount.toLocaleString()} VND`,
          discount: response.data.discount,
          loading: false,
        });
      } else {
        setPromotionValidation({
          isValid: false,
          message: response.message || "Invalid promotion code",
          discount: 0,
          loading: false,
        });
      }
    } catch (error: any) {
      console.error("Promotion validation error:", error);
      const errorMessage = promotionService.handleError(error);
      setPromotionValidation({
        isValid: false,
        message: errorMessage,
        discount: 0,
        loading: false,
      });
    }
  }, [pricing.subtotal]);

  // Debounced validation
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      validatePromotionCode(customerInfo.promotionCode);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [customerInfo.promotionCode, validatePromotionCode]);

  // Call parent callback when validation changes
  React.useEffect(() => {
    if (onPromotionValidation) {
      onPromotionValidation(promotionValidation);
    }
  }, [promotionValidation, onPromotionValidation]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Customer Information Card - Optimized */}
      <Card className="border-gray-200 h-fit">
        <CardHeader className="px-6 py-4 pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <User className="h-5 w-5" />
            <span>Customer Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-0 space-y-4">
          <div>
            <Label htmlFor="customer-name">Full Name *</Label>
            <Input
              id="customer-name"
              placeholder="Enter customer full name"
              value={customerInfo.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="customer-phone">Phone Number *</Label>
            <Input
              id="customer-phone"
              placeholder="Enter phone number"
              value={customerInfo.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="customer-email">Email Address</Label>
            <div className="relative">
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter Gmail address (optional)"
                value={customerInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={emailValidation.isValid === true ? "border-green-500" : 
                          emailValidation.isValid === false ? "border-red-500" : ""}
              />
              {emailValidation.isValid === true && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {emailValidation.isValid === false && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            
            {/* Email Validation Message */}
            {emailValidation.message && (
              <div className={`text-xs mt-1 ${
                emailValidation.isValid === true ? "text-green-600" : 
                emailValidation.isValid === false ? "text-red-600" : 
                "text-gray-500"
              }`}>
                {emailValidation.message}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <Label htmlFor="promotion-code">Promotion Code</Label>
            <div className="relative">
              <Input
                id="promotion-code"
                placeholder="Enter promotion code for discount (optional)"
                value={customerInfo.promotionCode}
                onChange={(e) =>
                  handleInputChange("promotionCode", e.target.value)
                }
                className={promotionValidation.isValid === true ? "border-green-500" : 
                          promotionValidation.isValid === false ? "border-red-500" : ""}
              />
              {promotionValidation.loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              {promotionValidation.isValid === true && !promotionValidation.loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              )}
              {promotionValidation.isValid === false && !promotionValidation.loading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <XCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            
            {/* Validation Message */}
            {promotionValidation.message && (
              <div className={`text-xs mt-1 ${
                promotionValidation.isValid === true ? "text-green-600" : 
                promotionValidation.isValid === false ? "text-red-600" : 
                "text-gray-500"
              }`}>
                {promotionValidation.message}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              Enter a valid promotion code from our database
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg w-96 h-fit sticky top-4">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-violet-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              Booking Summary
            </h3>
          </div>
          
          <div className="p-6 space-y-5">
            {selectedMovie && (
              <div className="flex items-start space-x-4">
                <div className="w-20 h-24 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg overflow-hidden flex-shrink-0 border border-purple-200 shadow-sm">
                  {selectedMovie.largeImage || selectedMovie.smallImage ? (
                    <img 
                      src={selectedMovie.largeImage || selectedMovie.smallImage} 
                      alt={selectedMovie.versionMovieEnglish || selectedMovie.versionMovieVn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                      <span className="text-xs text-purple-600 font-medium">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-lg leading-tight truncate mb-1">
                    {selectedMovie.versionMovieEnglish || selectedMovie.versionMovieVn}
                  </h4>
                  <p className="text-sm text-gray-600 font-medium">{selectedMovie.duration} min</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {selectedMovie.rating}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {selectedShowtime && (
              <div className="pt-4 border-t border-gray-100">
                <div className="space-y-3">
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
                    <span className="font-semibold text-gray-900">{selectedShowtime.room}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                      Date:
                    </span>
                    <span className="font-semibold text-gray-900">{selectedShowtime.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600 flex items-center">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
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

            {selectedConcessions.length > 0 && (
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-700">Selected Concessions</span>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {selectedConcessions.length} items
                  </span>
                </div>
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
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold text-gray-900">{pricing.subtotal.toLocaleString()} VND</span>
                </div>

                {/* Member Discount */}
                {/* Removed Member Discount */}

                {/* Promotion Discount */}
                {customerInfo.promotionCode && pricing.promotionDiscount > 0 && (
                  <div className="flex justify-between text-base text-green-600">
                    <span>Promotion ({customerInfo.promotionCode}):</span>
                    <span className="font-semibold">-{pricing.promotionDiscount.toLocaleString()} VND</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    {pricing.total.toLocaleString()} VND
                  </span>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-3 space-y-2">
              <button
                onClick={onPreviousStep}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                ← Back to Concessions
              </button>
              <button
                onClick={onNextStep}
                disabled={!customerInfo.name || !customerInfo.phone}
                className="w-full px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Continue to Payment →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}