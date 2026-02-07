import { X} from "lucide-react";
import { useState, useEffect } from "react";
import { promotionService } from "../../../services/api";
import type { Promotion } from "../../../types/promotion";
import { notify, MESSAGES } from "../../../lib/toast";

type PromotionStatus = "active" | "expired";

// ViewPromotionModal Component
interface ViewPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotionSlug: string | null;
  promotion?: Promotion | null;
  onStatusChange?: (updatedPromotion: Promotion) => void; // Callback to update parent state
}

export default function ViewPromotionModal({
  isOpen,
  onClose,
  promotionSlug,
  promotion: initialPromotion,
  onStatusChange,
}: ViewPromotionModalProps) {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  useEffect(() => {
    console.log('ViewPromotionModal useEffect:', { isOpen, promotionSlug, initialPromotion });
    if (isOpen) {
      if (promotionSlug) {
        console.log('Fetching promotion for slug:', promotionSlug);
        fetchPromotion();
      } else if (initialPromotion) {
        console.log('Using initial promotion data');
        setPromotion(initialPromotion);
        setLoading(false);
        setError(null);
      }
    } else {
      // Reset state when modal closes
      console.log('Modal closing, resetting state');
      setPromotion(null);
      setError(null);
    }
  }, [isOpen, promotionSlug, initialPromotion]);

  const fetchPromotion = async () => {
    if (!promotionSlug) return;
    try {
      setLoading(true);
      setError(null);
      const response = await promotionService.getPromotionBySlug(promotionSlug);
      if (response.success) {
        setPromotion(response.data);
      } else {
        setError(response.message || "Failed to fetch promotion");
      }
    } catch (err: any) {
      console.error("Error fetching promotion:", err);
      setError("Network error or promotion not found");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!promotion) return;
    
    try {
      setIsTogglingStatus(true);
      const loadingToast = notify.loading("Updating promotion status...");
      
      // Chỉ chuyển giữa 'active' và 'expired'
      const newStatus: PromotionStatus = promotion.status === "active" ? "expired" : "active";
      
      // Prepare update data with only the status change
      const updateData: any = {
        status: newStatus
      };
      
      // Call API to update promotion status
      const response = await promotionService.updatePromotion(promotion.slug, updateData);
      
      if (response.success) {
        // Cập nhật local state
        const updatedPromotion = { ...promotion, status: newStatus };
        setPromotion(updatedPromotion);
        // Notify parent component
        if (onStatusChange) {
          onStatusChange(updatedPromotion);
        }
        notify.dismiss(loadingToast);
        notify.success(newStatus === "active" ? MESSAGES.PROMOTION.ACTIVATED : MESSAGES.PROMOTION.DEACTIVATED);
      } else {
        notify.dismiss(loadingToast);
        notify.error(response.message || MESSAGES.PROMOTION.ERROR);
      }
    } catch (error: any) {
      console.error('Error toggling promotion status:', error);
      notify.error(MESSAGES.PROMOTION.ERROR);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const formatDate = (date?: string | number | Date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status?: string) => {
    if (status === "active") return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              {promotion?.title}
              {promotion?.code && (
                <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-mono">{promotion.code}</span>
              )}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${promotion?.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {promotion?.status === 'active' ? 'Active' : 'Expired'}
              </span>
              {promotion?.category && <span className="text-xs text-gray-500">{promotion.category}</span>}
            </div>
            {promotion?.discountType && (
              <div className="mt-2">
                <span className="text-xs font-medium text-gray-500">Type:</span>
                <span className="ml-2 text-sm font-semibold text-blue-700">{promotion.discountType}</span>
              </div>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Full-width Image */}
        {promotion?.image && (
          <div className="p-6 pb-0">
            <img 
              src={promotion.image}
              alt={promotion.title}
              className="w-full h-64 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/800x256/FFD700/000000?text=Promotion+Image';
              }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          <div className="max-w-3xl mx-auto">
            {/* Description */}
            {promotion?.description && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">{promotion.description}</p>
              </div>
            )}

            {/* Key Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700 mb-1">Discount Value</h4>
                <p className="text-2xl font-bold text-blue-900">{promotion?.discountValue || "N/A"}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-700 mb-1">Remaining</h4>
                <p className="text-2xl font-bold text-purple-900">{((promotion?.maxUsage ?? 0) - (promotion?.currentUsage ?? 0))}</p>
              </div>
            </div>

            {/* Date and Amount Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Start Date</h4>
                  <div className="flex items-center gap-2 text-gray-900">
                    <span className="material-icons text-lg"></span>
                    {formatDate(promotion?.startDate)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">End Date</h4>
                  <div className="flex items-center gap-2 text-gray-900">
                    <span className="material-icons text-lg"></span>
                    {formatDate(promotion?.endDate)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
              </div>
            </div>

            {/* Content - Simplified */}
            {promotion?.content && promotion.content.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
                <div className="space-y-4">
                  {promotion.content.map((item, index) => {
                    // Only render text and conditions content
                    if (item.type === 'text' || item.type === 'conditions') {
                      return (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          {item.value && (
                            <p className="text-gray-700 leading-relaxed">{item.value}</p>
                          )}
                          {item.list && item.list.length > 0 && (
                            <ul className="list-disc list-inside text-gray-700 mt-3 space-y-1">
                              {item.list.map((listItem, listIndex) => (
                                <li key={listIndex}>{listItem}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
