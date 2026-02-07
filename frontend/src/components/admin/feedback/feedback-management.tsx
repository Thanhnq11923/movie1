import React, { useEffect, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Trash2,
  RefreshCw,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Eye,
  Reply,
  Clock,
  AlertTriangle,
  Star,
} from "lucide-react";
import type { Feedback } from "../../../services/api/feedbackService";
import { notify } from "../../../lib/toast";
import { feedbackService } from "../../../services/api";
import ViewMovieFeedbackModalComponent from "./view-feedback";
import RespondMovieFeedbackModalComponent from "./respond-feedback";

// Explicitly export the MovieFeedback interface so other components can use it
export interface MovieFeedback {
  id: string;
  customerName: string;
  customerEmail: string;
  movieTitle: string;
  showtime: string;
  room: string;
  seat: string;
  movieRating: number;
  serviceRating: number;
  facilityRating: number;
  overallRating: number;
  reviewText: string;
  priority: "low" | "medium" | "high";
  createdAt: string;
  respondedAt?: string;
  responseText?: string;
}

// Create type-safe wrappers for the modal components
const ViewMovieFeedbackModal = ViewMovieFeedbackModalComponent as React.FC<{
  feedback: MovieFeedback;
  isOpen: boolean;
  onClose: () => void;
}>;

const RespondMovieFeedbackModal =
  RespondMovieFeedbackModalComponent as React.FC<{
    feedback: MovieFeedback;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: (updatedFeedback: MovieFeedback) => void;
  }>;

// Map API feedback to UI feedback
const mapApiToUiFeedback = (apiFeedback: Feedback): MovieFeedback => {
  // Get movie title (use both English and Vietnamese if available)
  const movieTitle = apiFeedback.movieId
    ? `${apiFeedback.movieId.versionMovieVn} (${apiFeedback.movieId.versionMovieEnglish})`
    : "Unknown Movie";

  return {
    id: apiFeedback._id,
    customerName: apiFeedback.userId?.fullName || "Anonymous User",
    customerEmail: apiFeedback.userId?.username || "user@example.com",
    movieTitle: movieTitle,
    showtime: new Date(apiFeedback.createdAt).toLocaleString(),
    room: apiFeedback.bookingId ? `Booking #${apiFeedback.bookingId.slice(-6)}` : "No Booking",
    seat: apiFeedback.bookingId ? "Multiple Seats" : "N/A",
    movieRating: apiFeedback.score,
    serviceRating: apiFeedback.score,
    facilityRating: apiFeedback.score,
    overallRating: apiFeedback.score,
    reviewText: apiFeedback.review,
    priority: apiFeedback.respondMessage
      ? "low" // If has response, set to low priority (resolved)
      : apiFeedback.score <= 3
      ? "high" // 1-3 stars: High priority (needs immediate attention)
      : apiFeedback.score <= 6
      ? "medium" // 4-6 stars: Medium priority (needs monitoring)
      : "low", // 7-10 stars: Low priority (good feedback)
    createdAt: new Date(apiFeedback.createdAt).toLocaleString(),
    respondedAt: apiFeedback.respondMessage
      ? new Date(apiFeedback.updatedAt).toLocaleString()
      : undefined,
    responseText: apiFeedback.respondMessage || undefined,
  };
};

