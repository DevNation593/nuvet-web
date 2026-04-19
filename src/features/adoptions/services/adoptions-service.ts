import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type {
    AdoptionStatus,
    ApiEnvelope,
    ApplyAdoptionRequest,
    CreateAdoptionRequest,
    UpdateAdoptionStatusRequest,
} from '@nuvet/types';
import type { AdoptionRecord } from '../hooks/use-adoptions';

export interface FetchAdoptionsParams {
    page?: number;
    limit?: number;
    status?: AdoptionStatus;
    tenantId?: string;
}

export async function fetchAdoptions(params: FetchAdoptionsParams = {}) {
    const { data } = await api.get<ApiEnvelope<AdoptionRecord[]>>('/adoptions', { params });
    return unwrapPaginatedResponse<AdoptionRecord>(data);
}

export async function createAdoptionListing(input: CreateAdoptionRequest) {
    const { data } = await api.post<ApiEnvelope<AdoptionRecord>>('/adoptions', input);
    return unwrapResponse<AdoptionRecord>(data);
}

export async function updateAdoptionStatus(id: string, input: UpdateAdoptionStatusRequest) {
    const { data } = await api.patch<ApiEnvelope<AdoptionRecord>>(`/adoptions/${id}/status`, input);
    return unwrapResponse<AdoptionRecord>(data);
}

export async function applyAdoption(id: string, input: ApplyAdoptionRequest) {
    const { data } = await api.post<ApiEnvelope<AdoptionRecord>>(`/adoptions/${id}/apply`, input);
    return unwrapResponse<AdoptionRecord>(data);
}
