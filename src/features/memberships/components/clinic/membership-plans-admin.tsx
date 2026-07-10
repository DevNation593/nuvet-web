'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Power, PowerOff, Star, AlertCircle } from 'lucide-react';
import type { ApiMembershipBillingPeriod, MembershipPlan } from '@nuvet/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import {
    useCreateMembershipPlan,
    useTenantPlans,
    useUpdateMembershipPlan,
} from '../../hooks/use-memberships';
import {
    formatMembershipPriceCents,
    getBillingPeriodLabel,
} from '../../lib/membership-labels';

const planSchema = z.object({
    name: z.string().min(2, 'Nombre demasiado corto'),
    slug: z
        .string()
        .min(2, 'Slug demasiado corto')
        .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
    description: z.string().max(2000).optional().or(z.literal('')),
    priceCents: z
        .number({ invalid_type_error: 'Precio inválido' })
        .int('Precio debe ser un entero (centavos)')
        .nonnegative('Precio no puede ser negativo'),
    currency: z.string().min(3).max(3).default('USD'),
    billingPeriod: z.enum(['MONTHLY', 'ANNUAL']),
    includedBenefits: z.string().optional().or(z.literal('')),
    applicableSpecies: z.string().optional().or(z.literal('')),
    isActive: z.boolean().default(true),
    displayOrder: z.number().int().nonnegative().default(0),
});

type PlanFormValues = z.infer<typeof planSchema>;

function toList(value: string | undefined): string[] {
    if (!value) return [];
    return value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
}

/**
 * Pantalla admin para gestionar los planes de membresía del tenant
 * actual. Permite:
 *   - Listar planes (activos e inactivos)
 *   - Crear un plan nuevo
 *   - Editar nombre, descripción, precio, beneficios, etc.
 *   - Activar / desactivar planes (toggle inline via PATCH)
 *
 * No soporta borrado físico — los planes desactivados se conservan en
 * el historial de suscripciones. La baja es lógica (isActive=false).
 */
