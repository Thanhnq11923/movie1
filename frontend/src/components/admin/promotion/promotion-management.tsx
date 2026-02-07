import { useState, useEffect, useRef } from "react";
import {
  Gift,
  Clock,
  Percent,
  DollarSign,
  MoreHorizontal,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  
} from "lucide-react";
import CreatePromotionModal from "./create-promotion-modal";
import ViewPromotionModal from "./view-promotion";
import EditPromotionModal from "./edit-promotion";
import { notify, MESSAGES } from "./../../../lib/toast";
import { promotionService } from "../../../services/api";
import type { Promotion } from "../../../types/promotion";

// Types
  
type PromotionStatus = "active" | "inactive" | "expired";

// Actions Dropdown Component
interface ActionsDropdownProps {
  promotion: Promotion;
  onView: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
  onToggleStatus: (promotion: Promotion) => void;
}

function ActionsDropdown({
  promotion,
  onView,
  onEdit,
  onDelete,
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-1"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => {
                onView(promotion);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4" />
              View Details
            </button>
            <button
              onClick={() => {
                onEdit(promotion);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="h-4 w-4" />
              Edit Promotion
            </button>

            <button
              onClick={() => {
                onDelete(promotion);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
const formatDate = (dateString: string | number | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getStatusColor = (status: PromotionStatus) => {
  switch (status) {
    case "active":
      return "bg-green-500 text-white";
    case "expired":
    default:
      return "bg-gray-500 text-white";
  }
};

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  // 1. State cho pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 1. Thêm state showDropdown
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await promotionService.getAllPromotions(1, 20, '-createdAt');
        if (response.success) {
          // Sort promotions theo createdAt giảm dần
          setPromotions(response.data.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()));
        } else {
          setError(response.message || "Failed to fetch promotions");
        }
      } catch (err: any) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  // Filter promotions based on search query, status filter, and date filter
  const filteredPromotions = promotions.filter((promotion) => {
    // Chuyển các trạng thái không hợp lệ thành expired
    let status = promotion.status;
    if (status !== "active") status = "expired";
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

  // 2. Pagination logic
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPromotions = filteredPromotions.slice(startIndex, endIndex);

  // Calculate statistics
  const activePromotions = promotions.filter((p) => p.status === "active").length;
  const expiredPromotions = promotions.filter((p) => p.status !== "active").length;
  const totalUsage = promotions.reduce((sum, p) => sum + (p.currentUsage ?? 0), 0);
  const customerSavings = 8500000; // In Vietnamese Dong

  // Action handlers
  const handleView = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsViewModalOpen(true);
  };

  const handleEdit = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsEditModalOpen(true);
  };

  const handleDelete = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDeleteModalOpen(true);
  };

  const handleToggleStatus = async (promotion: Promotion) => {
    try {
      const loadingToast = notify.loading("Updating promotion status...");
      // Chỉ chuyển giữa 'active' và 'expired'
      const newStatus: PromotionStatus = promotion.status === "active" ? "expired" : "active";
      // Gọi API cập nhật trạng thái
      const response = await promotionService.updatePromotion(promotion.slug, { status: newStatus } as any);
      if (response.success) {
        setPromotions((prevPromotions) =>
          prevPromotions.map((p) =>
            p._id === promotion._id ? { ...p, status: newStatus as PromotionStatus } : p
          )
        );
        notify.dismiss(loadingToast);
        if (newStatus === "active") {
          notify.success(MESSAGES.PROMOTION.ACTIVATED);
        } else {
          notify.success(MESSAGES.PROMOTION.DEACTIVATED);
        }
      } else {
        notify.dismiss(loadingToast);
        notify.error(response.message || MESSAGES.PROMOTION.ERROR);
      }
    } catch {
      notify.error(MESSAGES.PROMOTION.ERROR);
    }
  };

  const handleSavePromotion = (updatedPromotion: Promotion) => {
    try {
      // Update local state with the promotion data returned from API
      setPromotions((prevPromotions) =>
        prevPromotions.map((p) =>
          p._id === updatedPromotion._id ? updatedPromotion : p
        )
      );
      
      // Close the edit modal
      setIsEditModalOpen(false);
      setSelectedPromotion(null);
    } catch (error) {
      console.error('Error updating local state:', error);
      notify.error(MESSAGES.PROMOTION.ERROR);
    }
  };

  const handleCreatePromotion = (newPromotion: Promotion) => {
    try {
      setPromotions((prevPromotions) => {
        const updated = [newPromotion, ...prevPromotions];
        return updated.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      });
      // Chỉ hiển thị một thông báo thành công duy nhất
      notify.success(MESSAGES.PROMOTION.CREATED || "Promotion created successfully!");
    } catch {
      notify.error(MESSAGES.PROMOTION.ERROR);
    }
  };

  const handleConfirmDelete = async (promotionId: string) => {
    try {
      const loadingToast = notify.loading("Deleting promotion...");
      // Find the promotion by id to get the slug
      const promotionToDelete = promotions.find((p) => p._id === promotionId);
      if (!promotionToDelete) {
        notify.dismiss(loadingToast);
        notify.error("Promotion not found.");
        return;
      }
      // Call API to delete promotion by slug
      const response = await promotionService.deletePromotion(promotionToDelete.slug);
      if (response.success) {
        setPromotions((prevPromotions) =>
          prevPromotions.filter((p) => p._id !== promotionId)
        );
        notify.dismiss(loadingToast);
        notify.success(MESSAGES.PROMOTION.DELETED);
        setIsDeleteModalOpen(false); // Close the modal
        setSelectedPromotion(null); // Clear selected promotion
      } else {
        notify.dismiss(loadingToast);
        notify.error(response.message || MESSAGES.PROMOTION.ERROR);
      }
    } catch (error) {
      notify.error(MESSAGES.PROMOTION.ERROR);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All Status");
    setDateFilter("");
  };

  // 3. Handler đổi trang
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Promotion Management
          </h1>
          <p className="text-gray-600">
            Create and manage promotional campaigns
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Promotion
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">
                Active Promotions
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                {activePromotions}
              </h2>
              <p className="text-xs text-gray-500">In System</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Gift className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <h2 className="text-3xl font-bold text-red-500">
                {expiredPromotions}
              </h2>
              <p className="text-xs text-gray-500">In next 48h</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Promotion List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Promotion List
              </h3>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search promotions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Expired</option>
              </select>

              {/* Đã xoá dropdown lọc theo types */}

              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />

              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {/* Promotions Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPromotions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        No promotions found
                      </td>
                    </tr>
                  ) : (
                    currentPromotions.map((promotion) => {
                      // Đảm bảo status chỉ là 'active' hoặc 'expired'
                      const safeStatus = promotion.status === 'active' ? 'active' : 'expired';
                      return (
                        <tr key={promotion._id || promotion.slug} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <img
                                src={promotion.image || 'https://via.placeholder.com/60x40/FFD700/000000?text=No+Image'}
                                alt={promotion.title}
                                className="w-15 h-10 object-cover rounded-md border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/60x40/FFD700/000000?text=No+Image';
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-gray-900">
                            {promotion.title}
                          </td>
                          <td className="px-4 py-4">
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                              {promotion.code}
                            </code>
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            {promotion.discountValue}
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            {promotion.startDate ? formatDate(promotion.startDate) : "N/A"} to{" "}
                            {promotion.endDate ? formatDate(promotion.endDate) : "N/A"}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                safeStatus
                              )}`}
                            >
                              {safeStatus}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            {promotion.discountType}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              data-promotion-id={promotion._id || promotion.slug}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDropdown(showDropdown === (promotion._id || promotion.slug) ? null : (promotion._id || promotion.slug));
                              }}
                              className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 flex justify-between items-center border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredPromotions.length)} of {filteredPromotions.length} promotions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${currentPage === page ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedPromotion && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Promotion
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this promotion?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {selectedPromotion.title}
                  </p>
                  <p className="text-gray-600">
                    Code: {selectedPromotion.code}
                  </p>
                  <p className="text-gray-600">
                    Status: {selectedPromotion.status}
                  </p>
                  <p className="text-gray-600">
                    Period: {selectedPromotion.startDate ? formatDate(selectedPromotion.startDate) : "N/A"} -{" "}
                    {selectedPromotion.endDate ? formatDate(selectedPromotion.endDate) : "N/A"}
                  </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. All promotion data and history
                will be permanently removed.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmDelete(selectedPromotion._id || '')}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Promotion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreatePromotionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreatePromotion}
        existingPromotions={promotions}
      />

      <ViewPromotionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        promotionSlug={selectedPromotion?.slug ?? null}
        promotion={selectedPromotion}
        onStatusChange={(updatedPromotion) => {
          setPromotions((prevPromotions) =>
            prevPromotions.map((p) =>
              p._id === updatedPromotion._id ? updatedPromotion : p
            )
          );
          setSelectedPromotion(updatedPromotion);
        }}
      />

      <EditPromotionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        promotion={selectedPromotion}
        onSave={handleSavePromotion}
        existingPromotions={promotions}
      />

      {/* 3. Thêm portal render dropdown menu ngoài bảng, giống account-management */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-promotion-id="${showDropdown}"]`
              );
              if (!buttonElement) return {};
              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120; // Approximate height of dropdown
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;
              const shouldAppearAbove = spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;
              const left = Math.min(
                window.innerWidth - 170,
                Math.max(10, buttonRect.right - 160)
              );
              const top = shouldAppearAbove
                ? buttonRect.top - dropdownHeight - 5
                : buttonRect.bottom + 5;
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
                  setShowDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  const promo = promotions.find((p) => (p._id || p.slug) === showDropdown);
                  if (promo) handleEdit(promo);
                  setShowDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Promotion
              </button>
              <button
                onClick={() => {
                  const promo = promotions.find((p) => (p._id || p.slug) === showDropdown);
                  if (promo) handleDelete(promo);
                  setShowDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
