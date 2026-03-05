import api from '@/shared/lib/api-client';
import type { ApiEnvelope, CreateUserRequest, UpdateUserRequest, User } from '@nuvet/types';

export interface FetchUsersParams {
    page?: number;
    limit?: number;
}

export async function fetchUsers(params: FetchUsersParams = {}) {
    const { data } = await api.get<ApiEnvelope<User[]>>('/users', { params });
    const payload = data?.data ?? data;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: User[] })?.data ?? [],
        meta: data?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
}

export async function createUser(input: CreateUserRequest) {
    const { data } = await api.post<ApiEnvelope<User>>('/users', input);
    return (data?.data ?? data) as User;
}

export async function updateUser(id: string, input: UpdateUserRequest) {
    const { data } = await api.patch<ApiEnvelope<User>>(`/users/${id}`, input);
    return (data?.data ?? data) as User;
}
