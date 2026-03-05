import api from '@/shared/lib/api-client';
import type {
    ApiEnvelope,
    ApiVaccinationStatus,
    CreateVaccinationRequest,
    UpdateVaccinationRequest,
} from '@nuvet/types';
import type { Vaccination } from '../hooks/use-vaccinations';

export interface FetchVaccinationsParams {
    page?: number;
    limit?: number;
    petId?: string | null;
}

export async function fetchVaccinations(params: FetchVaccinationsParams = {}) {
    const { data } = await api.get<ApiEnvelope<Vaccination[]>>('/vaccinations', { params });
    const payload = data?.data ?? data;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: Vaccination[] })?.data ?? [],
        meta: data?.meta ?? { page: 1, totalPages: 1 },
    };
}

export async function fetchUpcomingVaccinations(days = 30) {
    const { data } = await api.get<ApiEnvelope<Vaccination[]>>('/vaccinations/upcoming', { params: { days } });
    return (data?.data ?? data ?? []) as Vaccination[];
}

export async function createVaccination(input: CreateVaccinationRequest) {
    const { data } = await api.post<ApiEnvelope<Vaccination>>('/vaccinations', input);
    return (data?.data ?? data) as Vaccination;
}

export async function updateVaccination(id: string, input: UpdateVaccinationRequest) {
    const { data } = await api.patch<ApiEnvelope<Vaccination>>(`/vaccinations/${id}`, input);
    return (data?.data ?? data) as Vaccination;
}
