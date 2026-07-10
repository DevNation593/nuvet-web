'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { CreditCard, Pause, Play, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { MembershipSubscription } from '@nuvet/types';

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
    DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';

import {
    useCancelSubscription,
    useMySubscriptions,
    usePauseSubscription,
    useResumeSubscription,
} from '../../hooks/use-memberships';
import {
    formatMembershipPriceCents,
    getBillingPeriodLabel,
    getSubscriptionStatusBadgeVariant,
    getSubscriptionStatusLabel,
} from '../../lib/membership-labels';

/**
 * Vista del portal del propietario para gestionar sus suscripciones de
 * membresía. Permite:
 *   - ver todas las suscripciones (activas, pausadas, canceladas, etc.)
 *   - pausar / reanudar una suscripción ACTIVE
 *   - cancelar con motivo (abre dialog de confirmación)
 *   - ir al catálogo clínico para suscribir mascotas nuevas
 */
export default function PortalMembershipsList() {
    const subscriptionsQuery = useMySubscriptions();
    const pause = usePauseSubscription();
    const resume = useResumeSubscription();
    const cancel = useCancelSubscription();

    if (subscriptionsQuery.isLoading) {
        return (
            <div className="text-muted-foreground text-sm">Cargando tus suscripciones…</div>
        );
    }

    if (subscriptionsQuery.isError) {
        return (
            <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border p-4 text-sm">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                        No pudimos cargar tus suscripciones. Intenta recargar la página.
                    </span>
                </div>
            </div>
        );
    }

    const subscriptions = subscriptionsQuery.data ?? [];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Mis membresías
                    </CardTitle>
                    <CardDescription>
                        Gestiona las suscripciones activas de tus mascotas y consulta el
                        historial de pagos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild variant="outline" size="sm">
                        <Link href="/clinic/memberships">Explorar planes</Link>
                    </Button>
                </CardContent>
            </Card>

            {subscriptions.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground py-8 text-center text-sm">
                        Aún no tienes suscripciones activas. Visita{' '}
                        <Link
                            href="/clinic/memberships"
                            className="text-foreground underline"
                        >
                            el catálogo de planes
                        </Link>{' '}
                        para empezar.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {subscriptions.map((sub) => (
                        <SubscriptionRow
                            key={sub.id}
                            subscription={sub}
                            isPausing={pause.isPending}
                            isResuming={resume.isPending}
                            isCancelling={cancel.isPending}
                            onPause={() => {
                                pause.mutate(sub.id, {
                                    onSuccess: () =>
                                        toast.success('Suscripción pausada'),
                                    onError: () =>
                                        toast.error('No pudimos pausar la suscripción'),
                                });
                            }}
                            onResume={() => {
                                resume.mutate(sub.id, {
                                    onSuccess: () =>
                                        toast.success('Suscripción reanudada'),
                                    onError: () =>
                                        toast.error('No pudimos reanudar la suscripción'),
                                });
                            }}
                            onCancel={(reason) => {
                                cancel.mutate(
                                    { id: sub.id, payload: { reason } },
                                    {
                                        onSuccess: () =>
                                            toast.success('Suscripción cancelada'),
                                        onError: () =>
                                            toast.error(
                                                'No pudimos cancelar la suscripción',
                                            ),
                                    },
                                );
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface SubscriptionRowProps {
    subscription: MembershipSubscription;
    isPausing: boolean;
    isResuming: boolean;
    isCancelling: boolean;
    onPause: () => void;
    onResume: () => void;
    onCancel: (reason: string) => void;
}

function SubscriptionRow({
    subscription,
    isPausing,
    isResuming,
    isCancelling,
    onPause,
    onResume,
    onCancel,
}: SubscriptionRowProps) {
    const [cancelOpen, setCancelOpen] = useState(false);
    const [reason, setReason] = useState('');

    const isActive = subscription.status === 'ACTIVE';
    const isPaused = subscription.status === 'PAUSED';
    const isCancellable = isActive || isPaused || subscription.status === 'PAST_DUE';

    const planLabel =
        subscription.plan?.name ?? `Plan #${subscription.planId.slice(0, 6)}`;
    const price =
        subscription.plan?.priceCents !== undefined
            ? formatMembershipPriceCents(
                  subscription.plan.priceCents,
                  subscription.plan.currency ?? 'USD',
              )
            : null;
    const billingPeriod = subscription.plan?.billingPeriod
        ? ` · ${getBillingPeriodLabel(subscription.plan.billingPeriod)}`
        : '';

    return (
        <Card data-testid={`portal-subscription-${subscription.id}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-base">{planLabel}</CardTitle>
                    <CardDescription>
                        Mascota:{' '}
                        <span className="text-foreground font-medium">
                            {subscription.pet?.name ?? subscription.petId}
                        </span>
                    </CardDescription>
                </div>
                <Badge variant={getSubscriptionStatusBadgeVariant(subscription.status)}>
                    {getSubscriptionStatusLabel(subscription.status)}
                </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                    <div>
                        <div className="text-foreground text-xs font-semibold uppercase">
                            Precio
                        </div>
                        <div>
                            {price ?? '—'}
                            {billingPeriod}
                        </div>
                    </div>
                    <div>
                        <div className="text-foreground text-xs font-semibold uppercase">
                            Período actual
                        </div>
                        <div>
                            {formatDate(subscription.currentPeriodStart)} →{' '}
                            {formatDate(subscription.currentPeriodEnd)}
                        </div>
                    </div>
                    <div>
                        <div className="text-foreground text-xs font-semibold uppercase">
                            Próximo cobro
                        </div>
                        <div>{formatDate(subscription.nextBillingAt)}</div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {isActive && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onPause}
                            disabled={isPausing}
                        >
                            <Pause className="mr-2 h-4 w-4" />
                            {isPausing ? 'Pausando…' : 'Pausar'}
                        </Button>
                    )}
                    {isPaused && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onResume}
                            disabled={isResuming}
                        >
                            <Play className="mr-2 h-4 w-4" />
                            {isResuming ? 'Reanudando…' : 'Reanudar'}
                        </Button>
                    )}
                    {isCancellable && (
                        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isCancelling}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Cancelar {planLabel}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tu suscripción quedará cancelada al final del
                                        período actual. Indica el motivo (opcional) — nos
                                        ayuda a mejorar.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="cancel-reason">Motivo</Label>
                                    <Textarea
                                        id="cancel-reason"
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Ej: mi mascota ya no necesita controles mensuales"
                                        rows={3}
                                    />
                                </div>
                                <DialogFooter className="gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => setCancelOpen(false)}
                                    >
                                        Volver
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            onCancel(reason);
                                            setCancelOpen(false);
                                        }}
                                        disabled={isCancelling}
                                    >
                                        {isCancelling
                                            ? 'Cancelando…'
                                            : 'Confirmar cancelación'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function formatDate(iso: string): string {
    try {
        return format(new Date(iso), "d 'de' MMM, yyyy");
    } catch {
        return iso;
    }
}
