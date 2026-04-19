import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse, unwrapArrayResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
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
    return unwrapPaginatedResponse<Vaccination>(data);
}

export async function fetchUpcomingVaccinations(days = 30) {
    const { data } = await api.get<ApiEnvelope<Vaccination[]>>('/vaccinations/upcoming', { params: { days } });
    return unwrapArrayResponse<Vaccination>(data);
}

export async function createVaccination(input: CreateVaccinationRequest) {
    const { data } = await api.post<ApiEnvelope<Vaccination>>('/vaccinations', input);
    return unwrapResponse<Vaccination>(data);
}

export async function updateVaccination(id: string, input: UpdateVaccinationRequest) {
    const { data } = await api.patch<ApiEnvelope<Vaccination>>(`/vaccinations/${id}`, input);
    return unwrapResponse<Vaccination>(data);
}
