import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MainLayout } from "../../../layouts/Layout";
import { Button } from "../../../components/ui/button";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  CreditCard,
  Smartphone,
} from "lucide-react";
import { notify } from "../../../lib/toast";

interface PaymentResult {
  status: string | null;
  message: string;
  bookingId: string | null;
  transactionId: string | null;
  amount: string | null;
  paymentMethod: string | null;
  reason: string | null;
  responseCode: string | null;
  resultCode: string | null;
  bankCode: string | null;
  payDate: string | null;
  payType: string | null;
  responseTime: string | null;
}

// VNPay error codes mapping
const vnpayErrorMessages: Record<string, string> = {
  "07": "Payment successful but transaction is suspicious (related to fraud, unusual transaction).",
  "09": "Card/Account has not registered for InternetBanking service",
  "10": "Card/Account information authentication failed more than 3 times",
  "11": "Payment timeout expired",
  "12": "Card/Account is locked",
  "13": "Incorrect transaction authentication password (OTP)",
  "24": "Customer cancelled transaction",
  "51": "Account has insufficient balance",
  "65": "Exceeded daily transaction limit",
  "75": "Payment bank is under maintenance",
  "79": "Entered wrong payment password too many times",
};

// MoMo error codes mapping
const momoErrorMessages: Record<string, string> = {
  "1000": "Transaction initiated, waiting for user payment confirmation",
  "1001": "Transaction successful but not completed",
  "1002": "Transaction failed",
  "1003": "Transaction cancelled",
  "1004": "Transaction rejected",
  "1005": "Transaction not found",
  "1006": "Transaction error",
  "2001": "Invalid parameters",
  "2007": "Insufficient funds for payment",
  "4001": "Transaction amount exceeds allowed limit",
  "4100": "Transaction rejected by user",
};

