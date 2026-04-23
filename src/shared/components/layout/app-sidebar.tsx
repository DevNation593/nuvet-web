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
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { PermissionModule, UserRole } from '@nuvet/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveActiveModules } from '@/shared/lib/permissions';
import { useEffect, useState } from 'react';

const BILLING_MODULE = PermissionModule.POS;
const DISCOUNTS_MODULE = 'discounts' as PermissionModule;

const staffNav: { href: string; label: string; icon: React.ElementType; module?: PermissionModule; adminOnly?: boolean }[] = [
    { href: '/clinic', label: 'Inicio', icon: LayoutDashboard },
    { href: '/clinic/appointments', label: 'Agenda',              icon: Calendar,      module: PermissionModule.APPOINTMENTS },
    { href: '/clinic/pets',         label: 'Mascotas',            icon: PawPrint,      module: PermissionModule.PETS },
    { href: '/clinic/clients',      label: 'Clientes',            icon: UserCircle2,   module: PermissionModule.CLIENTS },
    { href: '/clinic/medical-records', label: 'Consulta',         icon: Stethoscope,   module: PermissionModule.MEDICAL_RECORDS },
    { href: '/clinic/aesthetics',   label: 'Estética',            icon: Scissors,      module: PermissionModule.AESTHETICS },
    { href: '/clinic/surgeries',    label: 'Cirugías',            icon: Heart,         module: PermissionModule.SURGERIES },
    { href: '/clinic/store',        label: 'Inventario',          icon: ShoppingCart,  module: PermissionModule.STORE },
    { href: '/clinic/pos',          label: 'Punto de Venta',      icon: Store,         module: PermissionModule.POS },
    { href: '/clinic/billing',      label: 'Facturación',         icon: FileText,      module: BILLING_MODULE },
    { href: '/clinic/insights',     label: 'Reportes',            icon: LineChart,     module: PermissionModule.REPORTS },
    { href: '/clinic/promotions',   label: 'Promociones',         icon: Percent,       module: DISCOUNTS_MODULE },
    { href: '/clinic/adoptions',    label: 'Adopciones',          icon: HeartHandshake, module: PermissionModule.ADOPTIONS },
    { href: '/clinic/branches',     label: 'Sucursales',          icon: Building2,     module: PermissionModule.BRANCHES, adminOnly: true },
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

const STORAGE_KEY = 'nuvet-sidebar-collapsed';

export function AppSidebar() {
    const pathname = usePathname();
    const user = useAuthStore((state) => state.user);
    const isClient = user?.role === 'CLIENT';
    const activeModules = resolveActiveModules(user);

    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored !== null) {
                setCollapsed(stored === 'true');
            }
        } catch {
            // ignore
        }
    }, []);

    function toggleCollapsed() {
        setCollapsed((prev) => {
            const next = !prev;
            try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
            return next;
        });
    }

    const isAdmin = user?.role === UserRole.CLINIC_ADMIN;
    const navItems = isClient
        ? clientNav
        : staffNav.filter((item) => {
              if (item.adminOnly && !isAdmin) return false;
              return !item.module || activeModules.includes(item.module);
          });

    return (
        <aside
            className={cn(
                'hidden flex-shrink-0 border-r bg-primary md:flex flex-col transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
            )}
        >
            <div className="flex h-16 items-center border-b border-primary-foreground/10 px-3 justify-between">
                {!collapsed && (
                    <span className="text-lg font-semibold text-primary-foreground truncate">NuVet Tech</span>
                )}
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                    className={cn(
                        'rounded-lg p-1.5 text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors',
                        collapsed ? 'mx-auto' : 'ml-auto',
                    )}
                >
                    {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>
            </div>
            <nav className="flex flex-col gap-1 p-2 overflow-y-auto flex-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/clinic' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors',
                                collapsed ? 'justify-center' : '',
                                isActive
                                    ? 'bg-primary-foreground/15 text-primary-foreground'
                                    : 'text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground',
                            )}
                        >
                            <Icon className="h-5 w-5 flex-shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
