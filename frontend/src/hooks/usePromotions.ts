import { useState, useEffect, useCallback } from 'react';
import { promotionService } from '../services/api';
import type { 
    Promotion, 
    PromotionResponse, 
    SinglePromotionResponse,
    CreatePromotionRequest,
    UpdatePromotionRequest
} from '../types/promotion';

interface UsePromotionsOptions {
    page?: number;
    limit?: number;
    sort?: string;
}

interface UsePromotionsReturn {
    promotions: Promotion[];
    loading: boolean;
    error: string | null;
    pagination: PromotionResponse['pagination'];
    fetchPromotions: (options?: UsePromotionsOptions) => Promise<void>;
    createPromotion: (data: CreatePromotionRequest) => Promise<Promotion | null>;
    updatePromotion: (slug: string, data: UpdatePromotionRequest) => Promise<Promotion | null>;
    deletePromotion: (slug: string) => Promise<boolean>;
    incrementShareCount: (slug: string) => Promise<number | null>;
}

export const usePromotions = (initialOptions?: UsePromotionsOptions): UsePromotionsReturn => {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PromotionResponse['pagination']>();

    const fetchPromotions = useCallback(async (options?: UsePromotionsOptions) => {
        setLoading(true);
        setError(null);
        
        try {
            const { page = 1, limit = 10, sort = '-createdAt' } = options || {};
            const response = await promotionService.getAllPromotions(page, limit, sort);
            
            if (response.success) {
                setPromotions(response.data);
                setPagination(response.pagination);
            } else {
                setError(response.message || 'Failed to fetch promotions');
            }
        } catch (err: any) {
            const errorMessage = promotionService.handleError(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const createPromotion = useCallback(async (data: CreatePromotionRequest): Promise<Promotion | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await promotionService.createPromotion(data);
            
            if (response.success) {
                // Refresh the promotions list
                await fetchPromotions();
                return response.data;
            } else {
                setError(response.message || 'Failed to create promotion');
                return null;
            }
        } catch (err: any) {
            const errorMessage = promotionService.handleError(err);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchPromotions]);

    const updatePromotion = useCallback(async (slug: string, data: UpdatePromotionRequest): Promise<Promotion | null> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await promotionService.updatePromotion(slug, data);
            
            if (response.success) {
                // Update the promotion in the local state
                setPromotions(prev => 
                    prev.map(promotion => 
                        promotion.slug === slug ? response.data : promotion
                    )
                );
                return response.data;
            } else {
                setError(response.message || 'Failed to update promotion');
                return null;
            }
        } catch (err: any) {
            const errorMessage = promotionService.handleError(err);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePromotion = useCallback(async (slug: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await promotionService.deletePromotion(slug);
            
            if (response.success) {
                // Remove the promotion from local state
                setPromotions(prev => prev.filter(promotion => promotion.slug !== slug));
                return true;
            } else {
                setError(response.message || 'Failed to delete promotion');
                return false;
            }
        } catch (err: any) {
            const errorMessage = promotionService.handleError(err);
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const incrementShareCount = useCallback(async (slug: string): Promise<number | null> => {
        try {
            const response = await promotionService.incrementShareCount(slug);
            
            if (response.success) {
                // Update the share count in local state
                setPromotions(prev => 
                    prev.map(promotion => 
                        promotion.slug === slug 
                            ? { ...promotion, shareCount: response.data.shareCount }
                            : promotion
                    )
                );
                return response.data.shareCount;
            } else {
                setError(response.message || 'Failed to increment share count');
                return null;
            }
        } catch (err: any) {
            const errorMessage = promotionService.handleError(err);
            setError(errorMessage);
            return null;
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchPromotions(initialOptions);
    }, [fetchPromotions, initialOptions]);

    return {
        promotions,
        loading,
        error,
        pagination,
        fetchPromotions,
        createPromotion,
        updatePromotion,
        deletePromotion,
        incrementShareCount
    };
};

// Hook for single promotion
export const usePromotion = (slug: string) => {
    const [promotion, setPromotion] = useState<Promotion | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPromotion = useCallback(async () => {
        if (!slug) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await promotionService.getPromotionBySlug(slug);
            
            if (response.success) {
                setPromotion(response.data);
            } else {
                setError(response.message || 'Failed to fetch promotion');
            }
        } catch (err: any) {
            const errorMessage = promotionService.handleError(err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchPromotion();
    }, [fetchPromotion]);

    return {
        promotion,
        loading,
        error,
        refetch: fetchPromotion
    };
}; 