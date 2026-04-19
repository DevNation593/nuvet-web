'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { AestheticStatus } from '@nuvet/types';
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
import { useAesthetics, useCreateAesthetic, useUpdateAesthetic } from '@/features/aesthetics/hooks/use-aesthetics';
import { usePets } from '@/features/pets/hooks/use-pets';
import { useStaffUsers } from '@/features/users/hooks/use-users';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { localDateTimeToUTC } from '@/shared/lib/timezone';

const aestheticSchema = z.object({
    petId: z.string().min(1),
    groomerId: z.string().min(1),
    serviceName: z.string().min(2),
    scheduledDate: z.string().min(1),
    price: z.coerce.number().nonnegative().optional(),
    notes: z.string().optional(),
});

export function AestheticsManagement() {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<AestheticStatus | ''>('');

    const aestheticsQuery = useAesthetics({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) });
    const petsQuery = usePets({ limit: 100 });
    const staffQuery = useStaffUsers();
    const createAesthetic = useCreateAesthetic();
    const updateAesthetic = useUpdateAesthetic(selectedId);

    const items = aestheticsQuery.data?.data ?? [];
    const pets = (petsQuery.data?.data ?? []) as Array<{ id: string; name: string }>;
    const groomers = (staffQuery.data?.data ?? []).filter((u) => u.role === 'GROOMER' || u.role === 'CLINIC_ADMIN');

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Estética</h2>
                    <p className="text-sm text-muted-foreground">Servicios de grooming y estética</p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo servicio
                </Button>
            </header>

            <Card>
                <CardHeader className="pb-3">
                    <div className="max-w-xs">
                        <select
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as AestheticStatus | '')}
                        >
                            <option value="">Todos los estados</option>
                            {Object.values(AestheticStatus).map((status) => (
                                <option key={status} value={status}>
                                    {getStatusLabel(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {aestheticsQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={5} />
                    ) : aestheticsQuery.isError ? (
                        <ClinicStateCard message="No se pudieron cargar los servicios." tone="error" />
                    ) : items.length === 0 ? (
                        <ClinicStateCard message="No hay servicios registrados." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Servicio</th>
                                        <th className="px-4 py-3 text-left font-medium">Mascota</th>
                                        <th className="px-4 py-3 text-left font-medium">Groomer</th>
                                        <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                        <th className="px-4 py-3 text-left font-medium">Precio</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-4 py-3 font-medium">{item.serviceName}</td>
                                            <td className="px-4 py-3">{item.pet?.name ?? '—'}</td>
                                            <td className="px-4 py-3">
                                                {item.groomer?.firstName} {item.groomer?.lastName}
                                            </td>
                                            <td className="px-4 py-3">{format(new Date(item.scheduledAt), 'dd/MM/yyyy HH:mm')}</td>
                                            <td className="px-4 py-3">{item.price != null ? `$${Number(item.price).toFixed(2)}` : '—'}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={item.status === AestheticStatus.COMPLETED ? 'confirmed' : 'scheduled'}>
                                                    {getStatusLabel(item.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={async () => {
                                                        try {
                                                            setSelectedId(item.id);
                                                            await updateAesthetic.mutateAsync({ status: AestheticStatus.COMPLETED });
                                                            toast.success('Estado actualizado');
                                                        } catch {
                                                            toast.error('No se pudo actualizar');
                                                        } finally {
                                                            setSelectedId(null);
                                                        }
                                                    }}
                                                    disabled={item.status === AestheticStatus.COMPLETED}
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

            <AestheticModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                pets={pets}
                groomers={groomers}
                loading={createAesthetic.isPending}
                onSubmit={async (values) => {
                    try {
                        await createAesthetic.mutateAsync({
                            petId: values.petId,
                            groomerId: values.groomerId,
                            serviceName: values.serviceName,
                            scheduledAt: localDateTimeToUTC(values.scheduledDate, '09:00'),
                            price: values.price,
                            notes: values.notes,
                        });
                        toast.success('Servicio creado');
                        setModalOpen(false);
                    } catch {
                        toast.error('No se pudo crear el servicio');
                    }
                }}
            />
        </div>
    );
}

function AestheticModal({
    open,
    onOpenChange,
    pets,
    groomers,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pets: Array<{ id: string; name: string }>;
    groomers: Array<{ id: string; firstName: string; lastName: string }>;
    loading: boolean;
    onSubmit: (values: z.infer<typeof aestheticSchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof aestheticSchema>>({
        resolver: zodResolver(aestheticSchema),
        values: {
            petId: '',
            groomerId: '',
            serviceName: '',
            scheduledDate: format(new Date(), 'yyyy-MM-dd'),
            price: 0,
            notes: '',
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nuevo servicio</DialogTitle>
                    <DialogDescription>Agenda un servicio de estética</DialogDescription>
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
                    <Field label="Groomer">
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('groomerId')}>
                            <option value="">Seleccionar</option>
                            {groomers.map((groomer) => (
                                <option key={groomer.id} value={groomer.id}>
                                    {groomer.firstName} {groomer.lastName}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Servicio">
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('serviceName')} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Fecha">
                            <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('scheduledDate')} />
                        </Field>
                        <Field label="Precio">
                            <input type="number" step="0.01" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('price')} />
                        </Field>
                    </div>
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
