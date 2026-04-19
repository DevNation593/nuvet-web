import api from '@/shared/lib/api-client';
import { unwrapArrayResponse } from '@/shared/lib/api-helpers';
import type { ApiEnvelope } from '@nuvet/types';

export interface Notification {
    id: string;
    title: string;
    body: string;
    channel: string;
    isRead: boolean;
    createdAt: string;
}

export async function getNotifications(unreadOnly = false) {
    const { data } = await api.get<ApiEnvelope<Notification[]>>('/notifications', {
        params: unreadOnly ? { unreadOnly: true } : undefined,
    });
    return unwrapArrayResponse<Notification>(data);
}

export async function markAsRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
}

export async function markAllAsRead() {
    await api.patch('/notifications/read-all');
}

export async function deleteNotification(id: string) {
    await api.delete(`/notifications/${id}`);
}
