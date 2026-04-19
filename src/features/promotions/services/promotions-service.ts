import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    Promotion,
    CreatePromotionInput,
    UpdatePromotionInput,
    PromotionsParams,
} from '../hooks/use-promotions';

type RawDiscountType = 'PERCENTAGE' | 'FIXED' | 'BUY_X_GET_Y';

type RawDiscount = {
    id: string;
    name: string;
    description?: string | null;
    type: RawDiscountType;
    value?: number | null;
    buyQuantity?: number | null;
    getQuantity?: number | null;
    minAmount?: number | null;
    maxUses?: number | null;
    usedCount?: number | null;
    startAt?: string | null;
    endAt?: string | null;
    isActive: boolean;
    createdAt: string;
};

function toPromotion(raw: RawDiscount): Promotion {
    return {
        id: raw.id,
        name: raw.name,
        description: raw.description ?? undefined,
        code: raw.name,
        type: raw.type === 'FIXED' ? 'FIXED_AMOUNT' : raw.type,
        value: Number(raw.value ?? 0),
        buyQuantity: raw.buyQuantity ?? undefined,
        getQuantity: raw.getQuantity ?? undefined,
        minPurchaseAmount: raw.minAmount ?? undefined,
        maxUsages: raw.maxUses ?? undefined,
        usageCount: raw.usedCount ?? 0,
        applicableProductIds: [],
        startDate: raw.startAt ?? undefined,
        endDate: raw.endAt ?? undefined,
        isActive: raw.isActive,
        createdAt: raw.createdAt,
    };
}

function toCreateDiscountPayload(input: CreatePromotionInput) {
    const rawType = input.type === 'FIXED_AMOUNT' ? 'FIXED' : input.type;
    return {
        name: input.name,
        description: input.description,
        type: rawType,
        value: rawType === 'BUY_X_GET_Y' ? 0 : Number(input.value ?? 0),
        buyQuantity: rawType === 'BUY_X_GET_Y' ? input.buyQuantity : undefined,
        getQuantity: rawType === 'BUY_X_GET_Y' ? input.getQuantity : undefined,
        targetType: 'ALL_PRODUCTS',
        minAmount: input.minPurchaseAmount,
        maxUses: input.maxUsages,
        startAt: input.startDate ? new Date(input.startDate).toISOString() : new Date().toISOString(),
        endAt: input.endDate ? new Date(input.endDate).toISOString() : undefined,
    };
}

function toUpdateDiscountPayload(input: UpdatePromotionInput) {
    const payload: Record<string, unknown> = {};

    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.type !== undefined) {
        const rawType = input.type === 'FIXED_AMOUNT' ? 'FIXED' : input.type;
        payload.type = rawType;
        if (rawType === 'BUY_X_GET_Y') {
            payload.value = 0;
            payload.buyQuantity = input.buyQuantity;
            payload.getQuantity = input.getQuantity;
        } else {
            payload.value = Number(input.value ?? 0);
            payload.buyQuantity = undefined;
            payload.getQuantity = undefined;
        }
    } else {
        if (input.value !== undefined) payload.value = Number(input.value);
        if (input.buyQuantity !== undefined) payload.buyQuantity = input.buyQuantity;
        if (input.getQuantity !== undefined) payload.getQuantity = input.getQuantity;
    }

    if (input.minPurchaseAmount !== undefined) payload.minAmount = input.minPurchaseAmount;
    if (input.maxUsages !== undefined) payload.maxUses = input.maxUsages;
    if (input.startDate !== undefined) payload.startAt = input.startDate ? new Date(input.startDate).toISOString() : null;
    if (input.endDate !== undefined) payload.endAt = input.endDate ? new Date(input.endDate).toISOString() : null;

    return payload;
}

export async function fetchPromotions(params: PromotionsParams = {}) {
    const mappedParams = {
        page: params.page,
        limit: params.limit,
        onlyActive: params.isActive,
    };
    const { data } = await api.get<ApiEnvelope<RawDiscount[]>>('/discounts', { params: mappedParams });
    const normalized = unwrapPaginatedResponse<RawDiscount>(data);
    return {
        ...normalized,
        data: normalized.data.map(toPromotion),
    };
}

export async function fetchPromotion(id: string) {
    const { data } = await api.get<ApiEnvelope<RawDiscount>>(`/discounts/${id}`);
    return toPromotion(unwrapResponse<RawDiscount>(data));
}

export async function validatePromotionCode(code: string) {
    const discountId = code.trim();
    if (!discountId) {
        throw new Error('PROMOTION_NOT_FOUND');
    }

    const { data } = await api.get<ApiEnvelope<RawDiscount>>(`/discounts/${discountId}`);
    const raw = unwrapResponse<RawDiscount>(data);
    const now = Date.now();
    const startsAt = raw.startAt ? new Date(raw.startAt).getTime() : null;
    const endsAt = raw.endAt ? new Date(raw.endAt).getTime() : null;

    if (!raw.isActive || (startsAt !== null && startsAt > now) || (endsAt !== null && endsAt < now)) {
        throw new Error('PROMOTION_NOT_ACTIVE');
    }

    return toPromotion(raw);
}

export async function createPromotion(input: CreatePromotionInput) {
    const { data } = await api.post<ApiEnvelope<RawDiscount>>('/discounts', toCreateDiscountPayload(input));
    return toPromotion(unwrapResponse<RawDiscount>(data));
}

export async function updatePromotion(id: string, input: UpdatePromotionInput) {
    const payload = toUpdateDiscountPayload(input);
    const { data } = await api.patch<ApiEnvelope<RawDiscount>>(`/discounts/${id}`, payload);
    return toPromotion(unwrapResponse<RawDiscount>(data));
}

export async function togglePromotion(id: string, isActive: boolean) {
    const { data } = await api.patch<ApiEnvelope<RawDiscount>>(`/discounts/${id}`, { isActive });
    return toPromotion(unwrapResponse<RawDiscount>(data));
}

export async function deletePromotion(id: string) {
    const { data } = await api.delete<ApiEnvelope<{ message: string }>>(`/discounts/${id}`);
    return unwrapResponse(data);
}
