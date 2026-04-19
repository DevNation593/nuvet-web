'use client';

import { useMemo } from 'react';
import { PermissionModule } from '@nuvet/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveActiveModules } from '@/shared/lib/permissions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useHomeSummary } from '@/features/dashboard/hooks/use-dashboard';
import {
    Calendar,
    DollarSign,
    Package,
    Pill,
    ShieldAlert,
    ShoppingCart,
    TrendingUp,
    Users,
    PawPrint,
    Clock,
    Loader2,
} from 'lucide-react';

const DISCOUNTS_MODULE = 'discounts' as PermissionModule;

const PAYMENT_LABELS: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    OTHER: 'Otro',
};

const APPOINTMENT_TYPE_LABELS: Record<string, string> = {
    CONSULTATION: 'Consulta',
    VACCINATION: 'Vacunación',
    SURGERY: 'Cirugía',
    GROOMING: 'Estética',
    FOLLOW_UP: 'Seguimiento',
    EMERGENCY: 'Emergencia',
    OTHER: 'Otro',
};

function formatCurrency(value: number) {
    return `$${value.toFixed(2)}`;
}

function formatTime(dateStr: string) {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return 'Ahora';
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
}

export function ClinicHomeSummary() {
    const user = useAuthStore((state) => state.user);
    const activeModules = resolveActiveModules(user);
    const today = new Date().toISOString().slice(0, 10);

    const hasPos = activeModules.includes(PermissionModule.POS);
    const hasStore = activeModules.includes(PermissionModule.STORE);
    const hasAppointments = activeModules.includes(PermissionModule.APPOINTMENTS);
    const hasDiscounts = activeModules.includes(DISCOUNTS_MODULE);

    const homeSummaryQ = useHomeSummary({
        date: today,
        includeAppointments: hasAppointments,
        includePos: hasPos,
        includeStore: hasStore,
        includeDiscounts: hasDiscounts,
    });

    const d = homeSummaryQ.data;
    const loading = homeSummaryQ.isLoading;

    const appointmentsToday = hasAppointments ? d?.appointmentsToday ?? 0 : 0;
    const totalLowStock = hasStore ? d?.store.lowStockCount ?? 0 : 0;
    const activeDiscountsCount = hasDiscounts ? d?.discounts.activeCount ?? 0 : 0;

    const alerts = useMemo(() => {
        const items: Array<{ key: string; icon: React.ElementType; text: string; variant: 'amber' | 'sky' | 'violet' }> = [];
        if (hasStore && totalLowStock > 0) {
            items.push({ key: 'low-stock', icon: ShieldAlert, text: `${totalLowStock} producto${totalLowStock !== 1 ? 's' : ''} con stock bajo.`, variant: 'amber' });
        }
        if (hasAppointments && appointmentsToday === 0) {
            items.push({ key: 'no-appointments', icon: Calendar, text: 'No hay citas programadas para hoy.', variant: 'sky' });
        }
        if (hasDiscounts && activeDiscountsCount === 0) {
            items.push({ key: 'no-discounts', icon: Pill, text: 'No hay promociones activas.', variant: 'violet' });
        }
        return items;
    }, [hasStore, hasAppointments, hasDiscounts, totalLowStock, appointmentsToday, activeDiscountsCount]);

    const alertColorMap = {
        amber: 'border-amber-300/50 bg-amber-50 text-amber-900',
        sky: 'border-sky-300/50 bg-sky-50 text-sky-900',
        violet: 'border-violet-300/50 bg-violet-50 text-violet-900',
    };

    return (
        <div className="space-y-5">
            <header className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inicio</p>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Bienvenido, {user?.firstName ?? 'equipo'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Resumen operativo del día con información en tiempo real.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : null}
                        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-right">
                            <p className="text-xs text-muted-foreground">Plan actual</p>
                            <p className="text-sm font-semibold">{user?.tenantPlan ?? 'N/D'}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* KPI Cards */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {hasAppointments ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Citas hoy</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{appointmentsToday}</p>
                            <p className="text-xs text-muted-foreground">Programadas para {today}</p>
                        </CardContent>
                    </Card>
                ) : null}

                {hasPos ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas hoy</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatCurrency(d?.pos.totalRevenue ?? 0)}</p>
                            <p className="text-xs text-muted-foreground">{d?.pos.totalTransactions ?? 0} transacciones</p>
                        </CardContent>
                    </Card>
                ) : null}

                {hasPos ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Ventas del mes</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatCurrency(d?.posMonth?.totalRevenue ?? 0)}</p>
                            <p className="text-xs text-muted-foreground">{d?.posMonth?.totalTransactions ?? 0} transacciones</p>
                        </CardContent>
                    </Card>
                ) : null}

                {hasStore ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Stock bajo</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{totalLowStock}</p>
                            <p className="text-xs text-muted-foreground">Productos por reponer</p>
                        </CardContent>
                    </Card>
                ) : null}

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{d?.totalClients ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Registrados en el sistema</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pacientes</CardTitle>
                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{d?.totalPets ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Mascotas activas</p>
                    </CardContent>
                </Card>

                {hasDiscounts ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Promociones</CardTitle>
                            <Pill className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{activeDiscountsCount}</p>
                            <p className="text-xs text-muted-foreground">Descuentos vigentes</p>
                        </CardContent>
                    </Card>
                ) : null}
            </section>

            {/* Main content grid */}
            <div className="grid gap-4 lg:grid-cols-2">
                {/* Recent Transactions */}
                {hasPos ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-base">Últimas ventas</CardTitle>
                            </div>
                            <CardDescription>Transacciones completadas recientemente</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(d?.recentTransactions ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay ventas registradas aún.</p>
                            ) : (
                                <div className="space-y-3">
                                    {d!.recentTransactions.map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">{tx.clientName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {PAYMENT_LABELS[tx.paymentMethod] ?? tx.paymentMethod} · {formatRelativeDate(tx.createdAt)}
                                                </p>
                                            </div>
                                            <p className="ml-3 whitespace-nowrap text-sm font-semibold">{formatCurrency(tx.total)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null}

                {/* Upcoming Appointments */}
                {hasAppointments ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-base">Próximas citas</CardTitle>
                            </div>
                            <CardDescription>Agenda de hoy y próximos días</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(d?.upcomingAppointments ?? []).length === 0 ? (
                                <p className="text-sm text-muted-foreground">No hay citas programadas próximamente.</p>
                            ) : (
                                <div className="space-y-3">
                                    {d!.upcomingAppointments.map((apt) => (
                                        <div key={apt.id} className="flex items-center justify-between rounded-md border px-3 py-2.5">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {apt.petName}
                                                    {apt.petSpecies ? ` (${apt.petSpecies})` : ''}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {apt.clientName} · {APPOINTMENT_TYPE_LABELS[apt.type] ?? apt.type}
                                                </p>
                                            </div>
                                            <div className="ml-3 text-right">
                                                <p className="whitespace-nowrap text-sm font-medium">{formatTime(apt.scheduledAt)}</p>
                                                <Badge variant="outline" className="text-xs">
                                                    {apt.status === 'CONFIRMED' ? 'Confirmada' : 'Programada'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : null}

                {/* Top Products */}
                {hasPos && (d?.topProducts ?? []).length > 0 ? (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-base">Productos más vendidos</CardTitle>
                            </div>
                            <CardDescription>Del mes actual por cantidad</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {d!.topProducts.map((product, idx) => (
                                    <div key={product.productId} className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
                                            {idx + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {product.quantitySold} vendidos · {formatCurrency(product.revenue)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Alerts */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base">Alertas</CardTitle>
                        </div>
                        <CardDescription>Situaciones que deberían revisarse</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        {alerts.length === 0 ? (
                            <p className="text-muted-foreground">Sin alertas críticas por ahora.</p>
                        ) : (
                            alerts.map((alert) => {
                                const Icon = alert.icon;
                                return (
                                    <div
                                        key={alert.key}
                                        className={`flex items-start gap-2 rounded-md border px-3 py-2 ${alertColorMap[alert.variant]}`}
                                    >
                                        <Icon className="mt-0.5 h-4 w-4" />
                                        <span>{alert.text}</span>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
