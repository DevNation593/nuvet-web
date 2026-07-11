'use client';

import { useState } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { usePets } from '@/features/pets/hooks/use-pets';
import { getPetSpeciesLabel } from '@/shared/lib/pet-labels';

type DashboardPet = {
    id: string;
    name: string;
    species?: string;
    breed?: string | null;
    birthDate?: string | null;
    isActive?: boolean;
    owner?: { firstName?: string; lastName?: string; email?: string };
};

const PAGE_SIZE = 10;

const calculateAge = (birthDate?: string | null): string => {
    if (!birthDate) return '—';
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return '—';
    const years = new Date().getFullYear() - d.getFullYear();
    if (years < 1) {
        const months = new Date().getMonth() - d.getMonth();
        return months <= 0 ? 'Recién nacido' : `${months} meses`;
    }
    return `${years} años`;
};

export function PetsDashboardTable() {
    const [page, setPage] = useState(1);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { data, isLoading, error, isFetching } = usePets({
        page,
        limit: PAGE_SIZE,
    });
    const rows = (data?.data ?? []) as DashboardPet[];
    const meta = data?.meta ?? { page: 1, totalPages: 1, total: 0, limit: PAGE_SIZE };
    const selectedPet = rows.find((p) => p.id === selectedId) ?? null;

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">Error al cargar pacientes</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Pacientes
                </h1>
                <Button title="Agregar nuevo paciente">Agregar paciente</Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="relative w-full overflow-auto max-h-[600px]">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                    Nombre
                                </th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                    Especie / Raza
                                </th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                    Propietario
                                </th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                    Edad
                                </th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                                    Estado
                                </th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-4 text-center text-gray-500">
                                        No se encontraron pacientes.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((pet) => (
                                    <tr
                                        key={pet.id}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <td className="p-4 align-middle font-medium">{pet.name}</td>
                                        <td className="p-4 align-middle">
                                            {getPetSpeciesLabel(pet.species)}{' '}
                                            <span className="text-gray-400">
                                                / {pet.breed || 'Desconocida'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {pet.owner?.firstName || pet.owner?.lastName
                                                ? `${pet.owner?.firstName ?? ''} ${pet.owner?.lastName ?? ''}`.trim()
                                                : '—'}
                                            <div className="text-xs text-gray-400">
                                                {pet.owner?.email ?? '—'}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {calculateAge(pet.birthDate)}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={
                                                    pet.isActive === false
                                                        ? 'text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700'
                                                        : 'text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700'
                                                }
                                            >
                                                {pet.isActive === false ? 'Inactivo' : 'Activo'}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setSelectedId(pet.id)}
                                                aria-label={`Ver detalle de ${pet.name}`}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between py-2">
                <div className="text-sm text-muted-foreground">
                    {meta.total === 0
                        ? 'Sin pacientes'
                        : `Mostrando ${rows.length} de ${meta.total} pacientes`}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1 || isFetching}
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">
                        Página {meta.page} de {Math.max(1, meta.totalPages)}
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= meta.totalPages || isFetching}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>

            <Dialog
                open={!!selectedPet}
                onOpenChange={(open) => !open && setSelectedId(null)}
            >
                <DialogContent className="max-w-2xl">
                    {selectedPet && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedPet.name}</DialogTitle>
                                <DialogDescription>
                                    {getPetSpeciesLabel(selectedPet.species)}
                                    {selectedPet.breed
                                        ? ` · ${selectedPet.breed}`
                                        : ''}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-3 sm:grid-cols-2 text-sm">
                                <DetailRow
                                    label="Edad"
                                    value={calculateAge(selectedPet.birthDate)}
                                />
                                <DetailRow
                                    label="Estado"
                                    value={
                                        selectedPet.isActive === false
                                            ? 'Inactivo'
                                            : 'Activo'
                                    }
                                />
                                <DetailRow
                                    label="Propietario"
                                    value={
                                        selectedPet.owner
                                            ? `${selectedPet.owner.firstName ?? ''} ${selectedPet.owner.lastName ?? ''}`.trim() ||
                                              '—'
                                            : '—'
                                    }
                                />
                                <DetailRow
                                    label="Email del propietario"
                                    value={selectedPet.owner?.email ?? '—'}
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedId(null)}
                                >
                                    Cerrar
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function DetailRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="text-sm font-medium">{value}</p>
        </div>
    );
}
