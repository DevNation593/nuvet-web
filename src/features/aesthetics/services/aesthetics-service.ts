import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
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
    return unwrapPaginatedResponse<AestheticService>(data);
}

export async function createAesthetic(input: CreateAestheticRequest) {
    const { data } = await api.post<ApiEnvelope<AestheticService>>('/aesthetics', input);
    return unwrapResponse<AestheticService>(data);
}

export async function updateAesthetic(id: string, input: UpdateAestheticRequest) {
    const { data } = await api.patch<ApiEnvelope<AestheticService>>(`/aesthetics/${id}`, input);
    return unwrapResponse<AestheticService>(data);
}

export async function deleteAesthetic(id: string) {
    await api.delete(`/aesthetics/${id}`);
}
