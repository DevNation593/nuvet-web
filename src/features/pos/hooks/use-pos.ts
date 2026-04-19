import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchPosTransactions,
    fetchPosDailySummary,
    fetchPosRegisters,
    fetchPosDiscounts,
    createPosTransaction,
    voidPosTransaction,
    fetchRegisterClosureReport,
} from '../services/pos-service';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER' | 'OTHER';
export type PosTicketStatus =
    | 'OPEN'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'PARTIAL_REFUND'
    | 'REFUNDED';

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
    status?: PosTicketStatus;
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
    client?: {
        firstName?: string;
        lastName?: string;
        identification?: string;
        email?: string;
    };
    providerInvoiceId?: string;
    invoice?: {
        providerInvoiceId?: string;
        status?: string;
        documentNumber?: string;
        accessKey?: string;
        authorizedAt?: string;
    };
    invoiceIssueError?: string;
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
    branchId?: string;
    invoice?: {
        buyer?: {
            legalName: string;
            taxId: string;
            idType?: '04' | '05' | '06' | '07' | '08';
            email?: string;
            phone?: string;
            address?: string;
        };
        establishmentCode?: string;
        emissionPointCode?: string;
        asyncEmission?: boolean;
        issueDate?: string;
    };
}

export interface PosDiscount {
    id: string;
    name: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED' | 'BUY_X_GET_Y';
    value: number;
    buyQuantity?: number;
    getQuantity?: number;
    minAmount?: number;
    maxUses?: number;
    usedCount?: number;
    startAt?: string;
    endAt?: string;
    targetType: string;
    targetId?: string;
    category?: string;
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

export interface PosRegisterClosureReport {
    registerId: string;
    openedAt: string;
    closedAt: string;
    openingBalance: number;
    closingBalance: number;
    expectedClosingBalance: number;
    discrepancy: number;
    summary: {
        ticketsCount: number;
        byPaymentMethod: Record<string, { count: number; total: number }>;
        refundsTotal: number;
        salesTotal: number;
        expectedCashBalance: number;
    };
}

export interface PosRegister {
    id: string;
    status: 'OPEN' | 'CLOSED';
    openingBalance: number;
    closingBalance?: number;
    openedAt: string;
    closedAt?: string;
    branch?: { id: string; name: string };
    openedBy?: { id: string; firstName: string; lastName: string };
    closedBy?: { id: string; firstName: string; lastName: string };
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function usePosTransactions(params: PosTransactionsParams = {}, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['pos-transactions', params],
        queryFn: () => fetchPosTransactions(params),
        enabled: options.enabled ?? true,
        staleTime: 30_000,
    });
}

export function usePosDailySummary(date?: string, options: { enabled?: boolean } = {}) {
    const queryDate = date ?? new Date().toISOString().slice(0, 10);
    return useQuery({
        queryKey: ['pos-daily-summary', queryDate],
        queryFn: () => fetchPosDailySummary(queryDate),
        enabled: options.enabled ?? true,
        staleTime: 30_000,
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

export function useRegisterClosureReport(registerId: string | null, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['pos-register-closure-report', registerId],
        queryFn: () => fetchRegisterClosureReport(registerId!),
        enabled: (options.enabled ?? true) && !!registerId,
    });
}

export function usePosRegisters(options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['pos-registers'],
        queryFn: () => fetchPosRegisters(),
        enabled: options.enabled ?? true,
        staleTime: 60_000,
    });
}

export function usePosDiscounts(options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['pos-discounts'],
        queryFn: () => fetchPosDiscounts(),
        enabled: options.enabled ?? true,
        staleTime: 5 * 60 * 1000,
    });
}
