'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { usePets } from '@/features/pets/hooks/use-pets';
import {
    useMySubscriptions,
    usePublicPlans,
    useSubscribeToPlan,
} from '@/features/memberships/hooks/use-memberships';
import type { MembershipPlan } from '@nuvet/types';
import { toast } from 'sonner';
import { CreditCard, Star } from 'lucide-react';

interface MembershipsCatalogProps {
    tenantId: string;
}

export function MembershipsCatalog({ tenantId }: MembershipsCatalogProps) {
    const plansQuery = usePublicPlans(tenantId);
    const subsQuery = useMySubscriptions();

    const plans = plansQuery.data ?? [];
    const subs = subsQuery.data ?? [];

    if (plansQuery.isLoading) {
        return <p className="text-muted-foreground">Cargando planes…</p>;
    }
    if (plansQuery.isError) {
        return <p className="text-destructive">No pudimos cargar el catálogo.</p>;
    }

    if (plans.length === 0) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    Esta clínica aún no publicó planes de membresía.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="memberships-catalog">
            {plans.map((plan) => (
                <PlanCard
                    key={plan.id}
                    plan={plan}
                    subscribedPetIds={subs
                        .filter((s) => s.planId === plan.id && (s.status === 'ACTIVE' || s.status === 'PENDING'))
                        .map((s) => s.petId)}
                />
            ))}
        </div>
    );
}

function PlanCard({
    plan,
    subscribedPetIds,
}: {
    plan: MembershipPlan;
    subscribedPetIds: string[];
}) {
    const petsQuery = usePets({ limit: 50 });
    const subscribe = useSubscribeToPlan();
    const [open, setOpen] = useState(false);
    const [petId, setPetId] = useState<string>('');

    const pets = useMemo(() => {
        const raw = petsQuery.data as unknown;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw as Array<{ id: string; name: string }>;
        // Forma PaginatedResponse<Pet>: { data: Pet[], meta: {...} }
        if (typeof raw === 'object' && 'data' in raw) {
            return ((raw as { data: Array<{ id: string; name: string }> }).data) ?? [];
        }
        return [];
    }, [petsQuery.data]);
    const eligiblePets = useMemo(
        () => pets.filter((p) => !subscribedPetIds.includes(p.id)),
        [pets, subscribedPetIds],
    );

    useEffect(() => {
        if (pets.length > 0 && !petId) setPetId(pets[0].id);
    }, [pets, petId]);

    const onSubmit = () => {
        if (!petId) {
            toast.error('Selecciona una mascota');
            return;
        }
        subscribe.mutate(
            { petId, planId: plan.id },
            {
                onSuccess: () => {
                    toast.success('¡Suscripción creada!');
                    setOpen(false);
                },
                onError: (e: unknown) =>
                    toast.error(e instanceof Error ? e.message : 'Error al suscribirse'),
            },
        );
    };

    return (
        <Card data-testid="plan-card">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">
                        <Star className="inline h-4 w-4 mr-1 text-yellow-500" />
                        {plan.name}
                    </CardTitle>
                    <Badge variant="outline">
                        {plan.billingPeriod === 'MONTHLY' ? 'Mensual' : 'Anual'}
                    </Badge>
                </div>
                <CardDescription>
                    {plan.description ?? 'Plan de membresía'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <p className="text-3xl font-bold">
                        {(plan.priceCents / 100).toFixed(2)}{' '}
                        <span className="text-base font-normal text-muted-foreground">
                            {plan.currency}
                        </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Por {plan.billingPeriod === 'MONTHLY' ? 'mes' : 'año'}
                    </p>
                </div>

                {plan.includedBenefits.length > 0 && (
                    <ul className="text-sm space-y-1">
                        {plan.includedBenefits.slice(0, 5).map((b, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="text-green-600">✓</span>
                                <span>{b}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="w-full"
                            disabled={eligiblePets.length === 0}
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {eligiblePets.length === 0
                                ? 'Ya suscrito en todas tus mascotas'
                                : 'Suscribir'}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Suscribir a {plan.name}</DialogTitle>
                            <DialogDescription>
                                Se cobrará {(plan.priceCents / 100).toFixed(2)} {plan.currency} al método de pago configurado.
                            </DialogDescription>
                        </DialogHeader>
                        <div>
                            <label className="text-sm font-medium">Mascota</label>
                            <select
                                value={petId}
                                onChange={(e) => setPetId(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
                            >
                                {eligiblePets.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={onSubmit} disabled={subscribe.isPending}>
                                {subscribe.isPending ? 'Procesando...' : 'Confirmar'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
