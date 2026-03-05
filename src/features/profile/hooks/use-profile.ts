import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@nuvet/types';
import { fetchMyProfile, updateMyProfile, changeMyPassword } from '../services/profile-service';

export interface MyProfile {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phone?: string;
}

export type UpdateMyProfileInput = UpdateProfileRequest;
export type ChangePasswordInput = ChangePasswordRequest;

export function useMyProfile() {
    return useQuery({
        queryKey: ['my-profile'],
        queryFn: () => fetchMyProfile(),
    });
}

export function useUpdateMyProfile() {
    const queryClient = useQueryClient();
    const updateUser = useAuthStore((state) => state.updateUser);

    return useMutation({
        mutationFn: (input: UpdateMyProfileInput) => updateMyProfile(input),
        onSuccess: (profile) => {
            updateUser({
                firstName: profile.firstName,
                lastName: profile.lastName,
            });
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
        },
    });
}

export function useChangeMyPassword() {
    return useMutation({
        mutationFn: (input: ChangePasswordInput) => changeMyPassword(input),
    });
}
