import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateNotificationTemplateRequest,
    NotificationChannel,
    TenantPlan,
    UpdateTenantRequest,
} from '@nuvet/types';
import {
    fetchTenantSettings,
    updateTenantSettings,
    fetchBillingConfig,
    updateBillingConfig,
    fetchNotificationTemplates,
    createNotificationTemplate,
    updateNotificationTemplate,
} from '../services/settings-service';

export interface TenantSettings {
    id: string;
    name: string;
    plan: TenantPlan;
    logoUrl?: string;
    phone?: string;
    address?: string;
    email?: string;
    billingApiKey?: string;
    billingEstablishmentCode?: string;
    billingEmissionPointCode?: string;
    hasBillingApiSecret?: boolean;
    _count?: { users: number; pets: number };
}

export interface BillingConfig {
    billingApiKey?: string | null;
    billingEstablishmentCode?: string | null;
    billingEmissionPointCode?: string | null;
    hasBillingApiSecret?: boolean;
}

export interface NotificationTemplate {
    id: string;
    tenantId?: string;
    key: string;
    channel: NotificationChannel;
    subject?: string;
    bodyTemplate: string;
    isSystem: boolean;
}

const CONFIG_STALE_TIME = 5 * 60 * 1000;

export function useTenantSettings() {
    return useQuery({
        queryKey: ['tenant-settings'],
        queryFn: () => fetchTenantSettings(),
        staleTime: CONFIG_STALE_TIME,
    });
}

export function useUpdateTenantSettings() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateTenantRequest) => updateTenantSettings(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
        },
    });
}

export function useBillingConfig() {
    return useQuery({
        queryKey: ['billing-config'],
        queryFn: () => fetchBillingConfig(),
        staleTime: CONFIG_STALE_TIME,
    });
}

export function useUpdateBillingConfig() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: Partial<BillingConfig & { billingApiSecret: string }>) => updateBillingConfig(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['billing-config'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
        },
    });
}

export function useNotificationTemplates() {
    return useQuery({
        queryKey: ['notification-templates'],
        queryFn: () => fetchNotificationTemplates(),
        staleTime: CONFIG_STALE_TIME,
    });
}

export function useCreateNotificationTemplate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateNotificationTemplateRequest) => createNotificationTemplate(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
        },
    });
}

export function useUpdateNotificationTemplate(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: Partial<CreateNotificationTemplateRequest>) => updateNotificationTemplate(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
        },
    });
}
