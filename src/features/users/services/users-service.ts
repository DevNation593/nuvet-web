import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope, CreateUserRequest, UpdateUserRequest, User } from '@nuvet/types';

export interface FetchUsersParams {
    page?: number;
    limit?: number;
}

export async function fetchUsers(params: FetchUsersParams = {}) {
    const { data } = await api.get<ApiEnvelope<User[]>>('/users', { params });
    return unwrapPaginatedResponse<User>(data);
}

export async function createUser(input: CreateUserRequest) {
    const { data } = await api.post<ApiEnvelope<User>>('/users', input);
    return unwrapResponse<User>(data);
}

export async function updateUser(id: string, input: UpdateUserRequest) {
    const { data } = await api.patch<ApiEnvelope<User>>(`/users/${id}`, input);
    return unwrapResponse<User>(data);
}
