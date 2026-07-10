import api from '@/shared/lib/api-client';
import type { ApiEnvelope } from '@nuvet/types';
import type {
    HomeVetBooking,
    ListHomeVetBookingsParams,
    CreateHomeVetBookingRequest,
    UpdateHomeVetBookingRequest,
    AssignVetRequest,
    CancelHomeVetBookingRequest,
    CompleteHomeVetBookingRequest,
} from '@nuvet/types';
import { unwrapPaginatedResponse } from '@/shared/lib/api-helpers';

export async function listHomeVetBookings(
    params: ListHomeVetBookingsParams = {},
): Promise<{ data: HomeVetBooking[]; total: number }> {
    const { data } = await api.get<ApiEnvelope<HomeVetBooking[]>>(
        '/home-vet/bookings',
        { params },
    );
    const paginated = unwrapPaginatedResponse<HomeVetBooking>(data);
    return {
        data: paginated.data,
        total: Number((paginated.meta as { total?: number })?.total ?? 0),
    };
}

export async function getHomeVetBooking(id: string): Promise<HomeVetBooking> {
    const { data } = await api.get<ApiEnvelope<HomeVetBooking>>(
        `/home-vet/bookings/${id}`,
    );
    return (data?.data ?? data) as HomeVetBooking;
}

export async function createHomeVetBooking(
    input: CreateHomeVetBookingRequest,
): Promise<HomeVetBooking> {
    const { data } = await api.post<ApiEnvelope<HomeVetBooking>>(
        '/home-vet/bookings',
        input,
    );
    return (data?.data ?? data) as HomeVetBooking;
}

export async function updateHomeVetBooking(
    id: string,
    input: UpdateHomeVetBookingRequest,
): Promise<HomeVetBooking> {
    const { data } = await api.patch<ApiEnvelope<HomeVetBooking>>(
        `/home-vet/bookings/${id}`,
        input,
    );
    return (data?.data ?? data) as HomeVetBooking;
}

export async function assignVet(
    id: string,
    input: AssignVetRequest,
): Promise<HomeVetBooking> {
    const { data } = await api.patch<ApiEnvelope<HomeVetBooking>>(
        `/home-vet/bookings/${id}/assign`,
        input,
    );
    return (data?.data ?? data) as HomeVetBooking;
}

export async function transitionHomeVetBooking(
    id: string,
    path: 'confirm' | 'en-route' | 'start' | 'complete' | 'no-show' | 'cancel',
    body: CancelHomeVetBookingRequest | CompleteHomeVetBookingRequest | object = {},
): Promise<HomeVetBooking> {
    const { data } = await api.patch<ApiEnvelope<HomeVetBooking>>(
        `/home-vet/bookings/${id}/${path}`,
        body,
    );
    return (data?.data ?? data) as HomeVetBooking;
}
