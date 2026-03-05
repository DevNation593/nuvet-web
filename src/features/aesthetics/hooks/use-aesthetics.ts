import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    AestheticStatus,
    CreateAestheticRequest,
    UpdateAestheticRequest,
} from '@nuvet/types';
import { fetchAesthetics, createAesthetic, updateAesthetic } from '../services/aesthetics-service';

export interface AestheticService {
    id: string;
    petId: string;
    groomerId: string;
    appointmentId?: string;
    serviceName: string;
    status: AestheticStatus;
    scheduledAt: string;
    price?: number;
    notes?: string;
    pet?: { id: string; name: string; species?: string };
    groomer?: { id: string; firstName: string; lastName: string };
}

export type CreateAestheticInput = CreateAestheticRequest;

export function useAesthetics(params: { page?: number; limit?: number; groomerId?: string; status?: AestheticStatus } = {}) {
    return useQuery({
        queryKey: ['aesthetics', params],
        queryFn: () => fetchAesthetics(params),
    });
}

export function useCreateAesthetic() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateAestheticInput) => createAesthetic(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aesthetics'] });
        },
    });
}

export function useUpdateAesthetic(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateAestheticRequest) => updateAesthetic(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['aesthetics'] });
        },
    });
}
