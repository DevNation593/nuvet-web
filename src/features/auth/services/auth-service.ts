import api from '@/shared/lib/api-client';
import type { ApiEnvelope, LoginRequest, LoginResponse } from '@nuvet/types';

export async function login(input: LoginRequest) {
    const res = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', input);
    return (res.data?.data ?? res.data) as LoginResponse;
}

export async function logout() {
    await api.post('/auth/logout').catch(() => {
        // Fire-and-forget: errors are acceptable on logout
    });
}
