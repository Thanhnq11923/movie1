import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { promotionService } from "../../../services/api";
import type { Promotion } from "../../../types/promotion";


interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newPromotion: Promotion) => void;
  existingPromotions?: Promotion[]; // Add this to check for code conflicts
}

export default function CreatePromotionModal({
  isOpen,
  onClose,
  onSave,
  existingPromotions = [],
}: CreatePromotionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discountType: "percentage", // Khôi phục discountType
    discountValue: "",
    startDate: "",
    endDate: "",
    maxUsage: 100,
    description: "",
    image: "", // Add image field
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        code: "",
        discountType: "percentage", // Khôi phục discountType
        discountValue: "",
        startDate: "",
        endDate: "",
        maxUsage: 100,
        description: "",
        image: "", // Add image field
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Xoá mọi trường discountType, PromotionType, select type, validate, setFormData liên quan đến type
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      return;
    }
    if (!formData.code.trim()) {
      return;
    } else {
      // Check for duplicate code (case-insensitive)
      const isDuplicateCode = existingPromotions.some(
        (promotion) =>
          promotion.code?.toLowerCase().trim() === formData.code.toLowerCase().trim()
      );
      if (isDuplicateCode) {
        return;
      }
    }
    if (!formData.discountType) {
      return;
    }
    if (!formData.discountValue || (typeof formData.discountValue === 'number' ? formData.discountValue <= 0 : parseFloat(formData.discountValue) <= 0)) {
      return;
    }
    if (!formData.startDate) {
      return;
    }
    if (!formData.endDate) {
      return;
    }
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        return;
      }
    }
    if (!formData.maxUsage || formData.maxUsage <= 0) {
      return;
    }
    if (!formData.description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      let status: 'active' | 'inactive' | 'expired' = "active";

      if (endDate < now) {
        status = "expired";
      } else if (now < startDate) {
        status = "inactive";
      } else if (endDate.getTime() - now.getTime() <= 2 * 24 * 60 * 60 * 1000) {
        status = "inactive";
      }

      // Generate slug from title
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Prepare promotion data
      const promotionData = {
        title: formData.title,
        slug: slug,
        image: formData.image || "https://images.unsplash.com/photo-1489599835385-400fe74d0e0f?w=400&h=300&fit=crop", // Default image
        description: formData.description,
        content: [
          {
            type: 'text' as const,
            value: formData.description
          }
        ],
        related: [],
        shareCount: 0,
        code: formData.code,
        discountType: formData.discountType,
        discountValue: typeof formData.discountValue === 'number' ? formData.discountValue : parseFloat(formData.discountValue),
        minAmount: 0, // Required field - minimum amount for promotion to apply
        maxDiscount: 0, // Required field - maximum discount amount
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxUsage: formData.maxUsage,
        currentUsage: 0,
        status: status,
        category: 'general' as const,
        userGroups: ['all'],
        applicableMovies: [],
        applicableProducts: []
        // Do NOT send createdBy or updatedBy here
      };

      // Call API to create promotion
      const response = await promotionService.createPromotion(promotionData);
      
      if (response.success) {
        // Call the onSave function with the new promotion from API
        onSave(response.data);
        onClose();
      } else {
        // Handle specific error messages
        if (response.message?.includes("already exists")) {
        } else {
        }
      }
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      
      // Handle specific error cases
      if (error.response?.data?.message?.includes("already exists")) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("slug")) {
        } else if (errorMessage.includes("code")) {
        } else {
        }
      } else {
        const errorMessage = promotionService.handleError ? promotionService.handleError(error) : "An error occurred while creating the promotion.";
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "maxUsage" 
        ? parseInt(value) || 0 
        : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Create New Promotion
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Name *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Weekend 20% Off"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., WEEKEND20"
                style={{ textTransform: "uppercase" }}
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code}</p>
              )}
            </div>

            {/* Xoá mọi trường discountType, PromotionType, select type, validate, setFormData liên quan đến type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Type *
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free_item">Free Item</option>
              </select>
              {errors.discountType && (
                <p className="text-red-500 text-xs mt-1">{errors.discountType}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value *
              </label>
              <input
                type="text"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.discountValue ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., 20"
              />
              {errors.discountValue && (
                <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                placeholder="Optional description for the promotion"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (optional)
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.image ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-red-500 text-xs mt-1">{errors.image}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter a valid image URL. If left empty, a default image will be used.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                "Create Promotion"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
