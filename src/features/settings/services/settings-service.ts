import api from '@/shared/lib/api-client';
import type {
    ApiEnvelope,
    CreateNotificationTemplateRequest,
    PermissionModule,
    UpdateTenantRequest,
} from '@nuvet/types';
import type { NotificationTemplate, TenantSettings } from '../hooks/use-settings';

export async function fetchTenantSettings() {
    const { data } = await api.get<ApiEnvelope<TenantSettings>>('/tenants/me');
    return (data?.data ?? data) as TenantSettings;
}

export async function updateTenantSettings(input: UpdateTenantRequest) {
    const { data } = await api.patch<ApiEnvelope<TenantSettings>>('/tenants/me', input);
    return (data?.data ?? data) as TenantSettings;
}

export async function fetchActiveModules() {
    const { data } = await api.get<ApiEnvelope<PermissionModule[]>>('/tenants/me/modules');
    return (data?.data ?? data ?? []) as PermissionModule[];
}

export async function updateActiveModules(activeModules: PermissionModule[]) {
    const { data } = await api.patch<ApiEnvelope<PermissionModule[]>>('/tenants/me/modules', { activeModules });
    return (data?.data ?? data ?? activeModules) as PermissionModule[];
}

export async function fetchNotificationTemplates() {
    const { data } = await api.get<ApiEnvelope<NotificationTemplate[]>>('/notifications/templates');
    return (data?.data ?? data ?? []) as NotificationTemplate[];
}

export async function createNotificationTemplate(input: CreateNotificationTemplateRequest) {
    const { data } = await api.post<ApiEnvelope<NotificationTemplate>>('/notifications/templates', input);
    return (data?.data ?? data) as NotificationTemplate;
}

export async function updateNotificationTemplate(
    id: string,
    input: Partial<CreateNotificationTemplateRequest>,
) {
    const { data } = await api.patch<ApiEnvelope<NotificationTemplate>>(
        `/notifications/templates/${id}`,
        input,
    );
    return (data?.data ?? data) as NotificationTemplate;
}
