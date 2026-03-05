import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    ApiVaccinationStatus,
    CreateVaccinationRequest,
    UpdateVaccinationRequest,
} from '@nuvet/types';
import { fetchVaccinations, fetchUpcomingVaccinations, createVaccination, updateVaccination } from '../services/vaccinations-service';

export interface Vaccination {
    id: string;
    petId: string;
    vetId: string;
    vaccineName: string;
    manufacturer?: string;
    batchNumber?: string;
    dose: number;
    administeredAt: string;
    nextDueAt?: string;
    status: ApiVaccinationStatus;
    notes?: string;
    pet?: { id: string; name: string; owner?: { firstName?: string; lastName?: string } };
}

export type CreateVaccinationInput = CreateVaccinationRequest;

export function useVaccinations(petId: string | null, params: { page?: number; limit?: number } = {}) {
    return useQuery({
        queryKey: ['vaccinations', petId, params],
        queryFn: () => fetchVaccinations({ ...params, petId }),
        enabled: !!petId,
    });
}

export function useUpcomingVaccinations(days = 30, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['vaccinations-upcoming', days],
        queryFn: () => fetchUpcomingVaccinations(days),
        enabled: options.enabled ?? true,
    });
}

export function useCreateVaccination() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateVaccinationInput) => createVaccination(input),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['vaccinations', variables.petId] });
            queryClient.invalidateQueries({ queryKey: ['vaccinations-upcoming'] });
        },
    });
}

export function useUpdateVaccination(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateVaccinationRequest) => updateVaccination(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
            queryClient.invalidateQueries({ queryKey: ['vaccinations-upcoming'] });
        },
    });
}
