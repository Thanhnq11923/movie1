"use client";

import { useState } from "react";
import { Star, Reply, Send, X, FileText } from "lucide-react";
import { notify, MESSAGES } from "../../../lib/toast";
import { feedbackService } from "../../../services/api";
import type { MovieFeedback } from "./feedback-management";

interface RespondMovieFeedbackModalProps {
  feedback: MovieFeedback;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedFeedback: MovieFeedback) => void;
}

// Template interface
interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  category: "positive" | "negative" | "neutral" | "general";
}

export default function RespondMovieFeedbackModal({
  feedback,
  isOpen,
  onClose,
  onUpdate,
}: RespondMovieFeedbackModalProps) {
  const [responseText, setResponseText] = useState(feedback.responseText || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  if (!isOpen) return null;

  // Response templates
  const responseTemplates: ResponseTemplate[] = [
    {
      id: "positive-1",
      name: "Thank You Template",
      category: "positive",
      content: `Dear ${feedback.customerName},

Thank you for taking the time to share your wonderful feedback about your experience at Onyx Cinema. We are delighted to hear that you enjoyed your movie and our service.

Your positive feedback motivates our team to continue delivering exceptional experiences. We truly appreciate customers like you who take the time to let us know when we're doing well.

We look forward to welcoming you back for many more memorable movie experiences!

Best regards,
Onyx Cinema Team`,
    },
    {
      id: "positive-2",
      name: "Appreciation Template",
      category: "positive",
      content: `Hello ${feedback.customerName},

We are thrilled to receive your positive feedback! Thank you for choosing Onyx Cinema for your entertainment needs.

Your satisfaction is our top priority, and knowing that we've met your expectations brings us great joy. We will continue to strive for excellence in every aspect of our service.

Thank you for being a valued customer. We can't wait to serve you again!

Warm regards,
Onyx Cinema Team`,
    },
    {
      id: "negative-1",
      name: "Apology Template",
      category: "negative",
      content: `Dear ${feedback.customerName},

We sincerely apologize that your experience at Onyx Cinema did not meet your expectations. We take all feedback seriously and are committed to addressing the issues you've raised.

We have noted your concerns and will:
• Review and improve our facility maintenance
• Enhance staff training programs
• Implement corrective measures to prevent similar issues

We value your feedback and hope to have the opportunity to serve you better in the future.

Best regards,
Onyx Cinema Team`,
    },
    {
      id: "negative-2",
      name: "Resolution Template",
      category: "negative",
      content: `Hello ${feedback.customerName},

Thank you for bringing these issues to our attention. We deeply regret that your experience fell short of our standards.

We are taking immediate action to:
- Investigate the specific problems you mentioned
- Retrain our staff where necessary
- Upgrade our facilities as needed

We would appreciate the chance to make this right. Please contact us directly so we can discuss how we can improve your experience.

Sincerely,
Onyx Cinema Team`,
    },
    {
      id: "neutral-1",
      name: "Acknowledgment Template",
      category: "neutral",
      content: `Dear ${feedback.customerName},

Thank you for sharing your feedback about your experience at Onyx Cinema. We appreciate you taking the time to provide us with your thoughts.

We have carefully reviewed your comments and will use them to improve our services. Your input helps us understand what we're doing well and where we can enhance our customer experience.

We hope to serve you again and provide an even better experience next time.

Best regards,
Onyx Cinema Team`,
    },
    {
      id: "general-1",
      name: "General Response Template",
      category: "general",
      content: `Dear ${feedback.customerName},

Thank you for your feedback regarding your recent visit to Onyx Cinema. We appreciate you taking the time to share your experience with us.

We value all customer feedback as it helps us understand how we can better serve our community. Your comments will be reviewed by our management team.

We hope to see you again soon and provide you with an excellent movie-going experience.

Best regards,
Onyx Cinema Team`,
    },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!responseText.trim()) {
      notify.error("Please write a response before sending");
      return;
    }

    if (responseText.trim().length < 10) {
      notify.error("Response must be at least 10 characters long");
      return;
    }

    setIsSubmitting(true);

    try {
      const loadingToast = notify.loading("Sending response to customer...");

      // Call the API to respond to feedback
      await feedbackService.respondToFeedback(feedback.id, responseText.trim());

      // Automatically update status to "Resolved" after responding
      await feedbackService.updateFeedbackStatus(feedback.id, "Approved");

      // Update feedback with response and resolved status
      const updatedFeedback: MovieFeedback = {
        ...feedback,
        responseText: responseText.trim(),
        respondedAt: new Date().toISOString(),
        priority: "low" as const, // Auto set to low priority (resolved)
      };

      if (onUpdate) {
        onUpdate(updatedFeedback);
      }

      notify.dismiss(loadingToast);
      notify.success("Response sent successfully!");

      // Close modal after successful response
      onClose();
    } catch (error) {
      console.error("Error responding to feedback:", error);
      notify.error(
        feedbackService.handleError(error) || MESSAGES.FEEDBACK.ERROR
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <span className="ml-1 text-sm text-gray-500">({rating}/10)</span>
      </div>
    );
  };

  const getRatingCategory = (rating: number) => {
    if (rating >= 8) return "positive";
    if (rating <= 4) return "negative";
    return "neutral";
  };

  const getRatingBadge = (rating: number) => {
    const category = getRatingCategory(rating);
    const styles = {
      positive: "bg-green-100 text-green-800",
      negative: "bg-red-100 text-red-800",
      neutral: "bg-yellow-100 text-yellow-800",
    };
    const labels = {
      positive: "Positive",
      negative: "Negative",
      neutral: "Neutral",
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[category]}`}
      >
        {labels[category]}
      </span>
    );
  };

  const applyTemplate = (template: ResponseTemplate) => {
    if (isSubmitting) return;

    setResponseText(template.content);
    setShowTemplates(false);
    notify.info(
      `Template "${template.name}" applied! You can customize the response before sending.`
    );
  };

  const getCharacterCount = () => {
    return responseText.trim().length;
  };

  const isResponseValid = () => {
    return responseText.trim().length >= 10;
  };

  const getSuggestedTemplates = () => {
    const category = getRatingCategory(feedback.overallRating);
    return responseTemplates.filter(
      (t) => t.category === category || t.category === "general"
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Reply className="h-5 w-5" />
            <h2 className="text-xl font-bold">Respond to Customer Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Movie Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{feedback.customerName}</h3>
              {getRatingBadge(feedback.overallRating)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Movie:</span>{" "}
                {feedback.movieTitle}
              </div>
              <div>
                <span className="font-medium">Date:</span>{" "}
                {new Date(feedback.createdAt).toLocaleDateString("en-US")}
              </div>
              {feedback.room !== "No Booking" && (
                <div>
                  <span className="font-medium">Location:</span> {feedback.room}
                  {feedback.seat !== "N/A" && ` - ${feedback.seat}`}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-medium">Overall Rating:</span>
                {renderStars(feedback.overallRating)}
              </div>
            </div>
          </div>

          {/* Original Review */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Customer Review</h3>
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
              <p className="text-sm leading-relaxed">{feedback.reviewText}</p>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Response Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Response</h3>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FileText className="h-4 w-4" />
                Use Template
              </button>
            </div>

            {/* Template Selection */}
            {showTemplates && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">
                  Suggested Templates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {getSuggestedTemplates().map((template) => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      disabled={isSubmitting}
                      className="text-left p-3 bg-white rounded border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      <div className="font-medium text-sm text-blue-900">
                        {template.name}
                      </div>
                      <div className="text-xs text-blue-700 mt-1 line-clamp-2">
                        {template.content.substring(0, 100)}...
                      </div>
                    </button>
                  ))}
                </div>
                <div className="mt-3 text-xs text-blue-700">
                  💡 Templates are customized based on the customer's rating.
                  You can modify them before sending.
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                placeholder="Write your response to the customer..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={8}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {getCharacterCount()} characters
                {getCharacterCount() < 10 && (
                  <span className="text-red-500 ml-1">(min 10)</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                This response will be sent to {feedback.customerEmail}
              </p>
              <div className="flex items-center gap-2">
                {!isResponseValid() && (
                  <span className="text-xs text-red-500">
                    Response too short
                  </span>
                )}
                {isResponseValid() && (
                  <span className="text-xs text-green-500">
                    ✓ Ready to send
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Previous Response (if exists) */}
          {feedback.responseText && feedback.responseText !== responseText && (
            <>
              <hr className="border-gray-200" />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Previous Response</h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm leading-relaxed">
                    {feedback.responseText}
                  </p>
                  {feedback.respondedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Sent on:{" "}
                      {new Date(feedback.respondedAt).toLocaleString("en-US")}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isResponseValid() || isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 transition-colors min-w-[130px] justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Response
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
