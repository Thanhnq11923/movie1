import { useState, useEffect, useRef } from "react";
import {
  Gift,
  Clock,
  Percent,
  DollarSign,
  MoreHorizontal,
  Search,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ViewPromotionModal from "./view-promotion";
import { notify } from "./../../../lib/toast";
import { promotionService } from "../../../services/api";
import type { Promotion } from "../../../types/promotion";

// Types
type PromotionStatus = "active" | "expired";

// Helper functions
const formatDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
};

const getStatusColor = (status: PromotionStatus) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "expired":
    default:
      return "bg-red-100 text-red-800";
  }
};

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await promotionService.getAllPromotions(1, 20, "-createdAt");
        if (response.success) {
          setPromotions(
            response.data.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
          );
        } else {
          throw new Error(response.message || "Failed to fetch promotions");
        }
      } catch (err: any) {
        setError(err.message || "Network error");
        notify.error(`Failed to fetch promotions: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter promotions
  const filteredPromotions = promotions.filter((promotion) => {
    const status = promotion.status === "active" ? "active" : "expired";
    const matchesSearch =
      (promotion.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (promotion.code?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus =
      statusFilter === "All Status" ||
      (statusFilter === "Active" && status === "active") ||
      (statusFilter === "Expired" && status === "expired");
    const matchesDate =
      dateFilter === "" ||
      (promotion.startDate && new Date(promotion.startDate).toISOString().includes(dateFilter)) ||
      (promotion.endDate && new Date(promotion.endDate).toISOString().includes(dateFilter));
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const indexOfFirstPromotion = (currentPage - 1) * itemsPerPage;
  const indexOfLastPromotion = indexOfFirstPromotion + itemsPerPage;
  const currentPromotions = filteredPromotions.slice(indexOfFirstPromotion, indexOfLastPromotion);

  // Calculate statistics from real API data
  const activePromotions = promotions.filter((p) => p.status === "active").length;
  const expiredPromotions = promotions.filter((p) => p.status !== "active").length;
  const totalUsage = promotions.reduce((sum, p) => sum + (p.currentUsage ?? 0), 0);
  
  // Calculate customer savings from promotions usage
  const customerSavings = promotions.reduce((total, promotion) => {
    if (promotion.currentUsage && promotion.currentUsage > 0) {
      // Calculate savings based on discount type and value
      let savingsPerUse = 0;
      if (promotion.discountType === "percentage") {
        // Assume average order value of 200,000 VND for percentage calculations
        const avgOrderValue = 200000;
        savingsPerUse = (avgOrderValue * (promotion.discountValue || 0)) / 100;
      } else if (promotion.discountType === "fixed") {
        savingsPerUse = promotion.discountValue || 0;
      }
      return total + (savingsPerUse * promotion.currentUsage);
    }
    return total;
  }, 0);

  // Calculate percentage changes (mock data for now, can be enhanced with historical data)
  const activePromotionsChange = "+5.2%"; // vs last month
  const expiredPromotionsChange = "-2.1%"; // vs last month  
  const totalUsageChange = "+12.5%"; // vs last month
  const customerSavingsChange = "+8.7%"; // vs last month

  // Action handlers
  const handleView = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsViewModalOpen(true);
    setShowDropdown(null);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setDateFilter("");
    setCurrentPage(1);
    notify.info("Filters have been reset");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading promotions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Gift className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load promotions</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              promotionService
                .getAllPromotions(1, 20, "-createdAt")
                .then((response) => {
                  if (response.success) {
                    setPromotions(
                      response.data.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
                    );
                  } else {
                    throw new Error(response.message || "Failed to fetch promotions");
                  }
                })
                .catch((err: any) => {
                  setError(err.message || "Network error");
                  notify.error(`Failed to fetch promotions: ${err.message}`);
                })
                .finally(() => setLoading(false));
            }}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 relative">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Promotion Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">View promotional campaigns (Read-only)</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Promotions</p>
              <p className="text-3xl font-bold text-gray-900">{activePromotions}</p>
              <p className="text-xs text-gray-500 mt-1">In System</p>
            </div>
            <Gift className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired Promotions</p>
              <p className="text-3xl font-bold text-red-600">{expiredPromotions}</p>
              <p className="text-xs text-gray-500 mt-1">Total expired</p>
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Promotion List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Promotion List</h2>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                promotionService
                  .getAllPromotions(1, 20, "-createdAt")
                  .then((response) => {
                    if (response.success) {
                      setPromotions(
                        response.data.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
                      );
                    } else {
                      throw new Error(response.message || "Failed to fetch promotions");
                    }
                  })
                  .catch((err: any) => {
                    setError(err.message || "Network error");
                    notify.error(`Failed to fetch promotions: ${err.message}`);
                  })
                  .finally(() => setLoading(false));
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mt-2 sm:mt-0"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search promotions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Expired</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
            />
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200 hidden sm:table-row-group">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Image</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Code</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Value</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Period</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Type</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPromotions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-500 text-sm sm:text-base">
                      No promotions found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentPromotions.map((promotion) => {
                    const safeStatus = promotion.status === "active" ? "active" : "expired";
                    return (
                      <tr key={promotion._id || promotion.slug} className="hover:bg-gray-50">
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          <img
                            src={promotion.image || "https://via.placeholder.com/60x40/FFD700/000000?text=No+Image"}
                            alt={promotion.title}
                            className="w-10 h-6 sm:w-15 sm:h-10 object-cover rounded-md border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/60x40/FFD700/000000?text=No+Image";
                            }}
                          />
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm font-medium text-gray-900">
                          <div className="max-w-xs break-words leading-relaxed">
                            {promotion.title}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          <code className="bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono break-all">
                            {promotion.code}
                          </code>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm text-gray-900">
                          {promotion.discountValue}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm text-gray-900">
                          <div className="break-words">
                            {promotion.startDate ? formatDate(promotion.startDate) : "N/A"} to{" "}
                            {promotion.endDate ? formatDate(promotion.endDate) : "N/A"}
                          </div>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4">
                          <span className={`inline-flex px-1 sm:px-2.5 py-0.5 sm:py-0.5 rounded-full text-xs font-medium ${getStatusColor(safeStatus)}`}>{safeStatus}</span>
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm text-gray-900">
                          {promotion.discountType}
                        </td>
                        <td className="px-2 sm:px-4 py-2 sm:py-4 text-sm text-gray-500">
                          <button
                            data-promotion-id={promotion._id || promotion.slug}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(showDropdown === (promotion._id || promotion.slug) ? null : promotion._id || promotion.slug);
                            }}
                            className="p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-2 sm:mb-0">
              Showing {indexOfFirstPromotion + 1} to {Math.min(indexOfLastPromotion, filteredPromotions.length)} of{" "}
              {filteredPromotions.length} promotions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-1 sm:p-2 rounded-lg ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-sm ${currentPage === i + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-1 sm:p-2 rounded-lg ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu Portal */}
      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(null)}>
          <div
            ref={dropdownRef}
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[140px] sm:min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(`[data-promotion-id="${showDropdown}"]`);
              if (!buttonElement) return {};
              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120;
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;
              const shouldAppearAbove = spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;
              const left = Math.min(window.innerWidth - 170, Math.max(10, buttonRect.right - 160));
              const top = shouldAppearAbove ? buttonRect.top - dropdownHeight - 5 : buttonRect.bottom + 5;
              return {
                left: `${left}px`,
                top: `${Math.max(10, Math.min(top, viewportHeight - dropdownHeight - 10))}px`,
              };
            })()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  const promo = promotions.find((p) => (p._id || p.slug) === showDropdown);
                  if (promo) handleView(promo);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Promotion Modal */}
      {isViewModalOpen && selectedPromotion && (
        <ViewPromotionModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          promotionSlug={selectedPromotion?.slug ?? null}
          promotion={selectedPromotion}
          onStatusChange={(updatedPromotion) => {
            setPromotions((prevPromotions) =>
              prevPromotions.map((p) => (p._id === updatedPromotion._id ? updatedPromotion : p))
            );
            setSelectedPromotion(updatedPromotion);
          }}
        />
      )}
    </div>
  );
}