import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    CreateSurgeryRequest,
    SurgeryStatus,
    UpdateSurgeryRequest,
} from '@nuvet/types';
import type { Surgery } from '../hooks/use-surgeries';

export interface FetchSurgeriesParams {
    page?: number;
    limit?: number;
    vetId?: string;
    status?: SurgeryStatus;
}

export async function fetchSurgeries(params: FetchSurgeriesParams = {}) {
    const { data } = await api.get<ApiEnvelope<Surgery[]>>('/surgeries', { params });
    return unwrapPaginatedResponse<Surgery>(data);
}

export async function createSurgery(input: CreateSurgeryRequest) {
    const { data } = await api.post<ApiEnvelope<Surgery>>('/surgeries', input);
    return unwrapResponse<Surgery>(data);
}

export async function updateSurgery(id: string, input: UpdateSurgeryRequest) {
    const { data } = await api.patch<ApiEnvelope<Surgery>>(`/surgeries/${id}`, input);
    return unwrapResponse<Surgery>(data);
}
