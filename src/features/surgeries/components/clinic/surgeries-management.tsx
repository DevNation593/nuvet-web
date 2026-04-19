'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { SurgeryStatus } from '@nuvet/types';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { usePets } from '@/features/pets/hooks/use-pets';
import { useStaffUsers } from '@/features/users/hooks/use-users';
import { useCreateSurgery, useSurgeries, useUpdateSurgery } from '@/features/surgeries/hooks/use-surgeries';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { localDateTimeToUTC } from '@/shared/lib/timezone';

const surgerySchema = z.object({
    petId: z.string().min(1),
    vetId: z.string().min(1),
    type: z.string().min(2),
    scheduledDate: z.string().min(1),
    durationMinutes: z.coerce.number().int().positive().optional(),
    anesthesiaType: z.string().optional(),
    notes: z.string().optional(),
});

export function SurgeriesManagement() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<SurgeryStatus | ''>('');

    const surgeriesQuery = useSurgeries({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) });
    const petsQuery = usePets({ limit: 100 });
    const staffQuery = useStaffUsers();
    const createSurgery = useCreateSurgery();
    const updateSurgery = useUpdateSurgery(selectedId);

    const surgeries = surgeriesQuery.data?.data ?? [];
    const pets = (petsQuery.data?.data ?? []) as Array<{ id: string; name: string }>;
    const vets = (staffQuery.data?.data ?? []).filter((u) => u.role === 'VET' || u.role === 'CLINIC_ADMIN');

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cirugías</h2>
                    <p className="text-sm text-muted-foreground">Programación y seguimiento quirúrgico</p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva cirugía
                </Button>
            </header>

            <Card>
                <CardHeader className="pb-3">
                    <div className="max-w-xs">
                        <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as SurgeryStatus | '')}
                        >
                            <option value="">Todos los estados</option>
                            {Object.values(SurgeryStatus).map((status) => (
                                <option key={status} value={status}>
                                    {getStatusLabel(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {surgeriesQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={5} />
                    ) : surgeriesQuery.isError ? (
                        <ClinicStateCard message="No se pudieron cargar las cirugías." tone="error" />
                    ) : surgeries.length === 0 ? (
                        <ClinicStateCard message="No hay cirugías registradas." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Tipo</th>
                                        <th className="px-4 py-3 text-left font-medium">Mascota</th>
                                        <th className="px-4 py-3 text-left font-medium">Veterinario</th>
                                        <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {surgeries.map((surgery) => (
                                        <tr key={surgery.id} className="border-b">
                                            <td className="px-4 py-3 font-medium">{surgery.type}</td>
                                            <td className="px-4 py-3">{surgery.pet?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                {surgery.vet?.firstName} {surgery.vet?.lastName}
                                            </td>
                                            <td className="px-4 py-3">{format(new Date(surgery.scheduledAt), 'dd/MM/yyyy HH:mm')}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={surgery.status === SurgeryStatus.COMPLETED ? 'confirmed' : 'scheduled'}>
                                                    {getStatusLabel(surgery.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={async () => {
                                                        try {
                                                            setSelectedId(surgery.id);
                                                            await updateSurgery.mutateAsync({ status: SurgeryStatus.COMPLETED });
                                                            toast.success('Estado actualizado');
                                                        } catch {
                                                            toast.error('No se pudo actualizar');
                                                        } finally {
                                                            setSelectedId(null);
                                                        }
                                                    }}
                                                    disabled={surgery.status === SurgeryStatus.COMPLETED}
                                                >
                                                    Completar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <SurgeryModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                pets={pets}
                vets={vets}
                loading={createSurgery.isPending}
                onSubmit={async (values) => {
                    try {
                        await createSurgery.mutateAsync({
                            petId: values.petId,
                            vetId: values.vetId,
                            type: values.type,
                            scheduledAt: localDateTimeToUTC(values.scheduledDate, '09:00'),
                            durationMinutes: values.durationMinutes,
                            anesthesiaType: values.anesthesiaType,
                            notes: values.notes,
                        });
                        toast.success('Cirugía creada');
                        setModalOpen(false);
                    } catch {
                        toast.error('No se pudo crear la cirugía');
                    }
                }}
            />
        </div>
    );
}

function SurgeryModal({
    open,
    onOpenChange,
    pets,
    vets,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pets: Array<{ id: string; name: string }>;
    vets: Array<{ id: string; firstName: string; lastName: string }>;
    loading: boolean;
    onSubmit: (values: z.infer<typeof surgerySchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof surgerySchema>>({
        resolver: zodResolver(surgerySchema),
        values: {
            petId: '',
            vetId: '',
            type: '',
            scheduledDate: format(new Date(), 'yyyy-MM-dd'),
            durationMinutes: 90,
            anesthesiaType: '',
            notes: '',
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva cirugía</DialogTitle>
                    <DialogDescription>Programa un procedimiento quirúrgico</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <Field label="Mascota">
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('petId')}>
                            <option value="">Seleccionar</option>
                            {pets.map((pet) => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Veterinario">
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('vetId')}>
                            <option value="">Seleccionar</option>
                            {vets.map((vet) => (
                                <option key={vet.id} value={vet.id}>
                                    {vet.firstName} {vet.lastName}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Tipo de cirugía">
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('type')} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Fecha">
                            <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('scheduledDate')} />
                        </Field>
                        <Field label="Duración (min)">
                            <input type="number" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('durationMinutes')} />
                        </Field>
                    </div>
                    <Field label="Anestesia">
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('anesthesiaType')} />
                    </Field>
                    <Field label="Notas">
                        <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('notes')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
        </label>
    );
}
