import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope, CreateClientRequest, UpdateClientRequest } from '@nuvet/types';
import type { ClinicClient } from '../hooks/use-clients';

export interface FetchClientsParams {
    page?: number;
    limit?: number;
}

export async function fetchClients(params: FetchClientsParams = {}) {
    const { data } = await api.get<ApiEnvelope<ClinicClient[]>>('/clients', { params });
    return unwrapPaginatedResponse<ClinicClient>(data);
}

export async function fetchClient(id: string) {
    const { data } = await api.get<ApiEnvelope<ClinicClient>>(`/clients/${id}`);
    return unwrapResponse<ClinicClient>(data);
}

export async function createClient(input: CreateClientRequest) {
    const { data } = await api.post<ApiEnvelope<ClinicClient>>('/clients', input);
    return unwrapResponse<ClinicClient>(data);
}

export async function updateClient(id: string, input: UpdateClientRequest) {
    const { data } = await api.patch<ApiEnvelope<ClinicClient>>(`/clients/${id}`, input);
    return unwrapResponse<ClinicClient>(data);
}

export async function fetchClientByIdentification(identification: string): Promise<ClinicClient | null> {
    const normalized = identification.trim();
    if (!normalized) return null;
    try {
        const { data } = await api.get<ApiEnvelope<ClinicClient | null>>(
            `/clients/by-identification/${encodeURIComponent(normalized)}`,
        );
        return unwrapResponse<ClinicClient | null>(data);
    } catch {
        return null;
    }
}
