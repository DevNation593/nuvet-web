import api from '@/shared/lib/api-client';
import type { ApiEnvelope, CreatePetRequest, UpdatePetRequest, Pet } from '@nuvet/types';

export interface FetchPetsParams {
    page?: number;
    limit?: number;
}

export async function fetchPets(params: FetchPetsParams = {}) {
    const { data } = await api.get<ApiEnvelope<Pet[]>>('/pets', { params });
    const payload = data?.data ?? data;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: Pet[] })?.data ?? [],
        meta: data?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
}

export async function fetchPet(id: string) {
    const { data } = await api.get<ApiEnvelope<Pet>>(`/pets/${id}`);
    return (data?.data ?? data) as Pet;
}

export async function createPet(input: CreatePetRequest) {
    const { data } = await api.post<ApiEnvelope<Pet>>('/pets', input);
    return (data?.data ?? data) as Pet;
}

export async function updatePet(id: string, input: UpdatePetRequest) {
    const { data } = await api.patch<ApiEnvelope<Pet>>(`/pets/${id}`, input);
    return (data?.data ?? data) as Pet;
}

export async function deactivatePet(id: string) {
    const { data } = await api.delete<ApiEnvelope<{ message: string }>>(`/pets/${id}`);
    return data;
}
