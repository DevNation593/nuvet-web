'use client';

import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useAppointments } from '@/features/appointments/hooks/use-appointments';
import { useAdoptions } from '@/features/adoptions/hooks/use-adoptions';
import { useClients } from '@/features/clients/hooks/use-clients';
import { usePets } from '@/features/pets/hooks/use-pets';
import { useLowStockProducts } from '@/features/store/hooks/use-store';
import { useUpcomingVaccinations } from '@/features/vaccinations/hooks/use-vaccinations';
import {
    AdoptionStatus,
    AppPermission,
    PermissionAction,
    PermissionModule,
    hasAnyPermission,
} from '@nuvet/types';
import { Loader2 } from 'lucide-react';
import { getAppointmentTypeLabel, getStatusLabel } from '@/shared/lib/status-labels';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveUserPermissions } from '@/shared/lib/permissions';

export default function ClinicDashboardPage() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const user = useAuthStore((state) => state.user);
    const permissions = resolveUserPermissions(user);
    const canReadVaccinations = hasAnyPermission(permissions, [
        `${PermissionModule.VACCINATIONS}:${PermissionAction.READ}` as AppPermission,
    ]);
    const canReadInventory = hasAnyPermission(permissions, [
        `${PermissionModule.INVENTORY}:${PermissionAction.READ}` as AppPermission,
    ]);
    const canReadAdoptions = hasAnyPermission(permissions, [
        `${PermissionModule.ADOPTIONS}:${PermissionAction.READ}` as AppPermission,
    ]);

    const appointmentsQuery = useAppointments({ from: today, to: today, limit: 50 });
    const petsQuery = usePets({ limit: 1 });
    const clientsQuery = useClients({ limit: 1 });
    const upcomingVaccinationsQuery = useUpcomingVaccinations(30, { enabled: canReadVaccinations });
    const lowStockQuery = useLowStockProducts({ enabled: canReadInventory });
    const pendingAdoptionsQuery = useAdoptions(
        { limit: 20, status: AdoptionStatus.PENDING },
        { enabled: canReadAdoptions },
    );

    const appointmentsToday = appointmentsQuery.data?.data ?? [];
    const totalPets = petsQuery.data?.meta?.total ?? 0;
    const totalClients = clientsQuery.data?.meta?.total ?? 0;
    const upcomingVaccinations = canReadVaccinations ? (upcomingVaccinationsQuery.data ?? []) : [];
    const lowStock = canReadInventory ? (lowStockQuery.data ?? []) : [];
    const pendingAdoptions = canReadAdoptions ? (pendingAdoptionsQuery.data?.data ?? []) : [];

    const isLoading =
        appointmentsQuery.isLoading ||
        petsQuery.isLoading ||
        clientsQuery.isLoading ||
        (canReadVaccinations && upcomingVaccinationsQuery.isLoading) ||
        (canReadInventory && lowStockQuery.isLoading) ||
        (canReadAdoptions && pendingAdoptionsQuery.isLoading);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Panel de la clínica</h2>
                <p className="text-muted-foreground">Resumen y acceso rápido</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard title="Citas hoy" value={`${appointmentsToday.length}`} subtitle="Agenda del día" />
                        <StatCard title="Pacientes activos" value={`${totalPets}`} subtitle="Mascotas registradas" />
                        <StatCard title="Clientes" value={`${totalClients}`} subtitle="Dueños registrados" />
                        <StatCard title="Adopciones pendientes" value={`${pendingAdoptions.length}`} subtitle="Solicitudes por revisar" />
                    </div>

                    <div className="grid gap-4 xl:grid-cols-3">
                        <Card className="xl:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">Citas de hoy</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {appointmentsToday.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No hay citas para hoy.</p>
                                ) : (
                                    appointmentsToday.slice(0, 8).map((appointment) => (
                                        <div key={appointment.id} className="flex items-center justify-between rounded-md border bg-muted/20 p-2 text-sm">
                                            <div>
                                                <p className="font-medium">
                                                    {format(new Date(appointment.scheduledAt), 'HH:mm')} · {(appointment as { pet?: { name?: string } }).pet?.name ?? 'Mascota'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{getAppointmentTypeLabel(appointment.type)}</p>
                                            </div>
                                            <p className="text-xs font-medium">{getStatusLabel(appointment.status)}</p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Alertas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium">Vacunas próximas</p>
                                    <p className="text-muted-foreground">{upcomingVaccinations.length} en 30 días</p>
                                </div>
                                <div>
                                    <p className="font-medium">Bajo stock</p>
                                    <p className="text-muted-foreground">{lowStock.length} productos</p>
                                </div>
                                <div>
                                    <p className="font-medium">Adopciones pendientes</p>
                                    <p className="text-muted-foreground">{pendingAdoptions.length} solicitudes</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
            </CardContent>
        </Card>
    );
}
