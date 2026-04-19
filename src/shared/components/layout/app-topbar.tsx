'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { logout as logoutService } from '@/features/auth/services/auth-service';
import { Button } from '@/shared/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { MobileSidebar } from './mobile-sidebar';
import { NotificationBell } from '@/features/notifications/components/notification-bell';
import { BranchSelector } from './branch-selector';

export function AppTopbar({ title }: { title?: string }) {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const clearAuth = useAuthStore((s) => s.logout);
    const queryClient = useQueryClient();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = useCallback(async () => {
        try {
            await logoutService();
        } catch {
            // server-side logout errors are non-critical
        }
        queryClient.clear();
        clearAuth();
        router.push('/auth/login');
    }, [clearAuth, queryClient, router]);

    return (
        <>
            <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={() => setMobileOpen(true)}
                        aria-label="Abrir menú"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h1 className="text-lg font-semibold text-foreground">{title ?? 'Clínica'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <BranchSelector />
                    <NotificationBell />
                    <span className="hidden text-sm text-muted-foreground sm:inline">
                        {user?.firstName} {user?.lastName}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </header>
            <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />
        </>
    );
}
