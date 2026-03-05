'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { usePets } from '@/features/pets/hooks/use-pets';
import { useAppointments } from '@/features/appointments/hooks/use-appointments';
import { ClientRowsSkeleton, ClientStateCard } from '@/shared/components/client/ui-states';
import { getStatusLabel, getAppointmentTypeLabel } from '@/shared/lib/status-labels';
import { AppointmentStatus } from '@nuvet/types';

const STATUS_VARIANT: Record<string, 'default' | 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'> = {
    [AppointmentStatus.SCHEDULED]:   'scheduled',
    [AppointmentStatus.CONFIRMED]:   'confirmed',
    [AppointmentStatus.IN_PROGRESS]: 'in-progress',
    [AppointmentStatus.COMPLETED]:   'completed',
    [AppointmentStatus.CANCELLED]:   'cancelled',
    [AppointmentStatus.NO_SHOW]:     'no-show',
};

export function HistoryClientView() {
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

    const petsQuery = usePets({ limit: 100 });
    const pets = petsQuery.data?.data ?? [];
    const effectivePetId = selectedPetId ?? pets[0]?.id ?? null;

    const appointmentsQuery = useAppointments(
        effectivePetId ? { petId: effectivePetId, limit: 200 } : {}
    );
    const appointments = appointmentsQuery.data?.data ?? [];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Historial de citas</h2>
                <p className="text-muted-foreground">Revisa las citas pasadas de tus mascotas.</p>
            </div>

            {petsQuery.isLoading ? (
                <ClientRowsSkeleton rows={4} height="h-16" />
            ) : petsQuery.isError ? (
                <ClientStateCard message="No se pudo cargar tus mascotas." tone="error" />
            ) : pets.length === 0 ? (
                <ClientStateCard message="No tienes mascotas registradas." />
            ) : (
                <div className="space-y-4">
                    {/* Selector de mascota */}
                    <div className="flex flex-wrap items-center gap-2">
                        {pets.map((pet) => (
                            <button
                                key={pet.id}
                                type="button"
                                onClick={() => setSelectedPetId(pet.id)}
                                className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                                    effectivePetId === pet.id
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-input bg-background hover:bg-muted'
                                }`}
                            >
                                {pet.name}
                            </button>
                        ))}
                    </div>

                    {/* Historial de citas */}
                    <Card>
                        <CardHeader className="pb-2">
                            <h3 className="font-semibold text-base">
                                Citas de {pets.find((p) => p.id === effectivePetId)?.name ?? '—'}
                            </h3>
                        </CardHeader>
                        <CardContent>
                            {appointmentsQuery.isLoading ? (
                                <ClientRowsSkeleton rows={5} height="h-14" />
                            ) : appointmentsQuery.isError ? (
                                <ClientStateCard
                                    message="No se pudo cargar el historial de citas."
                                    tone="error"
                                />
                            ) : appointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No hay citas registradas para esta mascota.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {appointments.map((apt) => (
                                        <div
                                            key={apt.id}
                                            className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {getAppointmentTypeLabel(apt.type)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(
                                                        new Date(apt.scheduledAt),
                                                        "EEEE d 'de' MMMM yyyy, HH:mm",
                                                        { locale: es }
                                                    )}
                                                </p>
                                            </div>
                                            <Badge variant={STATUS_VARIANT[apt.status] ?? 'default'}>
                                                {getStatusLabel(apt.status)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