export default function OrderPayment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Format currency to VND
  const formatCurrency = (amount: string | null): string => {
    if (!amount) return "0 ₫";
    const numAmount = parseInt(amount);
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numAmount);
  };

  // Format date from VNPay format (YYYYMMDDHHmmss)
  const formatPayDate = (payDate: string | null): string => {
    if (!payDate || payDate.length !== 14) return "";
    const year = payDate.substring(0, 4);
    const month = payDate.substring(4, 6);
    const day = payDate.substring(6, 8);
    const hour = payDate.substring(8, 10);
    const minute = payDate.substring(10, 12);
    const second = payDate.substring(12, 14);
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };

  // Format MoMo response time
  const formatResponseTime = (responseTime: string | null): string => {
    if (!responseTime) return "";
    const timestamp = parseInt(responseTime);
    return new Date(timestamp).toLocaleString("en-US");
  };

  // Get error message based on payment method and error code
  const getErrorMessage = (
    paymentMethod: string | null,
    errorCode: string | null
  ): string => {
    if (!errorCode) return "";

    if (paymentMethod === "vnpay") {
      return vnpayErrorMessages[errorCode] || `VNPay Error: ${errorCode}`;
    } else if (paymentMethod === "momo") {
      return momoErrorMessages[errorCode] || `MoMo Error: ${errorCode}`;
    }

    return `Error: ${errorCode}`;
  };

  const handleTrasaction = (payment: PaymentResult) => {
    // Navigate to profile page with redeem tab active
    navigate("/profile", {
      state: {
        tab: "history",
        selectedEgift: payment, // Pass the selected egift data
      },
    });
  };

  useEffect(() => {
    // Parse URL parameters
    const result: PaymentResult = {
      status: searchParams.get("status"),
      message: decodeURIComponent(searchParams.get("message") || ""),
      bookingId: searchParams.get("bookingId"),
      transactionId: searchParams.get("transactionId"),
      amount: searchParams.get("amount"),
      paymentMethod: searchParams.get("paymentMethod"),
      reason: searchParams.get("reason"),
      responseCode: searchParams.get("responseCode"),
      resultCode: searchParams.get("resultCode"),
      bankCode: searchParams.get("bankCode"),
      payDate: searchParams.get("payDate"),
      payType: searchParams.get("payType"),
      responseTime: searchParams.get("responseTime"),
    };

    setPaymentResult(result);
    setIsLoading(false);

    // Show toast notifications
    if (result.status === "success") {
      notify.success(`✅ ${result.message}`);
    } else if (result.status === "failed") {
      const errorCode = result.responseCode || result.resultCode;
      const errorMessage = getErrorMessage(result.paymentMethod, errorCode);
      notify.error(
        `❌ ${result.message}${errorMessage ? ` - ${errorMessage}` : ""}`
      );
    }

    // Log payment result for debugging
    console.log("Payment Result:", result);
  }, [searchParams]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing payment result...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!paymentResult) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Payment information not found
            </h2>
            <p className="text-gray-600 mb-6">
              Please try again or contact support.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isSuccess = paymentResult.status === "success";
  const PaymentIcon =
    paymentResult.paymentMethod === "momo" ? Smartphone : CreditCard;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 sticky top-0 z-20 mt-16 sm:mt-10">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="p-2"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">
                Payment Result
              </h1>
              <p className="text-sm text-gray-500">
                {paymentResult.paymentMethod?.toUpperCase()} Payment Result
              </p>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
              {/* Status Icon and Message */}
              <div className="text-center mb-8">
                {isSuccess ? (
                  <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                ) : (
                  <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                )}

                <h2
                  className={`text-2xl sm:text-3xl font-bold mb-2 ${
                    isSuccess ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isSuccess ? "Payment Successful!" : "Payment Failed!"}
                </h2>

                {/* Error details for failed payments */}
                {!isSuccess &&
                  (paymentResult.responseCode || paymentResult.resultCode) && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                      <p className="text-red-800 text-sm">
                        {getErrorMessage(
                          paymentResult.paymentMethod,
                          paymentResult.responseCode || paymentResult.resultCode
                        )}
                      </p>
                    </div>
                  )}
              </div>

              {/* Payment Details */}
              {isSuccess && (
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Transaction Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {paymentResult.bookingId && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">ID:</span>
                        <span className="font-medium text-gray-900">
                          {paymentResult.bookingId}
                        </span>
                      </div>
                    )}

                    {paymentResult.transactionId && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="font-medium text-gray-900">
                          {paymentResult.transactionId}
                        </span>
                      </div>
                    )}

                    {paymentResult.amount && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(paymentResult.amount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-gray-600">Payment Method:</span>
                      <div className="flex items-center gap-2">
                        <PaymentIcon className="w-4 h-4" />
                        <span className="font-medium text-gray-900">
                          {paymentResult.paymentMethod?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* VNPay specific details */}
                    {paymentResult.paymentMethod === "vnpay" && (
                      <>
                        {paymentResult.bankCode && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-600">Bank:</span>
                            <span className="font-medium text-gray-900">
                              {paymentResult.bankCode}
                            </span>
                          </div>
                        )}

                        {paymentResult.payDate && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-600">Payment Time:</span>
                            <span className="font-medium text-gray-900">
                              {formatPayDate(paymentResult.payDate)}
                            </span>
                          </div>
                        )}
                      </>
                    )}

                    {/* MoMo specific details */}
                    {paymentResult.paymentMethod === "momo" && (
                      <>
                        {paymentResult.payType && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-600">Payment Type:</span>
                            <span className="font-medium text-gray-900">
                              {paymentResult.payType.toUpperCase()}
                            </span>
                          </div>
                        )}

                        {paymentResult.responseTime && (
                          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <span className="text-gray-600">Payment Time:</span>
                            <span className="font-medium text-gray-900">
                              {formatResponseTime(paymentResult.responseTime)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {isSuccess ? (
                  <>
                    <Button
                      onClick={() => navigate("/")}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Back to Home
                    </Button>
                    <Button
                      onClick={() => handleTrasaction(paymentResult)}
                      variant="outline"
                      className="flex-1"
                    >
                      View My Bookings
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate(-1)}
                      variant="outline"
                      className="flex-1"
                    >
                      Try Again
                    </Button>
                    <Button
                      onClick={() => navigate("/")}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Back to Home
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
