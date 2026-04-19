'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { PetSex, PetSpecies } from '@nuvet/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { useClients } from '@/features/clients/hooks/use-clients';
import { useCreatePet, useDeactivatePet, usePet, usePets, useReactivatePet, useUpdatePet } from '@/features/pets/hooks/use-pets';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { FileText, Loader2, PawPrint, Pencil, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getPetSpeciesLabel } from '@/shared/lib/pet-labels';

type PetRow = {
    id: string;
    ownerId: string;
    name: string;
    species: PetSpecies;
    sex: PetSex;
    breed?: string;
    birthDate?: string;
    isActive?: boolean;
    createdAt: string;
    owner?: { firstName?: string; lastName?: string };
};

const petSchema = z.object({
    ownerId: z.string().min(1, 'Selecciona un dueño'),
    name: z.string().min(2, 'Nombre requerido'),
    species: z.nativeEnum(PetSpecies),
    sex: z.nativeEnum(PetSex),
    breed: z.string().optional(),
    birthDate: z.string().optional(),
    weight: z.preprocess(
        (value) => (value === '' || value == null ? undefined : value),
        z.coerce.number().positive().optional(),
    ),
    notes: z.string().optional(),
    color: z.string().optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

type PetMedicalRecord = {
    id: string;
    diagnosis?: string;
    treatment?: string;
    notes?: string;
    createdAt?: string;
};

type PetVaccination = {
    id: string;
    vaccineName?: string;
    status?: string;
    administeredAt?: string;
    nextDueAt?: string;
};

type PetDetail = PetRow & {
    medicalRecords?: PetMedicalRecord[];
    vaccinations?: PetVaccination[];
};

function calculateAge(birthDate?: string) {
    if (!birthDate) return '—';
    const birth = new Date(birthDate);
    const years = Math.floor((Date.now() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return `${years} años`;
}

function formatDate(value?: string) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return format(date, 'dd/MM/yyyy');
}

export function PetsManagement() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPet, setEditingPet] = useState<PetRow | null>(null);
    const [speciesFilter, setSpeciesFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'all'>('active');

    const petsQuery = usePets({ limit: 100, includeInactive: statusFilter !== 'active' });
    const clientsQuery = useClients({ limit: 100 });
    const selectedPetQuery = usePet(selectedId);
    const createPet = useCreatePet();
    const updatePet = useUpdatePet(editingPet?.id ?? null);
    const deactivatePet = useDeactivatePet();
    const reactivatePet = useReactivatePet();

    const pets = useMemo(() => (((petsQuery.data?.data ?? []) as unknown[]) as PetRow[]), [petsQuery.data?.data]);
    const clients = useMemo(() => clientsQuery.data?.data ?? [], [clientsQuery.data?.data]);
    const selectedPet = (selectedPetQuery.data as unknown as PetDetail | undefined) ?? undefined;

    const filteredPets = useMemo(() => {
        const term = search.trim().toLowerCase();
        return pets.filter((pet) => {
            const matchesSearch =
                !term ||
                `${pet.name} ${pet.breed ?? ''} ${pet.owner?.firstName ?? ''} ${pet.owner?.lastName ?? ''}`
                    .toLowerCase()
                    .includes(term);
            const matchesSpecies = !speciesFilter || pet.species === speciesFilter;
            const isPetActive = pet.isActive ?? true;
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && isPetActive) ||
                (statusFilter === 'inactive' && !isPetActive);

            return matchesSearch && matchesSpecies && matchesStatus;
        });
    }, [pets, search, speciesFilter, statusFilter]);

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Mascotas</h2>
                    <p className="text-sm text-muted-foreground">Gestiona el registro de mascotas</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingPet(null);
                        setModalOpen(true);
                    }}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nueva Mascota
                </Button>
            </header>

            <Card>
                <CardHeader className="pb-3">
                    <div className="grid gap-2 sm:grid-cols-[1fr_220px_220px]">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nombre o dueño..."
                                className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                            />
                        </div>
                        <select
                            aria-label="Filtrar por especie"
                            title="Filtrar por especie"
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={speciesFilter}
                            onChange={(e) => setSpeciesFilter(e.target.value)}
                        >
                            <option value="">Todas las especies</option>
                            {Object.values(PetSpecies).map((specie) => (
                                <option key={specie} value={specie}>
                                    {getPetSpeciesLabel(specie)}
                                </option>
                            ))}
                        </select>
                        <select
                            aria-label="Filtrar por estado"
                            title="Filtrar por estado"
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value as 'active' | 'inactive' | 'all')}
                        >
                            <option value="active">Solo activas</option>
                            <option value="inactive">Solo inactivas</option>
                            <option value="all">Todas</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {petsQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={6} />
                    ) : petsQuery.isError ? (
                        <ClinicStateCard
                            message="No se pudieron cargar las mascotas."
                            tone="error"
                            action={
                                <Button variant="outline" onClick={() => petsQuery.refetch()}>
                                    Reintentar
                                </Button>
                            }
                        />
                    ) : filteredPets.length === 0 ? (
                        <ClinicStateCard message="No hay mascotas para mostrar." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium">Especie</th>
                                        <th className="px-4 py-3 text-left font-medium">Raza</th>
                                        <th className="px-4 py-3 text-left font-medium">Edad</th>
                                        <th className="px-4 py-3 text-left font-medium">Dueño</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Última visita</th>
                                        <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPets.map((pet) => (
                                        <tr
                                            key={pet.id}
                                            className="cursor-pointer border-b hover:bg-muted/20"
                                            onClick={() => setSelectedId(pet.id)}
                                        >
                                            <td className="px-4 py-3 font-medium">{pet.name}</td>
                                            <td className="px-4 py-3">{getPetSpeciesLabel(pet.species)}</td>
                                            <td className="px-4 py-3">{pet.breed ?? '—'}</td>
                                            <td className="px-4 py-3">{calculateAge(pet.birthDate)}</td>
                                            <td className="px-4 py-3">
                                                {pet.owner?.firstName} {pet.owner?.lastName}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={(pet.isActive ?? true) ? 'confirmed' : 'cancelled'}>
                                                    {(pet.isActive ?? true) ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{format(new Date(pet.createdAt), 'dd/MM/yy')}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            setEditingPet(pet);
                                                            setModalOpen(true);
                                                        }}
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            router.push(`/clinic/pets/${pet.id}/history`);
                                                        }}
                                                        title="Historial clínico"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={async (event) => {
                                                            event.stopPropagation();
                                                            try {
                                                                if ((pet.isActive ?? true)) {
                                                                    await deactivatePet.mutateAsync(pet.id);
                                                                    toast.success('Mascota desactivada');
                                                                } else {
                                                                    await reactivatePet.mutateAsync(pet.id);
                                                                    toast.success('Mascota reactivada');
                                                                }
                                                            } catch {
                                                                toast.error('No se pudo actualizar el estado');
                                                            }
                                                        }}
                                                    >
                                                        <PawPrint className="h-4 w-4" />
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Detalle de mascota</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedPetQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando detalle...
                        </div>
                    ) : !selectedPet ? (
                        <p className="text-sm text-muted-foreground">
                            Selecciona una mascota para ver su información.
                        </p>
                    ) : (
                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <DetailItem label="Nombre" value={selectedPet.name} />
                            <DetailItem label="Especie" value={getPetSpeciesLabel(selectedPet.species)} />
                            <DetailItem label="Raza" value={selectedPet.breed ?? '—'} />
                            <DetailItem label="Sexo" value={selectedPet.sex} />
                            <DetailItem label="Edad" value={calculateAge(selectedPet.birthDate)} />
                            <DetailItem
                                label="Dueño"
                                value={`${selectedPet.owner?.firstName ?? ''} ${selectedPet.owner?.lastName ?? ''}`.trim() || '—'}
                            />
                            <DetailItem
                                label="Historial clínico"
                                value={
                                    selectedPet.medicalRecords && selectedPet.medicalRecords.length > 0
                                        ? `${selectedPet.medicalRecords.length} registros recientes`
                                        : 'Sin registros'
                                }
                            />
                            <DetailItem
                                label="Vacunas"
                                value={
                                    selectedPet.vaccinations && selectedPet.vaccinations.length > 0
                                        ? `${selectedPet.vaccinations.length} vacunas registradas`
                                        : 'Sin vacunas registradas'
                                }
                            />
                        </div>
                    )}

                    {selectedPet ? (
                        <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <div className="rounded-md border bg-muted/10 p-3">
                                <p className="mb-2 text-sm font-semibold">Registros médicos recientes</p>
                                {!selectedPet.medicalRecords || selectedPet.medicalRecords.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No hay historial clínico registrado.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedPet.medicalRecords.map((record) => (
                                            <div key={record.id} className="rounded-md border bg-background p-2 text-xs">
                                                <p className="font-medium">{record.diagnosis || 'Sin diagnóstico'}</p>
                                                <p className="text-muted-foreground">
                                                    Fecha: {formatDate(record.createdAt)}
                                                </p>
                                                {record.treatment ? <p>Tratamiento: {record.treatment}</p> : null}
                                                {record.notes ? <p>Notas: {record.notes}</p> : null}
                                                <div className="mt-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            router.push(
                                                                `/clinic/medical-records?petId=${selectedPet.id}&recordId=${record.id}`,
                                                            )
                                                        }
                                                    >
                                                        Abrir historial
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="rounded-md border bg-muted/10 p-3">
                                <p className="mb-2 text-sm font-semibold">Vacunación reciente</p>
                                {!selectedPet.vaccinations || selectedPet.vaccinations.length === 0 ? (
                                    <p className="text-xs text-muted-foreground">No hay vacunas registradas.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedPet.vaccinations.map((vaccination) => (
                                            <div key={vaccination.id} className="rounded-md border bg-background p-2 text-xs">
                                                <p className="font-medium">{vaccination.vaccineName || 'Vacuna sin nombre'}</p>
                                                <p className="text-muted-foreground">
                                                    Aplicada: {formatDate(vaccination.administeredAt)}
                                                </p>
                                                {vaccination.nextDueAt ? (
                                                    <p className="text-muted-foreground">Próxima dosis: {formatDate(vaccination.nextDueAt)}</p>
                                                ) : null}
                                                {vaccination.status ? <p>Estado: {vaccination.status}</p> : null}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <PetModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initialData={editingPet}
                clients={clients}
                loading={createPet.isPending || updatePet.isPending}
                onSubmit={async (values) => {
                    try {
                        if (editingPet) {
                            await updatePet.mutateAsync(values);
                            toast.success('Mascota actualizada');
                        } else {
                            await createPet.mutateAsync(values);
                            toast.success('Mascota creada');
                        }
                        setModalOpen(false);
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo guardar la mascota');
                    }
                }}
            />
        </div>
    );
}

function PetModal({
    open,
    onOpenChange,
    initialData,
    clients,
    onSubmit,
    loading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: PetRow | null;
    clients: Array<{ id: string; firstName: string; lastName: string }>;
    onSubmit: (values: PetFormValues) => Promise<void>;
    loading: boolean;
}) {
    const form = useForm<PetFormValues>({
        resolver: zodResolver(petSchema),
        values: {
            ownerId: initialData?.ownerId ?? '',
            name: initialData?.name ?? '',
            species: initialData?.species ?? PetSpecies.DOG,
            sex: initialData?.sex ?? PetSex.MALE,
            breed: initialData?.breed ?? '',
            birthDate: initialData?.birthDate ? initialData.birthDate.slice(0, 10) : '',
            weight: undefined,
            notes: '',
            color: '',
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar mascota' : 'Nueva mascota'}</DialogTitle>
                    <DialogDescription>Completa los datos médicos básicos de la mascota.</DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(async (values) => {
                        await onSubmit(values);
                    })}
                >
                    <InputField label="Dueño" error={form.formState.errors.ownerId?.message}>
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('ownerId')}>
                            <option value="">Seleccionar dueño</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.firstName} {client.lastName}
                                </option>
                            ))}
                        </select>
                    </InputField>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InputField label="Nombre" error={form.formState.errors.name?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('name')} />
                        </InputField>
                        <InputField label="Raza" error={form.formState.errors.breed?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('breed')} />
                        </InputField>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <InputField label="Especie" error={form.formState.errors.species?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('species')}>
                                {Object.values(PetSpecies).map((specie) => (
                                    <option key={specie} value={specie}>
                                        {getPetSpeciesLabel(specie)}
                                    </option>
                                ))}
                            </select>
                        </InputField>
                        <InputField label="Sexo" error={form.formState.errors.sex?.message}>
                            <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('sex')}>
                                {Object.values(PetSex).map((sex) => (
                                    <option key={sex} value={sex}>
                                        {sex}
                                    </option>
                                ))}
                            </select>
                        </InputField>
                        <InputField label="Nacimiento" error={form.formState.errors.birthDate?.message}>
                            <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('birthDate')} />
                        </InputField>
                    </div>
                    <InputField label="Notas" error={form.formState.errors.notes?.message}>
                        <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('notes')} />
                    </InputField>
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

function InputField({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    );
}
