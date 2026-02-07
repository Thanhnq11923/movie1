import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Gift, Calendar, CheckCircle, X } from "lucide-react";
import axios from "axios";

interface EgiftItem {
  _id: string;
  title: string; // Changed from name to title
  description: string;
  points: number;
  category: string;
  status: "active" | "inactive";
  image?: string;
}

interface PointHistoryItem {
  _id: string;
  egift: {
    title: string;
  };
  points: number;
  exchangedAt: string;
}

export default function RedeemPoint() {
  const location = useLocation();
  const [egiftItems, setEgiftItems] = useState<EgiftItem[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const historiesPerPage = 5;

  // Get selected egift from navigation state
  const selectedEgiftFromNav = location.state?.selectedEgift;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        const userResponse = await axios.get(
          "http://localhost:3000/api/users/me",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const userData = userResponse.data.data || userResponse.data;
        setUserPoints(userData.member?.score || 0);

        const egiftResponse = await axios.get(
          "http://localhost:3000/api/egifts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const egiftRawData = egiftResponse.data.data || egiftResponse.data;
        const egiftData: EgiftItem[] = Array.isArray(egiftRawData)
          ? egiftRawData.filter((item: EgiftItem) =>
              ["Voucher", "Food", "Movie Ticket"].includes(item.category)
            )
          : [];
        setEgiftItems(egiftData);

        const historyResponse = await axios.get(
          "http://localhost:3000/api/users/point-history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const historyData = historyResponse.data.data || historyResponse.data;
        setPointHistory(Array.isArray(historyData) ? historyData : []);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load data";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-select egift if passed from navigation
  useEffect(() => {
    if (selectedEgiftFromNav && selectedEgiftFromNav._id) {
      setSelectedReward(selectedEgiftFromNav._id);
      // Clear the navigation state to avoid re-selecting on re-render
      window.history.replaceState({}, document.title);
    }
  }, [selectedEgiftFromNav]);

  const handleRedeem = async (egiftId: string, points: number) => {
    if (userPoints < points || redeeming) return;
    setRedeeming(egiftId);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        "http://localhost:3000/api/users/exchange-egift",
        {
          egiftId: egiftId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);

      const updatedUserData = response.data.data;
      if (updatedUserData && updatedUserData.member) {
        setUserPoints(updatedUserData.member.score);
      }

      const historyResponse = await axios.get(
        "http://localhost:3000/api/users/point-history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const historyData = historyResponse.data.data || historyResponse.data;
      setPointHistory(Array.isArray(historyData) ? historyData : []);
      setSelectedReward(egiftId);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to redeem";
      setError(errorMessage);
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 sm:p-4 mb-4 rounded-lg flex items-center gap-2 justify-center">
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          <span className="text-sm sm:text-base text-red-800">{error}</span>
        </div>
      )}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 p-3 sm:p-4 mb-4 rounded-lg flex items-center gap-2 justify-center">
          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
          <span className="text-sm sm:text-base text-green-800">
            Redeem successful!
          </span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12 sm:py-16">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      )}

      {/* Redeem Points Section */}
      {!loading && (
        <div className="mb-8 sm:mb-10">
          <h3 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
            Available Rewards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {egiftItems.length === 0 ? (
              <div className="col-span-full text-center py-8 sm:py-12">
                <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm sm:text-base text-gray-500">
                  No rewards available at the moment.
                </p>
              </div>
            ) : (
              egiftItems.map((item) => {
                const canAfford = userPoints >= item.points;
                const isRedeeming = redeeming === item._id;
                const isSelected = selectedReward === item._id;
                return (
                  <div
                    key={item._id}
                    className={`bg-white rounded-lg p-4 border transition-all duration-200 hover:shadow-md
                    ${
                      isSelected
                        ? "border-orange-500 ring-1 ring-orange-200 bg-orange-50"
                        : "border-gray-200"
                    }
                    ${!canAfford ? "opacity-60" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-20 h-20 rounded-lg"
                          />
                          <div className="">
                            <p className="text-sm text-gray-900">
                              {item.title}
                            </p>
                            <p className="text-sm font-medium text-gray-900">
                              {item.category}
                            </p>
                            <p className="text-sm font-medium text-orange-400">
                              {item.points.toLocaleString()} points
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleRedeem(item._id, item.points)}
                            disabled={!canAfford || isRedeeming}
                            className={`px-4 py-2 rounded-sm text-sm transition-colors w-full ${
                              canAfford && !isRedeeming
                                ? "bg-orange-400 text-white hover:bg-orange-500"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {isRedeeming ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                <span>Redeeming</span>
                              </div>
                            ) : (
                              "Redeem"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Point History Section */}
      {!loading && (
        <div>
          <h3 className="text-lg sm:text-xl text-gray-900 mb-4 sm:mb-6">
            Point History
          </h3>
          {pointHistory.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-gray-500">
                No redemption history yet.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {pointHistory
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.exchangedAt).getTime() -
                      new Date(a.exchangedAt).getTime()
                  )
                  .slice(
                    (currentPage - 1) * historiesPerPage,
                    currentPage * historiesPerPage
                  )
                  .map((transaction) => (
                    <div
                      key={transaction._id}
                      className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {transaction.egift.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                            <Calendar className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {new Date(
                                transaction.exchangedAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="text-sm sm:text-base font-medium text-orange-500">
                            - {Math.abs(transaction.points).toLocaleString()}{" "}
                            points
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center items-center gap-1 sm:gap-2 mt-6">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                {Array.from(
                  { length: Math.ceil(pointHistory.length / historiesPerPage) },
                  (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border text-sm transition-colors
                      ${
                        currentPage === i + 1
                          ? "bg-orange-400 text-white border-orange-500"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }
                    `}
                    >
                      {i + 1}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        Math.ceil(pointHistory.length / historiesPerPage),
                        prev + 1
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(pointHistory.length / historiesPerPage)
                  }
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
