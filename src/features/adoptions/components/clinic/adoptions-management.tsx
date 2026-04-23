'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdoptionStatus, PetSpecies, PetSex } from '@nuvet/types';
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
import {
    useAdoptionAnimals,
    useCreateAdoptionAnimal,
    useUpdateAdoptionAnimal,
    useDeleteAdoptionAnimal,
} from '@/features/adoption-animals/hooks/use-adoption-animals';
import type { AdoptionAnimal } from '@/features/adoption-animals/services/adoption-animals-service';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { getPetSpeciesLabel } from '@/shared/lib/pet-labels';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const listingSchema = z.object({
    adoptionAnimalId: z.string().min(1, 'Selecciona un animal'),
    notes: z.string().optional(),
});

const animalSchema = z.object({
    name: z.string().min(1, 'Nombre requerido'),
    species: z.nativeEnum(PetSpecies),
    sex: z.nativeEnum(PetSex),
    breed: z.string().optional(),
    color: z.string().optional(),
    weight: z.coerce.number().optional(),
    birthDate: z.string().optional(),
    description: z.string().optional(),
    isNeutered: z.boolean().optional(),
    notes: z.string().optional(),
});

type AnimalFormValues = z.infer<typeof animalSchema>;

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdoptionsManagement() {
    const [statusFilter, setStatusFilter] = useState<AdoptionStatus | ''>('');
    const [listingModalOpen, setListingModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Animal states
    const [animalModalOpen, setAnimalModalOpen] = useState(false);
    const [editingAnimal, setEditingAnimal] = useState<AdoptionAnimal | null>(null);
    const [deleteAnimalId, setDeleteAnimalId] = useState<string | null>(null);

    const adoptionsQuery = useAdoptions({ limit: 100, ...(statusFilter ? { status: statusFilter } : {}) });
    const animalsQuery = useAdoptionAnimals({ limit: 100 });
    const createListing = useCreateAdoptionListing();
    const updateStatus = useUpdateAdoptionStatus(selectedId);
    const createAnimal = useCreateAdoptionAnimal();
    const updateAnimal = useUpdateAdoptionAnimal(editingAnimal?.id ?? null);
    const deleteAnimal = useDeleteAdoptionAnimal();

    const adoptions = useMemo(() => adoptionsQuery.data?.data ?? [], [adoptionsQuery.data?.data]);
    const animals = useMemo(
        () => animalsQuery.data?.data ?? [],
        [animalsQuery.data?.data],
    );

    const selectedAdoption = useMemo(() => adoptions.find((item) => item.id === selectedId) ?? null, [adoptions, selectedId]);

    return (
        <div className="space-y-6">
            {/* ── Animales en adopción ── */}
            <section className="space-y-4">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Adopciones</h2>
                        <p className="text-sm text-muted-foreground">Gestión de animales disponibles y solicitudes de adopción</p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingAnimal(null);
                            setAnimalModalOpen(true);
                        }}
                        title="Registrar nuevo animal para adopción"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo animal
                    </Button>
                </header>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Animales en adopción</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {animalsQuery.isLoading ? (
                            <ClinicRowsSkeleton rows={4} />
                        ) : animals.length === 0 ? (
                            <ClinicStateCard message="No hay animales registrados para adopción." />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[640px] text-sm">
                                    <thead className="border-y bg-muted/30 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                            <th className="px-4 py-3 text-left font-medium">Especie</th>
                                            <th className="px-4 py-3 text-left font-medium">Sexo</th>
                                            <th className="px-4 py-3 text-left font-medium">Estado</th>
                                            <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {animals.map((animal) => (
                                            <tr key={animal.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{animal.name}</td>
                                                <td className="px-4 py-3">{getPetSpeciesLabel(animal.species)}</td>
                                                <td className="px-4 py-3">{animal.sex === PetSex.MALE ? 'Macho' : 'Hembra'}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={animal.isActive ? 'scheduled' : 'cancelled'}>
                                                        {animal.isActive ? 'Disponible' : 'Inactivo'}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            title="Editar animal"
                                                            onClick={() => {
                                                                setEditingAnimal(animal);
                                                                setAnimalModalOpen(true);
                                                            }}
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            title="Eliminar animal"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => setDeleteAnimalId(animal.id)}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
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
            </section>

            {/* ── Publicaciones de adopción ── */}
            <section className="space-y-4">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-bold tracking-tight">Publicaciones</h3>
                        <p className="text-sm text-muted-foreground">Solicitudes y estado del proceso de adopción</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setListingModalOpen(true)}
                        title="Crear nueva publicación de adopción"
                        disabled={animals.filter((a) => a.isActive).length === 0}
                    >
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
                                            <th className="px-4 py-3 text-left font-medium">Animal</th>
                                            <th className="px-4 py-3 text-left font-medium">Solicitante</th>
                                            <th className="px-4 py-3 text-left font-medium">Contacto</th>
                                            <th className="px-4 py-3 text-left font-medium">Estado</th>
                                            <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {adoptions.map((item) => {
                                            const animalName = (item as { adoptionAnimal?: { name?: string }; pet?: { name?: string } }).adoptionAnimal?.name
                                                ?? (item as { pet?: { name?: string } }).pet?.name
                                                ?? 'Animal';
                                            const animalSpecies = (item as { adoptionAnimal?: { species?: string }; pet?: { species?: string } }).adoptionAnimal?.species
                                                ?? (item as { pet?: { species?: string } }).pet?.species;
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={`border-b cursor-pointer hover:bg-muted/20 ${selectedId === item.id ? 'bg-muted/30' : ''}`}
                                                    onClick={() => setSelectedId(selectedId === item.id ? null : item.id)}
                                                >
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium">{animalName}</p>
                                                        <p className="text-xs text-muted-foreground">{getPetSpeciesLabel(animalSpecies)}</p>
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
                                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                title="Aprobar solicitud"
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
                                                                title="Rechazar solicitud"
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
                                            );
                                        })}
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
                            <Detail label="Animal" value={(selectedAdoption as { adoptionAnimal?: { name?: string }; pet?: { name?: string } }).adoptionAnimal?.name ?? (selectedAdoption as { pet?: { name?: string } }).pet?.name ?? '—'} />
                            <Detail label="Estado" value={getStatusLabel(selectedAdoption.status)} />
                            <Detail label="Solicitante" value={selectedAdoption.applicantName ?? '—'} />
                            <Detail label="Email" value={selectedAdoption.applicantEmail ?? '—'} />
                            <Detail label="Teléfono" value={selectedAdoption.applicantPhone ?? '—'} />
                            <Detail label="Notas" value={selectedAdoption.notes ?? '—'} />
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* ── Modal: Animal ── */}
            <AnimalModal
                open={animalModalOpen}
                onOpenChange={setAnimalModalOpen}
                loading={createAnimal.isPending || updateAnimal.isPending}
                initialValues={editingAnimal ? {
                    name: editingAnimal.name,
                    species: editingAnimal.species,
                    sex: editingAnimal.sex,
                    breed: editingAnimal.breed ?? '',
                    color: editingAnimal.color ?? '',
                    weight: editingAnimal.weight ?? undefined,
                    birthDate: editingAnimal.birthDate?.slice(0, 10) ?? '',
                    description: editingAnimal.description ?? '',
                    isNeutered: editingAnimal.isNeutered,
                    notes: editingAnimal.notes ?? '',
                } : undefined}
                onSubmit={async (values) => {
                    try {
                        if (editingAnimal) {
                            await updateAnimal.mutateAsync(values);
                            toast.success('Animal actualizado');
                        } else {
                            await createAnimal.mutateAsync(values);
                            toast.success('Animal registrado');
                        }
                        setAnimalModalOpen(false);
                        setEditingAnimal(null);
                    } catch {
                        toast.error('No se pudo guardar el animal');
                    }
                }}
            />

            {/* ── Modal: Nueva publicación ── */}
            <AdoptionListingModal
                open={listingModalOpen}
                onOpenChange={setListingModalOpen}
                animals={animals.filter((a) => a.isActive)}
                loading={createListing.isPending}
                onSubmit={async (values) => {
                    try {
                        await createListing.mutateAsync({ adoptionAnimalId: values.adoptionAnimalId, notes: values.notes });
                        toast.success('Publicación creada');
                        setListingModalOpen(false);
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo crear la publicación');
                    }
                }}
            />

            {/* ── Confirm delete animal ── */}
            <Dialog open={Boolean(deleteAnimalId)} onOpenChange={(o) => { if (!o) setDeleteAnimalId(null); }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar animal</DialogTitle>
                        <DialogDescription>¿Estás seguro de que deseas eliminar este animal de adopción? Esta acción no se puede deshacer.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteAnimalId(null)}>Cancelar</Button>
                        <Button
                            variant="destructive"
                            disabled={deleteAnimal.isPending}
                            onClick={async () => {
                                if (!deleteAnimalId) return;
                                try {
                                    await deleteAnimal.mutateAsync(deleteAnimalId);
                                    toast.success('Animal eliminado');
                                    setDeleteAnimalId(null);
                                } catch {
                                    toast.error('No se pudo eliminar');
                                }
                            }}
                        >
                            {deleteAnimal.isPending ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AnimalModal({
    open,
    onOpenChange,
    loading,
    onSubmit,
    initialValues,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    onSubmit: (values: AnimalFormValues) => Promise<void>;
    initialValues?: Partial<AnimalFormValues>;
}) {
    const form = useForm<AnimalFormValues>({
        resolver: zodResolver(animalSchema),
        values: {
            name: initialValues?.name ?? '',
            species: initialValues?.species ?? PetSpecies.DOG,
            sex: initialValues?.sex ?? PetSex.MALE,
            breed: initialValues?.breed ?? '',
            color: initialValues?.color ?? '',
            weight: initialValues?.weight,
            birthDate: initialValues?.birthDate ?? '',
            description: initialValues?.description ?? '',
            isNeutered: initialValues?.isNeutered ?? false,
            notes: initialValues?.notes ?? '',
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{initialValues ? 'Editar animal' : 'Nuevo animal en adopción'}</DialogTitle>
                    <DialogDescription>Completa los datos del animal disponible para adopción.</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Nombre *" error={form.formState.errors.name?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('name')} />
                        </Field>
                        <Field label="Raza">
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('breed')} />
                        </Field>
                        <Field label="Especie *" error={form.formState.errors.species?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('species')}>
                                {Object.values(PetSpecies).map((s) => (
                                    <option key={s} value={s}>{getPetSpeciesLabel(s)}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Sexo *" error={form.formState.errors.sex?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('sex')}>
                                <option value={PetSex.MALE}>Macho</option>
                                <option value={PetSex.FEMALE}>Hembra</option>
                            </select>
                        </Field>
                        <Field label="Color">
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('color')} />
                        </Field>
                        <Field label="Peso (kg)">
                            <input type="number" step="0.1" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('weight')} />
                        </Field>
                        <Field label="Fecha de nacimiento">
                            <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('birthDate')} />
                        </Field>
                        <Field label="Castrado/Esterilizado">
                            <div className="flex h-10 items-center gap-2">
                                <input type="checkbox" id="isNeutered" className="h-4 w-4" {...form.register('isNeutered')} />
                                <label htmlFor="isNeutered" className="text-sm">Sí</label>
                            </div>
                        </Field>
                    </div>
                    <Field label="Descripción">
                        <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('description')} />
                    </Field>
                    <Field label="Notas internas">
                        <textarea rows={2} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('notes')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} title="Cancelar sin guardar">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} title="Guardar animal">
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function AdoptionListingModal({
    open,
    onOpenChange,
    animals,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    animals: AdoptionAnimal[];
    loading: boolean;
    onSubmit: (values: z.infer<typeof listingSchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof listingSchema>>({
        resolver: zodResolver(listingSchema),
        values: { adoptionAnimalId: '', notes: '' },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva publicación de adopción</DialogTitle>
                    <DialogDescription>Selecciona el animal disponible para crear la publicación.</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <Field label="Animal *" error={form.formState.errors.adoptionAnimalId?.message}>
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('adoptionAnimalId')}>
                            <option value="">Seleccionar animal</option>
                            {animals.map((animal) => (
                                <option key={animal.id} value={animal.id}>
                                    {animal.name} — {getPetSpeciesLabel(animal.species)}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Notas">
                        <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('notes')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} title="Cancelar sin guardar">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} title="Guardar publicación">
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
