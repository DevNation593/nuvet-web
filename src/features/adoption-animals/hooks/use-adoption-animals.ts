import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    fetchAdoptionAnimals,
    createAdoptionAnimal,
    updateAdoptionAnimal,
    deleteAdoptionAnimal,
    type CreateAdoptionAnimalInput,
    type UpdateAdoptionAnimalInput,
} from '../services/adoption-animals-service';

export function useAdoptionAnimals(params: { page?: number; limit?: number } = {}) {
    return useQuery({
        queryKey: ['adoption-animals', params],
        queryFn: () => fetchAdoptionAnimals(params),
    });
}

export function useCreateAdoptionAnimal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateAdoptionAnimalInput) => createAdoptionAnimal(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoption-animals'] });
        },
    });
}

export function useUpdateAdoptionAnimal(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateAdoptionAnimalInput) => updateAdoptionAnimal(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoption-animals'] });
        },
    });
}

export function useDeleteAdoptionAnimal() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteAdoptionAnimal(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoption-animals'] });
        },
    });
}
