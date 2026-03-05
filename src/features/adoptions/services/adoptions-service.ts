import api from '@/shared/lib/api-client';
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
    const payload = data?.data ?? data;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: AdoptionRecord[] })?.data ?? [],
        meta: data?.meta ?? { page: 1, totalPages: 1 },
    };
}

export async function createAdoptionListing(input: CreateAdoptionRequest) {
    const { data } = await api.post<ApiEnvelope<AdoptionRecord>>('/adoptions', input);
    return (data?.data ?? data) as AdoptionRecord;
}

export async function updateAdoptionStatus(id: string, input: UpdateAdoptionStatusRequest) {
    const { data } = await api.patch<ApiEnvelope<AdoptionRecord>>(`/adoptions/${id}/status`, input);
    return (data?.data ?? data) as AdoptionRecord;
}

export async function applyAdoption(id: string, input: ApplyAdoptionRequest) {
    const { data } = await api.post<ApiEnvelope<AdoptionRecord>>(`/adoptions/${id}/apply`, input);
    return (data?.data ?? data) as AdoptionRecord;
}
