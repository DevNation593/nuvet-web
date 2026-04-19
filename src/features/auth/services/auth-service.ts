import api from '@/shared/lib/api-client';
import { unwrapResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope, LoginRequest, LoginResponse } from '@nuvet/types';

export async function login(input: LoginRequest) {
    const { data } = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', input);
    return unwrapResponse<LoginResponse>(data);
}

export async function requestPasswordReset(email: string) {
    const { data } = await api.post<ApiEnvelope<{ message: string }>>('/auth/forgot-password', { email });
    return unwrapResponse<{ message: string }>(data);
}

export async function resetPassword(token: string, newPassword: string) {
    const { data } = await api.post<ApiEnvelope<{ message: string }>>('/auth/reset-password', { token, newPassword });
    return unwrapResponse<{ message: string }>(data);
}

export async function logout() {
    await api.post('/auth/logout').catch(() => {});
}
