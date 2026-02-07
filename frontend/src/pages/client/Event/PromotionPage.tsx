/* eslint-disable @typescript-eslint/no-explicit-any */
import { MainLayout } from "../../../layouts/Layout";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { promotionService } from "../../../services/api";
import type { Promotion } from "../../../types/promotion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";

// Define promotion categories for filtering (currently unused but kept for future use)
// const promotionCategories = {
//   combo: "combo",
//   members: "members",
//   partners: "partners",
// };

export const PromotionPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // State management
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch promotions from API
  const fetchPromotions = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await promotionService.getAllPromotions(
        page,
        9,
        "-createdAt"
      );

      if (response.success) {
        setPromotions(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          // setTotalItems(response.pagination.totalItems); // Currently unused
        }
      } else {
        setError(response.message || "Không thể tải danh sách promotions");
      }
    } catch (err: any) {
      const errorMessage = promotionService.handleError(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load promotions on component mount
  useEffect(() => {
    fetchPromotions(currentPage);
  }, [currentPage]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Filter promotions based on selected category
  const filteredPromotions =
    activeFilter === "all"
      ? promotions
      : promotions.filter((promo) => {
          // Check if promotion content contains category information
          return promo.content.some(
            (content) =>
              content.type === activeFilter ||
              content.value?.toLowerCase().includes(activeFilter)
          );
        });

  // Helper function to get promotion badge info
  const getPromotionBadge = (promotion: Promotion) => {
    if (promotion.shareCount > 100) {
      return { text: "Hot", color: "bg-yellow-500" };
    }
    if (
      promotion.createdAt &&
      new Date(promotion.createdAt) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      return { text: "New", color: "bg-green-500" };
    }
    return null;
  };

  // Helper function to get discount info
  const getDiscountInfo = (promotion: Promotion) => {
    const discountContent = promotion.content.find(
      (content) =>
        content.value?.toLowerCase().includes("%") ||
        content.value?.toLowerCase().includes("discount")
    );
    return discountContent?.value || null;
  };

  if (loading && promotions.length === 0) {
    return (
      <div>
        <MainLayout>
          <div className="container mx-auto px-4 pt-24 pb-16">
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-yellow-500 mx-auto" />
                <p className="mt-4 text-gray-600">Loading promotions...</p>
              </div>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <MainLayout>
          <div className="container mx-auto px-4 pt-24 pb-16">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading data
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => fetchPromotions(currentPage)}
                    className="mt-2 text-sm text-red-800 hover:text-red-900 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </MainLayout>
      </div>
    );
  }

  return (
    <div>
      <MainLayout>
        <div className="container mx-auto px-4 pt-24 pb-16">
          {/* Header Section */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-black-800 mb-2 relative inline-block">
              PROMOTIONAL OFFERS
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-orange-400 rounded-full"></div>
            </h1>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Discover special offers and exciting promotions from our cinemas
            </p>
          </div>

          {/* Filter Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              className={`px-5 py-2 relative ${
                activeFilter === "all" ? "text-orange-400" : "text-gray-700"
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All
              {activeFilter === "all" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400"></div>
              )}
            </button>
            <button
              className={`px-5 py-2 relative ${
                activeFilter === "combo" ? "text-orange-500" : "text-gray-700"
              }`}
              onClick={() => setActiveFilter("combo")}
            >
              Combo Offers
              {activeFilter === "combo" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400"></div>
              )}
            </button>
            <button
              className={`px-5 py-2 relative ${
                activeFilter === "members" ? "text-orange-500" : "text-gray-700"
              }`}
              onClick={() => setActiveFilter("members")}
            >
              Members
              {activeFilter === "members" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400"></div>
              )}
            </button>
            <button
              className={`px-5 py-2 relative ${
                activeFilter === "partners"
                  ? "text-orange-500"
                  : "text-gray-700"
              }`}
              onClick={() => setActiveFilter("partners")}
            >
              Partners
              {activeFilter === "partners" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-400"></div>
              )}
            </button>
          </div>

          {/* Promotions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-3">
            {filteredPromotions.length > 0 ? (
              filteredPromotions.map((promotion) => {
                const badge = getPromotionBadge(promotion);
                const discount = getDiscountInfo(promotion);

                return (
                  <div
                    key={promotion.slug}
                    className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square h-60 w-full bg-gray-100">
                      <img
                        src={promotion.image}
                        alt={promotion.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const fallbackDiv =
                            target.nextElementSibling as HTMLDivElement;
                          if (fallbackDiv) {
                            fallbackDiv.classList.remove("hidden");
                          }
                        }}
                      />
                      <div className="w-full h-full items-center justify-center hidden">
                        <div className="text-center">
                          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <div className="text-gray-500 text-xs">
                            {promotion.title}
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      {badge && (
                        <div
                          className={`absolute top-2 right-2 ${badge.color} text-white text-xs font-bold px-2 py-1 rounded-full`}
                        >
                          {badge.text}
                        </div>
                      )}
                      {discount && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {discount}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-gray-900 text-xl sm:text-base mb-2 line-clamp-2">
                        {promotion.title}
                      </h3>

                      {/* Date */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-orange-400" />
                          <span className="text-sm font-medium text-orange-400">
                            {promotion.createdAt
                              ? new Date(
                                  promotion.createdAt
                                ).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="flex gap-2">
                        <Link
                          to={`/promotion/${promotion.slug}`}
                          className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-2 px-3 rounded-sm text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-10">
                <div className="text-gray-500 text-lg">
                  {loading
                    ? "Đang tải..."
                    : "Không tìm thấy promotions cho danh mục này."}
                </div>
                {!loading && (
                  <button
                    onClick={() => setActiveFilter("all")}
                    className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Xem tất cả promotions
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-8">
              {/* Items info */}
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 9 + 1} to{" "}
                {Math.min(currentPage * 9, promotions.length)} of{" "}
                {promotions.length} items
              </div>

              {/* Pagination controls */}
              <div className="flex justify-center items-center gap-2">
                <button
                  className="h-8 w-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {/* Page numbers with smart display */}
                {(() => {
                  const pages = [];

                  // Always show first page
                  pages.push(1);

                  // Show pages around current page
                  for (
                    let i = Math.max(2, currentPage - 1);
                    i <= Math.min(totalPages - 1, currentPage + 1);
                    i++
                  ) {
                    if (i > 1 && i < totalPages) {
                      pages.push(i);
                    }
                  }

                  // Always show last page if there are more than 1 page
                  if (totalPages > 1) {
                    pages.push(totalPages);
                  }

                  // Remove duplicates and sort
                  const uniquePages = [...new Set(pages)].sort((a, b) => a - b);

                  return uniquePages.map((page, index) => {
                    // Add ellipsis if there's a gap
                    const prevPage = uniquePages[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          className={`h-8 w-8 border rounded text-sm transition-colors ${
                            currentPage === page
                              ? "bg-yellow-600 text-white border-yellow-600 hover:bg-yellow-700"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </div>
                    );
                  });
                })()}

                <button
                  className="h-8 w-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Empty state when no promotions */}
          {promotions.length === 0 && !loading && (
            <div className="col-span-3 text-center py-10">
              <div className="text-gray-400 text-6xl mb-4">📢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có promotions
              </h3>
              <p className="text-gray-500">
                Database chưa có dữ liệu promotion nào.
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
};

export default PromotionPage;
