'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
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
import {
    CreateVaccinationInput,
    useCreateVaccination,
    useUpcomingVaccinations,
    useUpdateVaccination,
    useVaccinations,
} from '@/features/vaccinations/hooks/use-vaccinations';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { Plus, Syringe } from 'lucide-react';
import { toast } from 'sonner';
import { VaccinationStatus } from '@nuvet/types';

const vaccinationSchema = z.object({
    petId: z.string().min(1, 'Selecciona una mascota'),
    vaccineName: z.string().min(2, 'Nombre requerido'),
    manufacturer: z.string().optional(),
    batchNumber: z.string().optional(),
    dose: z.coerce.number().int().min(1),
    administeredAt: z.string().min(1, 'Fecha requerida'),
    nextDueAt: z.string().optional(),
    notes: z.string().optional(),
});

type VaccinationFormValues = z.infer<typeof vaccinationSchema>;

export function VaccinationsManagement() {
    const [selectedPetId, setSelectedPetId] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingVaccinationId, setEditingVaccinationId] = useState<string | null>(null);

    const petsQuery = usePets({ limit: 100 });
    const vaccinationsQuery = useVaccinations(selectedPetId || null, { limit: 100 });
    const upcomingQuery = useUpcomingVaccinations(30);
    const createVaccination = useCreateVaccination();
    const updateVaccination = useUpdateVaccination(editingVaccinationId);

    const pets = useMemo(
        () =>
            ((petsQuery.data?.data ?? []) as Array<{
                id: string;
                name: string;
                owner?: { firstName?: string; lastName?: string };
            }>),
        [petsQuery.data?.data],
    );
    const vaccinations = useMemo(() => vaccinationsQuery.data?.data ?? [], [vaccinationsQuery.data?.data]);
    const upcoming = useMemo(() => upcomingQuery.data ?? [], [upcomingQuery.data]);

    const selectedPetLabel = useMemo(() => {
        const pet = pets.find((item) => item.id === selectedPetId);
        if (!pet) return 'Todas';
        const ownerName = `${pet.owner?.firstName ?? ''} ${pet.owner?.lastName ?? ''}`.trim();
        return ownerName ? `${pet.name} · ${ownerName}` : pet.name;
    }, [pets, selectedPetId]);

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Vacunas</h2>
                    <p className="text-sm text-muted-foreground">Calendario y registro de vacunación</p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva vacuna
                </Button>
            </header>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="grid gap-2 sm:grid-cols-[1fr_260px]">
                            <select
                                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                                value={selectedPetId}
                                onChange={(e) => setSelectedPetId(e.target.value)}
                            >
                                <option value="">Todas las mascotas</option>
                                {pets.map((pet) => (
                                    <option key={pet.id} value={pet.id}>
                                        {pet.name}
                                    </option>
                                ))}
                            </select>
                            <div className="h-10 rounded-md border border-input bg-muted/20 px-3 text-sm leading-10 text-muted-foreground">
                                {selectedPetLabel}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!selectedPetId ? (
                            <ClinicStateCard message="Selecciona una mascota para ver su historial de vacunas." />
                        ) : vaccinationsQuery.isLoading ? (
                            <ClinicRowsSkeleton rows={6} />
                        ) : vaccinationsQuery.isError ? (
                            <ClinicStateCard message="No se pudo cargar el historial de vacunas." tone="error" />
                        ) : vaccinations.length === 0 ? (
                            <div className="flex min-h-[240px] flex-col items-center justify-center gap-2 p-6 text-center">
                                <Syringe className="h-6 w-6 text-muted-foreground" />
                                <p className="text-sm font-medium">Sin vacunas registradas</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="border-y bg-muted/30 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Vacuna</th>
                                            <th className="px-4 py-3 text-left font-medium">Dosis</th>
                                            <th className="px-4 py-3 text-left font-medium">Aplicada</th>
                                            <th className="px-4 py-3 text-left font-medium">Próxima</th>
                                            <th className="px-4 py-3 text-left font-medium">Estado</th>
                                            <th className="px-4 py-3 text-left font-medium">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vaccinations.map((vaccination) => (
                                            <tr key={vaccination.id} className="border-b">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium">{vaccination.vaccineName}</p>
                                                    <p className="text-xs text-muted-foreground">{vaccination.manufacturer ?? '—'}</p>
                                                </td>
                                                <td className="px-4 py-3">{vaccination.dose}</td>
                                                <td className="px-4 py-3">{format(new Date(vaccination.administeredAt), 'dd/MM/yy')}</td>
                                                <td className="px-4 py-3">
                                                    {vaccination.nextDueAt ? format(new Date(vaccination.nextDueAt), 'dd/MM/yy') : '—'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Badge
                                                        variant={
                                                            vaccination.status === VaccinationStatus.ADMINISTERED
                                                                ? 'confirmed'
                                                                : 'scheduled'
                                                        }
                                                    >
                                                        {getStatusLabel(vaccination.status)}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            try {
                                                                setEditingVaccinationId(vaccination.id);
                                                                await updateVaccination.mutateAsync({
                                                                    status: VaccinationStatus.ADMINISTERED,
                                                                });
                                                                toast.success('Estado actualizado');
                                                            } catch {
                                                                toast.error('No se pudo actualizar');
                                                            } finally {
                                                                setEditingVaccinationId(null);
                                                            }
                                                        }}
                                                    >
                                                        Marcar aplicada
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

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Próximas vacunas (30 días)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {upcomingQuery.isLoading && <ClinicRowsSkeleton compact />}
                        {upcomingQuery.isError && (
                            <ClinicStateCard message="No se pudo cargar próximas vacunas." tone="error" />
                        )}
                        {!upcomingQuery.isLoading && !upcomingQuery.isError && upcoming.length === 0 && (
                            <p className="text-sm text-muted-foreground">No hay próximas vacunas.</p>
                        )}
                        {upcoming.map((item) => (
                            <div key={item.id} className="rounded-md border bg-muted/20 p-2 text-xs">
                                <p className="font-medium">{item.pet?.name ?? 'Mascota'}</p>
                                <p className="text-muted-foreground">{item.vaccineName}</p>
                                <p className="text-muted-foreground">
                                    Vence: {item.nextDueAt ? format(new Date(item.nextDueAt), 'dd/MM/yyyy') : '—'}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <VaccinationModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                pets={pets}
                defaultPetId={selectedPetId}
                loading={createVaccination.isPending}
                onSubmit={async (values) => {
                    try {
                        const payload: CreateVaccinationInput = {
                            ...values,
                            administeredAt: `${values.administeredAt}T09:00:00.000Z`,
                            nextDueAt: values.nextDueAt ? `${values.nextDueAt}T09:00:00.000Z` : undefined,
                        };
                        await createVaccination.mutateAsync(payload);
                        toast.success('Vacuna registrada');
                        setModalOpen(false);
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo registrar la vacuna');
                    }
                }}
            />
        </div>
    );
}

function VaccinationModal({
    open,
    onOpenChange,
    pets,
    defaultPetId,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pets: Array<{ id: string; name: string }>;
    defaultPetId: string;
    loading: boolean;
    onSubmit: (values: VaccinationFormValues) => Promise<void>;
}) {
    const form = useForm<VaccinationFormValues>({
        resolver: zodResolver(vaccinationSchema),
        values: {
            petId: defaultPetId,
            vaccineName: '',
            manufacturer: '',
            batchNumber: '',
            dose: 1,
            administeredAt: format(new Date(), 'yyyy-MM-dd'),
            nextDueAt: '',
            notes: '',
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva vacuna</DialogTitle>
                    <DialogDescription>Registra una nueva dosis aplicada.</DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(async (values) => {
                        await onSubmit(values);
                    })}
                >
                    <Field label="Mascota" error={form.formState.errors.petId?.message}>
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('petId')}>
                            <option value="">Seleccionar mascota</option>
                            {pets.map((pet) => (
                                <option key={pet.id} value={pet.id}>
                                    {pet.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Vacuna" error={form.formState.errors.vaccineName?.message}>
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('vaccineName')} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Fabricante" error={form.formState.errors.manufacturer?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('manufacturer')} />
                        </Field>
                        <Field label="Lote" error={form.formState.errors.batchNumber?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('batchNumber')} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Dosis" error={form.formState.errors.dose?.message}>
                            <input type="number" min={1} className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('dose')} />
                        </Field>
                        <Field label="Aplicada" error={form.formState.errors.administeredAt?.message}>
                            <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('administeredAt')} />
                        </Field>
                        <Field label="Próxima" error={form.formState.errors.nextDueAt?.message}>
                            <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('nextDueAt')} />
                        </Field>
                    </div>
                    <Field label="Notas" error={form.formState.errors.notes?.message}>
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}
