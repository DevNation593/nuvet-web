'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { Loader2 } from 'lucide-react';

interface AuthHydrationGuardProps {
    children: React.ReactNode;
}

export function AuthHydrationGuard({ children }: AuthHydrationGuardProps) {
    const router = useRouter();
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Si el store ya estaba hidratado antes de montar este componente
        if (useAuthStore.persist.hasHydrated()) {
            const { accessToken } = useAuthStore.getState();
            if (!accessToken) {
                router.replace('/auth/login');
            } else {
                setHydrated(true);
            }
            return;
        }

        // Suscribirse al evento de fin de hidratación
        const unsub = useAuthStore.persist.onFinishHydration(() => {
            const { accessToken } = useAuthStore.getState();
            if (!accessToken) {
                router.replace('/auth/login');
            } else {
                setHydrated(true);
            }
        });

        return () => unsub();
    }, [router]);

    if (!hydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
