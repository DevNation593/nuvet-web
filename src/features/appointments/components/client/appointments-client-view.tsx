'use client';

import { useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AppointmentType } from '@nuvet/types';
import {
    useAppointment,
    useAppointments,
    useAppointmentStaff,
    useAvailability,
    useCancelAppointment,
    useCreateAppointment,
} from '@/features/appointments/hooks/use-appointments';
import { usePets } from '@/features/pets/hooks/use-pets';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ClientRowsSkeleton, ClientStateCard } from '@/shared/components/client/ui-states';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { CalendarPlus, Loader2 } from 'lucide-react';
import { getAppointmentTypeLabel, getStatusLabel } from '@/shared/lib/status-labels';

const STATUS_VARIANT: Record<string, 'scheduled' | 'confirmed' | 'completed' | 'cancelled'> = {
    SCHEDULED: 'scheduled',
    CONFIRMED: 'confirmed',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

const bookingSchema = z.object({
    petId: z.string().min(1, 'Selecciona una mascota'),
    type: z.nativeEnum(AppointmentType),
    date: z.string().min(1, 'Selecciona una fecha'),
    staffId: z.string().min(1, 'Selecciona un profesional'),
    slot: z.string().min(1, 'Selecciona un horario'),
    notes: z.string().optional(),
});

export function AppointmentsClientView() {
    const [open, setOpen] = useState(false);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [{ from, to }] = useState(() => {
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + 90);
        return { from: format(now, 'yyyy-MM-dd'), to: format(end, 'yyyy-MM-dd') };
    });
    const { data, isLoading, isError } = useAppointments({ dateFrom: from, dateTo: to, limit: 50 });
    const petsQuery = usePets({ limit: 50 });
    const staffQuery = useAppointmentStaff();
    const createAppointment = useCreateAppointment();
    const cancelAppointment = useCancelAppointment();
    const detailQuery = useAppointment(selectedId);

    const form = useForm<z.infer<typeof bookingSchema>>({
        resolver: zodResolver(bookingSchema),
        values: { petId: '', type: AppointmentType.CONSULTATION, date: format(new Date(), 'yyyy-MM-dd'), staffId: '', slot: '', notes: '' },
    });

    const [selectedDate, selectedStaffId] = useWatch({ control: form.control, name: ['date', 'staffId'] });
    const availabilityQuery = useAvailability(
        selectedDate && selectedStaffId ? { date: selectedDate, staffId: selectedStaffId } : null
    );
    const availableSlots = useMemo(
        () => (availabilityQuery.data ?? []).filter((slot) => slot.available),
        [availabilityQuery.data]
    );

    const list = data?.data ?? [];
    const pets = petsQuery.data?.data ?? [];
    const staff = staffQuery.data ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Mis Citas</h2>
                <Button onClick={() => setOpen(true)}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Reservar cita
                </Button>
            </div>

            {isLoading ? (
                <ClientRowsSkeleton rows={4} height="h-16" />
            ) : isError ? (
                <ClientStateCard message="No se pudo cargar tus citas." tone="error" />
            ) : list.length === 0 ? (
                <ClientStateCard message="No tienes citas programadas." />
            ) : (
                <div className="space-y-3">
                    {list.map((apt) => (
                        <Card key={apt.id}>
                            <CardContent className="pt-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="font-medium">{(apt as { pet?: { name?: string } }).pet?.name ?? '—'}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(apt.scheduledAt), 'EEEE d MMMM, HH:mm', { locale: es })} · {getAppointmentTypeLabel(apt.type)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={STATUS_VARIANT[apt.status] ?? 'default'}>{getStatusLabel(apt.status)}</Badge>
                                        <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedId(apt.id); setDetailOpen(true); }}>
                                            Ver detalle
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Booking dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nueva cita</DialogTitle>
                        <DialogDescription>Selecciona mascota, profesional y horario disponible.</DialogDescription>
                    </DialogHeader>
                    <form
                        className="space-y-3"
                        onSubmit={form.handleSubmit(async (values) => {
                            try {
                                await createAppointment.mutateAsync({
                                    petId: values.petId,
                                    type: values.type,
                                    scheduledAt: values.slot,
                                    durationMinutes: 30,
                                    vetId: values.staffId,
                                    notes: values.notes || undefined,
                                });
                                toast.success('Cita reservada');
                                setOpen(false);
                                form.reset({ petId: '', type: AppointmentType.CONSULTATION, date: format(new Date(), 'yyyy-MM-dd'), staffId: '', slot: '', notes: '' });
                            } catch (error: unknown) {
                                const msg = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
                                toast.error(msg ?? 'No se pudo reservar la cita');
                            }
                        })}
                    >
                        <Field label="Mascota" error={form.formState.errors.petId?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('petId')}>
                                <option value="">Selecciona mascota</option>
                                {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                            </select>
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Tipo de cita" error={form.formState.errors.type?.message}>
                                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('type')}>
                                    {Object.values(AppointmentType).map((type) => (
                                        <option key={type} value={type}>{getAppointmentTypeLabel(type)}</option>
                                    ))}
                                </select>
                            </Field>
                            <Field label="Fecha" error={form.formState.errors.date?.message}>
                                <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('date')} />
                            </Field>
                        </div>
                        <Field label="Profesional" error={form.formState.errors.staffId?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('staffId')}>
                                <option value="">Selecciona profesional</option>
                                {staff.map((item) => (
                                    <option key={item.id} value={item.id}>{item.firstName} {item.lastName} ({item.role})</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Horario disponible" error={form.formState.errors.slot?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('slot')}>
                                <option value="">Selecciona horario</option>
                                {availableSlots.map((slot) => (
                                    <option key={slot.time} value={slot.time}>{format(new Date(slot.time), 'HH:mm')}</option>
                                ))}
                            </select>
                            {availabilityQuery.isLoading && <p className="text-xs text-muted-foreground">Cargando disponibilidad...</p>}
                            {!availabilityQuery.isLoading && selectedStaffId && availableSlots.length === 0 && (
                                <p className="text-xs text-muted-foreground">No hay horarios disponibles para esta fecha.</p>
                            )}
                        </Field>
                        <Field label="Notas">
                            <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('notes')} />
                        </Field>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createAppointment.isPending || petsQuery.isLoading || staffQuery.isLoading}>
                                {createAppointment.isPending ? 'Guardando...' : 'Confirmar cita'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalle de cita</DialogTitle>
                        <DialogDescription>Revisa la información y cancela si es necesario.</DialogDescription>
                    </DialogHeader>
                    {detailQuery.isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : detailQuery.isError || !detailQuery.data ? (
                        <p className="py-6 text-center text-sm text-destructive">No se pudo cargar el detalle.</p>
                    ) : (
                        <div className="space-y-3">
                            <DetailRow label="Mascota" value={(detailQuery.data as { pet?: { name?: string } }).pet?.name ?? '—'} />
                            <DetailRow label="Fecha" value={format(new Date(detailQuery.data.scheduledAt), 'EEEE d MMMM yyyy, HH:mm', { locale: es })} />
                            <DetailRow label="Tipo" value={getAppointmentTypeLabel(detailQuery.data.type)} />
                            <DetailRow label="Estado" value={getStatusLabel(detailQuery.data.status)} />
                            <DetailRow
                                label="Profesional"
                                value={
                                    (detailQuery.data as { vet?: { firstName?: string; lastName?: string } }).vet
                                        ? `${(detailQuery.data as { vet?: { firstName?: string } }).vet?.firstName ?? ''} ${(detailQuery.data as { vet?: { lastName?: string } }).vet?.lastName ?? ''}`.trim()
                                        : 'No asignado'
                                }
                            />
                            <DetailRow label="Notas" value={(detailQuery.data as { notes?: string }).notes || '—'} />
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>Cerrar</Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!selectedId || cancelAppointment.isPending || !detailQuery.data || !['SCHEDULED', 'CONFIRMED'].includes(detailQuery.data.status)}
                            onClick={async () => {
                                if (!selectedId) return;
                                try {
                                    await cancelAppointment.mutateAsync({ id: selectedId, reason: 'Cancelada por cliente' });
                                    toast.success('Cita cancelada');
                                    setDetailOpen(false);
                                } catch (error: unknown) {
                                    const msg = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
                                    toast.error(msg ?? 'No se pudo cancelar la cita');
                                }
                            }}
                        >
                            {cancelAppointment.isPending ? 'Cancelando...' : 'Cancelar cita'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </label>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border px-3 py-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}
