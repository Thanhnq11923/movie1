"use client";

import { Calendar, Coins, TrendingUp, Gift, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lastActivity: string;
  joinDate: string;
}

interface ViewPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

// Không dùng sampleTransactionHistory nữa

interface RedeemHistoryItem {
  _id: string;
  egift: {
    title: string;
  };
  points: number;
  exchangedAt: string;
}

const getTransactionColor = (type: string) => {
  switch (type) {
    case "Earned":
      return "bg-green-100 text-green-800";
    case "Redeemed":
      return "bg-blue-100 text-blue-800";
    case "Expired":
      return "bg-red-100 text-red-800";
    case "Adjusted":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

export function ViewPointsModal({
  isOpen,
  onClose,
  customer,
}: ViewPointsModalProps) {
  const [history, setHistory] = useState<RedeemHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer || !isOpen) return;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        // Lấy lịch sử redeem của user theo id động
        const res = await axios.get(
          `http://localhost:3000/api/users/${customer.id}/point-history`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data.data || res.data;
        // Lọc chỉ các giao dịch redeem (points < 0)
        const redeemHistory = Array.isArray(data)
          ? data.filter((item: any) => item.points < 0 && item.egift && item.egift.title)
          : [];
        setHistory(redeemHistory);
      } catch (err: any) {
        setError("Không thể tải lịch sử đổi điểm");
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [customer, isOpen]);

  if (!customer || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative mx-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Points Details
          </h2>
          <p className="text-gray-600">
            View detailed points information and transaction history
          </p>
        </div>

        <div className="space-y-6">
          {/* Customer Info Header */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {customer.avatar ? (
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-700 text-xl font-semibold">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {customer.name}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member since {formatDate(customer.joinDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Points Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Total Points Earned
                </h4>
                <Coins className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                {customer.totalPoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Available Points
                </h4>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-600">
                {customer.availablePoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">Ready to redeem</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-600">
                  Points Redeemed
                </h4>
                <Gift className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {customer.usedPoints.toLocaleString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">Total redeemed</p>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="border-b border-gray-200 p-4">
              <h4 className="text-xl font-semibold text-gray-900">
                Redeem History
              </h4>
              <p className="text-gray-600">Recent redeem activity</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-Gift
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-500">Loading redeem history...</p>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-red-500">{error}</td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-8 text-gray-500">No redeem history found.</td>
                    </tr>
                  ) : (
                    history.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.egift?.title || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                          {item.points}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(item.exchangedAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            {/* <div className="flex gap-3">
              <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Adjust Points
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Send Message
              </button>
            </div> */}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-colors ml-218"
            >
              Close
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default ViewPointsModal;
