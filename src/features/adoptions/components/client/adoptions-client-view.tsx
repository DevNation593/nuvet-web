'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AdoptionStatus } from '@nuvet/types';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { useAdoptions, useApplyAdoption } from '@/features/adoptions/hooks/use-adoptions';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { ClientGridSkeleton, ClientStateCard } from '@/shared/components/client/ui-states';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { getPetSpeciesLabel } from '@/shared/lib/pet-labels';
import { Heart } from 'lucide-react';

const applySchema = z.object({
    applicantName: z.string().min(2, 'Ingresa tu nombre'),
    applicantEmail: z.string().email('Email inválido'),
    applicantPhone: z.string().optional(),
    notes: z.string().optional(),
});

export function AdoptionsClientView() {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const adoptionsQuery = useAdoptions({ status: AdoptionStatus.AVAILABLE, limit: 30 });
    const applyMutation = useApplyAdoption(selectedId);

    const records = adoptionsQuery.data?.data ?? [];
    const selected = records.find((item) => item.id === selectedId) ?? null;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Adopción</h2>
                <p className="text-muted-foreground">Mascotas disponibles para adopción.</p>
            </div>

            {adoptionsQuery.isLoading ? (
                <ClientGridSkeleton items={6} itemClassName="h-44" columnsClassName="md:grid-cols-2 lg:grid-cols-3" />
            ) : adoptionsQuery.isError ? (
                <ClientStateCard message="No se pudo cargar la lista de adopciones." tone="error" />
            ) : records.length === 0 ? (
                <ClientStateCard message="No hay publicaciones de adopción disponibles por ahora." />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {records.map((item) => (
                        <Card key={item.id}>
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold">{item.pet?.name ?? 'Mascota'}</h3>
                                        <p className="text-xs text-muted-foreground">{getPetSpeciesLabel(item.pet?.species)}</p>
                                    </div>
                                    <Badge variant="secondary">{getStatusLabel(item.status)}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    {item.notes || 'Sin notas adicionales en esta publicación.'}
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={() => { setSelectedId(item.id); setModalOpen(true); }}
                                >
                                    <Heart className="mr-2 h-4 w-4" />
                                    Quiero adoptar
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ApplyDialog
                open={modalOpen}
                onOpenChange={setModalOpen}
                selectedName={selected?.pet?.name}
                loading={applyMutation.isPending}
                defaultName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()}
                defaultEmail={user?.email ?? ''}
                onSubmit={async (values) => {
                    try {
                        await applyMutation.mutateAsync(values);
                        toast.success('Solicitud enviada');
                        setModalOpen(false);
                    } catch (error: unknown) {
                        const msg = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
                        toast.error(msg ?? 'No se pudo enviar la solicitud');
                    }
                }}
            />
        </div>
    );
}

function ApplyDialog({
    open,
    onOpenChange,
    selectedName,
    loading,
    defaultName,
    defaultEmail,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedName?: string;
    loading: boolean;
    defaultName: string;
    defaultEmail: string;
    onSubmit: (values: z.infer<typeof applySchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof applySchema>>({
        resolver: zodResolver(applySchema),
        values: { applicantName: defaultName, applicantEmail: defaultEmail, applicantPhone: '', notes: '' },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Aplicar a adopción</DialogTitle>
                    <DialogDescription>
                        Completa tus datos para solicitar la adopción de {selectedName ?? 'esta mascota'}.
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <Field label="Nombre completo" error={form.formState.errors.applicantName?.message}>
                        <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('applicantName')} />
                    </Field>
                    <Field label="Correo electrónico" error={form.formState.errors.applicantEmail?.message}>
                        <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('applicantEmail')} />
                    </Field>
                    <Field label="Teléfono" error={form.formState.errors.applicantPhone?.message}>
                        <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...form.register('applicantPhone')} />
                    </Field>
                    <Field label="Mensaje para la clínica">
                        <textarea rows={3} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register('notes')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Enviar solicitud'}</Button>
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
            {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </label>
    );
}