const FeedbackManagement: React.FC = () => {
  const [feedback, setFeedback] = useState<MovieFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Priority");
  const [movieFilter, setMovieFilter] = useState<string>("All Movies");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [selectedFeedback, setSelectedFeedback] =
    useState<MovieFeedback | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] =
    useState<MovieFeedback | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiData = await feedbackService.getAllFeedbacks();
      const uiData = apiData.map(mapApiToUiFeedback);
      // Sort feedback by createdAt in descending order (newest first)
      uiData.sort(
        (a, b) =>
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
      );
      setFeedback(uiData);
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to fetch feedback");
      notify.error(`Failed to fetch feedback: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const filteredFeedback = feedback.filter((f) => {
    const matchesSearch =
      f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.reviewText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Priority" ||
      f.priority === statusFilter.toLowerCase();
    const matchesMovie =
      movieFilter === "All Movies" || f.movieTitle === movieFilter;
    return matchesSearch && matchesStatus && matchesMovie;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedback = filteredFeedback.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setShowDropdown(null); // Close any open dropdown when changing pages
    }
  };

  const getFeedbackStats = () => {
    const total = feedback.length;
    const highPriority = feedback.filter((f) => f.priority === "high").length;
    const mediumPriority = feedback.filter(
      (f) => f.priority === "medium"
    ).length;
    const lowPriority = feedback.filter((f) => f.priority === "low").length;

    return { total, highPriority, mediumPriority, lowPriority };
  };

  const stats = getFeedbackStats();

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Priority");
    setMovieFilter("All Movies");
    setCurrentPage(1); // Reset to first page when resetting filters
    notify.info("Filters have been reset");
  };

  const handleDeleteFeedback = (id: string) => {
    const feedbackItem = feedback.find((f) => f.id === id);
    if (feedbackItem) {
      setFeedbackToDelete(feedbackItem);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackToDelete) return;

    try {
      setLoadingAction(feedbackToDelete.id);
      const loadingToast = notify.loading(
        `Deleting feedback from ${feedbackToDelete.customerName}...`
      );

      await feedbackService.deleteFeedback(feedbackToDelete.id);

      setFeedback((prev) => prev.filter((f) => f.id !== feedbackToDelete.id));

      notify.dismiss(loadingToast);
      notify.success(
        `Feedback from ${feedbackToDelete.customerName} deleted successfully`
      );

      setShowDeleteModal(false);
      setFeedbackToDelete(null);

      // Adjust current page if necessary
      if (currentFeedback.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error deleting feedback:", error);
      notify.error(`Failed to delete feedback: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const cancelDeleteFeedback = () => {
    setShowDeleteModal(false);
    setFeedbackToDelete(null);
  };

  const handleViewFeedback = (feedbackItem: MovieFeedback) => {
    setSelectedFeedback(feedbackItem);
    setIsViewModalOpen(true);
    setShowDropdown(null);
  };

  const handleRespondFeedback = (feedbackItem: MovieFeedback) => {
    setSelectedFeedback(feedbackItem);
    setIsRespondModalOpen(true);
    setShowDropdown(null);
  };

  const handleUpdateFeedback = (updatedFeedback: MovieFeedback) => {
    try {
      setFeedback((prev) =>
        prev.map((f) => (f.id === updatedFeedback.id ? updatedFeedback : f))
      );
      setIsRespondModalOpen(false);
      // Refresh data to ensure consistency with API
      setTimeout(() => {
        fetchFeedbacks();
      }, 500);
    } catch {
      notify.error("Failed to update feedback");
    }
  };

  const handleClickOutside = () => {
    setShowDropdown(null);
  };

  const getPriorityIcon = (priority: "low" | "medium" | "high") => {
    if (priority === "high") {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (priority === "medium") {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  // Unique movies for filter
  const uniqueMovies = Array.from(
    new Set(feedback.map((f) => f.movieTitle))
  ).sort();

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <MessageSquare className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load feedback
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchFeedbacks}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6 relative"
      onClick={handleClickOutside}
    >
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Feedback Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage customer feedback and reviews across your organization
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Feedback</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">
                All feedback received
              </p>
            </div>
            <MessageSquare className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-3xl font-bold text-red-600">
                {stats.highPriority}
              </p>
              <p className="text-xs text-gray-500 mt-1">Needs attention</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Medium Priority</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.mediumPriority}
              </p>
              <p className="text-xs text-gray-500 mt-1">Moderate concern</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Priority</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.lowPriority}
              </p>
              <p className="text-xs text-gray-500 mt-1">Resolved</p>
            </div>
            <MessageSquare className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Feedback List
            </h2>
            <button
              onClick={fetchFeedbacks}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by customer, movie, or review..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="All Priority">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={movieFilter}
              onChange={(e) => {
                setMovieFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="All Movies">All Movies</option>
              {uniqueMovies.map((movie) => (
                <option key={movie} value={movie}>
                  {movie}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] sm:min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Customer
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Movie
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Rating
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Priority
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Review
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentFeedback.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base"
                    >
                      No feedback found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentFeedback.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 relative">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(item.priority)}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.customerName}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {item.customerEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.movieTitle}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {item.showtime}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900">
                            {item.overallRating}/10
                          </span>
                          <Star className="w-4 h-4 text-yellow-400" />
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadgeColor(
                            item.priority
                          )}`}
                        >
                          {item.priority.charAt(0).toUpperCase() +
                            item.priority.slice(1)}{" "}
                          Priority
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 max-w-xs">
                        <div className="truncate text-sm text-gray-600">
                          {item.reviewText}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="relative">
                          <button
                            data-feedback-id={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(
                                showDropdown === item.id ? null : item.id
                              );
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            disabled={loadingAction === item.id}
                          >
                            {loadingAction === item.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                              <MoreHorizontal className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredFeedback.length)} of{" "}
              {filteredFeedback.length} feedback
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu Portal - Positioned outside table */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-feedback-id="${showDropdown}"]`
              );
              if (!buttonElement) return {};

              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120; // Approximate height of dropdown with 3 items
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;

              // Check if dropdown should appear above or below
              const shouldAppearAbove =
                spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;

              const left = Math.min(
                window.innerWidth - 170, // dropdown width + padding
                Math.max(10, buttonRect.right - 160)
              );

              const top = shouldAppearAbove
                ? buttonRect.top - dropdownHeight - 5
                : buttonRect.bottom + 5;

              return {
                left: `${left}px`,
                top: `${Math.max(
                  10,
                  Math.min(top, viewportHeight - dropdownHeight - 10)
                )}px`,
              };
            })()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  const feedbackItem = feedback.find(
                    (f) => f.id === showDropdown
                  );
                  if (feedbackItem) handleViewFeedback(feedbackItem);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
              <button
                onClick={() => {
                  const feedbackItem = feedback.find(
                    (f) => f.id === showDropdown
                  );
                  if (feedbackItem) handleRespondFeedback(feedbackItem);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Reply className="w-4 h-4 mr-2" />
                Respond
              </button>

              <button
                onClick={() => {
                  handleDeleteFeedback(showDropdown);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && feedbackToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteFeedback}
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
                  Delete Feedback
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this feedback?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {feedbackToDelete.customerName}
                  </p>
                  <p className="text-gray-600">
                    {feedbackToDelete.customerEmail}
                  </p>
                  <p className="text-gray-600">
                    Movie: {feedbackToDelete.movieTitle}
                  </p>
                  <p className="text-gray-600">
                    Priority:{" "}
                    {feedbackToDelete.priority.charAt(0).toUpperCase() +
                      feedbackToDelete.priority.slice(1)}
                  </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. All feedback data will also be
                affected.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteFeedback}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFeedback}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedFeedback && (
        <>
          <ViewMovieFeedbackModal
            feedback={selectedFeedback}
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
          />
          <RespondMovieFeedbackModal
            feedback={selectedFeedback}
            isOpen={isRespondModalOpen}
            onClose={() => setIsRespondModalOpen(false)}
            onUpdate={handleUpdateFeedback}
          />
        </>
      )}
    </div>
  );
};

export default FeedbackManagement;
