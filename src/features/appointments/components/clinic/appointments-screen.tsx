'use client';

import { useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    addDays,
    addWeeks,
    format,
    isSameDay,
    startOfDay,
    startOfWeek,
    subWeeks,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { AppointmentType } from '@nuvet/types';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import {
    useAppointment,
    useAppointments,
    useAvailability,
    useCreateAppointment,
    useUpdateAppointmentStatus,
} from '@/features/appointments/hooks/use-appointments';
import { usePets } from '@/features/pets/hooks/use-pets';
import { useStaffUsers } from '@/features/users/hooks/use-users';
import { ClinicScheduleSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { findConflictingAppointment } from '@/features/appointments/lib/appointments-conflicts';
import { getSlotsForDay } from '@/features/appointments/lib/agenda-utils';
import { getAppointmentTypeLabel, getStatusLabel } from '@/shared/lib/status-labels';
import { cn } from '@/shared/lib/utils';
import { localDateTimeToUTC } from '@/shared/lib/timezone';
import { CalendarClock, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useBranchesStore } from '@/features/branches/store/branches.store';

type AppointmentWithRelations = {
    id: string;
    type: string;
    status: string;
    scheduledAt: string;
    durationMinutes?: number;
    notes?: string;
    cancelReason?: string;
    pet?: { id: string; name: string };
    vet?: { id: string; firstName: string; lastName: string };
    groomer?: { id: string; firstName: string; lastName: string };
};

const statusVariant: Record<
    string,
    'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show'
> = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no-show',
};

const createAppointmentSchema = z.object({
    petId: z.string().min(1, 'Selecciona una mascota'),
    type: z.nativeEnum(AppointmentType),
    staffId: z.string().min(1, 'Selecciona un responsable'),
    date: z.string().min(1, 'Selecciona una fecha'),
    time: z.string().min(1, 'Selecciona una hora'),
    durationMinutes: z.coerce.number().min(15).max(240),
    notes: z.string().max(500).optional(),
});

type CreateAppointmentValues = z.infer<typeof createAppointmentSchema>;

function formatStaffName(staff?: { firstName?: string; lastName?: string } | null) {
    if (!staff) return 'Sin asignar';
    return `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.trim() || 'Sin asignar';
}

export function AppointmentsScreen() {
    const [view, setView] = useState<'day' | 'week'>('week');
    const [baseDate, setBaseDate] = useState(new Date());
    const [staffFilter, setStaffFilter] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [createOpen, setCreateOpen] = useState(false);

    const periodStart =
        view === 'day' ? startOfDay(baseDate) : startOfWeek(baseDate, { weekStartsOn: 1 });
    const periodEnd = view === 'day' ? addDays(periodStart, 1) : addDays(periodStart, 7);

    const from = format(periodStart, 'yyyy-MM-dd');
    const to = format(periodEnd, 'yyyy-MM-dd');
    const activeBranchId = useBranchesStore((s) => s.activeBranchId);

    const appointmentsQuery = useAppointments({
        from,
        to,
        staffId: staffFilter || undefined,
        branchId: activeBranchId ?? undefined,
        limit: 100,
    });
    const petsQuery = usePets({ limit: 100 });
    const staffQuery = useStaffUsers();
    const appointmentQuery = useAppointment(selectedId);
    const createAppointment = useCreateAppointment();
    const updateStatus = useUpdateAppointmentStatus(selectedId);

    const appointments = ((appointmentsQuery.data?.data ?? []) as unknown[]) as AppointmentWithRelations[];
    const pets = petsQuery.data?.data ?? [];
    const staff = staffQuery.data?.data ?? [];
    const selectedAppointment = (appointmentQuery.data as unknown as AppointmentWithRelations | undefined) ?? undefined;

    const daysInView =
        view === 'day'
            ? [new Date(periodStart)]
            : Array.from({ length: 7 }, (_, i) => addDays(new Date(periodStart), i));

    const slots = getSlotsForDay(new Date(periodStart));

    return (
        <div className="space-y-4">
            <header className="rounded-xl border bg-card p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={() => setBaseDate((d) => (view === 'day' ? addDays(d, -1) : subWeeks(d, 1)))}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="min-w-[190px] text-center text-sm font-semibold sm:text-base">
                            {view === 'day'
                                ? format(baseDate, "EEEE d 'de' MMMM yyyy", { locale: es })
                                : `${format(periodStart, 'd MMM', { locale: es })} - ${format(addDays(periodEnd, -1), 'd MMM yyyy', { locale: es })}`}
                        </div>
                        <Button variant="outline" size="icon" onClick={() => setBaseDate((d) => (view === 'day' ? addDays(d, 1) : addWeeks(d, 1)))}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={staffFilter}
                            onChange={(e) => setStaffFilter(e.target.value)}
                            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="">Todo el personal</option>
                            {staff.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                </option>
                            ))}
                        </select>
                        <Button variant={view === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setView('day')}>
                            Día
                        </Button>
                        <Button variant={view === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setView('week')}>
                            Semana
                        </Button>
                        <Button size="sm" onClick={() => setCreateOpen(true)}>
                            <Plus className="mr-1 h-4 w-4" />
                            Nueva Cita
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <Card className="overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 px-4 py-3">
                        <CardTitle className="text-base">Agenda de Citas</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {appointmentsQuery.isLoading ? (
                            <ClinicScheduleSkeleton rows={10} />
                        ) : appointmentsQuery.isError ? (
                            <ClinicStateCard
                                message="No se pudo cargar la agenda."
                                tone="error"
                                action={
                                    <Button variant="outline" onClick={() => appointmentsQuery.refetch()}>
                                        Reintentar
                                    </Button>
                                }
                            />
                        ) : appointments.length === 0 ? (
                            <EmptyAgenda />
                        ) : view === 'day' ? (
                            <DayView date={periodStart} slots={slots} appointments={appointments} selectedId={selectedId} onSelect={setSelectedId} />
                        ) : (
                            <WeekView days={daysInView} appointments={appointments} selectedId={selectedId} onSelect={setSelectedId} />
                        )}
                    </CardContent>
                </Card>

                <AppointmentDetailPanel
                    appointment={selectedAppointment}
                    loading={appointmentQuery.isLoading}
                    onClose={() => setSelectedId(null)}
                    onUpdateStatus={async (status) => {
                        try {
                            await updateStatus.mutateAsync({ status });
                            toast.success('Estado actualizado');
                        } catch {
                            toast.error('No se pudo actualizar el estado');
                        }
                    }}
                />
            </div>

            <CreateAppointmentModal
                open={createOpen}
                onOpenChange={setCreateOpen}
                pets={pets}
                staff={staff}
                baseDate={baseDate}
                appointments={appointments}
                onCreate={async (values) => {
                    const scheduledAt = localDateTimeToUTC(values.date, values.time);
                    const conflict = findConflictingAppointment(
                        scheduledAt,
                        values.durationMinutes,
                        appointments.filter(
                            (item) =>
                                item.vet?.id === values.staffId || item.groomer?.id === values.staffId,
                        ),
                    );

                    if (conflict) {
                        toast.error('Conflicto detectado: ya existe una cita en ese horario');
                        return;
                    }

                    try {
                        await createAppointment.mutateAsync({
                            petId: values.petId,
                            type: values.type,
                            scheduledAt,
                            durationMinutes: values.durationMinutes,
                            vetId: values.staffId,
                            notes: values.notes,
                            branchId: activeBranchId ?? undefined,
                        });
                        toast.success('Cita creada');
                        setCreateOpen(false);
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo crear la cita');
                    }
                }}
                creating={createAppointment.isPending}
            />
        </div>
    );
}

function DayView({
    date,
    slots,
    appointments,
    selectedId,
    onSelect,
}: {
    date: Date;
    slots: Array<{ start: Date; end: Date; key: string }>;
    appointments: AppointmentWithRelations[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    const dayAppointments = appointments.filter((item) => isSameDay(new Date(item.scheduledAt), date));

    return (
        <div className="max-h-[640px] overflow-auto">
            {slots.map((slot) => {
                const inSlot = dayAppointments.filter((item) => {
                    const start = new Date(item.scheduledAt);
                    const end = new Date(start.getTime() + (item.durationMinutes ?? 30) * 60_000);
                    return start < slot.end && end > slot.start;
                });

                return (
                    <div key={slot.key} className="grid grid-cols-[72px_1fr] border-b last:border-b-0">
                        <div className="p-3 text-xs text-muted-foreground">{format(slot.start, 'HH:mm')}</div>
                        <div className="p-2">
                            {inSlot.length === 0 ? (
                                <div className="h-8 rounded-md border border-dashed border-border/70 bg-muted/20" />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {inSlot.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => onSelect(item.id)}
                                            className={cn(
                                                'rounded-md border px-2 py-1 text-left text-xs transition',
                                                selectedId === item.id ? 'border-primary bg-primary/10' : 'bg-background hover:bg-muted',
                                            )}
                                        >
                                            <div className="mb-1 flex items-center gap-1">
                                                <Badge variant={statusVariant[item.status] ?? 'scheduled'}>{getStatusLabel(item.status)}</Badge>
                                            </div>
                                            <p className="font-semibold">{item.pet?.name ?? 'Mascota'}</p>
                                            <p className="text-muted-foreground">{getAppointmentTypeLabel(item.type)}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function WeekView({
    days,
    appointments,
    selectedId,
    onSelect,
}: {
    days: Date[];
    appointments: AppointmentWithRelations[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="grid min-h-[500px] grid-cols-1 gap-3 p-3 md:grid-cols-2 xl:grid-cols-7">
            {days.map((day) => {
                const dayAppointments = appointments
                    .filter((item) => isSameDay(new Date(item.scheduledAt), day))
                    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

                return (
                    <div key={day.toISOString()} className="rounded-lg border bg-background">
                        <div className="border-b px-3 py-2 text-center">
                            <p className="text-xs uppercase text-muted-foreground">{format(day, 'EEE', { locale: es })}</p>
                            <p className="text-sm font-semibold">{format(day, 'd MMM', { locale: es })}</p>
                        </div>
                        <div className="space-y-2 p-2">
                            {dayAppointments.length === 0 && (
                                <div className="rounded-md border border-dashed p-2 text-center text-xs text-muted-foreground">
                                    Sin citas
                                </div>
                            )}
                            {dayAppointments.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => onSelect(item.id)}
                                    className={cn(
                                        'w-full rounded-md border px-2 py-2 text-left text-xs transition',
                                        selectedId === item.id ? 'border-primary bg-primary/10' : 'bg-card hover:bg-muted/50',
                                    )}
                                >
                                    <p className="font-semibold">
                                        {format(new Date(item.scheduledAt), 'HH:mm')} · {item.pet?.name ?? 'Mascota'}
                                    </p>
                                    <p className="mt-1 text-muted-foreground">{getAppointmentTypeLabel(item.type)}</p>
                                    <div className="mt-1">
                                        <Badge variant={statusVariant[item.status] ?? 'scheduled'}>{getStatusLabel(item.status)}</Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AppointmentDetailPanel({
    appointment,
    loading,
    onClose,
    onUpdateStatus,
}: {
    appointment: AppointmentWithRelations | undefined;
    loading: boolean;
    onClose: () => void;
    onUpdateStatus: (status: 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW') => Promise<void>;
}) {
    return (
        <Card className="h-fit">
            <CardHeader className="flex-row items-center justify-between space-y-0 border-b bg-muted/20 px-4 py-3">
                <CardTitle className="text-base">Detalle de cita</CardTitle>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    Cerrar
                </Button>
            </CardHeader>
            <CardContent className="space-y-3 p-4 text-sm">
                {loading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}
                {!loading && !appointment && (
                    <p className="text-muted-foreground">Selecciona una cita para ver su información.</p>
                )}
                {!loading && appointment && (
                    <>
                        <InfoRow label="Mascota" value={appointment.pet?.name ?? 'No disponible'} />
                        <InfoRow label="Tipo" value={getAppointmentTypeLabel(appointment.type)} />
                        <InfoRow
                            label="Horario"
                            value={format(new Date(appointment.scheduledAt), "d MMM yyyy, HH:mm", { locale: es })}
                        />
                        <InfoRow label="Duración" value={`${appointment.durationMinutes ?? 30} min`} />
                        <InfoRow
                            label="Responsable"
                            value={formatStaffName(appointment.vet ?? appointment.groomer)}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Estado</span>
                            <Badge variant={statusVariant[appointment.status] ?? 'scheduled'}>{getStatusLabel(appointment.status)}</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <Button size="sm" variant="outline" onClick={() => onUpdateStatus('CONFIRMED')}>
                                Confirmar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onUpdateStatus('IN_PROGRESS')}>
                                En curso
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onUpdateStatus('COMPLETED')}>
                                Completar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => onUpdateStatus('CANCELLED')}>
                                Cancelar
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{label}</span>
            <span className="text-right font-medium">{value}</span>
        </div>
    );
}

function CreateAppointmentModal({
    open,
    onOpenChange,
    baseDate,
    pets,
    staff,
    appointments,
    onCreate,
    creating,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    baseDate: Date;
    pets: Array<{ id: string; name: string }>;
    staff: Array<{ id: string; firstName: string; lastName: string }>;
    appointments: AppointmentWithRelations[];
    onCreate: (values: CreateAppointmentValues) => Promise<void>;
    creating: boolean;
}) {
    const form = useForm<CreateAppointmentValues>({
        resolver: zodResolver(createAppointmentSchema),
        defaultValues: {
            petId: '',
            type: AppointmentType.CONSULTATION,
            staffId: '',
            date: format(baseDate, 'yyyy-MM-dd'),
            time: '',
            durationMinutes: 30,
            notes: '',
        },
    });

    const [selectedStaffId, selectedDate, selectedTime, selectedDurationMinutes] = useWatch({
        control: form.control,
        name: ['staffId', 'date', 'time', 'durationMinutes'],
    });
    const branchId = useBranchesStore((s) => s.activeBranchId);
    const availabilityQuery = useAvailability(
        selectedStaffId && selectedDate
            ? { staffId: selectedStaffId, date: selectedDate, branchId: branchId ?? undefined }
            : null,
    );

    const availableTimes = useMemo(
        () =>
            (availabilityQuery.data ?? [])
                .filter((slot) => slot.available)
                .map((slot) => format(new Date(slot.time), 'HH:mm')),
        [availabilityQuery.data],
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear cita</DialogTitle>
                    <DialogDescription>
                        Agenda una nueva cita y revisa disponibilidad en tiempo real.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(async (values) => {
                        await onCreate(values);
                    })}
                >
                    <FormField label="Mascota" error={form.formState.errors.petId?.message}>
                        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('petId')}>
                            <option value="">Seleccionar mascota</option>
                            {pets.map((pet) => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.name}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FormField label="Tipo" error={form.formState.errors.type?.message}>
                            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('type')}>
                                <option value={AppointmentType.CONSULTATION}>Consulta</option>
                                <option value={AppointmentType.VACCINATION}>Vacunación</option>
                                <option value={AppointmentType.AESTHETICS}>Estética</option>
                                <option value={AppointmentType.SURGERY}>Cirugía</option>
                                <option value={AppointmentType.CHECKUP}>Chequeo</option>
                            </select>
                        </FormField>

                        <FormField label="Duración" error={form.formState.errors.durationMinutes?.message}>
                            <input type="number" min={15} step={15} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('durationMinutes')} />
                        </FormField>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <FormField label="Responsable" error={form.formState.errors.staffId?.message}>
                            <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('staffId')}>
                                <option value="">Seleccionar responsable</option>
                                {staff.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName}
                                    </option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Fecha" error={form.formState.errors.date?.message}>
                            <input type="date" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('date')} />
                        </FormField>
                    </div>

                    <FormField label="Hora" error={form.formState.errors.time?.message}>
                        <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('time')}>
                            <option value="">Seleccionar horario</option>
                            {availableTimes.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    {availabilityQuery.isLoading && (
                        <p className="text-xs text-muted-foreground">Cargando disponibilidad...</p>
                    )}
                    {!availabilityQuery.isLoading && selectedStaffId && selectedDate && availableTimes.length === 0 && (
                        <p className="text-xs text-destructive">No hay horarios disponibles para la fecha seleccionada.</p>
                    )}

                    <FormField label="Notas" error={form.formState.errors.notes?.message}>
                        <textarea rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('notes')} />
                    </FormField>

                    <ConflictHint
                        appointments={appointments}
                        staffId={selectedStaffId}
                        date={selectedDate}
                        time={selectedTime}
                        durationMinutes={selectedDurationMinutes}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={creating}>
                            {creating ? 'Creando...' : 'Crear cita'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function FormField({
    label,
    children,
    error,
}: {
    label: string;
    children: React.ReactNode;
    error?: string;
}) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}

function ConflictHint({
    appointments,
    staffId,
    date,
    time,
    durationMinutes,
}: {
    appointments: AppointmentWithRelations[];
    staffId: string;
    date: string;
    time: string;
    durationMinutes: number;
}) {
    if (!staffId || !date || !time) return null;
    const scheduledAt = localDateTimeToUTC(date, time);
    const conflict = findConflictingAppointment(
        scheduledAt,
        durationMinutes,
        appointments.filter((item) => item.vet?.id === staffId || item.groomer?.id === staffId),
    );
    if (!conflict) return null;

    return (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs text-destructive">
            Conflicto detectado con la cita de las {format(new Date(conflict.scheduledAt), 'HH:mm')}.
        </p>
    );
}

function EmptyAgenda() {
    return (
        <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="rounded-full bg-muted p-3">
                <CalendarClock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No hay citas en este rango.</p>
            <p className="max-w-sm text-xs text-muted-foreground">
                Ajusta las fechas o crea una nueva cita para comenzar la agenda.
            </p>
        </div>
    );
}
