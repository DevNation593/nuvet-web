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
import {
    useCreateSurgery,
    useDeleteSurgery,
    useSurgeries,
    useUpdateSurgery,
    type Surgery,
} from '@/features/surgeries/hooks/use-surgeries';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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

type SurgeryFormValues = z.infer<typeof surgerySchema>;

export function SurgeriesManagement() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<SurgeryStatus | ''>('');
    const [deleteTarget, setDeleteTarget] = useState<Surgery | null>(null);

    const surgeriesQuery = useSurgeries({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) });
    const petsQuery = usePets({ limit: 100 });
    const staffQuery = useStaffUsers();
    const createSurgery = useCreateSurgery();
    const updateSurgery = useUpdateSurgery(selectedId ?? editingSurgery?.id ?? null);
    const deleteSurgery = useDeleteSurgery();

    const surgeries = surgeriesQuery.data?.data ?? [];
    const pets = (petsQuery.data?.data ?? []) as Array<{ id: string; name: string }>;
    const vets = (staffQuery.data?.data ?? []).filter((u) => u.role === 'VET' || u.role === 'CLINIC_ADMIN');

    function openCreate() {
        setEditingSurgery(null);
        setModalOpen(true);
    }

    function openEdit(surgery: Surgery) {
        setEditingSurgery(surgery);
        setModalOpen(true);
    }

    async function handleSubmit(values: SurgeryFormValues) {
        try {
            const payload = {
                petId: values.petId,
                vetId: values.vetId,
                type: values.type,
                scheduledAt: localDateTimeToUTC(values.scheduledDate, '09:00'),
                durationMinutes: values.durationMinutes,
                anesthesiaType: values.anesthesiaType,
                notes: values.notes,
            };

            if (editingSurgery) {
                await updateSurgery.mutateAsync(payload);
                toast.success('Cirugía actualizada');
            } else {
                await createSurgery.mutateAsync(payload);
                toast.success('Cirugía creada');
            }
            setModalOpen(false);
            setEditingSurgery(null);
        } catch {
            toast.error(editingSurgery ? 'No se pudo actualizar' : 'No se pudo crear la cirugía');
        }
    }

    async function handleDelete() {
        if (!deleteTarget) return;
        try {
            await deleteSurgery.mutateAsync(deleteTarget.id);
            toast.success('Cirugía eliminada');
            setDeleteTarget(null);
        } catch {
            toast.error('No se pudo eliminar la cirugía');
        }
    }

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Cirugías</h2>
                    <p className="text-sm text-muted-foreground">Programación y seguimiento quirúrgico</p>
                </div>
                <Button onClick={openCreate} title="Registrar nueva cirugía">
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
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Marcar cirugía como completada"
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
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Editar cirugía"
                                                        onClick={() => openEdit(surgery)}
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Eliminar cirugía"
                                                        onClick={() => setDeleteTarget(surgery)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                                    </Button>
                                                </div>
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
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditingSurgery(null);
                }}
                pets={pets}
                vets={vets}
                initialValues={editingSurgery}
                loading={createSurgery.isPending || updateSurgery.isPending}
                onSubmit={handleSubmit}
            />

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar cirugía</DialogTitle>
                        <DialogDescription>
                            ¿Eliminar la cirugía <strong>{deleteTarget?.type}</strong>? Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} title="Cancelar eliminación">
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteSurgery.isPending}
                            title="Confirmar eliminación"
                        >
                            {deleteSurgery.isPending ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SurgeryModal({
    open,
    onOpenChange,
    pets,
    vets,
    loading,
    initialValues,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pets: Array<{ id: string; name: string }>;
    vets: Array<{ id: string; firstName: string; lastName: string }>;
    loading: boolean;
    initialValues?: Surgery | null;
    onSubmit: (values: SurgeryFormValues) => Promise<void>;
}) {
    const form = useForm<SurgeryFormValues>({
        resolver: zodResolver(surgerySchema),
        values: {
            petId: initialValues?.petId ?? '',
            vetId: initialValues?.vetId ?? '',
            type: initialValues?.type ?? '',
            scheduledDate: initialValues?.scheduledAt
                ? format(new Date(initialValues.scheduledAt), 'yyyy-MM-dd')
                : format(new Date(), 'yyyy-MM-dd'),
            durationMinutes: initialValues?.durationMinutes ?? 90,
            anesthesiaType: initialValues?.anesthesiaType ?? '',
            notes: initialValues?.notes ?? '',
        },
    });

    const isEdit = Boolean(initialValues?.id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Editar cirugía' : 'Nueva cirugía'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Modifica los datos del procedimiento.' : 'Programa un procedimiento quirúrgico'}
                    </DialogDescription>
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} title="Cancelar sin guardar">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} title="Guardar cirugía">
                            {loading ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Guardar'}
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
