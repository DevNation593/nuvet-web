import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    Consent,
    CreatePassportShareRequest,
    PassportPet,
    PassportShare,
} from '@nuvet/types';
import {
    createPassportShare,
    fetchPetPassport,
    listMyPassportShares,
    lookupByMicrochip,
    revokePassportShare,
} from '../services/passport-service';

export function usePetPassport(petId: string | null) {
    return useQuery<PassportPet>({
        queryKey: ['passport', 'pet', petId],
        queryFn: () => fetchPetPassport(petId!),
        enabled: !!petId,
    });
}

export function useMicrochipLookup(microchip: string | null) {
    return useQuery({
        queryKey: ['passport', 'lookup', microchip],
        queryFn: () => lookupByMicrochip(microchip!),
        enabled: !!microchip && microchip.length >= 4,
    });
}

export function useMyPassportShares() {
    return useQuery<PassportShare[]>({
        queryKey: ['passport', 'shares', 'mine'],
        queryFn: () => listMyPassportShares(),
    });
}

export function useCreatePassportShare() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ petId, ttlDays }: CreatePassportShareRequest) =>
            createPassportShare(petId, ttlDays),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['passport', 'shares', 'mine'] });
        },
    });
}

export function useRevokePassportShare() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (shareId: string) => revokePassportShare(shareId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['passport', 'shares', 'mine'] });
        },
    });
}

export type { Consent };
