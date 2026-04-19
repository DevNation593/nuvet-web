import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse, unwrapArrayResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    PosTransaction,
    CreatePosTransactionInput,
    PosTransactionsParams,
    PosDailySummary,
    PosRegister,
    PosRegisterClosureReport,
    PosDiscount,
} from '../hooks/use-pos';

export async function fetchPosTransactions(params: PosTransactionsParams = {}) {
    const { data } = await api.get<ApiEnvelope<PosTransaction[]>>('/pos/transactions', { params });
    return unwrapPaginatedResponse<PosTransaction>(data);
}

export async function fetchPosDailySummary(date?: string) {
    const queryDate = date ?? new Date().toISOString().slice(0, 10);
    const { data } = await api.get<ApiEnvelope<PosDailySummary>>('/pos/summary/daily', {
        params: { date: queryDate },
    });
    return unwrapResponse<PosDailySummary>(data);
}

export async function createPosTransaction(input: CreatePosTransactionInput) {
    const { data } = await api.post<ApiEnvelope<PosTransaction>>('/pos/transactions', input);
    return unwrapResponse<PosTransaction>(data);
}

export async function voidPosTransaction(id: string, reason: string) {
    const { data } = await api.patch<ApiEnvelope<PosTransaction>>(`/pos/transactions/${id}/void`, { reason });
    return unwrapResponse<PosTransaction>(data);
}

export async function fetchRegisterClosureReport(registerId: string) {
    const { data } = await api.get<ApiEnvelope<PosRegisterClosureReport>>(
        `/pos/registers/${registerId}/closure-report`,
    );
    return unwrapResponse<PosRegisterClosureReport>(data);
}

export async function fetchPosRegisters() {
    const { data } = await api.get<ApiEnvelope<PosRegister[]>>('/pos/registers', {
        params: { page: 1, limit: 10 },
    });
    return unwrapPaginatedResponse<PosRegister>(data);
}

export async function fetchPosDiscounts() {
    const { data } = await api.get<ApiEnvelope<PosDiscount[]>>('/pos/discounts');
    return unwrapArrayResponse<PosDiscount>(data);
}
