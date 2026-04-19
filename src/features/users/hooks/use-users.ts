import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateUserRequest,
    UpdateUserRequest,
    User,
} from '@nuvet/types';
import { fetchUsers, createUser, updateUser } from '../services/users-service';

export interface UsersParams {
    page?: number;
    limit?: number;
}

export interface PaginatedUsers {
    data: User[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useUsers(params: UsersParams = {}) {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => fetchUsers(params),
    });
}

const STAFF_ROLES = new Set([
    'CLINIC_ADMIN', 'VET', 'RECEPTIONIST', 'GROOMER', 'INVENTORY', 'ADOPTION_MANAGER',
]);

export function useStaffUsers() {
    const { data, ...rest } = useUsers({ limit: 100 });
    const staff = useMemo(
        () => data?.data?.filter((u) => STAFF_ROLES.has(u.role)) ?? [],
        [data?.data],
    );
    return { data: { data: staff, meta: data?.meta }, ...rest };
}

export type CreateUserInput = CreateUserRequest;
export type UpdateUserInput = UpdateUserRequest;

export function useCreateUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateUserInput) => createUser(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

export function useUpdateUser(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateUserInput) => updateUser(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            if (id) queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
    });
}