export default function MembershipPlansAdmin() {
    const plansQuery = useTenantPlans();
    const update = useUpdateMembershipPlan();

    const [editing, setEditing] = useState<MembershipPlan | null>(null);
    const [creating, setCreating] = useState(false);

    if (plansQuery.isLoading) {
        return (
            <div className="text-muted-foreground p-6 text-sm">
                Cargando planes de membresía…
            </div>
        );
    }

    if (plansQuery.isError) {
        return (
            <div className="border-destructive/40 bg-destructive/10 text-destructive m-6 rounded-md border p-4 text-sm">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                        No pudimos cargar los planes. Intenta recargar la página.
                    </span>
                </div>
            </div>
        );
    }

    const plans = plansQuery.data ?? [];

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Star className="text-primary h-6 w-6" />
                    <div>
                        <h1 className="text-2xl font-bold">Planes de Membresía</h1>
                        <p className="text-muted-foreground text-sm">
                            Configura los planes que verán los propietarios en el portal.
                        </p>
                    </div>
                </div>
                <Button onClick={() => setCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo plan
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Planes del tenant</CardTitle>
                    <CardDescription>
                        Los planes inactivos no aparecen en el catálogo público pero se
                        conservan en suscripciones históricas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {plans.length === 0 ? (
                        <div className="text-muted-foreground p-8 text-center text-sm">
                            Aún no has creado ningún plan. Haz clic en{' '}
                            <strong>Nuevo plan</strong> para empezar.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left font-medium">
                                            Plan
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Precio
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Período
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Beneficios
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-right font-medium">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.map((plan) => (
                                        <tr
                                            key={plan.id}
                                            className="border-b last:border-b-0 hover:bg-muted/30"
                                            data-testid={`admin-plan-row-${plan.id}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-medium">
                                                    {plan.name}
                                                </div>
                                                <div className="text-muted-foreground text-xs">
                                                    {plan.slug}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-mono">
                                                {formatMembershipPriceCents(
                                                    plan.priceCents,
                                                    plan.currency,
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getBillingPeriodLabel(plan.billingPeriod)}
                                            </td>
                                            <td className="text-muted-foreground px-4 py-3 text-xs">
                                                {plan.includedBenefits.length === 0
                                                    ? '—'
                                                    : `${plan.includedBenefits.length} beneficio${
                                                          plan.includedBenefits.length === 1
                                                              ? ''
                                                              : 's'
                                                      }`}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant={
                                                        plan.isActive
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {plan.isActive ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setEditing(plan)}
                                                    >
                                                        <Pencil className="mr-1 h-4 w-4" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        disabled={update.isPending}
                                                        onClick={() =>
                                                            update.mutate(
                                                                {
                                                                    id: plan.id,
                                                                    input: {
                                                                        isActive:
                                                                            !plan.isActive,
                                                                    },
                                                                },
                                                                {
                                                                    onSuccess: () =>
                                                                        toast.success(
                                                                            plan.isActive
                                                                                ? 'Plan desactivado'
                                                                                : 'Plan activado',
                                                                        ),
                                                                    onError: () =>
                                                                        toast.error(
                                                                            'No pudimos cambiar el estado del plan',
                                                                        ),
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {plan.isActive ? (
                                                            <>
                                                                <PowerOff className="mr-1 h-4 w-4 text-amber-600" />
                                                                Desactivar
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Power className="mr-1 h-4 w-4 text-emerald-600" />
                                                                Activar
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PlanDialog
                open={creating || editing !== null}
                plan={editing}
                onOpenChange={(o) => {
                    if (!o) {
                        setCreating(false);
                        setEditing(null);
                    }
                }}
            />
        </div>
    );
}

function PlanDialog({
    open,
    plan,
    onOpenChange,
}: {
    open: boolean;
    plan: MembershipPlan | null;
    onOpenChange: (open: boolean) => void;
}) {
    const isEdit = plan !== null;
    const create = useCreateMembershipPlan();
    const update = useUpdateMembershipPlan();

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: '',
            slug: '',
            description: '',
            priceCents: 0,
            currency: 'USD',
            billingPeriod: 'MONTHLY',
            includedBenefits: '',
            applicableSpecies: '',
            isActive: true,
            displayOrder: 0,
        },
    });

    // Reset cuando cambia el plan o se abre/cierra
    useEffect(() => {
        if (open) {
            if (plan) {
                form.reset({
                    name: plan.name,
                    slug: plan.slug,
                    description: plan.description ?? '',
                    priceCents: plan.priceCents,
                    currency: plan.currency ?? 'USD',
                    billingPeriod: plan.billingPeriod,
                    includedBenefits: plan.includedBenefits.join(', '),
                    applicableSpecies: plan.applicableSpecies.join(', '),
                    isActive: plan.isActive,
                    displayOrder: plan.displayOrder,
                });
            } else {
                form.reset({
                    name: '',
                    slug: '',
                    description: '',
                    priceCents: 0,
                    currency: 'USD',
                    billingPeriod: 'MONTHLY',
                    includedBenefits: '',
                    applicableSpecies: '',
                    isActive: true,
                    displayOrder: 0,
                });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, plan?.id]);

    const onSubmit = form.handleSubmit((values) => {
        const payload = {
            name: values.name,
            slug: values.slug,
            description: values.description?.trim() ? values.description.trim() : undefined,
            priceCents: values.priceCents,
            currency: values.currency,
            billingPeriod: values.billingPeriod as ApiMembershipBillingPeriod,
            includedBenefits: toList(values.includedBenefits),
            applicableSpecies: toList(values.applicableSpecies),
            isActive: values.isActive,
            displayOrder: values.displayOrder,
        };

        if (isEdit && plan) {
            update.mutate(
                { id: plan.id, input: payload },
                {
                    onSuccess: () => {
                        toast.success('Plan actualizado');
                        onOpenChange(false);
                    },
                    onError: () => toast.error('No pudimos actualizar el plan'),
                },
            );
        } else {
            create.mutate(payload, {
                onSuccess: () => {
                    toast.success('Plan creado');
                    onOpenChange(false);
                },
                onError: (err) => {
                    const msg =
                        (err as { response?: { data?: { message?: string } } })?.response
                            ?.data?.message ?? 'No pudimos crear el plan';
                    toast.error(msg);
                },
            });
        }
    });

    const submitting = create.isPending || update.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? `Editar ${plan?.name}` : 'Nuevo plan'}</DialogTitle>
                    <DialogDescription>
                        Define el nombre, precio y beneficios del plan. Los cambios se
                        reflejan inmediatamente en el portal del propietario.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                            label="Nombre"
                            error={form.formState.errors.name?.message}
                        >
                            <Input {...form.register('name')} placeholder="Plan Basic" />
                        </Field>
                        <Field
                            label="Slug"
                            hint="Identificador URL-safe"
                            error={form.formState.errors.slug?.message}
                        >
                            <Input
                                {...form.register('slug')}
                                placeholder="basic-monthly"
                            />
                        </Field>
                    </div>

                    <Field
                        label="Descripción"
                        error={form.formState.errors.description?.message}
                    >
                        <Textarea
                            {...form.register('description')}
                            placeholder="Plan básico mensual que incluye consulta y vacunas anuales"
                            rows={3}
                        />
                    </Field>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <Field
                            label="Precio (centavos)"
                            error={form.formState.errors.priceCents?.message}
                        >
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                {...form.register('priceCents', { valueAsNumber: true })}
                            />
                        </Field>
                        <Field label="Moneda">
                            <Input
                                maxLength={3}
                                {...form.register('currency')}
                                placeholder="USD"
                            />
                        </Field>
                        <Field label="Período">
                            <select
                                {...form.register('billingPeriod')}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                                <option value="MONTHLY">Mensual</option>
                                <option value="ANNUAL">Anual</option>
                            </select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field
                            label="Beneficios incluidos"
                            hint="Separados por coma. Ej: consulta, vacunas, desparasitación"
                            error={form.formState.errors.includedBenefits?.message}
                        >
                            <Input
                                {...form.register('includedBenefits')}
                                placeholder="consulta, vacunas"
                            />
                        </Field>
                        <Field
                            label="Especies aplicables"
                            hint="Vacío = todas. Ej: DOG, CAT"
                            error={form.formState.errors.applicableSpecies?.message}
                        >
                            <Input
                                {...form.register('applicableSpecies')}
                                placeholder="DOG, CAT"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Orden de visualización">
                            <Input
                                type="number"
                                min="0"
                                step="1"
                                {...form.register('displayOrder', { valueAsNumber: true })}
                            />
                        </Field>
                        <Field label="Estado">
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    {...form.register('isActive')}
                                    className="h-4 w-4"
                                />
                                Plan activo (visible en el catálogo público)
                            </label>
                        </Field>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={submitting}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting
                                ? isEdit
                                    ? 'Guardando…'
                                    : 'Creando…'
                                : isEdit
                                  ? 'Guardar cambios'
                                  : 'Crear plan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({
    label,
    hint,
    error,
    children,
}: {
    label: string;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">{label}</Label>
            {children}
            {hint && !error && (
                <p className="text-muted-foreground text-xs">{hint}</p>
            )}
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );
}
