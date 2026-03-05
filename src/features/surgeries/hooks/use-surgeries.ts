import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateSurgeryRequest,
    SurgeryStatus,
    UpdateSurgeryRequest,
} from '@nuvet/types';
import { fetchSurgeries, createSurgery, updateSurgery } from '../services/surgeries-service';

export interface Surgery {
    id: string;
    petId: string;
    vetId: string;
    appointmentId?: string;
    type: string;
    status: SurgeryStatus;
    scheduledAt: string;
    consentSignedAt?: string;
    consentSignedBy?: string;
    preInstructions?: string;
    postInstructions?: string;
    postOpNotes?: string;
    anesthesiaType?: string;
    durationMinutes?: number;
    notes?: string;
    pet?: { id: string; name: string; species?: string };
    vet?: { id: string; firstName: string; lastName: string };
}

export type CreateSurgeryInput = CreateSurgeryRequest;

export function useSurgeries(params: { page?: number; limit?: number; vetId?: string; status?: SurgeryStatus } = {}) {
    return useQuery({
        queryKey: ['surgeries', params],
        queryFn: () => fetchSurgeries(params),
    });
}

export function useCreateSurgery() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateSurgeryInput) => createSurgery(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surgeries'] });
        },
    });
}

export function useUpdateSurgery(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateSurgeryRequest) => updateSurgery(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['surgeries'] });
        },
    });
}
