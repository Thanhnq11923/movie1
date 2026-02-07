"use client";

import {
  Clock,
  User,
  MessageSquare,
  X,
  Star,
  Film,
  CheckCircle,
} from "lucide-react";
import type { MovieFeedback } from "./feedback-management";

interface ViewMovieFeedbackModalProps {
  feedback: MovieFeedback;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewMovieFeedbackModal({
  feedback,
  isOpen,
  onClose,
}: ViewMovieFeedbackModalProps) {
  if (!isOpen) return null;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({rating}/10)</span>
      </div>
    );
  };

  const getPriorityBadge = (priority: "low" | "medium" | "high") => {
    const styles = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    };
    const labels = {
      low: "Low Priority",
      medium: "Medium Priority",
      high: "High Priority",
    };
    return (
      <span
        className={`px-2 py-1 rounded text-sm font-medium ${styles[priority]}`}
      >
        {labels[priority]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Feedback Details
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                <p className="font-medium text-gray-900">
                  {feedback.customerName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                <p className="font-medium text-gray-900">
                  {feedback.customerEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Movie & Booking Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Film className="h-5 w-5 text-gray-600" />
              Movie & Booking Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Movie Title</p>
                <p className="font-medium text-gray-900">
                  {feedback.movieTitle}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Feedback Date</p>
                <p className="font-medium text-gray-900">
                  {formatDate(feedback.createdAt)}
                </p>
              </div>
              {feedback.respondedAt && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Response Date</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(feedback.respondedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Rating & Status */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-gray-600" />
              Rating & Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-2">Overall Rating</p>
                {renderStars(feedback.overallRating)}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Priority Level</p>
                {getPriorityBadge(feedback.priority)}
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Response Status</p>
                <div className="flex items-center gap-2">
                  {feedback.responseText ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-700">Responded</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-yellow-700">
                        Pending Response
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Customer Review */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              Customer Review
            </h3>
            <div className="bg-gray-50 p-4 rounded border">
              <p className="text-gray-700 leading-relaxed">
                {feedback.reviewText}
              </p>
            </div>
          </div>

          {/* Admin Response (if exists) */}
          {feedback.responseText && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-600" />
                Our Response
              </h3>
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {feedback.responseText}
                </p>
                {feedback.respondedAt && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Responded on {formatDate(feedback.respondedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
