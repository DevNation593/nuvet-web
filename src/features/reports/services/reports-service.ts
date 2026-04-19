import api from '@/shared/lib/api-client';
import { unwrapResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    ClientSegmentationResult,
    ExecutiveKpisResult,
    InventoryKardexResult,
    PosDiscountUsageReportResult,
    RestockSuggestionsResult,
} from '../hooks/use-reports';

export interface ReportDateRangeInput {
    from: string;
    to: string;
}

export async function fetchExecutiveKpis(params: ReportDateRangeInput) {
    const { data } = await api.get<ApiEnvelope<ExecutiveKpisResult>>('/reports/executive-kpis', {
        params,
    });
    return unwrapResponse<ExecutiveKpisResult>(data);
}

export async function fetchClientSegmentation(params?: {
    minFrequentPurchases?: number;
    inactiveDays?: number;
}) {
    const { data } = await api.get<ApiEnvelope<ClientSegmentationResult>>('/reports/client-segmentation', {
        params,
    });
    return unwrapResponse<ClientSegmentationResult>(data);
}

export async function fetchPosDiscountUsageReport(params: {
    from: string;
    to: string;
    branchId?: string;
    discountId?: string;
}) {
    const { data } = await api.get<ApiEnvelope<PosDiscountUsageReportResult>>('/reports/pos-discount-usage', {
        params,
    });
    return unwrapResponse<PosDiscountUsageReportResult>(data);
}

export async function fetchInventoryKardex(params?: {
    productId?: string;
    from?: string;
    to?: string;
}) {
    const { data } = await api.get<ApiEnvelope<InventoryKardexResult>>('/reports/inventory-kardex', {
        params,
    });
    return unwrapResponse<InventoryKardexResult>(data);
}

export async function fetchRestockSuggestions(params?: { lookbackDays?: number }) {
    const { data } = await api.get<ApiEnvelope<RestockSuggestionsResult>>('/reports/restock-suggestions', {
        params,
    });
    return unwrapResponse<RestockSuggestionsResult>(data);
}

interface ClinicalRemindersResult {
    generatedAt: string;
    daysAhead: number;
    channels: string[];
    totals: { appointments: number; vaccinations: number; notificationsCreated: number };
}

export async function triggerClinicalReminders(input?: {
    daysAhead?: number;
    channels?: Array<'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'>;
}) {
    const { data } = await api.post<ApiEnvelope<ClinicalRemindersResult>>(
        '/notifications/reminders/clinical',
        input ?? {},
    );
    return unwrapResponse<ClinicalRemindersResult>(data);
}
