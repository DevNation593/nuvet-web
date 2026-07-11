import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    ApiVaccinationCampaignStatus,
    CreateVaccinationCampaignRequest,
    MarkRegistrationAttendedRequest,
    RegisterPetToCampaignRequest,
    UpdateVaccinationCampaignRequest,
    VaccinationCampaign,
    VaccinationRegistration,
} from '@nuvet/types';

export interface ListVaccinationCampaignsParams {
    status?: ApiVaccinationCampaignStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    pageSize?: number;
}

export async function listVaccinationCampaigns(
    params: ListVaccinationCampaignsParams = {},
): Promise<{ data: VaccinationCampaign[]; total: number }> {
    const { data } = await api.get<ApiEnvelope<VaccinationCampaign[]>>(
        '/vaccinations/campaigns',
        { params },
    );
    const paginated = unwrapPaginatedResponse<VaccinationCampaign>(data);
    return {
        data: paginated.data,
        total: Number((paginated.meta as { total?: number })?.total ?? 0),
    };
}

export async function getVaccinationCampaign(id: string): Promise<VaccinationCampaign> {
    const { data } = await api.get<ApiEnvelope<VaccinationCampaign>>(
        `/vaccinations/campaigns/${id}`,
    );
    return unwrapResponse<VaccinationCampaign>(data);
}

export async function createVaccinationCampaign(
    input: CreateVaccinationCampaignRequest,
): Promise<VaccinationCampaign> {
    const { data } = await api.post<ApiEnvelope<VaccinationCampaign>>(
        '/vaccinations/campaigns',
        input,
    );
    return unwrapResponse<VaccinationCampaign>(data);
}

export async function updateVaccinationCampaign(
    id: string,
    input: UpdateVaccinationCampaignRequest,
): Promise<VaccinationCampaign> {
    const { data } = await api.patch<ApiEnvelope<VaccinationCampaign>>(
        `/vaccinations/campaigns/${id}`,
        input,
    );
    return unwrapResponse<VaccinationCampaign>(data);
}

export async function openVaccinationCampaign(id: string): Promise<VaccinationCampaign> {
    return updateVaccinationCampaign(id, { status: 'OPEN' });
}

export async function closeVaccinationCampaign(id: string): Promise<VaccinationCampaign> {
    return updateVaccinationCampaign(id, { status: 'CLOSED' });
}

export async function completeVaccinationCampaign(id: string): Promise<VaccinationCampaign> {
    return updateVaccinationCampaign(id, { status: 'COMPLETED' });
}

export async function cancelVaccinationCampaign(id: string): Promise<VaccinationCampaign> {
    return updateVaccinationCampaign(id, { status: 'CANCELLED' });
}

export async function deleteVaccinationCampaign(id: string): Promise<void> {
    await api.delete(`/vaccinations/campaigns/${id}`);
}

export async function listCampaignRegistrations(
    campaignId: string,
    page = 1,
    pageSize = 50,
): Promise<{ data: VaccinationRegistration[]; total: number }> {
    const { data } = await api.get<ApiEnvelope<VaccinationRegistration[]>>(
        `/vaccinations/campaigns/${campaignId}/registrations`,
        { params: { page, pageSize } },
    );
    const paginated = unwrapPaginatedResponse<VaccinationRegistration>(data);
    return {
        data: paginated.data,
        total: Number((paginated.meta as { total?: number })?.total ?? 0),
    };
}

export async function registerPetToCampaign(
    campaignId: string,
    input: RegisterPetToCampaignRequest,
): Promise<VaccinationRegistration> {
    const { data } = await api.post<ApiEnvelope<VaccinationRegistration>>(
        `/vaccinations/campaigns/${campaignId}/registrations`,
        input,
    );
    return unwrapResponse<VaccinationRegistration>(data);
}

export async function markAttended(
    registrationId: string,
    input: MarkRegistrationAttendedRequest = {},
): Promise<VaccinationRegistration> {
    const { data } = await api.patch<ApiEnvelope<VaccinationRegistration>>(
        `/vaccinations/campaigns/registrations/${registrationId}/attend`,
        input,
    );
    return unwrapResponse<VaccinationRegistration>(data);
}

export async function markNoShow(
    registrationId: string,
): Promise<VaccinationRegistration> {
    const { data } = await api.patch<ApiEnvelope<VaccinationRegistration>>(
        `/vaccinations/campaigns/registrations/${registrationId}/no-show`,
    );
    return unwrapResponse<VaccinationRegistration>(data);
}

export async function cancelRegistration(
    registrationId: string,
): Promise<void> {
    await api.delete(`/vaccinations/campaigns/registrations/${registrationId}`);
}
