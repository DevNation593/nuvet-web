import api from '@/shared/lib/api-client';
import { unwrapResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope } from '@nuvet/types';

export interface HomeSummaryParams {
    date?: string;
    includeAppointments?: boolean;
    includePos?: boolean;
    includeStore?: boolean;
    includeDiscounts?: boolean;
}

export interface RecentTransaction {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    clientName: string;
    paymentMethod: string;
}

export interface UpcomingAppointment {
    id: string;
    scheduledAt: string;
    type: string;
    status: string;
    petName: string;
    petSpecies: string | null;
    clientName: string;
}

export interface TopProduct {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
}

export interface HomeSummaryResult {
    date: string;
    appointmentsToday: number;
    pos: {
        totalTransactions: number;
        totalRevenue: number;
        totalDiscount: number;
    };
    posMonth: {
        totalTransactions: number;
        totalRevenue: number;
    };
    store: {
        lowStockCount: number;
    };
    discounts: {
        activeCount: number;
    };
    recentTransactions: RecentTransaction[];
    upcomingAppointments: UpcomingAppointment[];
    topProducts: TopProduct[];
    totalClients: number;
    totalPets: number;
}

export async function fetchHomeSummary(params: HomeSummaryParams) {
    const { data } = await api.get<ApiEnvelope<HomeSummaryResult>>('/auth/home-summary', {
        params,
    });
    return unwrapResponse<HomeSummaryResult>(data);
}
