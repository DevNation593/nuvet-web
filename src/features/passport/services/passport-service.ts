import api from '@/shared/lib/api-client';
import { unwrapResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    CreatePassportShareRequest,
    PassportLookupResult,
    PassportPet,
    PassportShare,
} from '@nuvet/types';

export async function fetchPetPassport(petId: string): Promise<PassportPet> {
    const { data } = await api.get<ApiEnvelope<PassportPet>>(`/passport/pets/${petId}`);
    return unwrapResponse<PassportPet>(data);
}

export async function lookupByMicrochip(microchip: string): Promise<PassportLookupResult[]> {
    const { data } = await api.get<ApiEnvelope<PassportLookupResult[]>>('/passport/lookup', {
        params: { microchip },
    });
    return unwrapResponse<PassportLookupResult[]>(data);
}

export async function createPassportShare(petId: string, ttlDays?: number): Promise<PassportShare> {
    const { data } = await api.post<ApiEnvelope<PassportShare>>('/passport/shares', {
        petId,
        ttlDays,
    });
    return unwrapResponse<PassportShare>(data);
}

export async function listMyPassportShares(): Promise<PassportShare[]> {
    const { data } = await api.get<ApiEnvelope<PassportShare[]>>('/passport/shares/mine');
    return unwrapResponse<PassportShare[]>(data);
}

export async function revokePassportShare(shareId: string): Promise<void> {
    await api.delete(`/passport/shares/${shareId}`);
}
