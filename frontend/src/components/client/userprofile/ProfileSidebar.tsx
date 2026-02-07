import { ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import type { UserAccount, TicketTransaction } from "../../../types/account";
import { getTransactionHistoryByUser } from "../../../services/api/bookingService";

interface MonthlySpending {
  month: string;
  amount: number;
  tickets: number;
}

export const ProfileSidebar = ({ user }: { user: UserAccount }) => {
  const [monthlyData, setMonthlyData] = useState<MonthlySpending[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Format currency in VND
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate monthly spending from transactions
  const calculateMonthlySpending = (
    transactions: TicketTransaction[]
  ): MonthlySpending[] => {
    const currentYear = new Date().getFullYear();
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];

    const monthlySpending: MonthlySpending[] = months.map((month) => ({
      month,
      amount: 0,
      tickets: 0,
    }));

    transactions.forEach((transaction) => {
      if (transaction.status === "confirmed") {
        const transactionDate = new Date(
          transaction.bookingDate || transaction.bookedAt
        );
        if (transactionDate.getFullYear() === currentYear) {
          const monthIndex = transactionDate.getMonth();
          monthlySpending[monthIndex].amount += transaction.totalMoney || 0;
          monthlySpending[monthIndex].tickets += 1;
        }
      }
    });

    return monthlySpending;
  };

  // Fetch transaction data
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setIsLoading(true);
        const transactions = await getTransactionHistoryByUser(user._id);
        const monthlySpending = calculateMonthlySpending(transactions);
        setMonthlyData(monthlySpending);
      } catch (error) {
        console.error("Error fetching transaction data:", error);
        // Fallback: Calculate from points (50 points = 120,000 VND)
        const estimatedSpending = (user.member.score / 50) * 120000;
        const monthlyAverage = estimatedSpending / 12;
        const fallbackData = Array.from({ length: 12 }, (_, index) => ({
          month: [
            "T1",
            "T2",
            "T3",
            "T4",
            "T5",
            "T6",
            "T7",
            "T8",
            "T9",
            "T10",
            "T11",
            "T12",
          ][index],
          amount: Math.random() * monthlyAverage * 2, // Random distribution
          tickets: Math.floor(Math.random() * 5),
        }));
        setMonthlyData(fallbackData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionData();
  }, [user._id, user.member.score]);

  // Get max amount for chart scaling
  const maxAmount = Math.max(...monthlyData.map((data) => data.amount), 1);
  const currentYear = new Date().getFullYear();
  const totalYearSpending = monthlyData.reduce(
    (sum, data) => sum + data.amount,
    0
  );

  return (
    <aside className="w-full lg:w-80 bg-white p-6 rounded-lg shadow-xl">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <img
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            src={user.image || "/path/to/default/avatar.png"}
            alt={user.fullName}
          />
        </div>
        <div>
          <h2 className="text-lg font-bold">{user.username}</h2>
          <p className="text-sm text-orange-500">{user.member.score} Points</p>
        </div>
      </div>

      {/* Total Spending Section */}
      <div className="mt-3 border-t pt-3 border-gray-300">
        <div className="flex text-center justify-between items-center">
          <p className="text-sm text-gray-600">Total spending {currentYear}</p>
          <p className="text-xl font-bold text-orange-500">
            {formatCurrency(totalYearSpending)}
          </p>
        </div>
      </div>

      {/* Monthly Spending Chart */}
      <div className="mt-3 p-2 bg-gray-100 rounded-lg">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Chart bars */}
            <div className="flex items-end justify-between h-24 px-1">
              {monthlyData.map((data, index) => {
                const height =
                  maxAmount > 0 ? (data.amount / maxAmount) * 80 : 0;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className="w-4 bg-gradient-to-t from-orange-500 to-orange-300 rounded-t-sm transition-all duration-300 hover:from-orange-600 hover:to-orange-400"
                      style={{ height: `${height}px` }}
                      title={`${data.month}: ${formatCurrency(data.amount)} (${
                        data.tickets
                      } tickets)`}
                    ></div>
                  </div>
                );
              })}
            </div>
            {/* Month labels */}
            <div className="flex justify-between text-[9px] text-gray-500 px-1">
              {monthlyData.map((data, index) => (
                <span key={index} className="flex-1 text-center">
                  {data.month}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-2">
        <a href="#" className="flex items-start p-3 border-t border-gray-300">
          <span className="flex-grow text-sm font-medium">
            <span className="text-gray-800">Hotline:</span>
            <span className="text-blue-600">19002224 (9:00 - 22:00)</span>
          </span>
          <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
        </a>
        <a href="#" className="flex items-start p-3 border-t border-gray-300">
          <span className="flex-grow text-sm font-medium">
            <span className="text-gray-800">Email: </span>
            <span className="text-blue-600">hotro@lumiere.vn</span>
          </span>
          <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
        </a>
        <a href="#" className="flex items-start p-3 border-t border-gray-300">
          <span className="flex-grow text-sm font-medium text-gray-800">
            Frequently asked questions
          </span>
          <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
        </a>
      </div>
    </aside>
  );
};
