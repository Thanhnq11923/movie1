import React from "react";
import { CheckCircle, Star, Gift } from "lucide-react";
import { Button } from "../../ui/button";

interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  pointsEarned: number;
  newTotalPoints: number;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  amount,
  paymentMethod,
  pointsEarned,
  newTotalPoints,
}) => {
  if (!isOpen) return null;

  const formatVND = (amount: number) => amount.toLocaleString("vi-VN") + " ₫";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
          Thanh toán thành công!
        </h2>

        {/* Booking Info */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Mã đặt vé:</span>
            <span className="font-semibold text-gray-900">{bookingId}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Số tiền:</span>
            <span className="font-semibold text-green-600">
              {formatVND(amount)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Phương thức:</span>
            <span className="font-semibold text-gray-900 capitalize">
              {paymentMethod}
            </span>
          </div>
        </div>

        {/* Points Reward */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-green-700">
              Chúc mừng! Bạn đã nhận được điểm thưởng
            </span>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Gift className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-lg font-bold text-green-600">
                +{pointsEarned} điểm
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Tổng điểm hiện tại: <span className="font-semibold">{newTotalPoints} điểm</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <Button
            onClick={() => window.location.href = "/"}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Về trang chủ
          </Button>
          
          <Button
            onClick={() => window.location.href = "/profile"}
            variant="outline"
            className="w-full"
          >
            Xem hồ sơ & điểm
          </Button>
          
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full text-gray-500"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}; 