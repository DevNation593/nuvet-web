'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useCreateVaccinationCampaign } from '@/features/vaccinations/hooks/use-vaccination-campaigns';

const CURRENCIES = ['USD', 'EUR', 'COP', 'MXN', 'ARS', 'PEN', 'CLP', 'BRL'] as const;

const formSchema = z
    .object({
        name: z.string().min(3, 'Mínimo 3 caracteres').max(120, 'Máximo 120 caracteres'),
        description: z.string().max(2000).optional(),
        vaccineName: z.string().min(2, 'Mínimo 2 caracteres').max(120),
        startsAt: z.string().min(1, 'Requerido'),
        endsAt: z.string().min(1, 'Requerido'),
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

export default function NewVaccinationCampaignPage() {
    const router = useRouter();
    const createMutation = useCreateVaccinationCampaign();

    const {
        register,
        handleSubmit,
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

    const onSubmit = async (values: FormValues) => {
        try {
            const campaign = await createMutation.mutateAsync({
                name: values.name,
                description: values.description || undefined,
                vaccineName: values.vaccineName,
                startsAt: new Date(values.startsAt).toISOString(),
                endsAt: new Date(values.endsAt).toISOString(),
                location: values.location || undefined,
                capacity: values.capacity ? Number(values.capacity) : undefined,
                priceCents: values.priceCents ? Math.round(Number(values.priceCents) * 100) : 0,
                currency: values.currency,
                notes: values.notes || undefined,
            });
            toast.success('Campaña creada en estado Borrador');
            router.push(`/clinic/vaccinations/campaigns/${campaign.id}`);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo crear la campaña';
            toast.error(message);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-3xl">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/clinic/vaccinations/campaigns" aria-label="Volver">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nueva campaña de vacunación</h1>
                    <p className="text-sm text-muted-foreground">
                        Se creará en estado Borrador. Ábrela desde el detalle para empezar a
                        aceptar inscripciones.
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
                            <Input
                                id="name"
                                placeholder="Jornada antirrábica — Parque La Carolina"
                                {...register('name')}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive">{errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vaccineName">Vacuna *</Label>
                            <Input
                                id="vaccineName"
                                placeholder="Antirrábica"
                                {...register('vaccineName')}
                            />
                            {errors.vaccineName && (
                                <p className="text-xs text-destructive">
                                    {errors.vaccineName.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                placeholder="Detalles visibles para los dueños de mascotas."
                                {...register('description')}
                            />
                            {errors.description && (
                                <p className="text-xs text-destructive">
                                    {errors.description.message}
                                </p>
                            )}
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
                            <Input
                                id="location"
                                placeholder="Parque La Carolina, Quito"
                                {...register('location')}
                            />
                            {errors.location && (
                                <p className="text-xs text-destructive">
                                    {errors.location.message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Capacidad y precio</CardTitle>
                        <CardDescription>
                            Si no defines capacidad, se considera ilimitada. Si el precio es 0, la
                            campaña es gratuita.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Cupo máximo</Label>
                                <Input
                                    id="capacity"
                                    type="number"
                                    min="1"
                                    placeholder="200"
                                    {...register('capacity')}
                                />
                                {errors.capacity && (
                                    <p className="text-xs text-destructive">
                                        {errors.capacity.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priceCents">Precio (en la moneda)</Label>
                                <Input
                                    id="priceCents"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
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
                        <CardDescription>
                            Solo visible para el staff de la clínica. No se muestra a los dueños
                            de mascotas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            rows={3}
                            placeholder="Recordatorios, logística, puntos de contacto…"
                            {...register('notes')}
                        />
                    </CardContent>
                </Card>

                {createMutation.error && (
                    <div className="flex items-start gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 mt-0.5" />
                        <span>
                            {createMutation.error instanceof Error
                                ? createMutation.error.message
                                : 'No se pudo crear la campaña'}
                        </span>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <Button asChild variant="outline">
                        <Link href="/clinic/vaccinations/campaigns">Cancelar</Link>
                    </Button>
                    <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                        {createMutation.isPending ? 'Creando…' : 'Crear campaña'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
