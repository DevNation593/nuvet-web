'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import {
    ClinicClient,
    CreateClientInput,
    useClient,
    useClients,
    useCreateClient,
    useUpdateClient,
} from '@/features/clients/hooks/use-clients';
import { usePets } from '@/features/pets/hooks/use-pets';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { Loader2, Pencil, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const clientSchema = z.object({
    firstName: z.string().min(2, 'Nombre requerido'),
    lastName: z.string().min(2, 'Apellido requerido'),
    email: z.string().email('Correo inválido'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Mínimo 8 caracteres').optional(),
    isActive: z.boolean().default(true),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function ClientsManagement() {
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<ClinicClient | null>(null);

    const clientsQuery = useClients({ limit: 100 });
    const selectedClientQuery = useClient(selectedId);
    const petsQuery = usePets({ limit: 100 });
    const createClient = useCreateClient();
    const updateClient = useUpdateClient(editingClient?.id ?? null);

    const clients = useMemo(() => clientsQuery.data?.data ?? [], [clientsQuery.data?.data]);
    const pets = useMemo(
        () => ((petsQuery.data?.data ?? []) as Array<{ ownerId?: string }>),
        [petsQuery.data?.data],
    );

    const petCountByOwner = useMemo(() => {
        const map = new Map<string, number>();
        for (const pet of pets) {
            if (!pet.ownerId) continue;
            map.set(pet.ownerId, (map.get(pet.ownerId) ?? 0) + 1);
        }
        return map;
    }, [pets]);

    const filteredClients = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return clients;
        return clients.filter((client) =>
            `${client.firstName} ${client.lastName} ${client.email} ${client.phone ?? ''}`
                .toLowerCase()
                .includes(term),
        );
    }, [clients, search]);

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-sm text-muted-foreground">Gestiona el registro de clientes</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingClient(null);
                        setModalOpen(true);
                    }}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </header>

            <Card>
                <CardHeader className="pb-3">
                    <div className="relative max-w-md">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por nombre, correo o teléfono..."
                            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {clientsQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={6} />
                    ) : clientsQuery.isError ? (
                        <ClinicStateCard
                            message="No se pudieron cargar los clientes."
                            tone="error"
                            action={
                                <Button variant="outline" onClick={() => clientsQuery.refetch()}>
                                    Reintentar
                                </Button>
                            }
                        />
                    ) : filteredClients.length === 0 ? (
                        <ClinicStateCard message="No hay clientes para mostrar." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium">Correo</th>
                                        <th className="px-4 py-3 text-left font-medium">Teléfono</th>
                                        <th className="px-4 py-3 text-left font-medium">Mascotas</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Registro</th>
                                        <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map((client) => (
                                        <tr
                                            key={client.id}
                                            className="cursor-pointer border-b hover:bg-muted/20"
                                            onClick={() => setSelectedId(client.id)}
                                        >
                                            <td className="px-4 py-3 font-medium">
                                                {client.firstName} {client.lastName}
                                            </td>
                                            <td className="px-4 py-3">{client.email}</td>
                                            <td className="px-4 py-3">{client.phone ?? '—'}</td>
                                            <td className="px-4 py-3">{petCountByOwner.get(client.id) ?? 0}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={client.isActive ? 'confirmed' : 'cancelled'}>
                                                    {client.isActive ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                {format(new Date(client.createdAt), 'dd/MM/yy')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        setEditingClient(client);
                                                        setModalOpen(true);
                                                    }}
                                                >
                                                    <Pencil className="h-4 w-4" />
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
                    <CardTitle className="text-base">Detalle de cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedClientQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Cargando detalle...
                        </div>
                    ) : !selectedClientQuery.data ? (
                        <p className="text-sm text-muted-foreground">
                            Selecciona un cliente para ver su información.
                        </p>
                    ) : (
                        <div className="grid gap-2 text-sm sm:grid-cols-2">
                            <DetailItem label="Nombre" value={`${selectedClientQuery.data.firstName} ${selectedClientQuery.data.lastName}`} />
                            <DetailItem label="Correo" value={selectedClientQuery.data.email} />
                            <DetailItem label="Teléfono" value={selectedClientQuery.data.phone ?? '—'} />
                            <DetailItem
                                label="Estado"
                                value={selectedClientQuery.data.isActive ? 'Activo' : 'Inactivo'}
                            />
                            <DetailItem
                                label="Mascotas registradas"
                                value={`${petCountByOwner.get(selectedClientQuery.data.id) ?? 0}`}
                            />
                            <DetailItem
                                label="Fecha de registro"
                                value={format(new Date(selectedClientQuery.data.createdAt), 'dd/MM/yyyy')}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            <ClientModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                initialData={editingClient}
                loading={createClient.isPending || updateClient.isPending}
                onSubmit={async (values) => {
                    try {
                        if (editingClient) {
                            await updateClient.mutateAsync({
                                firstName: values.firstName,
                                lastName: values.lastName,
                                email: values.email,
                                phone: values.phone,
                                isActive: values.isActive,
                                ...(values.password ? { password: values.password } : {}),
                            });
                            toast.success('Cliente actualizado');
                        } else {
                            const payload: CreateClientInput = {
                                firstName: values.firstName,
                                lastName: values.lastName,
                                email: values.email,
                                phone: values.phone,
                                password: values.password ?? '',
                            };
                            await createClient.mutateAsync(payload);
                            toast.success('Cliente creado');
                        }
                        setModalOpen(false);
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo guardar el cliente');
                    }
                }}
            />
        </div>
    );
}

function ClientModal({
    open,
    onOpenChange,
    initialData,
    onSubmit,
    loading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData: ClinicClient | null;
    onSubmit: (values: ClientFormValues) => Promise<void>;
    loading: boolean;
}) {
    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema.superRefine((value, context) => {
            if (!initialData && !value.password) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: 'Contraseña requerida para crear',
                });
            }
        })),
        values: {
            firstName: initialData?.firstName ?? '',
            lastName: initialData?.lastName ?? '',
            email: initialData?.email ?? '',
            phone: initialData?.phone ?? '',
            password: '',
            isActive: initialData?.isActive ?? true,
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
                    <DialogDescription>
                        Completa la información del cliente para habilitar su acceso.
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(async (values) => {
                        await onSubmit(values);
                    })}
                >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <InputField label="Nombre" error={form.formState.errors.firstName?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('firstName')} />
                        </InputField>
                        <InputField label="Apellido" error={form.formState.errors.lastName?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('lastName')} />
                        </InputField>
                    </div>

                    <InputField label="Correo" error={form.formState.errors.email?.message}>
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('email')} />
                    </InputField>
                    <InputField label="Teléfono" error={form.formState.errors.phone?.message}>
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('phone')} />
                    </InputField>
                    <InputField
                        label={initialData ? 'Contraseña (opcional)' : 'Contraseña'}
                        error={form.formState.errors.password?.message}
                    >
                        <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('password')} />
                    </InputField>

                    {initialData && (
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" {...form.register('isActive')} />
                            Cliente activo
                        </label>
                    )}

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
