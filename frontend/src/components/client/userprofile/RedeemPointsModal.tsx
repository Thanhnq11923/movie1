import { useState, useEffect } from "react";
import { X, Coins } from "lucide-react";
import axios from "axios";

interface RedeemPointsModalProps {
  onClose: () => void;
}

interface EgiftItem {
  _id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  status: "active" | "inactive";
}

export function RedeemPointsModal({ onClose }: RedeemPointsModalProps) {
  const [selectedEgift, setSelectedEgift] = useState<string>("");
  const [egiftItems, setEgiftItems] = useState<EgiftItem[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");

        // Fetch user points
        const userResponse = await axios.get(
          "http://localhost:3000/api/users/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = userResponse.data.data || userResponse.data;
        setUserPoints(userData.member?.score || 0);

        // Fetch egift items
        const egiftResponse = await axios.get(
          "http://localhost:3000/api/users/egifts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const egiftData = egiftResponse.data.data || egiftResponse.data;
        setEgiftItems(egiftData);

        setError(null);
      } catch (err: unknown) {
        console.error("Error fetching data:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRedeem = async () => {
    if (!selectedEgift) return;

    const selectedItem = egiftItems.find((item) => item._id === selectedEgift);
    if (!selectedItem || userPoints < selectedItem.points) return;

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3000/api/users/exchange-egift",
        { points: selectedItem.points, egiftType: selectedEgift },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(
        `Redeemed egift ${selectedEgift} for ${selectedItem.points} points`
      );

      // Refresh user points
      const userResponse = await axios.get(
        "http://localhost:3000/api/users/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userData = userResponse.data.data || userResponse.data;
      setUserPoints(userData.member?.score || 0);

      // Close modal after redemption
      setTimeout(() => onClose(), 1000);
    } catch (err: unknown) {
      console.error("Error redeeming egift:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to redeem egift";
      setError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
          <p className="text-red-500 text-center mb-4">Error: {error}</p>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <Coins className="w-6 h-6 text-yellow-600" />
          <h2 className="text-xl font-semibold">Redeem Points</h2>
        </div>

        <div className="mb-6">
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {userPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Available Points</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Reward
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEgift}
            onChange={(e) => setSelectedEgift(e.target.value)}
          >
            <option value="">Select a reward</option>
            {egiftItems.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name} ({item.points} points)
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRedeem}
            disabled={
              !selectedEgift ||
              userPoints <
                (egiftItems.find((item) => item._id === selectedEgift)
                  ?.points || 0)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Redeem Points
          </button>
        </div>
      </div>
    </div>
  );
}
