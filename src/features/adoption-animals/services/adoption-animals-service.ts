import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope, PetSpecies, PetSex } from '@nuvet/types';

export interface AdoptionAnimal {
    id: string;
    tenantId: string;
    name: string;
    species: PetSpecies;
    breed?: string | null;
    sex: PetSex;
    birthDate?: string | null;
    color?: string | null;
    weight?: number | null;
    photoUrl?: string | null;
    description?: string | null;
    isNeutered: boolean;
    notes?: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAdoptionAnimalInput {
    name: string;
    species: PetSpecies;
    sex: PetSex;
    breed?: string;
    birthDate?: string;
    color?: string;
    weight?: number;
    photoUrl?: string;
    description?: string;
    isNeutered?: boolean;
    notes?: string;
}

export type UpdateAdoptionAnimalInput = Partial<CreateAdoptionAnimalInput> & { isActive?: boolean };

export async function fetchAdoptionAnimals(params: { page?: number; limit?: number } = {}) {
    const { data } = await api.get<ApiEnvelope<AdoptionAnimal[]>>('/adoption-animals', { params });
    return unwrapPaginatedResponse<AdoptionAnimal>(data);
}

export async function createAdoptionAnimal(input: CreateAdoptionAnimalInput) {
    const { data } = await api.post<ApiEnvelope<AdoptionAnimal>>('/adoption-animals', input);
    return unwrapResponse<AdoptionAnimal>(data);
}

export async function updateAdoptionAnimal(id: string, input: UpdateAdoptionAnimalInput) {
    const { data } = await api.patch<ApiEnvelope<AdoptionAnimal>>(`/adoption-animals/${id}`, input);
    return unwrapResponse<AdoptionAnimal>(data);
}

export async function deleteAdoptionAnimal(id: string) {
    await api.delete(`/adoption-animals/${id}`);
}
