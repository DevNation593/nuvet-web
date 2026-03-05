'use client';

import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { getAppointmentTypeLabel, getStatusLabel } from '@/shared/lib/status-labels';
import { useAppointments } from '@/features/appointments/hooks/use-appointments';

type DashboardAppointment = {
    id: string;
    scheduledAt: string | Date;
    type: string;
    status: string;
    pet?: { name?: string; owner?: { lastName?: string } };
    vet?: { lastName?: string };
};

const STATUS_COLORS: Record<string, string> = {
    CONFIRMED: 'bg-green-100 text-green-800',
    SCHEDULED: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-emerald-100 text-emerald-800',
};

export function AppointmentsDashboardTable() {
    const { data, isLoading, error } = useAppointments({ page: 1, limit: 10 });
    const rows = (data?.data ?? []) as DashboardAppointment[];

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">Error al cargar las citas</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Citas
                </h1>
                <Button>Nueva cita</Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Fecha</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Mascota</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Tipo</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Estado</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Veterinario</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No se encontraron citas.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((appointment) => (
                                    <tr
                                        key={appointment.id}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle">
                                            {format(new Date(appointment.scheduledAt), 'PPP p')}
                                        </td>
                                        <td className="p-4 align-middle font-medium">
                                            {appointment.pet?.name}{' '}
                                            <span className="text-gray-400 font-normal">
                                                ({appointment.pet?.owner?.lastName})
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {getAppointmentTypeLabel(appointment.type)}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    STATUS_COLORS[appointment.status] ?? 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {getStatusLabel(appointment.status)}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {appointment.vet?.lastName ? `Dr. ${appointment.vet.lastName}` : '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Página {data?.meta.page ?? 1} de {data?.meta.totalPages ?? 1}
                </div>
            </div>
        </div>
    );
}
