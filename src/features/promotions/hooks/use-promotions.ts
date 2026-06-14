import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchPromotions,
    fetchPromotion,
    validatePromotionCode,
    createPromotion,
    updatePromotion,
    togglePromotion,
    deletePromotion,
} from '../services/promotions-service';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PromotionType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';

export interface Promotion {
    id: string;
    name: string;
    description?: string;
    type: PromotionType;
    value: number;
    buyQuantity?: number;
    getQuantity?: number;
    minPurchaseAmount?: number;
    maxUsages?: number;
    usageCount: number;
    applicableProductIds: string[];
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreatePromotionInput {
    name: string;
    description?: string;
    type: PromotionType;
    value: number;
    buyQuantity?: number;
    getQuantity?: number;
    minPurchaseAmount?: number;
    maxUsages?: number;
    applicableProductIds?: string[];
    startDate?: string;
    endDate?: string;
}

export type UpdatePromotionInput = Partial<CreatePromotionInput>;

export interface PromotionsParams {
    page?: number;
    limit?: number;
    isActive?: boolean;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function usePromotions(params: PromotionsParams = {}, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['promotions', params],
        queryFn: () => fetchPromotions(params),
        enabled: options.enabled ?? true,
    });
}

export function usePromotion(id: string | null, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['promotions', id],
        queryFn: () => fetchPromotion(id!),
        enabled: (options.enabled ?? true) && Boolean(id),
    });
}

export function useValidatePromotionCode() {
    return useMutation({
        mutationFn: (code: string) => validatePromotionCode(code),
    });
}

export function useCreatePromotion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreatePromotionInput) => createPromotion(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
    });
}

export function useUpdatePromotion(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdatePromotionInput) => updatePromotion(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
    });
}

export function useTogglePromotion(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (isActive: boolean) => togglePromotion(id!, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
    });
}

export function useDeletePromotion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePromotion(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
        },
    });
}
