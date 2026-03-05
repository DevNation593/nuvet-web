import api from '@/shared/lib/api-client';
import type { ApiEnvelope, CreateClientRequest, UpdateClientRequest } from '@nuvet/types';
import type { ClinicClient } from '../hooks/use-clients';

export interface FetchClientsParams {
    page?: number;
    limit?: number;
}

export async function fetchClients(params: FetchClientsParams = {}) {
    const { data } = await api.get<ApiEnvelope<ClinicClient[]>>('/clients', { params });
    const payload = data?.data ?? data;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: ClinicClient[] })?.data ?? [],
        meta: data?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
}

export async function fetchClient(id: string) {
    const { data } = await api.get<ApiEnvelope<ClinicClient>>(`/clients/${id}`);
    return (data?.data ?? data) as ClinicClient;
}

export async function createClient(input: CreateClientRequest) {
    const { data } = await api.post<ApiEnvelope<ClinicClient>>('/clients', input);
    return (data?.data ?? data) as ClinicClient;
}

export async function updateClient(id: string, input: UpdateClientRequest) {
    const { data } = await api.patch<ApiEnvelope<ClinicClient>>(`/clients/${id}`, input);
    return (data?.data ?? data) as ClinicClient;
}
