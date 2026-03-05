import api from '@/shared/lib/api-client';
import type {
    AestheticStatus,
    ApiEnvelope,
    CreateAestheticRequest,
    UpdateAestheticRequest,
} from '@nuvet/types';
import type { AestheticService } from '../hooks/use-aesthetics';

export interface FetchAestheticsParams {
    page?: number;
    limit?: number;
    groomerId?: string;
    status?: AestheticStatus;
}

export async function fetchAesthetics(params: FetchAestheticsParams = {}) {
    const { data } = await api.get<ApiEnvelope<AestheticService[]>>('/aesthetics', { params });
    const payload = data?.data ?? data;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: AestheticService[] })?.data ?? [],
        meta: data?.meta ?? { page: 1, totalPages: 1 },
    };
}

export async function createAesthetic(input: CreateAestheticRequest) {
    const { data } = await api.post<ApiEnvelope<AestheticService>>('/aesthetics', input);
    return (data?.data ?? data) as AestheticService;
}

export async function updateAesthetic(id: string, input: UpdateAestheticRequest) {
    const { data } = await api.patch<ApiEnvelope<AestheticService>>(`/aesthetics/${id}`, input);
    return (data?.data ?? data) as AestheticService;
}
