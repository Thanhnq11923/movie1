import React, { useState, useEffect } from "react";
import { X, Power, PowerOff } from "lucide-react";
import { notify, MESSAGES } from "../../../lib/toast";
import { promotionService } from "../../../services/api";
import type { Promotion } from "../../../types/promotion";

// Types
type PromotionType = "percentage" | "fixed" | "free_item";
type PromotionStatus = "active" | "inactive" | "expired";

// EditPromotionModal Component
interface EditPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion: Promotion | null;
  onSave: (updatedPromotion: Promotion) => void;
  existingPromotions?: Promotion[]; // Add this to check for code conflicts
}

export default function EditPromotionModal({
  isOpen,
  onClose,
  promotion,
  onSave,
  existingPromotions = [],
}: EditPromotionModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    discountType: "percentage" as PromotionType,
    discountValue: "",
    startDate: "",
    endDate: "",
    maxUsage: 100,
    description: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    if (promotion) {
      let cleanValue = promotion.discountValue?.toString() || "";
      if (promotion.discountType === "percentage" && cleanValue.includes("%")) {
        cleanValue = cleanValue.replace("%", "");
      }
      if (promotion.discountType === "fixed" && cleanValue.includes("đ")) {
        cleanValue = cleanValue.replace(/[đ\s]/g, "").replace(/\./g, "");
      }

      setFormData({
        title: promotion.title,
        code: promotion.code || "",
        discountType: promotion.discountType || "percentage",
        discountValue: cleanValue,
        startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : "",
        endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : "",
        maxUsage: promotion.maxUsage || 100,
        description: promotion.description || "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [promotion]);

  if (!isOpen || !promotion) return null;

  const handleSubmit = async () => {
    if (!validateForm()) {
      notify.error(MESSAGES.GENERAL.VALIDATION_ERROR);
      return;
    }

    setIsSubmitting(true);

    try {
      const now = new Date();
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      let status: PromotionStatus = "active";

      if (endDate < now) {
        status = "expired";
      } else if (now < startDate) {
        status = "inactive";
      } else if (endDate.getTime() - now.getTime() <= 2 * 24 * 60 * 60 * 1000) {
        status = "inactive";
      }

      // Prepare update data - only include fields that have changed
      const updateData: any = {};
      
      // Only include fields that have actually changed
      if (formData.title !== promotion.title) {
        updateData.title = formData.title;
      }
      
      if (formData.code !== promotion.code) {
        updateData.code = formData.code;
      }
      
      if (formData.discountType !== promotion.discountType) {
        updateData.discountType = formData.discountType;
      }
      
      if (formData.discountValue !== (promotion.discountValue?.toString() || "")) {
        updateData.discountValue = typeof formData.discountValue === 'number' ? formData.discountValue : parseFloat(formData.discountValue);
      }
      
      if (formData.startDate !== (promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : "")) {
        updateData.startDate = formData.startDate;
      }
      
      if (formData.endDate !== (promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : "")) {
        updateData.endDate = formData.endDate;
      }
      
      if (formData.maxUsage !== promotion.maxUsage) {
        updateData.maxUsage = formData.maxUsage;
      }
      
      if (formData.description !== promotion.description) {
        updateData.description = formData.description;
      }
      
      // Always include status as it's calculated based on dates
      updateData.status = status;

      console.log('=== EDIT PROMOTION DEBUG ===');
      console.log('Current promotion ID:', promotion._id);
      console.log('Current promotion slug:', promotion.slug);
      console.log('Changed fields:', Object.keys(updateData));
      console.log('Update data being sent:', JSON.stringify(updateData, null, 2));

      // Call API to update promotion
      const response = await promotionService.updatePromotion(promotion.slug, updateData);
      
      if (response.success) {
        // Call the onSave function with the updated promotion from API
        onSave(response.data);
        notify.success(MESSAGES.PROMOTION.UPDATED);
        onClose();
      } else {
        // Handle specific error messages
        if (response.message?.includes("already exists")) {
          notify.error("Code or title already exists. Please use a different code or title.");
        } else {
          notify.error(response.message || MESSAGES.PROMOTION.ERROR);
        }
      }
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      
      // Handle specific error cases
      if (error.response?.data?.message?.includes("already exists")) {
        const errorMessage = error.response.data.message;
        if (errorMessage.includes("slug")) {
          notify.error("Cannot update this promotion. The title change would create a duplicate slug. Please use a different title or contact administrator.");
        } else if (errorMessage.includes("code")) {
          notify.error("A promotion with this code already exists. Please use a different code.");
        } else {
          notify.error("A promotion with this slug or code already exists. Please check your input.");
        }
      } else {
        const errorMessage = promotionService.handleError ? promotionService.handleError(error) : MESSAGES.PROMOTION.ERROR;
        notify.error(errorMessage);
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

  const handleToggleStatus = async () => {
    if (!promotion) return;
    try {
      setIsTogglingStatus(true);
      const loadingToast = notify.loading("Updating promotion status...");
      const newStatus: PromotionStatus = promotion.status === "active" ? "expired" : "active";
      const updateData: any = { status: newStatus };
      const response = await promotionService.updatePromotion(promotion.slug, updateData);
      if (response.success) {
        const updatedPromotion = { ...promotion, status: newStatus };
        onSave(updatedPromotion);
        notify.dismiss(loadingToast);
        notify.success(newStatus === "active" ? MESSAGES.PROMOTION.ACTIVATED : MESSAGES.PROMOTION.DEACTIVATED);
      } else {
        notify.dismiss(loadingToast);
        notify.error(response.message || MESSAGES.PROMOTION.ERROR);
      }
    } catch (error: any) {
      notify.error(MESSAGES.PROMOTION.ERROR);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (promotion) {
      // Check if title has changed
      const titleChanged = formData.title !== promotion.title;
      
      if (titleChanged) {
        // Only check for duplicate title (case-insensitive) - exclude current promotion
        const isDuplicateTitle = existingPromotions.some(
          (existingPromotion) =>
            existingPromotion._id !== promotion._id && // Exclude current promotion
            existingPromotion.title?.toLowerCase().trim() === formData.title.toLowerCase().trim()
        );
        
        if (isDuplicateTitle) {
          newErrors.title = "This title already exists. Please use a different title.";
        }
      }
      // Allow all other changes without slug validation
    }

    if (!formData.code.trim()) {
      newErrors.code = "Code is required";
    } else {
      // Check for duplicate code (case-insensitive) - exclude current promotion
      const isDuplicateCode = existingPromotions.some(
        (existingPromotion) =>
          existingPromotion._id !== promotion._id && // Exclude current promotion
          existingPromotion.code?.toLowerCase().trim() === formData.code.toLowerCase().trim()
      );
      
      if (isDuplicateCode) {
        newErrors.code = "This code already exists. Please use a different code.";
      }
    }

    if (!formData.discountValue || (typeof formData.discountValue === 'number' ? formData.discountValue <= 0 : parseFloat(formData.discountValue) <= 0)) {
      newErrors.discountValue = "Value must be greater than 0";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      if (endDate <= startDate) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    if (!formData.maxUsage || formData.maxUsage <= 0) {
      newErrors.maxUsage = "Max usage must be greater than 0";
    } else if (formData.maxUsage < (promotion.currentUsage || 0)) {
      newErrors.maxUsage = `Max usage cannot be less than current usage (${promotion.currentUsage || 0})`;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
          <h2 className="text-xl font-bold text-gray-900">Edit Promotion</h2>
          <div className="flex items-center gap-2">
            {promotion && (
              <button
                onClick={handleToggleStatus}
                disabled={isTogglingStatus || isSubmitting}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  promotion.status === "active"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isTogglingStatus ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                ) : promotion.status === "active" ? (
                  <PowerOff className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )}
                {promotion.status === "active" ? "Deactivate" : "Activate"}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Current Status
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  promotion.status === "active"
                    ? "bg-green-100 text-green-800"
                    : promotion.status === "expired"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {promotion.status || "unknown"}
              </span>
            </div>
          </div>

          {/* Warning for title changes */}
          {promotion && formData.title !== promotion.title && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                ℹ️ Title Change Notice
              </h3>
              <p className="text-sm text-blue-700">
                Changing the title will automatically update the promotion's URL slug.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Promotion Title *
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
                style={{ textTransform: "uppercase" }}
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code}</p>
              )}
            </div>

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
                Maximum Usage *
              </label>
              <input
                type="number"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleInputChange}
                min={promotion.currentUsage || 0}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed ${
                  errors.maxUsage ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.maxUsage && (
                <p className="text-red-500 text-xs mt-1">{errors.maxUsage}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Minimum value: {promotion.currentUsage || 0} (current usage)
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
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
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 min-w-[125px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
