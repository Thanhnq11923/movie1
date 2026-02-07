import React from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../../layouts/Layout";
import { Button } from "../../../components/ui/button";

export default function PaymentTestPage() {
  const navigate = useNavigate();

  const testScenarios = [
    {
      title: "VNPay Success",
      description: "VNPay payment successful",
      url: "/order-payment?status=success&message=Payment%20successful&bookingId=64d123456789abcdef654321&transactionId=13731599&amount=120000&bankCode=NCB&payDate=20250803214636&paymentMethod=vnpay",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "VNPay Failed",
      description: "VNPay payment failed - Customer cancelled",
      url: "/order-payment?status=failed&message=Transaction%20failed%3A%20Customer%20cancelled%20transaction&bookingId=64d123456789abcdef654321&reason=payment_failed&responseCode=24&transactionId=13731600&paymentMethod=vnpay",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "VNPay Failed - Insufficient Balance",
      description: "VNPay payment failed - Insufficient balance",
      url: "/order-payment?status=failed&message=Transaction%20failed&bookingId=64d123456789abcdef654321&reason=payment_failed&responseCode=51&transactionId=13731601&paymentMethod=vnpay",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "MoMo Success",
      description: "MoMo payment successful",
      url: "/order-payment?status=success&message=Payment%20successful&bookingId=64d123456789abcdef654321&transactionId=2758071234&amount=120000&payType=qr&responseTime=1704067300000&paymentMethod=momo",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "MoMo Failed",
      description: "MoMo payment failed - User rejected",
      url: "/order-payment?status=failed&message=Transaction%20rejected%20by%20user&bookingId=64d123456789abcdef654321&reason=payment_failed&resultCode=4100&transactionId=2758071235&paymentMethod=momo",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "MoMo Failed - Insufficient Balance",
      description: "MoMo payment failed - Insufficient funds",
      url: "/order-payment?status=failed&message=Transaction%20failed&bookingId=64d123456789abcdef654321&reason=payment_failed&resultCode=2007&transactionId=2758071236&paymentMethod=momo",
      color: "bg-red-500 hover:bg-red-600",
    },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm py-4 sticky top-0 z-20 mt-16 sm:mt-20">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">
                Payment Test Page
              </h1>
              <p className="text-sm text-gray-500">
                Test different payment scenarios for VNPay and MoMo
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
              <p className="text-gray-600 mb-6">
                Click on any scenario below to test the OrderPayment page with
                different URL parameters. Each scenario will show different
                toast notifications and payment result displays.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testScenarios.map((scenario, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-lg mb-2">
                      {scenario.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {scenario.description}
                    </p>
                    <Button
                      onClick={() => navigate(scenario.url)}
                      className={`w-full text-white ${scenario.color}`}
                    >
                      Test {scenario.title}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                URL Structure Examples
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-green-600 mb-2">
                    ✅ Success URL (VNPay)
                  </h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    /order-payment?status=success&message=Payment%20successful&bookingId=64d123456789abcdef654321&transactionId=13731599&amount=120000&bankCode=NCB&payDate=20250803214636&paymentMethod=vnpay
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-pink-600 mb-2">
                    ✅ Success URL (MoMo)
                  </h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    /order-payment?status=success&message=Payment%20successful&bookingId=64d123456789abcdef654321&transactionId=2758071234&amount=120000&payType=qr&responseTime=1704067300000&paymentMethod=momo
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-red-600 mb-2">
                    ❌ Failed URL (VNPay)
                  </h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    /order-payment?status=failed&message=Transaction%20failed&bookingId=64d123456789abcdef654321&reason=payment_failed&responseCode=24&transactionId=13731600&paymentMethod=vnpay
                  </code>
                </div>

                <div>
                  <h3 className="font-medium text-red-600 mb-2">
                    ❌ Failed URL (MoMo)
                  </h3>
                  <code className="block bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                    /order-payment?status=failed&message=Transaction%20rejected&bookingId=64d123456789abcdef654321&reason=payment_failed&resultCode=4100&transactionId=2758071235&paymentMethod=momo
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
