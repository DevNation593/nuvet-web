import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateClientRequest, UpdateClientRequest } from '@nuvet/types';
import { fetchClients, fetchClient, createClient, updateClient } from '../services/clients-service';

export interface ClinicClient {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ClientsParams {
    page?: number;
    limit?: number;
}

export interface PaginatedClients {
    data: ClinicClient[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

export type CreateClientInput = CreateClientRequest;

export type UpdateClientInput = UpdateClientRequest;

export function useClients(params: ClientsParams = {}) {
    return useQuery({
        queryKey: ['clients', params],
        queryFn: () => fetchClients(params),
    });
}

export function useClient(id: string | null) {
    return useQuery({
        queryKey: ['client', id],
        queryFn: () => fetchClient(id!),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateClientInput) => createClient(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
}

export function useUpdateClient(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateClientInput) => updateClient(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            if (id) {
                queryClient.invalidateQueries({ queryKey: ['client', id] });
            }
        },
    });
}
