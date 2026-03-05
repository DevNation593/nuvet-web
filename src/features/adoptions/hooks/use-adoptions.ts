import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    AdoptionStatus,
    ApplyAdoptionRequest,
    CreateAdoptionRequest,
    UpdateAdoptionStatusRequest,
} from '@nuvet/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import {
    fetchAdoptions,
    createAdoptionListing,
    updateAdoptionStatus,
    applyAdoption,
} from '../services/adoptions-service';

export interface AdoptionRecord {
    id: string;
    petId: string;
    status: AdoptionStatus;
    applicantName?: string;
    applicantEmail?: string;
    applicantPhone?: string;
    notes?: string;
    rejectionReason?: string;
    createdAt: string;
    pet?: { id: string; name: string; species?: string; breed?: string };
}

export function useAdoptions(
    params: { page?: number; limit?: number; status?: AdoptionStatus; tenantId?: string } = {},
    options: { enabled?: boolean } = {},
) {
    const authTenantId = useAuthStore((state) => state.tenantId);
    const tenantId = params.tenantId ?? authTenantId ?? undefined;
    const requestParams = {
        page: params.page,
        limit: params.limit,
        status: params.status,
        tenantId,
    };
    const enabled = (options.enabled ?? true) && Boolean(tenantId);

    return useQuery({
        queryKey: ['adoptions', requestParams],
        queryFn: () => fetchAdoptions(requestParams),
        enabled,
    });
}

export type CreateAdoptionInput = CreateAdoptionRequest;
export type ApplyAdoptionInput = ApplyAdoptionRequest;

export function useCreateAdoptionListing() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateAdoptionInput) => createAdoptionListing(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoptions'] });
        },
    });
}

export function useUpdateAdoptionStatus(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateAdoptionStatusRequest) => updateAdoptionStatus(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoptions'] });
        },
    });
}

export function useApplyAdoption(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: ApplyAdoptionInput) => applyAdoption(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adoptions'] });
        },
    });
}
