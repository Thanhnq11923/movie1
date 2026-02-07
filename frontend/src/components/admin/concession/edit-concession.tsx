import type React from "react";
import { useState, useEffect } from "react";
import {
  X,
  Upload,
  Package,
  Zap,
} from "lucide-react";
import { notify, MESSAGES } from "../../../lib/toast"; // Import notification system
import { updateWatercorn } from "../../../services/api"; // Import API service

interface ConcessionItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: "popcorn" | "drinks" | "snacks" | "combos";
  status: "active" | "inactive";
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface EditConcessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  concession: ConcessionItem;
  onEdit: (concession: ConcessionItem) => void;
}

export function EditConcessionModal({
  isOpen,
  onClose,
  concession,
  onEdit,
}: EditConcessionModalProps) {
  const [formData, setFormData] = useState<ConcessionItem>(concession);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && concession) {
      setFormData(concession);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [concession, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validations
    if (!formData.name?.trim()) {
      newErrors.name = "Product name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Product name must be at least 2 characters";
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    } else if (formData.price > 999999) {
      newErrors.price = "Price cannot exceed $999,999";
    }

    if (!formData.stockQuantity && formData.stockQuantity !== 0) {
      newErrors.stockQuantity = "Stock quantity is required";
    } else if (formData.stockQuantity < 0) {
      newErrors.stockQuantity = "Stock cannot be negative";
    } else if (formData.stockQuantity > 999999) {
      newErrors.stockQuantity = "Stock quantity cannot exceed 999,999";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.id) {
      newErrors.general = "Product ID is missing. Please close and try again.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      notify.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Log for debugging
      console.log("Starting product update...");
      console.log("Product ID:", formData.id);
      console.log("Original concession:", concession);
      console.log("Form data:", formData);

      // Prepare data for API call
      const updateData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        image: formData.image || '',
        description: formData.description.trim(),
        category: formData.category,
        status: formData.status === "active" ? 1 : 0, // convert to number for backend
        stockQuantity: Number(formData.stockQuantity),
        updatedAt: new Date().toISOString(),
      };

      console.log("Prepared update data:", updateData);

      // Validate required fields one more time
      if (!formData.id) {
        throw new Error("Product ID is required for update");
      }

      // Call the API to update watercorn
      const response = await updateWatercorn(formData.id, updateData);
      console.log("API Response:", response);

      // Check for successful response
      if (response && (response.success !== false)) {
        // Create updated concession object
        const updatedConcession: ConcessionItem = {
          ...formData,
          // Merge any data returned from the API
          ...(response.data || {}),
          // Ensure these fields are properly formatted
          name: updateData.name,
          price: updateData.price,
          description: updateData.description,
          category: updateData.category,
          status: updateData.status === 1 ? "active" : "inactive",
          stockQuantity: updateData.stockQuantity,
          updatedAt: updateData.updatedAt,
        };

        console.log("Updated concession:", updatedConcession);

        // Call the parent onEdit function to update the local state
        onEdit(updatedConcession);

    
        
        // Close the modal
        handleClose();
      } else {
        // Handle API error response
        const errorMessage = response?.message || 
                            response?.error || 
                            "Failed to update product - unexpected response";
        console.error("API returned error:", response);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      
      // Enhanced error logging
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        status: error?.status,
        stack: error?.stack,
        formData: formData,
        updateData
      });
      
      // Determine appropriate error message
      let errorMessage = "Failed to update product. Please try again.";
      
      if (error?.message) {
        if (error.message.includes("token") || error.message.includes("Authentication")) {
          errorMessage = "Session expired. Please log in again.";
        } else if (error.message.includes("Network") || error.message.includes("fetch")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("Validation") || error.message.includes("Invalid")) {
          errorMessage = "Invalid data provided. Please check your inputs.";
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      notify.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      console.log("Cannot close modal while submitting");
      return;
    }

    console.log("Closing modal and resetting form");
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (isSubmitting) {
      console.log("Input change blocked - form is submitting");
      return;
    }

    const { id, value, type } = e.target;
    const { checked } = e.target as HTMLInputElement;

    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }

    console.log(`Input change: ${id} = ${value}`);

    switch (id) {
      case "name":
        setFormData(prev => ({ ...prev, name: value }));
        break;
      case "category":
        setFormData(prev => ({
          ...prev,
          category: value as ConcessionItem["category"],
        }));
        break;
      case "description":
        setFormData(prev => ({ ...prev, description: value }));
        break;
      case "price":
        const priceValue = value === '' ? 0 : Number(value);
        setFormData(prev => ({ ...prev, price: priceValue }));
        break;
      case "stockQuantity":
        const stockValue = value === '' ? 0 : Number(value);
        setFormData(prev => ({ ...prev, stockQuantity: stockValue }));
        break;
      case "status":
        if (type === "checkbox") {
          setFormData(prev => ({ 
            ...prev, 
            status: checked ? "active" : "inactive" 
          }));
        } else {
          setFormData(prev => ({ 
            ...prev, 
            status: value as ConcessionItem["status"] 
          }));
        }
        break;
      default:
        console.warn(`Unhandled input change for field: ${id}`);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + " ₫";
  };

  // Early return if modal is not open
  if (!isOpen) return null;

  // Check if concession data is valid
  if (!concession || !concession.id) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white max-w-md mx-4 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-600 mb-4">Invalid product data. Please close and try again.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={!isSubmitting ? handleClose : undefined}
    >
      <div
        className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-lg p-6 relative mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-100 pb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-gray-600">
              Update product information and settings
            </p>
            {formData.id && (
              <p className="text-sm text-gray-500 mt-1">
                Product ID: {formData.id}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isSubmitting ? "Cannot close while saving" : "Close"}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* General error display */}
        {errors.general && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Product Name *
                    </label>
                    <input
                      id="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Enter product name"
                      maxLength={100}
                      className={`mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                        errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="category"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Category *
                    </label>
                    <select
                      id="category"
                      value={formData.category || ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className={`w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                        errors.category ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                      }`}
                    >
                      <option value="">Select a category</option>
                      <option value="popcorn">Popcorn</option>
                      <option value="drinks">Drinks</option>
                      <option value="snacks">Snacks</option>
                      <option value="combos">Combos</option>
                    </select>
                    {errors.category && (
                      <p className="text-sm text-red-500 mt-1">{errors.category}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Describe your product in detail"
                      rows={3}
                      maxLength={500}
                      className={`mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                        errors.description
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.description ? (
                        <p className="text-sm text-red-500">{errors.description}</p>
                      ) : (
                        <span></span>
                      )}
                      <span className="text-xs text-gray-400">
                        {(formData.description || '').length}/500
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="price"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Selling Price * {formData.price > 0 && (
                        <span className="text-gray-500">
                          ({formatCurrency(formData.price)})
                        </span>
                      )}
                    </label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      max="999999"
                      value={formData.price || ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="0.00"
                      className={`mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                        errors.price ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.price && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Product Image
                </h3>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Product preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                  <button
                    type="button"
                    disabled
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 opacity-50 cursor-not-allowed mx-auto"
                  >
                    <Upload className="h-4 w-4" />
                    Change Image
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG up to 5MB (Feature coming soon)
                  </p>
                </div>
              </div>

              {/* Inventory */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label
                      htmlFor="stockQuantity"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Current Stock *
                    </label>
                    <input
                      id="stockQuantity"
                      type="number"
                      min="0"
                      max="999999"
                      value={formData.stockQuantity || ''}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="0"
                      className={`mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors ${
                        errors.stockQuantity ? "border-red-500 focus:ring-red-500" : "border-gray-200"
                      }`}
                    />
                    {errors.stockQuantity && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.stockQuantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Status
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <input
                      id="status"
                      type="checkbox"
                      checked={formData.status === "active"}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      className="rounded border-gray-300 text-black focus:ring-black disabled:cursor-not-allowed"
                    />
                    <div>
                      <span className="font-medium text-gray-900">
                        Active Product
                      </span>
                      <p className="text-sm text-gray-500">
                        Product will be visible to customers
                      </p>
                    </div>
                  </label>
                  <div className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${formData.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {formData.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.id}
              className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 min-w-[150px] justify-center transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </form>

        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <span className="text-gray-700 font-medium">
                Updating product...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}