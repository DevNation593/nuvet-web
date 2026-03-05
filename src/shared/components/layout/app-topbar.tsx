'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Button } from '@/shared/components/ui/button';
import { LogOut } from 'lucide-react';

export function AppTopbar({ title }: { title?: string }) {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    return (
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
            <h1 className="text-lg font-semibold text-foreground">{title ?? 'Clínica'}</h1>
            <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                    {user?.firstName} {user?.lastName}
                </span>
                <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
}
