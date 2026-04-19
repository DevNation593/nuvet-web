import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from '../services/notifications-service';

const NOTIFICATIONS_KEY = ['notifications'] as const;

export function useNotifications() {
    return useQuery({
        queryKey: NOTIFICATIONS_KEY,
        queryFn: () => getNotifications(),
        staleTime: 30_000,
        refetchInterval: 60_000,
    });
}

export function useUnreadCount() {
    const { data } = useNotifications();
    return data?.filter((n) => !n.isRead).length ?? 0;
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
    });
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: markAllAsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
    });
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }),
    });
}
