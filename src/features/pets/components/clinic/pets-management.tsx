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
import { Eye, FileText, Loader2, PawPrint, Pencil, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { getPetSpeciesLabel } from '@/shared/lib/pet-labels';
import { ScrollableTable, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/components/ui/table';
import { MobileCard, MobileCardHeader, MobileCardTitle, MobileCardContent, MobileCardRow, MobileCardLabel, MobileCardValue, MobileCardActions } from '@/shared/components/ui/mobile-card';
import { useIsMobile } from '@/shared/hooks/use-media-query';

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
    const [page, setPage] = useState(1);
    const [detailOpen, setDetailOpen] = useState(false);
    const PAGE_SIZE = 20;
    const isMobile = useIsMobile();

    const petsQuery = usePets({
        page,
        limit: PAGE_SIZE,
        includeInactive: statusFilter !== 'active',
    });
    const petsMeta = petsQuery.data?.meta ?? {
        page: 1,
        limit: PAGE_SIZE,
        total: 0,
        totalPages: 1,
    };
    const clientsQuery = useClients({ limit: 100 });
    const selectedPetQuery = usePet(selectedId);
    const createPet = useCreatePet();
    const updatePet = useUpdatePet(editingPet?.id ?? null);
    const deactivatePet = useDeactivatePet();
    const reactivatePet = useReactivatePet();

    const pets = useMemo(() => (((petsQuery.data?.data ?? []) as unknown[]) as PetRow[]), [petsQuery.data?.data]);
    const clients = useMemo(() => clientsQuery.data?.data ?? [], [clientsQuery.data?.data]);
    const selectedPet = (selectedPetQuery.data as unknown as PetDetail | undefined) ?? undefined;

    const openDetail = (id: string) => {
        setSelectedId(id);
        setDetailOpen(true);
    };

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
                    title="Registrar una nueva mascota"
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
                                <Button
                                    variant="outline"
                                    title="Reintentar carga de datos"
                                    onClick={() => petsQuery.refetch()}
                                >
                                    Reintentar
                                </Button>
                            }
                        />
                    ) : filteredPets.length === 0 ? (
                        <ClinicStateCard message="No hay mascotas para mostrar." />
                    ) : isMobile ? (
                        <div className="space-y-3 p-4 max-h-[600px] overflow-y-auto">
                            {filteredPets.map((pet) => (
                                <MobileCard key={pet.id}>
                                    <MobileCardHeader>
                                        <MobileCardTitle>{pet.name}</MobileCardTitle>
                                        <Badge variant={(pet.isActive ?? true) ? 'confirmed' : 'cancelled'}>
                                            {(pet.isActive ?? true) ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </MobileCardHeader>
                                    <MobileCardContent>
                                        <MobileCardRow>
                                            <MobileCardLabel>Especie:</MobileCardLabel>
                                            <MobileCardValue>{getPetSpeciesLabel(pet.species)}</MobileCardValue>
                                        </MobileCardRow>
                                        <MobileCardRow>
                                            <MobileCardLabel>Raza:</MobileCardLabel>
                                            <MobileCardValue>{pet.breed ?? '—'}</MobileCardValue>
                                        </MobileCardRow>
                                        <MobileCardRow>
                                            <MobileCardLabel>Edad:</MobileCardLabel>
                                            <MobileCardValue>{calculateAge(pet.birthDate)}</MobileCardValue>
                                        </MobileCardRow>
                                        <MobileCardRow>
                                            <MobileCardLabel>Dueño:</MobileCardLabel>
                                            <MobileCardValue>
                                                {pet.owner?.firstName} {pet.owner?.lastName}
                                            </MobileCardValue>
                                        </MobileCardRow>
                                        <MobileCardActions>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => openDetail(pet.id)}
                                                aria-label={`Ver detalle de ${pet.name}`}
                                            >
                                                <Eye className="h-3.5 w-3.5 mr-1" />
                                                Detalle
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => {
                                                    setEditingPet(pet);
                                                    setModalOpen(true);
                                                }}
                                                aria-label={`Editar ${pet.name}`}
                                            >
                                                <Pencil className="h-3.5 w-3.5 mr-1" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => router.push(`/clinic/pets/${pet.id}/history`)}
                                                aria-label={`Ver historial de ${pet.name}`}
                                            >
                                                <FileText className="h-3.5 w-3.5 mr-1" />
                                                Historial
                                            </Button>
                                        </MobileCardActions>
                                    </MobileCardContent>
                                </MobileCard>
                            ))}
                        </div>
                    ) : (
                        <ScrollableTable maxHeight="max-h-[600px]" minWidth="min-w-[860px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Especie</TableHead>
                                    <TableHead>Raza</TableHead>
                                    <TableHead>Edad</TableHead>
                                    <TableHead>Dueño</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Última visita</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPets.map((pet) => (
                                    <TableRow key={pet.id}>
                                        <TableCell className="font-medium">{pet.name}</TableCell>
                                        <TableCell>{getPetSpeciesLabel(pet.species)}</TableCell>
                                        <TableCell>{pet.breed ?? '—'}</TableCell>
                                        <TableCell>{calculateAge(pet.birthDate)}</TableCell>
                                        <TableCell>
                                            {pet.owner?.firstName} {pet.owner?.lastName}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={(pet.isActive ?? true) ? 'confirmed' : 'cancelled'}>
                                                {(pet.isActive ?? true) ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(pet.createdAt), 'dd/MM/yy')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openDetail(pet.id)}
                                                    title={`Ver detalle de ${pet.name}`}
                                                    aria-label={`Ver detalle de ${pet.name}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingPet(pet);
                                                        setModalOpen(true);
                                                    }}
                                                    title="Editar"
                                                    aria-label={`Editar ${pet.name}`}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => router.push(`/clinic/pets/${pet.id}/history`)}
                                                    title="Historial clínico"
                                                    aria-label={`Ver historial de ${pet.name}`}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    title={(pet.isActive ?? true) ? 'Desactivar mascota' : 'Activar mascota'}
                                                    aria-label={(pet.isActive ?? true) ? `Desactivar ${pet.name}` : `Activar ${pet.name}`}
                                                    onClick={async () => {
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
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ScrollableTable>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm text-muted-foreground">
                        {petsMeta.total === 0
                            ? 'Sin mascotas para mostrar'
                            : `Mostrando ${pets.length} de ${petsMeta.total} mascotas`}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1 || petsQuery.isFetching}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm text-muted-foreground px-2">
                            Página {petsMeta.page} de {Math.max(1, petsMeta.totalPages)}
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={page >= petsMeta.totalPages || petsQuery.isFetching}
                        >
                            Siguiente
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setSelectedId(null);
                }}
            >
                <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                    {selectedPetQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando detalle...
                        </div>
                    ) : !selectedPet ? (
                        <p className="text-sm text-muted-foreground">
                            No se encontró la mascota.
                        </p>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedPet.name}</DialogTitle>
                                <DialogDescription>
                                    {getPetSpeciesLabel(selectedPet.species)}
                                    {selectedPet.breed ? ` · ${selectedPet.breed}` : ''}
                                </DialogDescription>
                            </DialogHeader>
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
                                                            title="Ver historial clínico completo"
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

                            <div className="mt-4 flex flex-wrap justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setEditingPet(selectedPet as PetRow);
                                        setModalOpen(true);
                                        setDetailOpen(false);
                                    }}
                                >
                                    <Pencil className="h-3.5 w-3.5 mr-1" />
                                    Editar
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        router.push(`/clinic/pets/${selectedPet.id}/history`);
                                    }}
                                >
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    Ver historial completo
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDetailOpen(false)}
                                >
                                    Cerrar
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

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
                        <Button
                            type="button"
                            variant="outline"
                            title="Cancelar sin guardar"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading} title="Guardar mascota">
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
