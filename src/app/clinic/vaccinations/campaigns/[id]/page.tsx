'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Users, Syringe, DollarSign, Play, Pause, CheckCircle2, XCircle, Trash2, Pencil, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type {
    ApiVaccinationCampaignStatus,
    ApiVaccinationRegistrationStatus,
    VaccinationCampaign,
    VaccinationRegistration,
} from '@nuvet/types';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table';
import {
    useCancelCampaign,
    useCancelRegistration,
    useCampaignRegistrations,
    useCloseCampaign,
    useCompleteCampaign,
    useDeleteCampaign,
    useMarkAttended,
    useMarkNoShow,
    useOpenCampaign,
    useVaccinationCampaign,
} from '@/features/vaccinations/hooks/use-vaccination-campaigns';

const STATUS_LABELS: Record<ApiVaccinationCampaignStatus, string> = {
    DRAFT: 'Borrador',
    OPEN: 'Abierta',
    CLOSED: 'Cerrada',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada',
};

const STATUS_VARIANTS: Record<ApiVaccinationCampaignStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    DRAFT: 'outline',
    OPEN: 'default',
    CLOSED: 'secondary',
    COMPLETED: 'default',
    CANCELLED: 'destructive',
};

const REGISTRATION_STATUS_LABELS: Record<ApiVaccinationRegistrationStatus, string> = {
    REGISTERED: 'Inscrita',
    ATTENDED: 'Asistió',
    NO_SHOW: 'No-show',
    CANCELLED: 'Cancelada',
};

const REGISTRATION_STATUS_VARIANTS: Record<ApiVaccinationRegistrationStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    REGISTERED: 'outline',
    ATTENDED: 'default',
    NO_SHOW: 'secondary',
    CANCELLED: 'destructive',
};

const formatDate = (iso: string) =>
    format(new Date(iso), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });

const formatPrice = (priceCents: number, currency: string) => {
    if (priceCents === 0) return 'Gratis';
    return new Intl.NumberFormat('es-EC', {
        style: 'currency',
        currency,
    }).format(priceCents / 100);
};

