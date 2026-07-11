import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateVaccinationCampaignRequest,
    MarkRegistrationAttendedRequest,
    RegisterPetToCampaignRequest,
    UpdateVaccinationCampaignRequest,
} from '@nuvet/types';
import {
    cancelRegistration,
    cancelVaccinationCampaign,
    closeVaccinationCampaign,
    completeVaccinationCampaign,
    createVaccinationCampaign,
    deleteVaccinationCampaign,
    getVaccinationCampaign,
    listCampaignRegistrations,
    listVaccinationCampaigns,
    markAttended,
    markNoShow,
    openVaccinationCampaign,
    registerPetToCampaign,
    updateVaccinationCampaign,
} from '../services/vaccination-campaigns-service';

export function useVaccinationCampaigns(params: Parameters<typeof listVaccinationCampaigns>[0] = {}) {
    return useQuery({
        queryKey: ['vaccination-campaigns', params] as const,
        queryFn: () => listVaccinationCampaigns(params),
    });
}

export function useVaccinationCampaign(id: string | undefined) {
    return useQuery({
        queryKey: ['vaccination-campaign', id] as const,
        queryFn: () => getVaccinationCampaign(id!),
        enabled: !!id,
    });
}

export function useCampaignRegistrations(
    campaignId: string | undefined,
    page = 1,
    pageSize = 50,
) {
    return useQuery({
        queryKey: ['vaccination-campaign-registrations', campaignId, page, pageSize] as const,
        queryFn: () => listCampaignRegistrations(campaignId!, page, pageSize),
        enabled: !!campaignId,
    });
}

function invalidateCampaignQueries(qc: ReturnType<typeof useQueryClient>, campaignId?: string) {
    qc.invalidateQueries({ queryKey: ['vaccination-campaigns'] });
    if (campaignId) {
        qc.invalidateQueries({ queryKey: ['vaccination-campaign', campaignId] });
        qc.invalidateQueries({ queryKey: ['vaccination-campaign-registrations', campaignId] });
    }
}

export function useCreateVaccinationCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateVaccinationCampaignRequest) =>
            createVaccinationCampaign(input),
        onSuccess: (campaign) => invalidateCampaignQueries(qc, campaign.id),
    });
}

export function useUpdateVaccinationCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateVaccinationCampaignRequest }) =>
            updateVaccinationCampaign(id, input),
        onSuccess: (campaign) => invalidateCampaignQueries(qc, campaign.id),
    });
}

export function useOpenCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => openVaccinationCampaign(id),
        onSuccess: (campaign) => invalidateCampaignQueries(qc, campaign.id),
    });
}

export function useCloseCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => closeVaccinationCampaign(id),
        onSuccess: (campaign) => invalidateCampaignQueries(qc, campaign.id),
    });
}

export function useCompleteCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => completeVaccinationCampaign(id),
        onSuccess: (campaign) => invalidateCampaignQueries(qc, campaign.id),
    });
}

export function useCancelCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => cancelVaccinationCampaign(id),
        onSuccess: (campaign) => invalidateCampaignQueries(qc, campaign.id),
    });
}

export function useDeleteCampaign() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteVaccinationCampaign(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['vaccination-campaigns'] }),
    });
}

export function useRegisterPet() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            campaignId,
            input,
        }: {
            campaignId: string;
            input: RegisterPetToCampaignRequest;
        }) => registerPetToCampaign(campaignId, input),
        onSuccess: (_reg, vars) => {
            invalidateCampaignQueries(qc, vars.campaignId);
        },
    });
}

export function useMarkAttended() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            registrationId,
            input,
        }: {
            registrationId: string;
            input?: MarkRegistrationAttendedRequest;
        }) => markAttended(registrationId, input ?? {}),
        onSuccess: (reg) => {
            invalidateCampaignQueries(qc, reg.campaignId);
        },
    });
}

export function useMarkNoShow() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (registrationId: string) => markNoShow(registrationId),
        onSuccess: (reg) => {
            invalidateCampaignQueries(qc, (reg as { campaignId: string }).campaignId);
        },
    });
}

export function useCancelRegistration() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (registrationId: string) => cancelRegistration(registrationId),
        onSuccess: (_void, registrationId) => {
            // cancelRegistration devuelve void, así que invalidamos
            // todas las campañas conocidas (no tenemos campaignId en
            // el response; las inscripciones suelen estar asociadas a
            // una sola campaña por sesión de UI).
            qc.invalidateQueries({ queryKey: ['vaccination-campaigns'] });
            qc.invalidateQueries({ queryKey: ['vaccination-campaign-registrations'] });
        },
    });
}
