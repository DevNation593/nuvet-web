import api from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    Promotion,
    CreatePromotionInput,
    UpdatePromotionInput,
    PromotionsParams,
} from '../hooks/use-promotions';

function normalizePaginated<T>(raw: ApiEnvelope<T[]>) {
    const payload = raw?.data ?? (raw as unknown as { data?: T[] });
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: T[] })?.data ?? [],
        meta: (raw as unknown as { meta?: { page: number; totalPages: number } })?.meta ?? { page: 1, totalPages: 1 },
    };
}

export async function fetchPromotions(params: PromotionsParams = {}) {
    const { data } = await api.get<ApiEnvelope<Promotion[]>>('/promotions', { params });
    return normalizePaginated<Promotion>(data);
}

export async function fetchPromotion(id: string) {
    const { data } = await api.get<ApiEnvelope<Promotion>>(`/promotions/${id}`);
    return (data?.data ?? data) as Promotion;
}

export async function validatePromotionCode(code: string) {
    const { data } = await api.post<ApiEnvelope<Promotion>>('/promotions/validate', { code });
    return (data?.data ?? data) as Promotion;
}

export async function createPromotion(input: CreatePromotionInput) {
    const { data } = await api.post<ApiEnvelope<Promotion>>('/promotions', input);
    return (data?.data ?? data) as Promotion;
}

export async function updatePromotion(id: string, input: UpdatePromotionInput) {
    const { data } = await api.patch<ApiEnvelope<Promotion>>(`/promotions/${id}`, input);
    return (data?.data ?? data) as Promotion;
}

export async function togglePromotion(id: string, isActive: boolean) {
    const { data } = await api.patch<ApiEnvelope<Promotion>>(`/promotions/${id}`, { isActive });
    return (data?.data ?? data) as Promotion;
}

export async function deletePromotion(id: string) {
    const { data } = await api.delete<ApiEnvelope<{ message: string }>>(`/promotions/${id}`);
    return data;
}
