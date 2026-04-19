import { useMutation, useQuery } from '@tanstack/react-query';
import {
    fetchPosDiscountUsageReport,
    fetchClientSegmentation,
    fetchExecutiveKpis,
    fetchInventoryKardex,
    fetchRestockSuggestions,
    triggerClinicalReminders,
} from '../services/reports-service';

export interface ExecutiveKpisResult {
    from: string;
    to: string;
    sales: {
        total: number;
        averageTicket: number;
        totalTickets: number;
        repurchaseRate: number;
    };
    topClients: Array<{ clientId: string; name: string; total: number; purchases: number }>;
    byBranch: Array<{
        branchId: string | null;
        branchName: string;
        tickets: number;
        total: number;
        averageTicket: number;
    }>;
    byProfessional: Array<{ professionalId: string; name: string; appointments: number }>;
}

export interface PosDiscountUsageReportResult {
    from: string;
    to: string;
    branchId?: string;
    discountId?: string;
    totalUsages: number;
    totalSavedAmount: number;
    byDiscount: Array<{
        discountId: string;
        discountName: string;
        usageCount: number;
        savedAmount: number;
    }>;
    items: Array<{
        id: string;
        createdAt: string;
        savedAmount: number;
        discount: {
            id: string;
            name: string;
        };
        posTicket?: {
            id: string;
            branchId: string | null;
            createdAt: string;
            total: number;
            subtotal: number;
            discount: number;
            status: string;
            branch?: {
                id: string;
                name: string;
            } | null;
        } | null;
    }>;
}

export interface ClientSegmentationResult {
    generatedAt: string;
    minFrequentPurchases: number;
    inactiveDays: number;
    frequent: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email?: string | null;
        purchases: number;
        totalSpent: number;
    }>;
    inactive: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email?: string | null;
        purchases: number;
        totalSpent: number;
        lastPurchaseAt: string;
    }>;
}

export interface InventoryKardexResult {
    productId?: string;
    totalMovements: number;
    entries: Array<{
        id: string;
        createdAt: string;
        productId: string;
        productName: string;
        sku: string;
        type: 'IN' | 'OUT' | 'ADJUSTMENT';
        quantity: number;
        delta: number;
        reason?: string;
        runningBalance: number;
    }>;
}

export interface RestockSuggestionsResult {
    lookbackDays: number;
    generatedAt: string;
    suggestions: Array<{
        productId: string;
        name: string;
        sku: string;
        category: string;
        currentStock: number;
        lowStockThreshold: number;
        soldInLookback: number;
        averageDailySales: number;
        suggestedReorderQty: number;
    }>;
}

const REPORT_STALE_TIME = 5 * 60 * 1000;

export function useExecutiveKpis(from: string, to: string, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['reports-executive-kpis', from, to],
        queryFn: () => fetchExecutiveKpis({ from, to }),
        enabled: (options.enabled ?? true) && !!from && !!to,
        staleTime: REPORT_STALE_TIME,
        gcTime: 15 * 60 * 1000,
    });
}

export function useClientSegmentation(
    params: { minFrequentPurchases?: number; inactiveDays?: number } = {},
    options: { enabled?: boolean } = {},
) {
    return useQuery({
        queryKey: ['reports-client-segmentation', params],
        queryFn: () => fetchClientSegmentation(params),
        enabled: options.enabled ?? true,
        staleTime: REPORT_STALE_TIME,
        gcTime: 15 * 60 * 1000,
    });
}

export function usePosDiscountUsageReport(
    params: { from: string; to: string; branchId?: string; discountId?: string },
    options: { enabled?: boolean } = {},
) {
    return useQuery({
        queryKey: ['reports-pos-discount-usage', params],
        queryFn: () => fetchPosDiscountUsageReport(params),
        enabled: (options.enabled ?? true) && !!params.from && !!params.to,
        staleTime: REPORT_STALE_TIME,
        gcTime: 15 * 60 * 1000,
    });
}

export function useInventoryKardex(
    params: { productId?: string; from?: string; to?: string } = {},
    options: { enabled?: boolean } = {},
) {
    return useQuery({
        queryKey: ['reports-inventory-kardex', params],
        queryFn: () => fetchInventoryKardex(params),
        enabled: options.enabled ?? true,
        staleTime: REPORT_STALE_TIME,
    });
}

export function useRestockSuggestions(
    params: { lookbackDays?: number } = {},
    options: { enabled?: boolean } = {},
) {
    return useQuery({
        queryKey: ['reports-restock-suggestions', params],
        queryFn: () => fetchRestockSuggestions(params),
        enabled: options.enabled ?? true,
        staleTime: REPORT_STALE_TIME,
    });
}

export function useTriggerClinicalReminders() {
    return useMutation({
        mutationFn: (input?: { daysAhead?: number; channels?: Array<'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'> }) =>
            triggerClinicalReminders(input),
    });
}
