'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    useUpdateVaccinationCampaign,
    useVaccinationCampaign,
} from '@/features/vaccinations/hooks/use-vaccination-campaigns';

const CURRENCIES = ['USD', 'EUR', 'COP', 'MXN', 'ARS', 'PEN', 'CLP', 'BRL'] as const;

const formSchema = z
    .object({
        name: z.string().min(3).max(120),
        description: z.string().max(2000).optional(),
        vaccineName: z.string().min(2).max(120),
        startsAt: z.string().min(1),
        endsAt: z.string().min(1),
        location: z.string().max(200).optional(),
        capacity: z
            .string()
            .optional()
            .refine(
                (val) => !val || (!Number.isNaN(Number(val)) && Number(val) > 0),
                'Debe ser un número positivo',
            ),
        priceCents: z
            .string()
            .optional()
            .refine(
                (val) => !val || (!Number.isNaN(Number(val)) && Number(val) >= 0),
                'Debe ser un número ≥ 0',
            ),
        currency: z.enum(CURRENCIES).default('USD'),
        notes: z.string().max(2000).optional(),
    })
    .refine(
        (data) => new Date(data.endsAt) > new Date(data.startsAt),
        {
            message: 'La fecha de fin debe ser posterior a la de inicio',
            path: ['endsAt'],
        },
    );

type FormValues = z.infer<typeof formSchema>;

const toDateTimeLocal = (iso: string) => {
    const d = new Date(iso);
    const offsetMs = d.getTimezoneOffset() * 60_000;
    return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
};

export default function EditVaccinationCampaignPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const campaignId = params?.id ?? '';

    const { data: campaign, isLoading } = useVaccinationCampaign(campaignId);
    const updateMutation = useUpdateVaccinationCampaign();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            vaccineName: '',
            startsAt: '',
            endsAt: '',
            location: '',
            capacity: '',
            priceCents: '',
            currency: 'USD',
            notes: '',
        },
    });

    useEffect(() => {
        if (!campaign) return;
        reset({
            name: campaign.name,
            description: campaign.description ?? '',
            vaccineName: campaign.vaccineName,
            startsAt: toDateTimeLocal(campaign.startsAt),
            endsAt: toDateTimeLocal(campaign.endsAt),
            location: campaign.location ?? '',
            capacity: campaign.capacity?.toString() ?? '',
            priceCents: (campaign.priceCents / 100).toString(),
            currency: campaign.currency as FormValues['currency'],
            notes: campaign.notes ?? '',
        });
    }, [campaign, reset]);

    const onSubmit = async (values: FormValues) => {
        try {
            await updateMutation.mutateAsync({
                id: campaignId,
                input: {
                    name: values.name,
                    description: values.description,
                    vaccineName: values.vaccineName,
                    startsAt: new Date(values.startsAt).toISOString(),
                    endsAt: new Date(values.endsAt).toISOString(),
                    location: values.location,
                    capacity: values.capacity ? Number(values.capacity) : undefined,
                    priceCents: values.priceCents
                        ? Math.round(Number(values.priceCents) * 100)
                        : 0,
                    currency: values.currency,
                    notes: values.notes,
                },
            });
            toast.success('Cambios guardados');
            router.push(`/clinic/vaccinations/campaigns/${campaignId}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo guardar';
            toast.error(message);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <p className="text-muted-foreground">Cargando campaña…</p>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground">
                            No pudimos cargar esta campaña.
                        </p>
                        <Button asChild variant="outline" size="sm" className="mt-3">
                            <Link href="/clinic/vaccinations/campaigns">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                    <Link
                        href={`/clinic/vaccinations/campaigns/${campaignId}`}
                        aria-label="Volver"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Editar campaña</h1>
                    <p className="text-sm text-muted-foreground">
                        Los cambios afectan a futuras inscripciones; las existentes no se
                        modifican.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información básica</CardTitle>
                        <CardDescription>
                            El nombre y la vacuna son visibles para los dueños de mascotas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre de la campaña *</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vaccineName">Vacuna *</Label>
                            <Input id="vaccineName" {...register('vaccineName')} />
                            {errors.vaccineName && (
                                <p className="text-xs text-destructive">
                                    {errors.vaccineName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea id="description" rows={3} {...register('description')} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Fecha y ubicación</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startsAt">Inicio *</Label>
                                <Input
                                    id="startsAt"
                                    type="datetime-local"
                                    {...register('startsAt')}
                                />
                                {errors.startsAt && (
                                    <p className="text-xs text-destructive">
                                        {errors.startsAt.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endsAt">Fin *</Label>
                                <Input
                                    id="endsAt"
                                    type="datetime-local"
                                    {...register('endsAt')}
                                />
                                {errors.endsAt && (
                                    <p className="text-xs text-destructive">
                                        {errors.endsAt.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Ubicación</Label>
                            <Input id="location" {...register('location')} />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Capacidad y precio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Cupo máximo</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    {...register('capacity')}
                                />
                                {errors.capacity && (
                                    <p className="text-xs text-destructive">
                                        {errors.capacity.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priceCents">Precio</Label>
                                <Input
                                    id="priceCents"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...register('priceCents')}
                                />
                                {errors.priceCents && (
                                    <p className="text-xs text-destructive">
                                        {errors.priceCents.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="currency">Moneda</Label>
                                <select
                                    id="currency"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    {...register('currency')}
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notas internas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea rows={3} {...register('notes')} />
                    </CardContent>
                </Card>

                {updateMutation.error && (
                    <div className="flex items-start gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>
                            {updateMutation.error instanceof Error
                                ? updateMutation.error.message
                                : 'Error al guardar'}
                        </span>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href={`/clinic/vaccinations/campaigns/${campaignId}`}>
                            Cancelar
                        </Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting || updateMutation.isPending}>
                        {updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
