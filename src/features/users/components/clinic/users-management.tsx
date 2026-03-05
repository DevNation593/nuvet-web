'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { useUsers } from '@/features/users/hooks/use-users';
import type { User } from '@nuvet/types';

const ROLE_LABELS: Record<string, string> = {
    CLINIC_ADMIN: 'Administrador',
    VET: 'Veterinario',
    RECEPTIONIST: 'Recepcionista',
    GROOMER: 'Estilista',
    INVENTORY: 'Inventario',
    ADOPTION_MANAGER: 'Adopciones',
    CLIENT: 'Cliente',
};

export function UsersManagement() {
    const { data, isLoading, error } = useUsers({ page: 1, limit: 50 });
    const rows = data?.data ?? [];

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">Error al cargar usuarios</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Usuarios del equipo</h2>
                <Button>Agregar usuario</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((user: User) => (
                    <Card key={user.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">
                                {user.firstName} {user.lastName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm">
                            <p className="text-muted-foreground">{user.email}</p>
                            <Badge variant="secondary">
                                {ROLE_LABELS[user.role] ?? user.role}
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
