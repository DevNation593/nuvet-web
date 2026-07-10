'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    User,
    Stethoscope,
    CheckCircle2,
    Play,
    XCircle,
    AlertCircle,
    ClipboardCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ApiHomeVetBookingStatus, UserRole } from '@nuvet/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import {
    useAssignVet,
    useHomeVetBooking,
    useTransitionHomeVetBooking,
} from '@/features/home-vet/hooks/use-home-vet-bookings';

const STATUS_LABELS: Record<ApiHomeVetBookingStatus, string> = {
    REQUESTED: 'Solicitada',
    CONFIRMED: 'Confirmada',
    EN_ROUTE: 'En camino',
    IN_PROGRESS: 'En curso',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
    NO_SHOW: 'No-show',
};

const STATUS_VARIANTS: Record<ApiHomeVetBookingStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    REQUESTED: 'outline',
    CONFIRMED: 'default',
    EN_ROUTE: 'secondary',
    IN_PROGRESS: 'default',
    COMPLETED: 'secondary',
    CANCELLED: 'destructive',
    NO_SHOW: 'destructive',
};

const formatDate = (iso: string) =>
    format(new Date(iso), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });

const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat('es-EC', { style: 'currency', currency }).format(cents / 100);

export default function HomeVetBookingDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const bookingId = params?.id ?? '';

    const { data: booking, isLoading, error, refetch } = useHomeVetBooking(bookingId);
    const assignVetMutation = useAssignVet();
    const transitionMutation = useTransitionHomeVetBooking();

    const [assignOpen, setAssignOpen] = useState(false);
    const [vetId, setVetId] = useState('');
    const [completeOpen, setCompleteOpen] = useState(false);
    const [visitNotes, setVisitNotes] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [cancelOpen, setCancelOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <p className="text-muted-foreground">Cargando visita…</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="pt-6 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <div className="flex-1">
                            <p className="text-sm text-muted-foreground">
                                No pudimos cargar esta visita.
                            </p>
                            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
                                Reintentar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleTransition = async (
        path: 'confirm' | 'en-route' | 'start' | 'no-show',
        successMsg: string,
    ) => {
        try {
            await transitionMutation.mutateAsync({ id: bookingId, path });
            toast.success(successMsg);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Operación fallida';
            toast.error(message);
        }
    };

    const handleAssignVet = async () => {
        if (!vetId) return;
        try {
            await assignVetMutation.mutateAsync({ id: bookingId, input: { vetId } });
            toast.success('Veterinario asignado');
            setAssignOpen(false);
            setVetId('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo asignar';
            toast.error(message);
        }
    };

    const handleComplete = async () => {
        try {
            await transitionMutation.mutateAsync({
                id: bookingId,
                path: 'complete',
                body: {
                    visitNotes: visitNotes || undefined,
                    diagnosis: diagnosis || undefined,
                },
            });
            toast.success('Visita completada');
            setCompleteOpen(false);
            setVisitNotes('');
            setDiagnosis('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo completar';
            toast.error(message);
        }
    };

    const handleCancel = async () => {
        try {
            await transitionMutation.mutateAsync({
                id: bookingId,
                path: 'cancel',
                body: { reason: cancelReason || undefined },
            });
            toast.success('Visita cancelada');
            setCancelOpen(false);
            setCancelReason('');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'No se pudo cancelar';
            toast.error(message);
        }
    };

    const isTerminal =
        booking.status === 'COMPLETED' ||
        booking.status === 'CANCELLED' ||
        booking.status === 'NO_SHOW';

    return (
        <div className="container mx-auto py-8 space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                    <Link
                        href="/clinic/home-vet/bookings"
                        aria-label="Volver"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight">
                            {booking.pet?.name ?? 'Visita a domicilio'}
                        </h1>
                        <Badge variant={STATUS_VARIANTS[booking.status]}>
                            {STATUS_LABELS[booking.status]}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{booking.reason}</p>
                </div>
                {!isTerminal && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {booking.status === 'REQUESTED' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    handleTransition('confirm', 'Visita confirmada')
                                }
                                disabled={transitionMutation.isPending}
                            >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Confirmar
                            </Button>
                        )}
                        {booking.status === 'CONFIRMED' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    handleTransition('en-route', 'Marcada en camino')
                                }
                                disabled={transitionMutation.isPending}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                En camino
                            </Button>
                        )}
                        {booking.status === 'EN_ROUTE' && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                    handleTransition('start', 'Visita iniciada')
                                }
                                disabled={transitionMutation.isPending}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                Iniciar visita
                            </Button>
                        )}
                        {booking.status === 'IN_PROGRESS' && (
                            <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm">
                                        <ClipboardCheck className="mr-2 h-4 w-4" />
                                        Completar
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Completar visita</DialogTitle>
                                        <DialogDescription>
                                            Registra las notas y diagnóstico del veterinario.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="visitNotes">Notas de la visita</Label>
                                            <Textarea
                                                id="visitNotes"
                                                rows={4}
                                                value={visitNotes}
                                                onChange={(e) => setVisitNotes(e.target.value)}
                                                placeholder="Procedimiento, observaciones, indicaciones…"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="diagnosis">Diagnóstico</Label>
                                            <Textarea
                                                id="diagnosis"
                                                rows={3}
                                                value={diagnosis}
                                                onChange={(e) => setDiagnosis(e.target.value)}
                                                placeholder="Diagnóstico del veterinario"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            variant="outline"
                                            onClick={() => setCompleteOpen(false)}
                                            disabled={transitionMutation.isPending}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={handleComplete}
                                            disabled={transitionMutation.isPending}
                                        >
                                            {transitionMutation.isPending ? 'Guardando…' : 'Marcar completada'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {booking.status !== 'IN_PROGRESS' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                    handleTransition('no-show', 'Marcada como no-show')
                                }
                                disabled={transitionMutation.isPending}
                            >
                                No-show
                            </Button>
                        )}
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setCancelOpen(true)}
                            disabled={transitionMutation.isPending}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Programada</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(booking.scheduledAt)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Dirección</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{booking.address}</span>
                        </CardTitle>
                        {booking.addressNotes && (
                            <CardDescription className="text-xs">
                                {booking.addressNotes}
                            </CardDescription>
                        )}
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Dueño</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {booking.owner
                                ? `${booking.owner.firstName} ${booking.owner.lastName}`
                                : booking.ownerId}
                        </CardTitle>
                        {booking.owner?.email && (
                            <CardDescription className="text-xs">
                                {booking.owner.email}
                            </CardDescription>
                        )}
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Veterinario asignado</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" />
                            {booking.vet
                                ? `${booking.vet.firstName} ${booking.vet.lastName}`
                                : 'Sin asignar'}
                        </CardTitle>
                        {!isTerminal && (
                            <div className="mt-2">
                                <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            {booking.vet ? 'Reasignar' : 'Asignar vet'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Asignar veterinario</DialogTitle>
                                            <DialogDescription>
                                                Pega el ID del veterinario. La asignación
                                                auto-confirma la visita si está en
                                                estado Solicitada.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div>
                                            <Label htmlFor="vetId">Vet ID (UUID)</Label>
                                            <Input
                                                id="vetId"
                                                value={vetId}
                                                onChange={(e) => setVetId(e.target.value)}
                                                placeholder="00000000-0000-0000-0000-000000000000"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                variant="outline"
                                                onClick={() => setAssignOpen(false)}
                                            >
                                                Cancelar
                                            </Button>
                                            <Button
                                                onClick={handleAssignVet}
                                                disabled={
                                                    !vetId || assignVetMutation.isPending
                                                }
                                            >
                                                {assignVetMutation.isPending
                                                    ? 'Asignando…'
                                                    : 'Asignar'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        )}
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Costos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Visita</span>
                        <span>{formatPrice(booking.visitFeeCents, booking.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Traslado</span>
                        <span>{formatPrice(booking.travelFeeCents, booking.currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base pt-2 border-t">
                        <span>Total</span>
                        <span>{formatPrice(booking.totalCents, booking.currency)}</span>
                    </div>
                </CardContent>
            </Card>

            {booking.visitNotes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notas de la visita</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{booking.visitNotes}</p>
                    </CardContent>
                </Card>
            )}

            {booking.diagnosis && (
                <Card>
                    <CardHeader>
                        <CardTitle>Diagnóstico</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm whitespace-pre-wrap">{booking.diagnosis}</p>
                    </CardContent>
                </Card>
            )}

            {booking.cancelReason && (
                <Card>
                    <CardHeader>
                        <CardTitle>Motivo de cancelación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm">{booking.cancelReason}</p>
                    </CardContent>
                </Card>
            )}

            <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Cancelar esta visita?</DialogTitle>
                        <DialogDescription>
                            El cliente será notificado. Esta acción no se puede deshacer.
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Label htmlFor="cancelReason">Motivo (opcional)</Label>
                        <Textarea
                            id="cancelReason"
                            rows={3}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setCancelOpen(false)}
                        >
                            Volver
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={transitionMutation.isPending}
                        >
                            {transitionMutation.isPending ? 'Cancelando…' : 'Sí, cancelar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