export default function VaccinationCampaignDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const campaignId = params?.id ?? '';

    const {
        data: campaign,
        isLoading,
        error,
    } = useVaccinationCampaign(campaignId);
    const { data: registrationsData, isLoading: loadingRegs } =
        useCampaignRegistrations(campaignId);
    const registrations = registrationsData?.data ?? [];

    const openMutation = useOpenCampaign();
    const closeMutation = useCloseCampaign();
    const completeMutation = useCompleteCampaign();
    const cancelMutation = useCancelCampaign();
    const deleteMutation = useDeleteCampaign();
    const markAttendedMutation = useMarkAttended();
    const markNoShowMutation = useMarkNoShow();
    const cancelRegMutation = useCancelRegistration();

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [cancelRegId, setCancelRegId] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="container mx-auto py-8">
                <p className="text-muted-foreground">Cargando campaña…</p>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="container mx-auto py-8">
                <Card>
                    <CardContent className="pt-6 flex flex-col items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <p className="text-sm text-muted-foreground">
                            No pudimos cargar esta campaña.
                        </p>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/clinic/vaccinations/campaigns">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver al listado
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const spotsLeft =
        campaign.capacity != null && campaign.registrationCount != null
            ? campaign.capacity - campaign.registrationCount
            : null;

    const handleTransition = async (
        fn: () => Promise<VaccinationCampaign>,
        successMsg: string,
    ) => {
        try {
            await fn();
            toast.success(successMsg);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Operación fallida';
            toast.error(message);
        }
    };

    const handleMarkAttended = async (reg: VaccinationRegistration) => {
        try {
            await markAttendedMutation.mutateAsync({ registrationId: reg.id });
            toast.success('Asistencia registrada');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al registrar asistencia';
            toast.error(message);
        }
    };

    const handleMarkNoShow = async (reg: VaccinationRegistration) => {
        try {
            await markNoShowMutation.mutateAsync(reg.id);
            toast.success('Marcado como no-show');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al marcar no-show';
            toast.error(message);
        }
    };

    const handleCancelRegistration = async () => {
        if (!cancelRegId) return;
        try {
            await cancelRegMutation.mutateAsync(cancelRegId);
            toast.success('Inscripción cancelada');
            setCancelRegId(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al cancelar';
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(campaign.id);
            toast.success('Campaña eliminada');
            router.push('/clinic/vaccinations/campaigns');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Error al eliminar';
            toast.error(message);
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                    <Link href="/clinic/vaccinations/campaigns" aria-label="Volver">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
                        <Badge variant={STATUS_VARIANTS[campaign.status]}>
                            {STATUS_LABELS[campaign.status]}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{campaign.vaccineName}</p>
                </div>
                <div className="flex items-center gap-2">
                    {campaign.status === 'DRAFT' && (
                        <Button
                            size="sm"
                            onClick={() =>
                                handleTransition(
                                    () => openMutation.mutateAsync(campaign.id),
                                    'Campaña abierta — ya acepta inscripciones',
                                )
                            }
                            disabled={openMutation.isPending}
                        >
                            <Play className="mr-2 h-4 w-4" />
                            Abrir inscripciones
                        </Button>
                    )}
                    {campaign.status === 'OPEN' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                handleTransition(
                                    () => closeMutation.mutateAsync(campaign.id),
                                    'Inscripciones cerradas',
                                )
                            }
                            disabled={closeMutation.isPending}
                        >
                            <Pause className="mr-2 h-4 w-4" />
                            Cerrar inscripciones
                        </Button>
                    )}
                    {(campaign.status === 'OPEN' || campaign.status === 'CLOSED') && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                handleTransition(
                                    () => completeMutation.mutateAsync(campaign.id),
                                    'Campaña marcada como completada',
                                )
                            }
                            disabled={completeMutation.isPending}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Marcar completada
                        </Button>
                    )}
                    {campaign.status !== 'CANCELLED' && campaign.status !== 'COMPLETED' && (
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                                handleTransition(
                                    () => cancelMutation.mutateAsync(campaign.id),
                                    'Campaña cancelada',
                                )
                            }
                            disabled={cancelMutation.isPending}
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar campaña
                        </Button>
                    )}
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/clinic/vaccinations/campaigns/${campaign.id}/edit`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                        </Link>
                    </Button>
                    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>¿Eliminar esta campaña?</DialogTitle>
                                <DialogDescription>
                                    Esta acción no se puede deshacer. Se eliminarán también las
                                    inscripciones asociadas.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteOpen(false)}
                                    disabled={deleteMutation.isPending}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? 'Eliminando…' : 'Eliminar'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Inicio</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(campaign.startsAt)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Fin</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(campaign.endsAt)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Ubicación</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {campaign.location ?? 'Sin ubicación'}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Vacuna</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Syringe className="h-4 w-4" />
                            {campaign.vaccineName}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Precio</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            {formatPrice(campaign.priceCents, campaign.currency)}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Cupos</CardDescription>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {campaign.registrationCount ?? 0}
                            {campaign.capacity != null && ` / ${campaign.capacity}`}
                            {spotsLeft != null && (
                                <Badge
                                    variant={
                                        spotsLeft <= 0
                                            ? 'destructive'
                                            : spotsLeft < 10
                                            ? 'secondary'
                                            : 'outline'
                                    }
                                >
                                    {spotsLeft <= 0 ? 'Sin cupos' : `${spotsLeft} libres`}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {campaign.description && (
                <Card>
                    <CardHeader>
                        <CardTitle>Descripción</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {campaign.description}
                        </p>
                    </CardContent>
                </Card>
            )}

            {campaign.notes && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notas internas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {campaign.notes}
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Inscripciones</CardTitle>
                    <CardDescription>
                        {registrations.length === 0
                            ? 'Aún no hay mascotas inscritas'
                            : `${registrations.length} mascota${registrations.length === 1 ? '' : 's'} inscrita${registrations.length === 1 ? '' : 's'}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loadingRegs ? (
                        <p className="text-sm text-muted-foreground">Cargando…</p>
                    ) : registrations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Comparte esta campaña con los dueños de mascotas para que puedan
                            inscribir a sus peludos.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Mascota</TableHead>
                                    <TableHead>Dueño</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Inscrita</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {registrations.map((reg) => (
                                    <TableRow key={reg.id}>
                                        <TableCell className="font-medium">
                                            {reg.pet?.name ?? reg.petId}
                                        </TableCell>
                                        <TableCell>
                                            {reg.owner
                                                ? `${reg.owner.firstName} ${reg.owner.lastName}`
                                                : reg.ownerId}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    REGISTRATION_STATUS_VARIANTS[reg.status]
                                                }
                                            >
                                                {REGISTRATION_STATUS_LABELS[reg.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(reg.createdAt), 'd MMM yyyy', {
                                                locale: es,
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {reg.status === 'REGISTERED' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleMarkAttended(reg)}
                                                            disabled={
                                                                markAttendedMutation.isPending
                                                            }
                                                        >
                                                            Asistió
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleMarkNoShow(reg)}
                                                            disabled={
                                                                markNoShowMutation.isPending
                                                            }
                                                        >
                                                            No-show
                                                        </Button>
                                                        <Dialog
                                                            open={cancelRegId === reg.id}
                                                            onOpenChange={(open) =>
                                                                setCancelRegId(open ? reg.id : null)
                                                            }
                                                        >
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="text-destructive"
                                                                >
                                                                    Cancelar
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>
                                                                        ¿Cancelar la inscripción?
                                                                    </DialogTitle>
                                                                    <DialogDescription>
                                                                        La mascota no recibirá
                                                                        la vacuna en esta
                                                                        campaña.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <DialogFooter>
                                                                    <Button
                                                                        variant="outline"
                                                                        onClick={() =>
                                                                            setCancelRegId(null)
                                                                        }
                                                                    >
                                                                        Volver
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        onClick={
                                                                            handleCancelRegistration
                                                                        }
                                                                        disabled={
                                                                            cancelRegMutation.isPending
                                                                        }
                                                                    >
                                                                        {cancelRegMutation.isPending
                                                                            ? 'Cancelando…'
                                                                            : 'Sí, cancelar'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </>
                                                )}
                                                {reg.status !== 'REGISTERED' && (
                                                    <span className="text-xs text-muted-foreground">
                                                        —
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
