import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    Appointment,
    CreateAppointmentRequest,
    UpdateAppointmentStatusRequest,
} from '@nuvet/types';

export interface FetchAppointmentsParams {
    page?: number;
    limit?: number;
    petId?: string;
    type?: string;
    status?: string;
    vetId?: string;
    staffId?: string;
    dateFrom?: string;
    dateTo?: string;
    from?: string;
    to?: string;
    branchId?: string;
}

export async function fetchAppointments(params: FetchAppointmentsParams = {}) {
    const resolvedDateFrom = params.dateFrom ?? params.from;
    const resolvedDateTo = params.dateTo ?? params.to;
    const resolvedVetId = params.vetId ?? params.staffId;
    const queryParams = {
        page: params.page,
        limit: params.limit,
        petId: params.petId,
        type: params.type,
        status: params.status,
        vetId: resolvedVetId,
        dateFrom: resolvedDateFrom,
        dateTo: resolvedDateTo,
        branchId: params.branchId,
    };
    const { data } = await api.get<ApiEnvelope<Appointment[]>>('/appointments', { params: queryParams });
    return unwrapPaginatedResponse<Appointment>(data);
}

export async function fetchAppointment(id: string) {
    const { data } = await api.get<ApiEnvelope<Appointment>>(`/appointments/${id}`);
    return unwrapResponse<Appointment>(data);
}

export async function fetchAvailability(date: string, staffId: string, branchId?: string) {
    const { data } = await api.get<{ data?: { slots?: { time: string; available: boolean }[] } }>(
        '/appointments/availability',
        { params: { date, vetId: staffId, branchId } },
    );
    return (data as { data?: { slots?: { time: string; available: boolean }[] } })?.data?.slots ?? [];
}

export async function fetchAppointmentStaff() {
    const { data } = await api.get<{
        data?: Array<{ id: string; firstName: string; lastName: string; role: string }>;
    }>('/appointments/staff');
    return (data as { data?: Array<{ id: string; firstName: string; lastName: string; role: string }> })?.data ?? [];
}

export async function createAppointment(input: CreateAppointmentRequest) {
    const { data } = await api.post<ApiEnvelope<Appointment>>('/appointments', input);
    return unwrapResponse<Appointment>(data);
}

export async function updateAppointmentStatus(id: string, input: UpdateAppointmentStatusRequest) {
    const { data } = await api.patch<ApiEnvelope<Appointment>>(`/appointments/${id}`, input);
    return unwrapResponse<Appointment>(data);
}

export async function cancelAppointment(id: string, reason?: string) {
    const { data } = await api.delete<ApiEnvelope<Appointment>>(`/appointments/${id}`, { data: { reason } });
    return unwrapResponse<Appointment>(data);
}
