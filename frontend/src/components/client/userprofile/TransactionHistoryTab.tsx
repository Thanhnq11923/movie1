/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import type { TicketTransaction } from "../../../types/account";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { TransactionDetailModal } from "./TransactionDetailModal";
import { useAuth } from "../../../hooks/useAuth";
import { getTransactionHistoryByUser } from "../../../services/api";

// Extended interface for backward compatibility with database fields
interface ExtendedTransaction extends TicketTransaction {
  seatStatus?: number;
  amount?: number;
  row?: string;
  col?: number;
  id?: string;
  createdAt?: string;
  movieTitle?: string;
  roomName?: string;
  seatNumber?: string;
  seat?: string;
  totalAmount?: number;
  price?: number;
  bookingStatus?: string;
}

const TransactionRow = ({
  transaction,
  onViewDetails,
}: {
  transaction: ExtendedTransaction;
  onViewDetails: (tx: ExtendedTransaction) => void;
}) => {
  // Debug: log transaction data to understand structure (uncomment if needed)
  // console.log("Transaction data:", transaction);

  // Date - try multiple possible date fields
  let dateStr = "N/A";
  const possibleDateFields = [
    transaction.bookedAt,
    transaction.bookingDate,
    transaction.date,
    transaction.createdAt,
  ];
  const validDate = possibleDateFields.find(
    (date) => date && !isNaN(new Date(date).getTime())
  );

  if (validDate) {
    try {
      dateStr = format(new Date(validDate), "dd/MM/yyyy");
    } catch (error) {
      console.warn("Date formatting error:", error);
      dateStr = "N/A";
    }
  }

  // Movie name - handle both string and object cases
  const movieName =
    typeof transaction.movieId === "object" &&
    transaction.movieId?.versionMovieEnglish
      ? transaction.movieId.versionMovieEnglish
      : transaction.movieName || transaction.movieTitle || "N/A";

  // Cinema room name - handle both string and object cases
  const cinemaRoomName =
    typeof transaction.cinemaRoomId === "object" &&
    transaction.cinemaRoomId?.roomName
      ? transaction.cinemaRoomId.roomName
      : transaction.cinemaRoomName || transaction.roomName || "N/A";

  // Seats - handle multiple possible structures
  const seatStr = (() => {
    if (Array.isArray(transaction.seats) && transaction.seats.length > 0) {
      return transaction.seats
        .map((s: any) => {
          if (typeof s === "object") {
            return `${s.row || ""}${s.col || s.number || ""}`;
          }
          return s.toString();
        })
        .join(", ");
    }

    if (transaction.row && transaction.col !== undefined) {
      return `${transaction.row}${transaction.col}`;
    }

    if (transaction.seatNumber || transaction.seat) {
      return transaction.seatNumber || transaction.seat;
    }

    return "N/A";
  })();

  // Concessions - handle array of items
  const concessionStr = (() => {
    if (
      Array.isArray(transaction.concessions) &&
      transaction.concessions.length > 0
    ) {
      return transaction.concessions
        .map(
          (item: any) =>
            `${item.name || item.itemName || "Item"} x${item.quantity || 1}`
        )
        .join(", ");
    }
    return "";
  })();

  // Detail string
  let detailStr =
    cinemaRoomName && cinemaRoomName !== "N/A"
      ? `Phòng: ${cinemaRoomName}`
      : "";
  if (seatStr && seatStr !== "N/A")
    detailStr += detailStr ? ` | Ghế: ${seatStr}` : `Ghế: ${seatStr}`;
  if (concessionStr)
    detailStr += detailStr
      ? ` | Bắp nước: ${concessionStr}`
      : `Bắp nước: ${concessionStr}`;

  // Amount - try multiple possible amount fields
  const amount =
    transaction.amount ??
    transaction.totalMoney ??
    transaction.totalAmount ??
    transaction.price ??
    0;

  // Status - handle multiple possible status representations
  let status: string = "pending";

  // First try the standard status field from TicketTransaction type
  if (transaction.status) {
    status = transaction.status.toLowerCase();
  }
  // Fallback to seatStatus mapping if status field is not available
  else if (typeof transaction.seatStatus === "number") {
    if (transaction.seatStatus === 1) status = "confirmed";
    else if (transaction.seatStatus === 0) status = "cancelled";
  }
  // Additional fallbacks
  else if (transaction.bookingStatus) {
    status = transaction.bookingStatus.toLowerCase();
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      {/* Mobile view */}
      <td className="block lg:hidden p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div className="text-sm font-medium text-gray-900">{movieName}</div>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : status === "completed"
                  ? "bg-blue-100 text-blue-800"
                  : status === "Payment_failed"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {status === "Payment_failed" ? "Failed" : status}
            </span>
          </div>
          <div className="text-xs text-gray-500">{dateStr}</div>
          <div className="text-xs  text-gray-600">{detailStr || "N/A"}</div>
          <div className="flex justify-between items-center">
            <div className="text-sm font-semibold text-gray-900">
              {typeof amount === "number"
                ? amount.toLocaleString() + " ₫"
                : "0 đ"}
            </div>
            <button
              onClick={() => onViewDetails(transaction)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <Eye size={16} />
              <span>View</span>
            </button>
          </div>
        </div>
      </td>

      {/* Desktop view */}
      <td className="hidden lg:table-cell p-3 sm:p-4 text-xs sm:text-sm text-gray-700">
        {dateStr}
      </td>
      <td className="hidden lg:table-cell p-3 sm:p-4 text-xs sm:text-sm text-gray-700">
        {movieName}
      </td>
      <td className="hidden lg:table-cell p-3 sm:p-4 text-xs sm:text-sm text-gray-700">
        {typeof amount === "number" ? amount.toLocaleString() + " ₫" : "0 đ"}
      </td>
      <td className="hidden lg:table-cell p-3 sm:p-4 text-xs sm:text-sm">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-sm ${
            status === "confirmed"
              ? "bg-green-100 text-green-800"
              : status === "cancelled"
              ? "bg-red-100 text-red-800"
              : status === "completed"
              ? "bg-blue-100 text-blue-800"
              : status === "Payment_failed"
              ? "bg-red-100 text-red-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {status === "Payment_failed" ? "Failed" : status}
        </span>
      </td>
      <td className="hidden lg:table-cell p-3 sm:p-4 text-center">
        <button
          onClick={() => onViewDetails(transaction)}
          className="text-gray-500 hover:text-blue-600 transition-colors"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};

export const TransactionHistoryTab = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<ExtendedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] =
    useState<ExtendedTransaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await getTransactionHistoryByUser(user.id);
        setTransactions(data);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleViewDetails = (transaction: ExtendedTransaction) => {
    setSelectedTransaction(transaction);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
  };

  // Sắp xếp mới nhất đến cũ nhất
  const sortedTransactions = transactions.slice().sort((a, b) => {
    // Safely handle potentially undefined date values
    const getValidDate = (transaction: any) => {
      const dateValue =
        transaction.bookedAt || transaction.bookingDate || transaction.date;
      if (!dateValue) return new Date(0); // Return epoch if no date found
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? new Date(0) : date;
    };

    const dateA = getValidDate(a).getTime();
    const dateB = getValidDate(b).getTime();
    return dateB - dateA;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(sortedTransactions.length / transactionsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-xs sm:text-sm text-gray-500">
          Note: only the 20 most recent transactions are displayed.
        </p>
        {loading ? (
          <div className="text-center py-12 sm:py-16">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-orange-500"></div>
              <span className="text-sm sm:text-base text-gray-600">
                Loading transactions...
              </span>
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 sm:py-16 space-y-2">
            <p className="text-gray-400 text-4xl sm:text-5xl">🎫</p>
            <p className="text-sm sm:text-base text-gray-500">
              You have no recent transactions.
            </p>
          </div>
        ) : (
          <div className="mt-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 hidden lg:table-header-group">
                    <tr>
                      <th className="p-3 sm:p-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="p-3 sm:p-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Movie
                      </th>
                      <th className="p-3 sm:p-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="p-3 sm:p-4 text-left text-xs text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="p-3 sm:p-4 text-center text-xs text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedTransactions.map((tx) => (
                      <TransactionRow
                        key={tx._id}
                        transaction={tx}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-center items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                &lt;
              </button>
              <div className="flex items-center gap-1 sm:gap-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border transition
                                            ${
                                              currentPage === i + 1
                                                ? "bg-orange-400 text-white border-orange-500"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
                                            }
                                        `}
                    aria-current={currentPage === i + 1 ? "page" : undefined}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
      <TransactionDetailModal
        isOpen={!!selectedTransaction}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
      />
    </>
  );
};
