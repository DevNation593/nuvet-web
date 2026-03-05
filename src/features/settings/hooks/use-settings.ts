import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type {
    CreateNotificationTemplateRequest,
    NotificationChannel,
    PermissionModule,
    TenantPlan,
    UpdateTenantRequest,
} from '@nuvet/types';
import {
    fetchTenantSettings,
    updateTenantSettings,
    fetchActiveModules,
    updateActiveModules,
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
    website?: string;
    activeModules?: PermissionModule[];
    _count?: { users: number; pets: number };
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

export function useTenantSettings() {
    return useQuery({
        queryKey: ['tenant-settings'],
        queryFn: () => fetchTenantSettings(),
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

export function useActiveModules() {
    return useQuery({
        queryKey: ['tenant-modules'],
        queryFn: () => fetchActiveModules(),
    });
}

export function useUpdateActiveModules() {
    const queryClient = useQueryClient();
    const updateUser = useAuthStore((state) => state.updateUser);
    return useMutation({
        mutationFn: (activeModules: PermissionModule[]) => updateActiveModules(activeModules),
        onSuccess: (activeModules) => {
            queryClient.invalidateQueries({ queryKey: ['tenant-modules'] });
            queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
            // Propagar al store para que el sidebar se actualice de inmediato
            updateUser({ activeModules });
        },
    });
}

export function useNotificationTemplates() {
    return useQuery({
        queryKey: ['notification-templates'],
        queryFn: () => fetchNotificationTemplates(),
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
