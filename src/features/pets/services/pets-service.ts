import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope, CreatePetRequest, UpdatePetRequest, Pet } from '@nuvet/types';

export interface FetchPetsParams {
    page?: number;
    limit?: number;
    includeInactive?: boolean;
}

export async function fetchPets(params: FetchPetsParams = {}) {
    const requestParams: FetchPetsParams = {
        page: params.page,
        limit: params.limit,
        includeInactive: params.includeInactive ? true : undefined,
    };
    const { data } = await api.get<ApiEnvelope<Pet[]>>('/pets', { params: requestParams });
    return unwrapPaginatedResponse<Pet>(data);
}

export async function fetchPet(id: string) {
    const { data } = await api.get<ApiEnvelope<Pet>>(`/pets/${id}`);
    return unwrapResponse<Pet>(data);
}

export async function createPet(input: CreatePetRequest) {
    const { data } = await api.post<ApiEnvelope<Pet>>('/pets', input);
    return unwrapResponse<Pet>(data);
}

export async function updatePet(id: string, input: UpdatePetRequest) {
    const { data } = await api.patch<ApiEnvelope<Pet>>(`/pets/${id}`, input);
    return unwrapResponse<Pet>(data);
}

export async function deactivatePet(id: string) {
    const { data } = await api.delete<ApiEnvelope<{ message: string }>>(`/pets/${id}`);
    return unwrapResponse(data);
}

export async function reactivatePet(id: string) {
    const { data } = await api.patch<ApiEnvelope<{ message: string }>>(`/pets/${id}/reactivate`);
    return unwrapResponse(data);
}

export interface ClinicalHistoryResult {
    pet: Pet & { owner?: { id: string; firstName: string; lastName: string; email: string; phone?: string } };
    medicalRecords: Array<{
        id: string;
        chiefComplaint: string;
        diagnosis: string;
        treatment: string;
        prescriptions?: string;
        notes?: string;
        weight?: number;
        temperature?: number;
        heartRate?: number;
        createdAt: string;
        vet: { id: string; firstName: string; lastName: string };
        appointment?: { id: string; scheduledAt: string; type: string };
    }>;
    vaccinations: Array<{
        id: string;
        vaccineName: string;
        manufacturer?: string;
        batchNumber?: string;
        dose: number;
        administeredAt: string;
        nextDueAt?: string;
        status: string;
        notes?: string;
        vet: { id: string; firstName: string; lastName: string };
    }>;
    surgeries: Array<{
        id: string;
        type: string;
        status: string;
        scheduledAt: string;
        anesthesiaType?: string;
        durationMinutes?: number;
        postOpNotes?: string;
        notes?: string;
        vet: { id: string; firstName: string; lastName: string };
    }>;
}

export async function fetchPetClinicalHistory(id: string) {
    const { data } = await api.get<ApiEnvelope<ClinicalHistoryResult>>(`/pets/${id}/clinical-history`);
    return unwrapResponse<ClinicalHistoryResult>(data);
}
