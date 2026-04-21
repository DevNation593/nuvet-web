'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { UserRole } from '@nuvet/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
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
import {
    useBranches,
    useCreateBranch,
    useUpdateBranch,
    useDeleteBranch,
} from '@/features/branches/hooks/use-branches';
import type { Branch } from '@/features/branches/store/branches.store';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { Building2, Loader2, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';

const branchSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio').max(100),
    address: z.string().max(200).optional().or(z.literal('')),
    phone: z.string().max(30).optional().or(z.literal('')),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    website: z.string().url('URL inválida').optional().or(z.literal('')),
    isMain: z.boolean().optional(),
    isActive: z.boolean().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export function BranchesManagement() {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === UserRole.CLINIC_ADMIN;

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

    const branchesQ = useBranches();
    const createBranch = useCreateBranch();
    const updateBranch = useUpdateBranch(editingBranch?.id ?? null);
    const deleteBranch = useDeleteBranch();

    if (!isAdmin) {
        router.replace('/clinic');
        return null;
    }

    const branches = branchesQ.data ?? [];

    function openCreate() {
        setEditingBranch(null);
        setDialogOpen(true);
    }

    function openEdit(branch: Branch) {
        setEditingBranch(branch);
        setDialogOpen(true);
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Sucursales</h2>
                    <p className="text-sm text-muted-foreground">
                        Administra las sucursales de tu clínica
                    </p>
                </div>
                <Button onClick={openCreate} size="sm" title="Crear nueva sucursal">
                    <Plus className="mr-2 h-4 w-4" /> Nueva sucursal
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-0" />
                <CardContent className="p-0">
                    {branchesQ.isLoading ? (
                        <ClinicRowsSkeleton rows={3} />
                    ) : branches.length === 0 ? (
                        <ClinicStateCard
                            message="No hay sucursales registradas. Crea la primera."
                            action={
                                <Button size="sm" onClick={openCreate} title="Crear primera sucursal">
                                    <Plus className="mr-2 h-4 w-4" /> Crear sucursal
                                </Button>
                            }
                        />
                    ) : (
                        <div className="divide-y">
                            {branches.map((branch) => (
                                <div
                                    key={branch.id}
                                    className="flex items-center justify-between gap-4 px-4 py-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Building2 className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">
                                                    {branch.name}
                                                </span>
                                                {branch.isMain && (
                                                    <Badge variant="default" className="text-[10px]">
                                                        Principal
                                                    </Badge>
                                                )}
                                                {!branch.isActive && (
                                                    <Badge variant="destructive" className="text-[10px]">
                                                        Inactiva
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                {branch.address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" />
                                                        {branch.address}
                                                    </span>
                                                )}
                                                {branch.phone && (
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {branch.phone}
                                                    </span>
                                                )}
                                            </div>
                                            {branch._count && (
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {branch._count.users} usuarios · {branch._count.appointments} citas
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => openEdit(branch)}
                                            title="Editar"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        {!branch.isMain && (
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => setDeletingBranch(branch)}
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <BranchFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editing={editingBranch}
                onSubmit={async (values) => {
                    try {
                        if (editingBranch) {
                            await updateBranch.mutateAsync(values);
                            toast.success('Sucursal actualizada');
                        } else {
                            await createBranch.mutateAsync(values);
                            toast.success('Sucursal creada');
                        }
                        setDialogOpen(false);
                        setEditingBranch(null);
                    } catch {
                        toast.error('Error al guardar la sucursal');
                    }
                }}
                saving={createBranch.isPending || updateBranch.isPending}
            />

            <DeleteBranchDialog
                branch={deletingBranch}
                onOpenChange={(open) => !open && setDeletingBranch(null)}
                onConfirm={async () => {
                    if (!deletingBranch) return;
                    try {
                        await deleteBranch.mutateAsync(deletingBranch.id);
                        toast.success('Sucursal eliminada');
                        setDeletingBranch(null);
                    } catch {
                        toast.error('No se pudo eliminar. Verifica que no tenga citas asociadas.');
                    }
                }}
                deleting={deleteBranch.isPending}
            />
        </div>
    );
}

function BranchFormDialog({
    open,
    onOpenChange,
    editing,
    onSubmit,
    saving,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editing: Branch | null;
    onSubmit: (values: BranchFormValues) => Promise<void>;
    saving: boolean;
}) {
    const form = useForm<BranchFormValues>({
        resolver: zodResolver(branchSchema),
        values: editing
            ? {
                  name: editing.name,
                  address: editing.address ?? '',
                  phone: editing.phone ?? '',
                  email: editing.email ?? '',
                  website: editing.website ?? '',
                  isMain: editing.isMain,
                  isActive: editing.isActive,
              }
            : {
                  name: '',
                  address: '',
                  phone: '',
                  email: '',
                  website: '',
                  isMain: false,
                  isActive: true,
              },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editing ? 'Editar sucursal' : 'Nueva sucursal'}
                    </DialogTitle>
                    <DialogDescription>
                        {editing
                            ? 'Modifica los datos de la sucursal'
                            : 'Completa los datos para crear una nueva sucursal'}
                    </DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(async (values) => {
                        const cleaned: BranchFormValues = {
                            ...values,
                            address: values.address || undefined,
                            phone: values.phone || undefined,
                            email: values.email || undefined,
                            website: values.website || undefined,
                        };
                        await onSubmit(cleaned);
                    })}
                >
                    <FieldWrapper label="Nombre *" error={form.formState.errors.name?.message}>
                        <input
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            placeholder="Sucursal Centro"
                            {...form.register('name')}
                        />
                    </FieldWrapper>

                    <FieldWrapper label="Dirección" error={form.formState.errors.address?.message}>
                        <input
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            placeholder="Av. Principal 123"
                            {...form.register('address')}
                        />
                    </FieldWrapper>

                    <div className="grid grid-cols-2 gap-3">
                        <FieldWrapper label="Teléfono" error={form.formState.errors.phone?.message}>
                            <input
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                placeholder="+593 99 123 4567"
                                {...form.register('phone')}
                            />
                        </FieldWrapper>

                        <FieldWrapper label="Email" error={form.formState.errors.email?.message}>
                            <input
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                placeholder="sucursal@clinica.com"
                                {...form.register('email')}
                            />
                        </FieldWrapper>
                    </div>

                    <FieldWrapper label="Sitio web" error={form.formState.errors.website?.message}>
                        <input
                            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            placeholder="https://clinica.com"
                            {...form.register('website')}
                        />
                    </FieldWrapper>

                    {editing && (
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" {...form.register('isMain')} />
                                Principal
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" {...form.register('isActive')} />
                                Activa
                            </label>
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} title="Cancelar sin guardar">
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving} title="Guardar sucursal">
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editing ? 'Guardar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteBranchDialog({
    branch,
    onOpenChange,
    onConfirm,
    deleting,
}: {
    branch: Branch | null;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    deleting: boolean;
}) {
    return (
        <Dialog open={!!branch} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Eliminar sucursal</DialogTitle>
                    <DialogDescription>
                        ¿Estás seguro de que deseas eliminar la sucursal{' '}
                        <strong>{branch?.name}</strong>? Esta acción no se puede deshacer.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} title="Cancelar eliminación">
                        Cancelar
                    </Button>
                    <Button variant="destructive" disabled={deleting} onClick={onConfirm} title="Confirmar eliminación">
                        {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Eliminar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function FieldWrapper({
    label,
    children,
    error,
}: {
    label: string;
    children: React.ReactNode;
    error?: string;
}) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}
