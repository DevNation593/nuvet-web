import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapArrayResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope } from '@nuvet/types';
import type { Branch } from '../store/branches.store';

export interface CreateBranchInput {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    logoUrl?: string;
    website?: string;
    isMain?: boolean;
}

export interface UpdateBranchInput extends Partial<CreateBranchInput> {
    isActive?: boolean;
}

export async function fetchBranches(onlyActive = false) {
    const { data } = await api.get<ApiEnvelope<Branch[]>>('/branches', {
        params: onlyActive ? { onlyActive: 'true' } : undefined,
    });
    return unwrapArrayResponse<Branch>(data);
}

export async function fetchBranch(id: string) {
    const { data } = await api.get<ApiEnvelope<Branch>>(`/branches/${id}`);
    return unwrapResponse<Branch>(data);
}

export async function createBranch(input: CreateBranchInput) {
    const { data } = await api.post<ApiEnvelope<Branch>>('/branches', input);
    return unwrapResponse<Branch>(data);
}

export async function updateBranch(id: string, input: UpdateBranchInput) {
    const { data } = await api.patch<ApiEnvelope<Branch>>(`/branches/${id}`, input);
    return unwrapResponse<Branch>(data);
}

export async function deleteBranch(id: string) {
    await api.delete(`/branches/${id}`);
}

export async function transferBranchUsers(fromId: string, toId: string) {
    const { data } = await api.post<ApiEnvelope<{ transferred: number }>>(
        `/branches/${fromId}/transfer-users/${toId}`,
    );
    return unwrapResponse<{ transferred: number }>(data);
}
