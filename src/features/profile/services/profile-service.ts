import api from '@/shared/lib/api-client';
import type { ApiEnvelope, ChangePasswordRequest, UpdateProfileRequest } from '@nuvet/types';
import type { MyProfile } from '../hooks/use-profile';

export async function fetchMyProfile() {
    const { data } = await api.get<ApiEnvelope<MyProfile>>('/auth/me');
    return (data?.data ?? data) as MyProfile;
}

export async function updateMyProfile(input: UpdateProfileRequest) {
    const { data } = await api.patch<ApiEnvelope<MyProfile>>('/auth/me', input);
    return (data?.data ?? data) as MyProfile;
}

export async function changeMyPassword(input: ChangePasswordRequest) {
    const { data } = await api.patch<ApiEnvelope<{ message?: string }>>('/auth/change-password', input);
    return (data?.data ?? data) as { message?: string };
}
