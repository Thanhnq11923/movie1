import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  Gift,
  Coins,
} from "lucide-react";
import { MainLayout } from "../../../../layouts/Layout";
import { egiftService } from "../../../../services/api/egiftService";
import type { Egift } from "../../../../services/api/egiftService";

export default function EGiftPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [egifts, setEgifts] = useState<Egift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEgift, setSelectedEgift] = useState<Egift | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch egifts from API
  useEffect(() => {
    const fetchEgifts = async () => {
      try {
        setLoading(true);
        const data = await egiftService.getAllEgifts();
        console.log("Fetched egifts:", data);
        setEgifts(data);
      } catch (err) {
        console.error("Error fetching egifts:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch egifts");
      } finally {
        setLoading(false);
      }
    };

    fetchEgifts();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(egifts.length / 8); // Show 8 items per page (4 columns × 2 rows)
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleViewDetail = (egift: Egift) => {
    setSelectedEgift(egift);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEgift(null);
  };

  const handleRedeem = (egift: Egift) => {
    // Navigate to profile page with redeem tab active
    navigate("/profile", {
      state: {
        tab: "redeem",
        selectedEgift: egift, // Pass the selected egift data
      },
    });
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 pt-15">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pt-20 sm:pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
                E-Gift Shop
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Discover our exclusive collection of movie-themed gifts and
                merchandise
              </p>
            </div>

            {/* Products Grid */}
            <div className="mb-6 sm:mb-8">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-red-600" />
                  <span className="ml-2 text-gray-600">Loading egifts...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-3">
                  {egifts
                    .slice((currentPage - 1) * 8, currentPage * 8)
                    .map((egift) => (
                      <div
                        key={egift._id}
                        className="bg-white border  border-gray-200 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square h-60 w-full bg-gray-100">
                          {egift.image ? (
                            <img
                              src={egift.image}
                              alt={egift.title}
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
                          ) : (
                            <img
                              src={`/assets/images/${
                                egift.title.toLowerCase().includes("doraemon")
                                  ? "drm"
                                  : egift.title.toLowerCase().includes("stitch")
                                  ? "st"
                                  : "gf"
                              }.png`}
                              alt={egift.title}
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
                          )}
                          <div className="w-full h-full items-center justify-center hidden">
                            <div className="text-center">
                              <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                              <div className="text-gray-500 text-xs">
                                {egift.title}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          {/* Title */}
                          <h3 className="text-gray-900 text-xl sm:text-base mb-2 line-clamp-2">
                            {egift.title}
                          </h3>

                          {/* Points */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xl font-medium text-orange-400">
                                {egift.points} points
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            {/* View Detail Button */}
                            <button
                              onClick={() => handleViewDetail(egift)}
                              className="flex-1 bg-white hover:bg-orange-400 hover:text-white border border-orange-400 text-orange-400 py-2 px-3 rounded-sm text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Detail
                            </button>

                            {/* Redeem Button */}
                            <button
                              onClick={() => handleRedeem(egift)}
                              className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-2 px-3 rounded-sm text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                              <Coins className="w-4 h-4" />
                              Redeem
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {egifts.length > 8 && (
              <div className="flex flex-col items-center gap-4">
                {/* Items info */}
                <div className="text-sm text-gray-600">
                  Showing {(currentPage - 1) * 8 + 1} to{" "}
                  {Math.min(currentPage * 8, egifts.length)} of {egifts.length}{" "}
                  items
                </div>

                {/* Pagination controls */}
                <div className="flex justify-center items-center gap-2">
                  <button
                    className="h-8 w-8 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {/* Page numbers with smart display */}
                  {(() => {
                    const totalPages = Math.ceil(egifts.length / 8);
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
                    const uniquePages = [...new Set(pages)].sort(
                      (a, b) => a - b
                    );

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
                                ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
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
                    onClick={handleNextPage}
                    disabled={currentPage === Math.ceil(egifts.length / 8)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedEgift && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-gray-900">
                    {selectedEgift.title}
                  </h2>
                  <button
                    onClick={closeDetailModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
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

                {/* Modal Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {selectedEgift.image ? (
                      <img
                        src={selectedEgift.image}
                        alt={selectedEgift.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={`/assets/images/${
                          selectedEgift.title.toLowerCase().includes("doraemon")
                            ? "drm"
                            : selectedEgift.title
                                .toLowerCase()
                                .includes("stitch")
                            ? "st"
                            : "gf"
                        }.png`}
                        alt={selectedEgift.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    {/* Points */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg text-orange-500">
                        {selectedEgift.points} points
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {selectedEgift.description}
                      </p>
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-3">
                      {selectedEgift.material && (
                        <div>
                          <span className="font-medium text-gray-900">
                            Material:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {selectedEgift.material}
                          </span>
                        </div>
                      )}
                      {selectedEgift.size && (
                        <div>
                          <span className="font-medium text-gray-900">
                            Size:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {selectedEgift.size}
                          </span>
                        </div>
                      )}
                      {selectedEgift.design && (
                        <div>
                          <span className="font-medium text-gray-900">
                            Design:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {selectedEgift.design}
                          </span>
                        </div>
                      )}
                      {selectedEgift.stock !== undefined && (
                        <div>
                          <span className="font-medium text-gray-900">
                            Stock:
                          </span>
                          <span className="text-gray-600 ml-2">
                            {selectedEgift.stock} available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={closeDetailModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
