"use client";

import { useState, useEffect } from "react";
import axios from "axios";

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

interface EditRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
  onSave: (reward: Reward) => void;
}

export function EditRewardModal({
  isOpen,
  onClose,
  reward,
  onSave,
}: EditRewardModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    pointsCost: "",
    category: "",
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

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost.toString(),
        category: reward.category,
        stock: reward.stock.toString(),
        expiryDate: reward.expiryDate || "",
        status: reward.status,
        image: reward.image || "",
        price: reward.price?.toString() || "",
        material: reward.material || "",
        size: reward.size || "",
        design: reward.design || "",
      });
      setImagePreview(reward.image || null);
    }
  }, [reward]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (value: string) => {
    setFormData((prev) => ({ ...prev, image: value }));
    setImagePreview(value);
  };

  const handleSubmit = async () => {
    if (!reward) return;

    // Validate required fields
    if (!formData.name || !formData.pointsCost) {
      alert("Please fill in all required fields");
      return;
    }

    // Chuẩn bị data đúng cấu trúc egifts backend
    const egiftData = {
      title: formData.name,
      description: formData.description,
      points: parseInt(formData.pointsCost) || 0,
      category: "Food", // Auto-set to Food
      image: formData.image || "",
      stock: parseInt(formData.stock) || 0,
      price: parseFloat(formData.price) || 0,
      material: formData.material || "",
      size: formData.size || "",
      design: formData.design || "",
      isActive: formData.status === "Active",
    };

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `http://localhost:3000/api/egifts/${reward.id}`,
        egiftData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const egift = res.data.data || res.data;
      onSave({
        id: egift._id,
        name: egift.title,
        description: egift.description,
        pointsCost: egift.points,
        category: egift.category,
        image: egift.image || formData.image || "",
        stock: egift.stock || parseInt(formData.stock) || 0,
        redeemed: egift.redeemed || reward.redeemed || 0,
        status: egift.isActive ? "Active" : "Inactive",
        expiryDate: egift.expiryDate || formData.expiryDate || undefined,
      });
      onClose();
    } catch (err) {
      alert("Failed to update egift!");
    }
  };

  if (!reward || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-black">Edit Reward</h2>
          <p className="text-gray-600">
            Update reward information and settings
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

          {/* Points, Price, Stock and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                Current Stock
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
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Additional Info */}
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

          {/* Stats Display */}
          <div className="border border-gray-200 bg-gray-50 rounded-lg">
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-black">
                    {reward.redeemed}
                  </div>
                  <div className="text-sm text-gray-600">Times Redeemed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-black">
                    {reward.redeemed * reward.pointsCost}
                  </div>
                  <div className="text-sm text-gray-600">Total Points Used</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded-md"
          >
            Update Reward
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default EditRewardModal;
