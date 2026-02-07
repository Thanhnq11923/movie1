export interface PromotionContent {
  type: 'text' | 'program_info' | 'combo' | 'note' | 'conditions';
  value?: string;
  duration?: {
    from: Date;
    to: Date;
  };
  name?: string;
  options?: Array<{
    items: string;
    price: number;
    _id?: string; // Add optional _id for MongoDB compatibility
  }>;
  list?: string[];
  _id?: string; // Add optional _id for MongoDB compatibility
}

export interface RelatedPromotion {
  title: string;
  image: string;
  _id?: string; // Add optional _id for MongoDB compatibility
}

export interface Promotion {
  _id?: string;
  title: string;
  slug: string;
  image: string;
  description: string;
  content: PromotionContent[];
  related: RelatedPromotion[];
  shareCount: number;
  code?: string;
  discountType?: 'percentage' | 'fixed' | 'free_item';
  discountValue?: number;
  minAmount?: number;
  maxDiscount?: number;
  startDate?: Date | number | string;
  endDate?: Date | number | string;
  maxUsage?: number;
  currentUsage?: number;
  status?: 'active' | 'inactive' | 'expired';
  category?: 'combo' | 'members' | 'partners' | 'general';
  userGroups?: string[];
  applicableMovies?: string[];
  applicableProducts?: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | number | string;
  updatedAt?: Date | number | string;
}

export interface PromotionResponse {
  success: boolean;
  data: Promotion[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
  error?: string;
}

export interface SinglePromotionResponse {
  success: boolean;
  data: Promotion;
  message?: string;
  error?: string;
}

export interface ShareCountResponse {
  success: boolean;
  message: string;
  data: {
    shareCount: number;
  };
  error?: string;
}

export interface CreatePromotionRequest {
  title: string;
  slug: string;
  image: string;
  description: string;
  content: PromotionContent[];
  related: RelatedPromotion[];
  shareCount?: number;
}

export interface UpdatePromotionRequest
  extends Partial<CreatePromotionRequest> { }

// Legacy promotion types for backward compatibility
export interface LegacyPromotion {
  code: string;
  discount: number;
  description: string;
  minAmount?: number;
  maxDiscount?: number;
}

export const legacyPromotions: LegacyPromotion[] = [
  {
    code: "Free Corn",
    discount: 0.1, // 10% off
    description: "10% off for new users",
    maxDiscount: 50,
  },
  {
    code: "1",
    discount: 0.15, // 15% off
    description: "15% off for orders above $100",
    minAmount: 10,
    maxDiscount: 100,
  },
];

// Alias for backward compatibility
export interface PromotionDetailResponse extends SinglePromotionResponse { }
