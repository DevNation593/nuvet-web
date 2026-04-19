'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdoptionStatus } from '@nuvet/types';
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
import { useAdoptions, useCreateAdoptionListing, useUpdateAdoptionStatus } from '@/features/adoptions/hooks/use-adoptions';
import { usePets } from '@/features/pets/hooks/use-pets';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { getPetSpeciesLabel } from '@/shared/lib/pet-labels';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const listingSchema = z.object({
    petId: z.string().min(1, 'Selecciona una mascota'),
    notes: z.string().optional(),
});

export function AdoptionsManagement() {
    const [statusFilter, setStatusFilter] = useState<AdoptionStatus | ''>('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const adoptionsQuery = useAdoptions({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) });
    const petsQuery = usePets({ limit: 100 });
    const createListing = useCreateAdoptionListing();
    const updateStatus = useUpdateAdoptionStatus(selectedId);

    const adoptions = useMemo(() => adoptionsQuery.data?.data ?? [], [adoptionsQuery.data?.data]);
    const pets = useMemo(
        () => ((petsQuery.data?.data ?? []) as Array<{ id: string; name: string; species?: string }>),
        [petsQuery.data?.data],
    );

    const selectedAdoption = useMemo(() => adoptions.find((item) => item.id === selectedId) ?? null, [adoptions, selectedId]);

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Adopciones</h2>
                    <p className="text-sm text-muted-foreground">Publicaciones y aprobación de solicitudes</p>
                </div>
                <Button onClick={() => setModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva publicación
                </Button>
            </header>

            <Card>
                <CardHeader className="pb-3">
                    <div className="max-w-xs">
                        <select
                            aria-label="Filtrar por estado"
                            title="Filtrar por estado"
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as AdoptionStatus | '')}
                        >
                            <option value="">Todos los estados</option>
                            {Object.values(AdoptionStatus).map((status) => (
                                <option key={status} value={status}>
                                    {getStatusLabel(status)}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {adoptionsQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={5} />
                    ) : adoptions.length === 0 ? (
                        <ClinicStateCard message="No hay publicaciones." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Mascota</th>
                                        <th className="px-4 py-3 text-left font-medium">Solicitante</th>
                                        <th className="px-4 py-3 text-left font-medium">Contacto</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adoptions.map((item) => (
                                        <tr key={item.id} className="border-b">
                                            <td className="px-4 py-3">
                                                <p className="font-medium">{item.pet?.name ?? 'Mascota'}</p>
                                                <p className="text-xs text-muted-foreground">{getPetSpeciesLabel(item.pet?.species)}</p>
                                            </td>
                                            <td className="px-4 py-3">{item.applicantName ?? 'Sin solicitud'}</td>
                                            <td className="px-4 py-3">
                                                {item.applicantEmail ?? '—'}
                                                <div className="text-xs text-muted-foreground">{item.applicantPhone ?? ''}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={item.status === AdoptionStatus.APPROVED ? 'confirmed' : item.status === AdoptionStatus.REJECTED ? 'cancelled' : 'scheduled'}>
                                                    {getStatusLabel(item.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            try {
                                                                setSelectedId(item.id);
                                                                await updateStatus.mutateAsync({ status: AdoptionStatus.APPROVED });
                                                                toast.success('Solicitud aprobada');
                                                            } catch {
                                                                toast.error('No se pudo aprobar');
                                                            }
                                                        }}
                                                        disabled={item.status !== AdoptionStatus.PENDING}
                                                    >
                                                        Aprobar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={async () => {
                                                            try {
                                                                setSelectedId(item.id);
                                                                await updateStatus.mutateAsync({ status: AdoptionStatus.REJECTED, rejectionReason: 'No cumple criterios' });
                                                                toast.success('Solicitud rechazada');
                                                            } catch {
                                                                toast.error('No se pudo rechazar');
                                                            }
                                                        }}
                                                        disabled={item.status !== AdoptionStatus.PENDING}
                                                    >
                                                        Rechazar
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

            {selectedAdoption && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Detalle de publicación</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                        <Detail label="Mascota" value={selectedAdoption.pet?.name ?? '—'} />
                        <Detail label="Estado" value={getStatusLabel(selectedAdoption.status)} />
                        <Detail label="Solicitante" value={selectedAdoption.applicantName ?? '—'} />
                        <Detail label="Email" value={selectedAdoption.applicantEmail ?? '—'} />
                        <Detail label="Teléfono" value={selectedAdoption.applicantPhone ?? '—'} />
                        <Detail label="Notas" value={selectedAdoption.notes ?? '—'} />
                    </CardContent>
                </Card>
            )}

            <AdoptionListingModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                pets={pets}
                loading={createListing.isPending}
                onSubmit={async (values) => {
                    try {
                        await createListing.mutateAsync(values);
                        toast.success('Publicación creada');
                        setModalOpen(false);
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo crear la publicación');
                    }
                }}
            />
        </div>
    );
}

function AdoptionListingModal({
    open,
    onOpenChange,
    pets,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pets: Array<{ id: string; name: string }>;
    loading: boolean;
    onSubmit: (values: z.infer<typeof listingSchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof listingSchema>>({
        resolver: zodResolver(listingSchema),
        values: { petId: '', notes: '' },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva publicación de adopción</DialogTitle>
                    <DialogDescription>Selecciona la mascota disponible para adopción.</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
