import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type {
    ApiConsentScope,
    ApiConsentStatus,
    ApiEnvelope,
    Consent,
    GrantConsentRequest,
    ListConsentsQuery,
    RevokeConsentRequest,
} from '@nuvet/types';

// Re-export para los consumidores existentes (use-consent.ts expone `Consent`,
// `ConsentStatus`, `ConsentScope` desde aquí).
export type { Consent };
export type ConsentStatus = ApiConsentStatus;
export type ConsentScope = ApiConsentScope;

export async function grantConsent(input: GrantConsentRequest): Promise<Consent> {
    const { data } = await api.post<ApiEnvelope<Consent>>('/consent', input);
    return unwrapResponse<Consent>(data);
}

export async function revokeConsent(
    id: string,
    payload: RevokeConsentRequest = {},
): Promise<Consent> {
    const { data } = await api.patch<ApiEnvelope<Consent>>(
        `/consent/${id}/revoke`,
        payload,
    );
    return unwrapResponse<Consent>(data);
}

export interface ListMyConsentsResult {
    data: Consent[];
    total: number;
}

export async function listMyConsents(
    params: ListConsentsQuery = {},
): Promise<ListMyConsentsResult> {
    const { data } = await api.get<ApiEnvelope<Consent[]>>('/consent', { params });
    const page = unwrapPaginatedResponse<Consent>(data);
    const meta = (data as { meta?: { total?: number; totalPages?: number } })?.meta;
    return {
        data: page.data,
        // El backend devuelve `total` dentro de `meta` (no en `data`).
        // Si no llega, usamos el largo del array como fallback.
        total: meta?.total ?? page.data.length,
    };
}
