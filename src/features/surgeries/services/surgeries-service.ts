import api from '@/shared/lib/api-client';
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
    const payload = data?.data ?? data;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: Surgery[] })?.data ?? [],
        meta: data?.meta ?? { page: 1, totalPages: 1 },
    };
}

export async function createSurgery(input: CreateSurgeryRequest) {
    const { data } = await api.post<ApiEnvelope<Surgery>>('/surgeries', input);
    return (data?.data ?? data) as Surgery;
}

export async function updateSurgery(id: string, input: UpdateSurgeryRequest) {
    const { data } = await api.patch<ApiEnvelope<Surgery>>(`/surgeries/${id}`, input);
    return (data?.data ?? data) as Surgery;
}
