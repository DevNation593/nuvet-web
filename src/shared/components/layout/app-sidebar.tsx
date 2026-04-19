'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import {
    LayoutDashboard,
    Calendar,
    UserCircle2,
    PawPrint,
    Stethoscope,
    Scissors,
    Heart,
    ShoppingCart,
    HeartHandshake,
    Settings,
    Percent,
    Store,
    History,
    ShoppingBag,
    FileText,
    LineChart,
    Building2,
} from 'lucide-react';
import { PermissionModule, UserRole } from '@nuvet/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveActiveModules } from '@/shared/lib/permissions';

const BILLING_MODULE = PermissionModule.POS;
const DISCOUNTS_MODULE = 'discounts' as PermissionModule;

const staffNav: { href: string; label: string; icon: React.ElementType; module?: PermissionModule; adminOnly?: boolean }[] = [
    { href: '/clinic', label: 'Inicio', icon: LayoutDashboard },
    { href: '/clinic/appointments', label: 'Agenda',              icon: Calendar,      module: PermissionModule.APPOINTMENTS },
    { href: '/clinic/pets',         label: 'Mascotas',            icon: PawPrint,      module: PermissionModule.PETS },
    { href: '/clinic/clients',      label: 'Clientes',            icon: UserCircle2,   module: PermissionModule.CLIENTS },
    { href: '/clinic/medical-records', label: 'Consulta',         icon: Stethoscope,   module: PermissionModule.MEDICAL_RECORDS },
    { href: '/clinic/aesthetics',   label: 'Estetica',            icon: Scissors,      module: PermissionModule.AESTHETICS },
    { href: '/clinic/surgeries',    label: 'Cirugias',            icon: Heart,         module: PermissionModule.SURGERIES },
    { href: '/clinic/store',        label: 'Tienda / Inventario', icon: ShoppingCart,  module: PermissionModule.STORE },
    { href: '/clinic/pos',          label: 'Punto de Venta',      icon: Store,         module: PermissionModule.POS },
    { href: '/clinic/billing',      label: 'Facturacion',         icon: FileText,      module: BILLING_MODULE },
    { href: '/clinic/insights',     label: 'Insights',            icon: LineChart,     module: PermissionModule.REPORTS },
    { href: '/clinic/promotions',   label: 'Promociones',         icon: Percent,       module: DISCOUNTS_MODULE },
    { href: '/clinic/adoptions',    label: 'Adopciones',          icon: HeartHandshake, module: PermissionModule.ADOPTIONS },
    { href: '/clinic/branches',     label: 'Sucursales',           icon: Building2,     module: PermissionModule.BRANCHES, adminOnly: true },
    { href: '/clinic/settings',     label: 'Ajustes',             icon: Settings,      module: PermissionModule.TENANT_SETTINGS },
];

const clientNav: { href: string; label: string; icon: React.ElementType }[] = [
    { href: '/clinic',              label: 'Inicio',        icon: LayoutDashboard },
    { href: '/clinic/pets',         label: 'Mis Mascotas',  icon: PawPrint },
    { href: '/clinic/appointments', label: 'Mis Citas',     icon: Calendar },
    { href: '/clinic/medical-records', label: 'Historial',  icon: History },
    { href: '/clinic/store',        label: 'Tienda',        icon: ShoppingBag },
    { href: '/clinic/adoptions',    label: 'Adopción',      icon: HeartHandshake },
];

export function AppSidebar() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const isClient = user?.role === 'CLIENT';
    const activeModules = resolveActiveModules(user);

    const isAdmin = user?.role === UserRole.CLINIC_ADMIN;
    const navItems = isClient
        ? clientNav
        : staffNav.filter((item) => {
              if (item.adminOnly && !isAdmin) return false;
              return !item.module || activeModules.includes(item.module);
          });

    return (
        <aside className="hidden w-64 flex-shrink-0 border-r bg-card md:block">
            <div className="flex h-16 items-center justify-center border-b px-4">
                <span className="text-lg font-semibold text-primary">NuVet</span>
            </div>
            <nav className="flex flex-col gap-1 p-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/clinic' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

