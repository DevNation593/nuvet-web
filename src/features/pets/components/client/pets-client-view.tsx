'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { PetSex, PetSpecies } from '@nuvet/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useCreatePet, usePets, useUpdatePet } from '@/features/pets/hooks/use-pets';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ClientGridSkeleton, ClientStateCard } from '@/shared/components/client/ui-states';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Pencil, Plus } from 'lucide-react';

const petSchema = z.object({
    name: z.string().min(2, 'Nombre requerido'),
    species: z.nativeEnum(PetSpecies),
    sex: z.nativeEnum(PetSex),
    breed: z.string().optional(),
    birthDate: z.string().optional(),
    weight: z.preprocess(
        (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
        z.number().positive().optional()
    ),
    notes: z.string().optional(),
});

type PetFormValues = z.infer<typeof petSchema>;

function toDateInput(value: Date | string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
}

export function PetsClientView() {
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const user = useAuthStore((state) => state.user);
    const { data, isLoading, isError } = usePets({ limit: 50 });
    const createPet = useCreatePet();
    const updatePet = useUpdatePet(editingId);

    const pets = useMemo(() => data?.data ?? [], [data?.data]);
    const editingPet = useMemo(() => pets.find((pet) => pet.id === editingId) ?? null, [pets, editingId]);

    const form = useForm<PetFormValues>({
        resolver: zodResolver(petSchema),
        values: {
            name: '',
            species: PetSpecies.DOG,
            sex: PetSex.MALE,
            breed: '',
            birthDate: '',
            weight: undefined,
            notes: '',
        },
    });

    useEffect(() => {
        if (!open) return;
        if (!editingPet) {
            form.reset({ name: '', species: PetSpecies.DOG, sex: PetSex.MALE, breed: '', birthDate: '', weight: undefined, notes: '' });
            return;
        }
        form.reset({
            name: editingPet.name ?? '',
            species: editingPet.species as PetSpecies,
            sex: editingPet.sex as PetSex,
            breed: editingPet.breed ?? '',
            birthDate: editingPet.birthDate ? toDateInput(editingPet.birthDate) : '',
            weight: editingPet.weight ?? undefined,
            notes: '',
        });
    }, [editingPet, open, form]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Mis Mascotas</h2>
                <Button onClick={() => { setEditingId(null); setOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva mascota
                </Button>
            </div>

            {isLoading ? (
                <ClientGridSkeleton items={6} itemClassName="h-36" columnsClassName="md:grid-cols-2 lg:grid-cols-3" />
            ) : isError ? (
                <ClientStateCard message="No se pudo cargar tus mascotas." tone="error" />
            ) : pets.length === 0 ? (
                <ClientStateCard message="No tienes mascotas registradas." />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pets.map((pet) => (
                        <Card key={pet.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-semibold">{pet.name}</h3>
                                    <Button type="button" size="icon" variant="outline" onClick={() => { setEditingId(pet.id); setOpen(true); }}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground">
                                <p>{pet.species} · {pet.sex}</p>
                                {pet.breed ? <p>{pet.breed}</p> : null}
                                {pet.birthDate ? <p>{toDateInput(pet.birthDate)}</p> : null}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPet ? 'Editar mascota' : 'Registrar mascota'}</DialogTitle>
                        <DialogDescription>Completa los datos de tu mascota.</DialogDescription>
                    </DialogHeader>
                    <form
                        className="space-y-3"
                        onSubmit={form.handleSubmit(async (values) => {
                            try {
                                if (!user?.id) { toast.error('Sesion invalida'); return; }
                                const payload = {
                                    ownerId: user.id,
                                    name: values.name,
                                    species: values.species,
                                    sex: values.sex,
                                    breed: values.breed || undefined,
                                    birthDate: values.birthDate || undefined,
                                    weight: values.weight || undefined,
                                    notes: values.notes || undefined,
                                };
                                if (editingPet) {
                                    await updatePet.mutateAsync(payload);
                                    toast.success('Mascota actualizada');
                                } else {
                                    await createPet.mutateAsync(payload);
                                    toast.success('Mascota creada');
                                }
                                setOpen(false);
                            } catch (error: unknown) {
                                const msg = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
                                toast.error(msg ?? 'No se pudo guardar la mascota');
                            }
                        })}
                    >
                        <Field label="Nombre" error={form.formState.errors.name?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('name')} />
                        </Field>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Especie" error={form.formState.errors.species?.message}>
                                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('species')}>
                                    {Object.values(PetSpecies).map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field label="Sexo" error={form.formState.errors.sex?.message}>
                                <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('sex')}>
                                    {Object.values(PetSex).map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </Field>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Raza">
                                <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('breed')} />
                            </Field>
                            <Field label="Nacimiento">
                                <input type="date" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('birthDate')} />
                            </Field>
                        </div>
                        <Field label="Peso (kg)" error={form.formState.errors.weight?.message}>
                            <input type="number" step="0.1" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('weight')} />
                        </Field>
                        <Field label="Notas">
                            <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('notes')} />
                        </Field>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button type="submit" disabled={createPet.isPending || updatePet.isPending}>
                                {createPet.isPending || updatePet.isPending ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </label>
    );
}
