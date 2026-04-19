import api from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@nuvet/types';

export interface AuditLogEntry {
    id: string;
    action: string;
    entity: string;
    entityId: string | null;
    oldData: Record<string, unknown> | null;
    newData: Record<string, unknown> | null;
    userId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    } | null;
}

export interface AuditLogFilters {
    page?: number;
    limit?: number;
    action?: string;
    entity?: string;
    userId?: string;
    from?: string;
    to?: string;
}

interface AuditLogResponse {
    data: AuditLogEntry[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export async function getAuditLogs(filters: AuditLogFilters = {}) {
    const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v != null && v !== ''),
    );
    const { data } = await api.get<ApiEnvelope<AuditLogResponse>>('/audit-logs', { params });
    const payload = (data as { data?: unknown })?.data ?? data;
    return payload as AuditLogResponse;
}
