'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePetClinicalHistory } from '@/features/pets/hooks/use-pets';
import type { ClinicalHistoryResult } from '@/features/pets/hooks/use-pets';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    ArrowLeft,
    Stethoscope,
    Syringe,
    Heart,
    Calendar,
    User,
    Loader2,
    FileText,
} from 'lucide-react';

function fmt(dateStr?: string | null) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return format(d, "dd MMM yyyy", { locale: es });
}

function fmtFull(dateStr?: string | null) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '—';
    return format(d, "dd MMM yyyy 'a las' HH:mm", { locale: es });
}

function vetName(vet?: { firstName: string; lastName: string }) {
    if (!vet) return '—';
    return `Dr. ${vet.firstName} ${vet.lastName}`;
}

const STATUS_LABELS: Record<string, string> = {
    ADMINISTERED: 'Administrada',
    SCHEDULED: 'Programada',
    OVERDUE: 'Vencida',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    IN_PROGRESS: 'En progreso',
};

const STATUS_VARIANTS: Record<string, 'default' | 'confirmed' | 'cancelled' | 'outline'> = {
    ADMINISTERED: 'confirmed',
    COMPLETED: 'confirmed',
    SCHEDULED: 'outline',
    IN_PROGRESS: 'default',
    OVERDUE: 'cancelled',
    CANCELLED: 'cancelled',
};

export default function PetClinicalHistoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const { data, isLoading, isError } = usePetClinicalHistory(id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span className="text-muted-foreground">Cargando historial clínico...</span>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="space-y-4 p-4">
                <Button
                    variant="ghost"
                    title="Volver a la lista de mascotas"
                    onClick={() => router.push('/clinic/pets')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
                <Card>
                    <CardContent className="p-8 text-center text-sm text-muted-foreground">
                        No se pudo cargar el historial clínico.
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { pet, medicalRecords, vaccinations, surgeries } = data as ClinicalHistoryResult;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    title="Volver a la lista de mascotas"
                    onClick={() => router.push('/clinic/pets')}
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Historial Clínico — {pet.name}</h1>
                    <p className="text-sm text-muted-foreground">
                        {pet.species} · {pet.breed ?? 'Sin raza'} ·
                        Dueño: {pet.owner?.firstName} {pet.owner?.lastName}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <StatCard
                    icon={<Stethoscope className="h-5 w-5 text-blue-500" />}
                    label="Consultas"
                    value={medicalRecords.length}
                />
                <StatCard
                    icon={<Syringe className="h-5 w-5 text-green-500" />}
                    label="Vacunas"
                    value={vaccinations.length}
                />
                <StatCard
                    icon={<Heart className="h-5 w-5 text-red-500" />}
                    label="Cirugías"
                    value={surgeries.length}
                />
            </div>

            {/* Registros médicos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Stethoscope className="h-5 w-5 text-blue-500" />
                        Registros Médicos ({medicalRecords.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {medicalRecords.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay registros médicos.</p>
                    ) : (
                        <div className="space-y-4">
                            {medicalRecords.map((record) => (
                                <div key={record.id} className="rounded-lg border p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold">{record.diagnosis}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Motivo: {record.chiefComplaint}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {fmt(record.createdAt)}
                                        </span>
                                    </div>
                                    <div className="grid gap-1 text-sm sm:grid-cols-2">
                                        <p><span className="font-medium">Tratamiento:</span> {record.treatment}</p>
                                        {record.prescriptions && (
                                            <p><span className="font-medium">Prescripciones:</span> {record.prescriptions}</p>
                                        )}
                                        {record.notes && (
                                            <p><span className="font-medium">Notas:</span> {record.notes}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" /> {vetName(record.vet)}
                                        </span>
                                        {record.weight != null && <span>Peso: {record.weight} kg</span>}
                                        {record.temperature != null && <span>Temp: {record.temperature} °C</span>}
                                        {record.heartRate != null && <span>FC: {record.heartRate} bpm</span>}
                                        {record.appointment && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="h-3.5 w-3.5" />
                                                Cita: {fmt(record.appointment.scheduledAt)} ({record.appointment.type})
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vacunaciones */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Syringe className="h-5 w-5 text-green-500" />
                        Vacunaciones ({vaccinations.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {vaccinations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay vacunas registradas.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium">Vacuna</th>
                                        <th className="px-3 py-2 text-left font-medium">Dosis</th>
                                        <th className="px-3 py-2 text-left font-medium">Fecha</th>
                                        <th className="px-3 py-2 text-left font-medium">Próxima</th>
                                        <th className="px-3 py-2 text-left font-medium">Estado</th>
                                        <th className="px-3 py-2 text-left font-medium">Veterinario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vaccinations.map((v) => (
                                        <tr key={v.id} className="border-b last:border-b-0">
                                            <td className="px-3 py-2 font-medium">
                                                {v.vaccineName}
                                                {v.manufacturer && (
                                                    <span className="ml-1 text-xs text-muted-foreground">({v.manufacturer})</span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2">{v.dose}</td>
                                            <td className="px-3 py-2">{fmt(v.administeredAt)}</td>
                                            <td className="px-3 py-2">{fmt(v.nextDueAt)}</td>
                                            <td className="px-3 py-2">
                                                <Badge variant={STATUS_VARIANTS[v.status] ?? 'outline'}>
                                                    {STATUS_LABELS[v.status] ?? v.status}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2 text-muted-foreground">{vetName(v.vet)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cirugías */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Heart className="h-5 w-5 text-red-500" />
                        Cirugías ({surgeries.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {surgeries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay cirugías registradas.</p>
                    ) : (
                        <div className="space-y-4">
                            {surgeries.map((s) => (
                                <div key={s.id} className="rounded-lg border p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold">{s.type}</p>
                                            <Badge variant={STATUS_VARIANTS[s.status] ?? 'outline'}>
                                                {STATUS_LABELS[s.status] ?? s.status}
                                            </Badge>
                                        </div>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {fmtFull(s.scheduledAt)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <User className="h-3.5 w-3.5" /> {vetName(s.vet)}
                                        </span>
                                        {s.anesthesiaType && <span>Anestesia: {s.anesthesiaType}</span>}
                                        {s.durationMinutes != null && <span>Duración: {s.durationMinutes} min</span>}
                                    </div>
                                    {s.postOpNotes && (
                                        <p className="text-sm"><span className="font-medium">Post-operatorio:</span> {s.postOpNotes}</p>
                                    )}
                                    {s.notes && (
                                        <p className="text-sm"><span className="font-medium">Notas:</span> {s.notes}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold">{value}</p>
                </div>
                {icon}
            </CardContent>
        </Card>
    );
}
