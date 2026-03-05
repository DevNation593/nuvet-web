'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { AppSidebar } from '@/shared/components/layout/app-sidebar';
import { AppTopbar } from '@/shared/components/layout/app-topbar';
import { canAccessClinicPath, resolveActiveModules } from '@/shared/lib/permissions';
import { FirstLoginPasswordModal } from '@/features/auth/components/first-login-password-modal';

const STAFF_ROLES = ['CLINIC_ADMIN', 'VET', 'RECEPTIONIST', 'GROOMER', 'INVENTORY', 'ADOPTION_MANAGER'];

/** Rutas accesibles a clientes (rol CLIENT) dentro del layout compartido */
const CLIENT_ACCESSIBLE_PATHS = [
    '/clinic',
    '/clinic/appointments',
    '/clinic/pets',
    '/clinic/store',
    '/clinic/adoptions',
    '/clinic/medical-records',
];

function isClientAccessiblePath(pathname: string): boolean {
    return CLIENT_ACCESSIBLE_PATHS.some(
        (p) => pathname === p || pathname.startsWith(p + '/')
    );
}

export default function ClinicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, accessToken } = useAuthStore();
    const activeModules = useMemo(() => resolveActiveModules(user), [user]);
    const isStaff = !!user && STAFF_ROLES.includes(user.role);
    const isClient = user?.role === 'CLIENT';

    useEffect(() => {
        if (!accessToken || !user) {
            router.replace(`/auth/login?from=${encodeURIComponent(pathname)}`);
            return;
        }
        if (isClient) {
            if (!isClientAccessiblePath(pathname)) router.replace('/clinic');
            return;
        }
        if (!isStaff) {
            router.replace('/auth/login');
            return;
        }
        if (!canAccessClinicPath(pathname, activeModules)) {
            router.replace('/clinic');
        }
    }, [accessToken, user, router, pathname, activeModules, isStaff, isClient]);

    if (!accessToken || !user || (!isStaff && !isClient)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    if (isClient && !isClientAccessiblePath(pathname)) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const segment = pathname.replace('/clinic', '') || 'inicio';
    const title = segment.charAt(1) ? segment.slice(1).charAt(0).toUpperCase() + segment.slice(2) : 'Inicio';

    return (
        <div className="flex h-screen overflow-hidden bg-muted/30">
            <FirstLoginPasswordModal />
            <AppSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AppTopbar title={title} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
