import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapArrayResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    CreateNotificationTemplateRequest,
    UpdateTenantRequest,
} from '@nuvet/types';
import type { BillingConfig, NotificationTemplate, TenantSettings } from '../hooks/use-settings';

export async function fetchTenantSettings() {
    const { data } = await api.get<ApiEnvelope<TenantSettings>>('/tenants/me');
    return unwrapResponse<TenantSettings>(data);
}

export async function updateTenantSettings(input: UpdateTenantRequest) {
    const { data } = await api.patch<ApiEnvelope<TenantSettings>>('/tenants/me', input);
    return unwrapResponse<TenantSettings>(data);
}

export async function fetchBillingConfig() {
    const { data } = await api.get<ApiEnvelope<BillingConfig>>('/tenants/me/billing-config');
    return unwrapResponse<BillingConfig>(data);
}

export async function updateBillingConfig(input: Partial<BillingConfig & { billingApiSecret: string }>) {
    const { data } = await api.patch<ApiEnvelope<BillingConfig>>('/tenants/me/billing-config', input);
    return unwrapResponse<BillingConfig>(data);
}

export async function fetchNotificationTemplates() {
    const { data } = await api.get<ApiEnvelope<NotificationTemplate[]>>('/notifications/templates');
    return unwrapArrayResponse<NotificationTemplate>(data);
}

export async function createNotificationTemplate(input: CreateNotificationTemplateRequest) {
    const { data } = await api.post<ApiEnvelope<NotificationTemplate>>('/notifications/templates', input);
    return unwrapResponse<NotificationTemplate>(data);
}

export async function updateNotificationTemplate(
    id: string,
    input: Partial<CreateNotificationTemplateRequest>,
) {
    const { data } = await api.patch<ApiEnvelope<NotificationTemplate>>(
        `/notifications/templates/${id}`,
        input,
    );
    return unwrapResponse<NotificationTemplate>(data);
}
