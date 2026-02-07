"use client";
import { useState } from "react";
import axios from "axios";
import { notify } from "../../../lib/toast";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "Food" | "Beverage" | "Ticket" | "Merchandise" | "Experience";
  image: string;
  stock: number;
  redeemed: number;
  status: "Active" | "Inactive" | "Out of Stock";
  expiryDate?: string;
  price?: number;
  material?: string;
  size?: string;
  design?: string;
}

interface AddRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reward: Reward) => void;
}

export function AddRewardModal({
  isOpen,
  onClose,
  onSave,
}: AddRewardModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointsCost: "",
    category: "Food", // Auto-set to Food
    stock: "",
    expiryDate: "",
    status: "Active",
    image: "", // Add image URL field
    price: "", // Add price field
    material: "", // Add material field
    size: "", // Add size field
    design: "", // Add design field
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, image: value }));
    setImagePreview(value);
  };

  const handleSubmit = async () => {
    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate call");
      return;
    }
    
    console.log("handleSubmit called with formData:", formData);
    // Validate required fields
    if (!formData.name || !formData.category || !formData.pointsCost) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);

    // Chuẩn bị data đúng cấu trúc API egifts
    const egiftData = {
      title: formData.name,
      description: formData.description,
      points: parseInt(formData.pointsCost) || 0,
      category: formData.category,
      image: formData.image || "",
      stock: parseInt(formData.stock) || 0,
      price: parseFloat(formData.price) || 0,
      material: formData.material || "",
      size: formData.size || "",
      design: formData.design || "",
      isActive: formData.status === "Active",
    };

    let loadingToast: any;
    try {
      loadingToast = notify.loading("Creating new reward...");
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        "http://localhost:3000/api/egifts",
        egiftData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Nếu muốn cập nhật UI, gọi onSave với egift mới trả về (map lại nếu cần)
      const egift = res.data.data || res.data;
      onSave({
        id: egift._id,
        name: egift.title,
        description: egift.description,
        pointsCost: egift.points,
        category: egift.category,
        image: egift.image || formData.image || "",
        stock: egift.stock || parseInt(formData.stock) || 0,
        redeemed: egift.redeemed || 0,
        status: egift.isActive ? "Active" : "Inactive",
        expiryDate: egift.expiryDate || formData.expiryDate || undefined,
        price: egift.price || parseFloat(formData.price) || undefined,
        material: egift.material || formData.material || undefined,
        size: egift.size || formData.size || undefined,
        design: egift.design || formData.design || undefined,
      });
      notify.dismiss(loadingToast);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error creating reward:", err);
      if (loadingToast) {
        notify.dismiss(loadingToast);
      }
      notify.error("Failed to create reward!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      pointsCost: "",
      category: "Food", // Auto-set to Food when reset
      stock: "",
      expiryDate: "",
      status: "Active",
      image: "",
      price: "",
      material: "",
      size: "",
      design: "",
    });
    setImagePreview(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-black">Add New Reward</h2>
          <p className="text-gray-600">
            Create a new reward for customers to redeem with their points
          </p>
        </div>

        <div className="space-y-6 py-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-black">
              🖼️ Reward Image
            </label>
            <div className="space-y-3">
              <input
                type="url"
                value={formData.image}
                onChange={(e) => handleImageChange(e.target.value)}
                placeholder="Enter reward image URL"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Reward preview"
                  className="w-full max-w-xs h-48 object-cover rounded-lg border"
                  onError={() => {
                    console.warn("Failed to load reward image");
                    setImagePreview(null);
                  }}
                />
              </div>
            )}
          </div>

                     {/* Basic Information */}
           <div className="space-y-2">
             <label htmlFor="name" className="text-sm font-medium text-black">
               Reward Name *
             </label>
             <input
               id="name"
               value={formData.name}
               onChange={(e) => handleInputChange("name", e.target.value)}
               placeholder="Enter reward name"
               className="w-full border border-gray-300 rounded-md p-2"
             />
           </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-black"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter reward description"
              rows={3}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Points, Price and Stock */}
          <div className=" grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label
                htmlFor="pointsCost"
                className="text-sm font-medium text-black"
              >
                Points Cost *
              </label>
              <input
                id="pointsCost"
                type="number"
                value={formData.pointsCost}
                onChange={(e) =>
                  handleInputChange("pointsCost", e.target.value)
                }
                placeholder="0"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            {/* <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium text-black">
                Price (VND)
              </label>
              <input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div> */}
            <div className="space-y-2">
              <label htmlFor="stock" className="text-sm font-medium text-black">
                Initial Stock
              </label>
              <input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="0"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="status"
                className="text-sm font-medium text-black"
              >
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="space-y-2">
            <label
              htmlFor="expiryDate"
              className="text-sm font-medium text-black"
            >
              Expiry Date (Optional)
            </label>
            <input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange("expiryDate", e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="material" className="text-sm font-medium text-black">
                Material
              </label>
              <textarea
                id="material"
                value={formData.material}
                onChange={(e) => handleInputChange("material", e.target.value)}
                placeholder="Enter material details"
                rows={2}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="size" className="text-sm font-medium text-black">
                Size
              </label>
              <textarea
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange("size", e.target.value)}
                placeholder="Enter size details"
                rows={2}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="design" className="text-sm font-medium text-black">
                Design
              </label>
              <textarea
                id="design"
                value={formData.design}
                onChange={(e) => handleInputChange("design", e.target.value)}
                placeholder="Enter design details"
                rows={2}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-4 py-2 rounded-md ${
              isSubmitting 
                ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {isSubmitting ? "Adding..." : "Add Reward"}
          </button>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default AddRewardModal;
