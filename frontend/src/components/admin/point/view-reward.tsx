"use client";

import { useState, useEffect } from "react";

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

interface ViewRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: Reward | null;
}

export function ViewRewardModal({
  isOpen,
  onClose,
  reward,
}: ViewRewardModalProps) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (reward?.image) {
      setImageError(false);
    }
  }, [reward]);

  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === null) {
      return "0 VND";
    }
    return price.toLocaleString("vi-VN") + " VND";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Inactive":
        return "bg-gray-100 text-gray-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Category color function removed - no longer needed

  if (!reward || !isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-black">Reward Details</h2>
          <p className="text-gray-600">
            View detailed information about this reward
          </p>
        </div>

        <div className="py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Image and Basic Info */}
            <div className="space-y-6">
              {/* Image Section */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Product Image</h3>
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {reward.image && !imageError ? (
                    <img
                      src={reward.image}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">🖼️</div>
                        <div className="text-gray-500 text-sm">{reward.name}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reward Name</label>
                    <p className="text-lg font-semibold text-gray-900">{reward.name}</p>
                  </div>

                  {/* Category display removed */}

                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reward.status)}`}>
                        {reward.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{reward.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details and Stats */}
            <div className="space-y-6">
              {/* Pricing and Points */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pricing & Points</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Points Cost</label>
                    <p className="text-2xl font-bold text-blue-600">{reward.pointsCost} pts</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-medium text-gray-700">Price (VND)</label>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(reward.price)}</p>
                  </div>
                </div>
              </div>

                             {/* Stock Information */}
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-gray-900">Stock Information</h3>
                 
                 <div className="bg-gray-50 p-4 rounded-lg">
                   <label className="text-sm font-medium text-gray-700">Current Stock</label>
                   <p className="text-2xl font-bold text-gray-900">{reward.stock}</p>
                 </div>

                 {reward.expiryDate && (
                   <div className="bg-gray-50 p-4 rounded-lg">
                     <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                     <p className="text-lg font-semibold text-gray-900">
                       {new Date(reward.expiryDate).toLocaleDateString()}
                     </p>
                   </div>
                 )}
               </div>

              {/* Product Details */}
              {(reward.material || reward.size || reward.design) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                  
                  <div className="space-y-3">
                    {reward.material && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Material</label>
                        <p className="text-gray-900 mt-1">{reward.material}</p>
                      </div>
                    )}
                    
                    {reward.size && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Size</label>
                        <p className="text-gray-900 mt-1">{reward.size}</p>
                      </div>
                    )}
                    
                    {reward.design && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Design</label>
                        <p className="text-gray-900 mt-1">{reward.design}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Close
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

export default ViewRewardModal; 