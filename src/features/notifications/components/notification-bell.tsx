'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/components/ui/popover';
import {
    useNotifications,
    useUnreadCount,
    useMarkAsRead,
    useMarkAllAsRead,
    useDeleteNotification,
} from '../hooks/use-notifications';
import { cn } from '@/shared/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { data: notifications = [], isLoading } = useNotifications();
    const unreadCount = useUnreadCount();
    const markRead = useMarkAsRead();
    const markAllRead = useMarkAllAsRead();
    const deleteNotif = useDeleteNotification();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h3 className="text-sm font-semibold">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs text-muted-foreground"
                            onClick={() => markAllRead.mutate()}
                            disabled={markAllRead.isPending}
                        >
                            <CheckCheck className="mr-1 h-3 w-3" />
                            Marcar todas leídas
                        </Button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Cargando...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                            No tienes notificaciones
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={cn(
                                    'flex gap-3 border-b px-4 py-3 transition-colors last:border-b-0',
                                    !n.isRead && 'bg-primary/5',
                                )}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={cn('text-sm', !n.isRead && 'font-semibold')}>
                                        {n.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {n.body}
                                    </p>
                                    <p className="mt-1 text-[10px] text-muted-foreground/70">
                                        {formatDistanceToNow(new Date(n.createdAt), {
                                            addSuffix: true,
                                            locale: es,
                                        })}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    {!n.isRead && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => markRead.mutate(n.id)}
                                            aria-label="Marcar como leída"
                                        >
                                            <Check className="h-3 w-3" />
                                        </Button>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteNotif.mutate(n.id)}
                                        aria-label="Eliminar notificación"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
