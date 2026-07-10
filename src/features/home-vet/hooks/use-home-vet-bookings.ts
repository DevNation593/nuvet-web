import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    HomeVetBooking,
    ListHomeVetBookingsParams,
    CreateHomeVetBookingRequest,
    UpdateHomeVetBookingRequest,
    AssignVetRequest,
    CancelHomeVetBookingRequest,
    CompleteHomeVetBookingRequest,
} from '@nuvet/types';
import {
    listHomeVetBookings,
    getHomeVetBooking,
    createHomeVetBooking,
    updateHomeVetBooking,
    assignVet,
    transitionHomeVetBooking,
} from '../services/home-vet-bookings-service';

const KEY = ['home-vet-bookings'] as const;
const DETAIL_KEY = (id: string) => ['home-vet-booking', id] as const;

export function useHomeVetBookings(
    params: ListHomeVetBookingsParams = {},
) {
    return useQuery({
        queryKey: [...KEY, params] as const,
        queryFn: () => listHomeVetBookings(params),
    });
}

export function useHomeVetBooking(id: string | undefined) {
    return useQuery({
        queryKey: DETAIL_KEY(id ?? ''),
        queryFn: () => getHomeVetBooking(id!),
        enabled: !!id,
    });
}

function invalidate(qc: ReturnType<typeof useQueryClient>, id?: string) {
    qc.invalidateQueries({ queryKey: KEY });
    if (id) qc.invalidateQueries({ queryKey: DETAIL_KEY(id) });
}

export function useCreateHomeVetBooking() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateHomeVetBookingRequest) =>
            createHomeVetBooking(input),
        onSuccess: (booking) => invalidate(qc, booking.id),
    });
}

export function useUpdateHomeVetBooking() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateHomeVetBookingRequest }) =>
            updateHomeVetBooking(id, input),
        onSuccess: (booking) => invalidate(qc, booking.id),
    });
}

export function useAssignVet() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: AssignVetRequest }) =>
            assignVet(id, input),
        onSuccess: (booking) => invalidate(qc, booking.id),
    });
}

export function useTransitionHomeVetBooking() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            path,
            body,
        }: {
            id: string;
            path: 'confirm' | 'en-route' | 'start' | 'complete' | 'no-show' | 'cancel';
            body?: CancelHomeVetBookingRequest | CompleteHomeVetBookingRequest | object;
        }) => transitionHomeVetBooking(id, path, body ?? {}),
        onSuccess: (booking: HomeVetBooking) => invalidate(qc, booking.id),
    });
}
