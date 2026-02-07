"use client";

import {
  Star,
  Package,
  Coffee,
  Popcorn,
} from "lucide-react";

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

interface ViewConcessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  concession: ConcessionItem;
}

export function ViewConcessionModal({
  isOpen,
  onClose,
  concession,
}: ViewConcessionModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + " ₫";
  };

  // Xoá các đoạn hiển thị hoặc logic liên quan đến các trường không còn trong DB (cost, minStock, ingredients, allergens, calories, size, isActive, isPopular, soldToday, revenue, rating, reviews, lastRestocked, stock)
  // Chỉ giữ lại các trường: name, price, image, description, category, status, stockQuantity, createdAt, updatedAt
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "popcorn":
        return <Popcorn className="h-4 w-4" />;
      case "drinks":
        return <Coffee className="h-4 w-4" />;
      case "snacks":
        return <Package className="h-4 w-4" />;
      case "combos":
        return <Star className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "popcorn":
        return "bg-gray-900 text-white border-gray-800";
      case "drinks":
        return "bg-gray-800 text-white border-gray-700";
      case "snacks":
        return "bg-gray-700 text-white border-gray-600";
      case "combos":
        return "bg-black text-white border-gray-900";
      default:
        return "bg-gray-600 text-white border-gray-500";
    }
  };

  const getCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-lg p-8 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Image */}
          <div className="flex flex-col items-center">
            <img
              src={concession.image || "/placeholder.svg"}
              alt={concession.name}
              className="w-64 h-64 object-cover rounded-lg shadow mb-4 border"
            />
            <span className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getCategoryColor(concession.category)}`}
            >
              {getCategoryIcon(concession.category)}
              <span className="ml-1 capitalize">{getCategoryName(concession.category)}</span>
            </span>
          </div>
          {/* Right: Info */}
          <div className="space-y-4">
            <div>
              <span className="block text-gray-500 text-xs font-medium mb-1">Product Name</span>
              <span className="text-xl font-bold text-gray-900">{concession.name}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-medium mb-1">Price</span>
              <span className="text-lg font-semibold text-green-700">{formatCurrency(concession.price)}</span>
            </div>
            <div>
              <span className="block text-gray-500 text-xs font-medium mb-1">Description</span>
              <span className="text-gray-800">{concession.description}</span>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="block text-gray-500 text-xs font-medium mb-1">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${concession.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>{concession.status === "active" ? "Active" : "Inactive"}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs font-medium mb-1">Stock</span>
                <span className="font-semibold text-gray-900">{concession.stockQuantity} units</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="block text-gray-500 text-xs font-medium mb-1">Created At</span>
                <span className="text-gray-700">{new Date(concession.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-gray-500 text-xs font-medium mb-1">Updated At</span>
                <span className="text-gray-700">{new Date(concession.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-8">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
