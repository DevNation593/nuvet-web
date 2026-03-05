import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPosTransactions, fetchPosDailySummary, createPosTransaction, voidPosTransaction } from '../services/pos-service';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';

export interface PosCartItem {
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    discount: number;       // amount already applied (from promotion)
    total: number;
}

export interface PosTransactionItem {
    productId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
}

export interface PosTransaction {
    id: string;
    items: PosTransactionItem[];
    subtotal: number;
    discountTotal: number;
    tax: number;
    total: number;
    paymentMethod: PaymentMethod;
    promotionCode?: string;
    promotionId?: string;
    cashReceived?: number;
    change?: number;
    notes?: string;
    clientId?: string;
    createdAt: string;
    receiptNumber: string;
}

export interface CreatePosTransactionInput {
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    paymentMethod: PaymentMethod;
    promotionCode?: string;
    cashReceived?: number;
    notes?: string;
    clientId?: string;
}

export interface PosTransactionsParams {
    page?: number;
    limit?: number;
    paymentMethod?: PaymentMethod;
    from?: string;
    to?: string;
}

export interface PosDailySummary {
    date: string;
    totalTransactions: number;
    totalRevenue: number;
    totalDiscount: number;
    byPaymentMethod: Record<PaymentMethod, { count: number; total: number }>;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function usePosTransactions(params: PosTransactionsParams = {}, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['pos-transactions', params],
        queryFn: () => fetchPosTransactions(params),
        enabled: options.enabled ?? true,
    });
}

export function usePosDailySummary(date?: string, options: { enabled?: boolean } = {}) {
    const queryDate = date ?? new Date().toISOString().slice(0, 10);
    return useQuery({
        queryKey: ['pos-daily-summary', queryDate],
        queryFn: () => fetchPosDailySummary(queryDate),
        enabled: options.enabled ?? true,
    });
}

export function useCreatePosTransaction() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreatePosTransactionInput) => createPosTransaction(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['pos-daily-summary'] });
            // Also update store product stock
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] });
        },
    });
}

export function useVoidPosTransaction(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (reason: string) => voidPosTransaction(id!, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pos-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['pos-daily-summary'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
        },
    });
}
