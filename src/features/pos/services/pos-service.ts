import api from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    PosTransaction,
    CreatePosTransactionInput,
    PosTransactionsParams,
    PosDailySummary,
} from '../hooks/use-pos';

function normalizePaginated<T>(raw: ApiEnvelope<T[]>) {
    const payload = raw?.data ?? (raw as unknown as { data?: T[] });
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: T[] })?.data ?? [],
        meta: (raw as unknown as { meta?: { page: number; totalPages: number } })?.meta ?? { page: 1, totalPages: 1 },
    };
}

export async function fetchPosTransactions(params: PosTransactionsParams = {}) {
    const { data } = await api.get<ApiEnvelope<PosTransaction[]>>('/pos/transactions', { params });
    return normalizePaginated<PosTransaction>(data);
}

export async function fetchPosDailySummary(date?: string) {
    const queryDate = date ?? new Date().toISOString().slice(0, 10);
    const { data } = await api.get<ApiEnvelope<PosDailySummary>>('/pos/summary/daily', {
        params: { date: queryDate },
    });
    return (data?.data ?? data) as PosDailySummary;
}

export async function createPosTransaction(input: CreatePosTransactionInput) {
    const { data } = await api.post<ApiEnvelope<PosTransaction>>('/pos/transactions', input);
    return (data?.data ?? data) as PosTransaction;
}

export async function voidPosTransaction(id: string, reason: string) {
    const { data } = await api.patch<ApiEnvelope<PosTransaction>>(`/pos/transactions/${id}/void`, { reason });
    return (data?.data ?? data) as PosTransaction;
}
