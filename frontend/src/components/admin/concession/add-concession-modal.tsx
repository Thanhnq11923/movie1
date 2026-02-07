"use client";

import type { ConcessionItem } from "./concession-managemen";
import { useState } from "react";
import { X, CreditCard, Package, Zap, Image, AlertCircle } from "lucide-react";
import { notify, MESSAGES } from "../../../lib/toast";

interface AddConcessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (
    newProduct: Omit<ConcessionItem, "id" | "createdAt" | "updatedAt">
  ) => void;
  isLoading: boolean; // Added isLoading prop
}

export function AddConcessionModal({
  isOpen,
  onClose,
  onSuccess,
  isLoading,
}: AddConcessionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
    category: "popcorn",
    status: true,
    stockQuantity: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Validate Product Name - no special characters allowed
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    } else {
      const nameRegex = /^[a-zA-Z0-9\s\u00C0-\u1EF9]+$/; // Allow letters, numbers, spaces, and Vietnamese characters
      if (!nameRegex.test(formData.name.trim())) {
        newErrors.name = "Product name cannot contain special characters (except spaces and Vietnamese characters)";
      }
    }
    
    if (
      !formData.price ||
      isNaN(Number(formData.price)) ||
      Number(formData.price) <= 0
    )
      newErrors.price = "Price must be a positive number";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (
      formData.stockQuantity === "" ||
      isNaN(Number(formData.stockQuantity)) ||
      Number(formData.stockQuantity) < 0
    )
      newErrors.stockQuantity = "Current stock cannot be negative";

    if (formData.image && formData.image.trim()) {
      try {
        new URL(formData.image);
      } catch {
        newErrors.image = "Please enter a valid image URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ): void => {
    const { name, value } = e.target;
    const target = e.target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "image") {
      setImageError(false);
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleImageLoad = () => {
    setImageError(false);
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoadStart = () => {
    setImageLoading(true);
    setImageError(false);
  };

  const handleClose = (): void => {
    if (isLoading) {
      notify.warning("Please wait for the operation to complete");
      return;
    }
    setFormData({
      name: "",
      price: "",
      image: "",
      description: "",
      category: "popcorn",
      status: true,
      stockQuantity: "",
    });
    setErrors({});
    setImageError(false);
    setImageLoading(false);
    onClose();
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!validateForm()) {
      notify.warning(
        MESSAGES?.GENERAL?.VALIDATION_ERROR || "Please fix validation errors!"
      );
      return;
    }
    try {
      const newProduct = {
        name: formData.name,
        price: Number(formData.price),
        image: formData.image || "/placeholder.svg?height=200&width=200",
        description: formData.description,
        category: formData.category as ConcessionItem["category"],
        status: formData.status ? "active" : "inactive" as "active" | "inactive",
        stockQuantity: Number(formData.stockQuantity),
      };
      if (onSuccess) onSuccess(newProduct);
    } catch (error) {
      console.error("Error creating concession:", error);
      notify.error(
        MESSAGES?.CONCESSION?.ERROR || "Failed to create concession"
      );
    }
  };

  const getImageSrc = () => {
    if (formData.image && formData.image.trim()) {
      return formData.image;
    }
    return "/placeholder.svg?height=200&width=200";
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={!isLoading ? handleClose : undefined}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center rounded-lg">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
              <span className="text-gray-700 font-medium">
                Creating product...
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="pb-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <p className="text-gray-600">
            Create a new concession item for your cinema
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Basic Information
                </h3>
                <div>
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Product Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Enter product name (no special characters)"
                    pattern="[a-zA-Z0-9\s\u00C0-\u1EF9]+"
                    title="Only letters, numbers, spaces, and Vietnamese characters are allowed"
                    className={`mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.name ? "border-red-500" : "border-gray-200"
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
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="w-full mt-1 p-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-black border-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    <option value="popcorn">Popcorn</option>
                    <option value="drinks">Drinks</option>
                    <option value="snacks">Snacks</option>
                    <option value="combos">Combos</option>
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.category}
                    </p>
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
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="Describe your product"
                    rows={3}
                    className={`mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.description ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pricing
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="price"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Selling Price *
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleNumberChange}
                      disabled={isLoading}
                      placeholder="0"
                      title="Price must be a positive number"
                      className={`mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.price ? "border-red-500" : "border-gray-200"
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
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Product Image
                </h3>
                <div>
                  <label
                    htmlFor="image"
                    className="text-sm font-medium text-gray-700 block"
                  >
                    Image URL (optional)
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    value={formData.image}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    placeholder="https://example.com/image.jpg"
                    className={`mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed ${
                      errors.image ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.image && (
                    <p className="text-sm text-red-500 mt-1">{errors.image}</p>
                  )}
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <div className="relative">
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
                      </div>
                    )}
                    {imageError && formData.image ? (
                      <div className="flex flex-col items-center justify-center h-32">
                        <AlertCircle className="w-12 h-12 text-red-400 mb-2" />
                        <p className="text-sm text-red-500">
                          Failed to load image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Please check the URL
                        </p>
                      </div>
                    ) : (
                      <img
                        src={getImageSrc()}
                        alt="Preview"
                        className={`w-32 h-32 object-cover rounded-lg mx-auto shadow-sm ${
                          imageLoading ? "opacity-50" : ""
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                        onLoadStart={handleImageLoadStart}
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Enter an image URL above to preview
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Inventory
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="stockQuantity"
                      className="text-sm font-medium text-gray-700 block"
                    >
                      Current Stock *
                    </label>
                    <input
                      id="stockQuantity"
                      name="stockQuantity"
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={handleNumberChange}
                      disabled={isLoading}
                      placeholder="0"
                      title="Current stock cannot be negative"
                      className={`mt-1 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:cursor-not-allowed ${
                        errors.stockQuantity
                          ? "border-red-500"
                          : "border-gray-200"
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Status
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="rounded border-gray-300 text-black focus:ring-black disabled:cursor-not-allowed"
                    />
                    <span className="font-medium text-gray-900">
                      Active Product
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
