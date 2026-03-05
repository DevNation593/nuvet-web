import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    Appointment,
    CreateAppointmentRequest,
    UpdateAppointmentStatusRequest,
} from '@nuvet/types';
import {
    fetchAppointments,
    fetchAppointment,
    fetchAvailability,
    fetchAppointmentStaff,
    createAppointment,
    updateAppointmentStatus,
    cancelAppointment,
} from '../services/appointments-service';

export interface AppointmentsParams {
    page?: number;
    limit?: number;
    from?: string;
    to?: string;
    staffId?: string;
    vetId?: string;
    petId?: string;
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

export interface PaginatedAppointments {
    data: Appointment[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export function useAppointments(params: AppointmentsParams = {}) {
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => fetchAppointments(params),
    });
}

export interface AvailabilityParams {
    date: string;
    staffId: string;
}

export function useAvailability(params: AvailabilityParams | null) {
    return useQuery({
        queryKey: ['availability', params],
        queryFn: () => fetchAvailability(params!.date, params!.staffId),
        enabled: !!params?.date && !!params?.staffId,
    });
}

export function useAppointmentStaff() {
    return useQuery({
        queryKey: ['appointment-staff'],
        queryFn: fetchAppointmentStaff,
    });
}

export type CreateAppointmentInput = CreateAppointmentRequest;

export function useCreateAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useUpdateAppointmentStatus(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateAppointmentStatusRequest) => updateAppointmentStatus(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useCancelAppointment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelAppointment(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
}

export function useAppointment(id: string | null) {
    return useQuery({
        queryKey: ['appointment', id],
        queryFn: () => fetchAppointment(id!),
        enabled: !!id,
    });
}
