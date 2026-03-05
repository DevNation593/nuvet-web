'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { usePets } from '@/features/pets/hooks/use-pets';

type DashboardPet = {
    id: string;
    name: string;
    species?: string;
    breed?: string | null;
    birthDate?: string | null;
    owner?: { firstName?: string; lastName?: string; email?: string };
};

export function PetsDashboardTable() {
    const { data, isLoading, error } = usePets({ page: 1, limit: 10 });
    const rows = (data?.data ?? []) as DashboardPet[];

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
                <Button>Agregar paciente</Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Nombre</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Especie/Raza</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Propietario</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Edad</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Última visita</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No se encontraron pacientes.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((pet) => (
                                    <tr
                                        key={pet.id}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle font-medium">{pet.name}</td>
                                        <td className="p-4 align-middle">
                                            {pet.species}{' '}
                                            <span className="text-gray-400">/ {pet.breed || 'Desconocida'}</span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {pet.owner?.firstName || pet.owner?.lastName
                                                ? `${pet.owner?.firstName ?? ''} ${pet.owner?.lastName ?? ''}`.trim()
                                                : '—'}
                                            <div className="text-xs text-gray-400">{pet.owner?.email ?? '—'}</div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            {pet.birthDate
                                                ? new Date().getFullYear() - new Date(pet.birthDate).getFullYear() + ' años'
                                                : '--'}
                                        </td>
                                        <td className="p-4 align-middle">--</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Página {data?.meta.page ?? 1} de {data?.meta.totalPages ?? 1}
                </div>
            </div>
        </div>
    );
}
