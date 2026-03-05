import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreatePetRequest, Pet, UpdatePetRequest } from '@nuvet/types';
import { fetchPets, fetchPet, createPet, updatePet, deactivatePet } from '../services/pets-service';

export interface PetsParams {
    page?: number;
    limit?: number;
}

export interface PaginatedPets {
    data: Pet[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

export function usePets(params: PetsParams = {}) {
    return useQuery({
        queryKey: ['pets', params],
        queryFn: () => fetchPets(params),
    });
}

export function usePet(id: string | null) {
    return useQuery({
        queryKey: ['pet', id],
        queryFn: () => fetchPet(id!),
        enabled: !!id,
    });
}

export type CreatePetInput = CreatePetRequest;

export type UpdatePetInput = UpdatePetRequest;

export function useCreatePet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreatePetInput) => createPet(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}

export function useUpdatePet(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdatePetInput) => updatePet(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
            if (id) queryClient.invalidateQueries({ queryKey: ['pet', id] });
        },
    });
}

export function useDeactivatePet() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deactivatePet(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pets'] });
        },
    });
}
