'use client';

import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Calendar, MapPin, Users, Edit3, Play, Pause, CheckCircle2, XCircle, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type {
    ApiVaccinationCampaignStatus,
    VaccinationCampaign,
} from '@nuvet/types';

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

import {
    useCancelCampaign,
    useCloseCampaign,
    useCompleteCampaign,
    useDeleteCampaign,
    useOpenCampaign,
    useVaccinationCampaigns,
} from '../../hooks/use-vaccination-campaigns';

/**
 * Vista admin · Lista de campañas de vacunación del tenant.
 *   - Tabla con filtros por status
 *   - Acciones inline: Open / Close / Complete / Cancel / Delete
 *   - Botón "+ Nueva campaña" → /clinic/vaccinations/campaigns/new
 */
export default function VaccinationCampaignsList() {
    const [statusFilter, setStatusFilter] = useState<ApiVaccinationCampaignStatus | ''>('');
    const [confirmingDelete, setConfirmingDelete] = useState<VaccinationCampaign | null>(null);

    const campaignsQuery = useVaccinationCampaigns(
        statusFilter ? { status: statusFilter } : {},
    );

    const open = useOpenCampaign();
    const close = useCloseCampaign();
    const complete = useCompleteCampaign();
    const cancel = useCancelCampaign();
    const del = useDeleteCampaign();

    if (campaignsQuery.isLoading) {
        return <div className="text-muted-foreground p-6 text-sm">Cargando campañas…</div>;
    }
    if (campaignsQuery.isError) {
        return (
            <div className="border-destructive/40 bg-destructive/10 text-destructive m-6 rounded-md border p-4 text-sm">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span>No pudimos cargar las campañas. Recargá la página.</span>
                </div>
            </div>
        );
    }

    const campaigns = campaignsQuery.data?.data ?? [];
    const total = campaignsQuery.data?.total ?? 0;

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Calendar className="text-primary h-6 w-6" />
                    <div>
                        <h1 className="text-2xl font-bold">Campañas de vacunación</h1>
                        <p className="text-muted-foreground text-sm">
                            Jornadas especiales: antirrábica, parvovirus, quíntuple, etc.
                        </p>
                    </div>
                </div>
                <Button asChild>
                    <Link href="/clinic/vaccinations/campaigns/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva campaña
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value as ApiVaccinationCampaignStatus | '',
                            )
                        }
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        aria-label="Filtrar por estado"
                    >
                        <option value="">Todos los estados</option>
                        <option value="DRAFT">Borrador</option>
                        <option value="OPEN">Abierta</option>
                        <option value="CLOSED">Cerrada</option>
                        <option value="COMPLETED">Completada</option>
                        <option value="CANCELLED">Cancelada</option>
                    </select>
                    <p className="text-muted-foreground text-sm">
                        {total} campaña{total === 1 ? '' : 's'} en total
                    </p>
                </CardContent>
            </Card>

            {campaigns.length === 0 ? (
                <Card>
                    <CardContent className="text-muted-foreground p-8 text-center text-sm">
                        Aún no has creado campañas. Hacé clic en{' '}
                        <strong>Nueva campaña</strong> para empezar.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {campaigns.map((c) => (
                        <CampaignRow
                            key={c.id}
                            campaign={c}
                            isMutating={
                                open.isPending ||
                                close.isPending ||
                                complete.isPending ||
                                cancel.isPending ||
                                del.isPending
                            }
                            onOpen={() =>
                                open.mutate(c.id, {
                                    onSuccess: () => toast.success('Campaña abierta'),
                                    onError: () => toast.error('No pudimos abrir la campaña'),
                                })
                            }
                            onClose={() =>
                                close.mutate(c.id, {
                                    onSuccess: () => toast.success('Inscripciones cerradas'),
                                    onError: () => toast.error('No pudimos cerrar'),
                                })
                            }
                            onComplete={() =>
                                complete.mutate(c.id, {
                                    onSuccess: () => toast.success('Campaña completada'),
                                    onError: () => toast.error('No pudimos completar'),
                                })
                            }
                            onCancel={() =>
                                cancel.mutate(c.id, {
                                    onSuccess: () => toast.success('Campaña cancelada'),
                                    onError: () => toast.error('No pudimos cancelar'),
                                })
                            }
                            onDeleteRequest={() => setConfirmingDelete(c)}
                        />
                    ))}
                </div>
            )}

            <Dialog
                open={confirmingDelete !== null}
                onOpenChange={(o) => {
                    if (!o) setConfirmingDelete(null);
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Eliminar {confirmingDelete?.name}</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. Si la campaña tiene
                            inscripciones, no se podrá eliminar — cancelala en su
                            lugar.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setConfirmingDelete(null)}
                        >
                            Volver
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (!confirmingDelete) return;
                                del.mutate(confirmingDelete.id, {
                                    onSuccess: () => {
                                        toast.success('Campaña eliminada');
                                        setConfirmingDelete(null);
                                    },
                                    onError: (err) => {
                                        const msg =
                                            (err as { response?: { data?: { message?: string } } })
                                                ?.response?.data?.message ??
                                            'No pudimos eliminar la campaña';
                                        toast.error(msg);
                                    },
                                });
                            }}
                            disabled={del.isPending}
                        >
                            {del.isPending ? 'Eliminando…' : 'Confirmar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

const STATUS_META: Record<ApiVaccinationCampaignStatus, {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
}> = {
    DRAFT: { label: 'Borrador', variant: 'outline' },
    OPEN: { label: 'Abierta', variant: 'default' },
    CLOSED: { label: 'Cerrada', variant: 'secondary' },
    COMPLETED: { label: 'Completada', variant: 'secondary' },
    CANCELLED: { label: 'Cancelada', variant: 'destructive' },
};

function CampaignRow({
    campaign,
    isMutating,
    onOpen,
    onClose,
    onComplete,
    onCancel,
    onDeleteRequest,
}: {
    campaign: VaccinationCampaign;
    isMutating: boolean;
    onOpen: () => void;
    onClose: () => void;
    onComplete: () => void;
    onCancel: () => void;
    onDeleteRequest: () => void;
}) {
    const meta = STATUS_META[campaign.status];
    return (
        <Card data-testid={`campaign-row-${campaign.id}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <CardDescription>
                        <span className="font-medium">{campaign.vaccineName}</span>
                        {campaign.location && (
                            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3" />
                                {campaign.location}
                            </span>
                        )}
                    </CardDescription>
                </div>
                <Badge variant={meta.variant}>{meta.label}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                    <div>
                        <div className="text-foreground text-xs font-semibold uppercase">
                            Inicio
                        </div>
                        <div>{formatDate(campaign.startsAt)}</div>
                    </div>
                    <div>
                        <div className="text-foreground text-xs font-semibold uppercase">
                            Fin
                        </div>
                        <div>{formatDate(campaign.endsAt)}</div>
                    </div>
                    <div>
                        <div className="text-foreground text-xs font-semibold uppercase">
                            Inscripciones
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {campaign.registrationCount ?? 0}
                            {campaign.capacity !== null && (
                                <span className="text-muted-foreground">
                                    / {campaign.capacity}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                        <Link href={`/clinic/vaccinations/campaigns/${campaign.id}`}>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Ver detalle
                        </Link>
                    </Button>
                    {campaign.status === 'DRAFT' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onOpen}
                            disabled={isMutating}
                        >
                            <Play className="mr-2 h-4 w-4 text-emerald-600" />
                            Abrir inscripciones
                        </Button>
                    )}
                    {campaign.status === 'OPEN' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                            disabled={isMutating}
                        >
                            <Pause className="mr-2 h-4 w-4 text-amber-600" />
                            Cerrar inscripciones
                        </Button>
                    )}
                    {(campaign.status === 'OPEN' || campaign.status === 'CLOSED') && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onComplete}
                            disabled={isMutating}
                        >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                            Marcar completada
                        </Button>
                    )}
                    {(campaign.status === 'DRAFT' ||
                        campaign.status === 'OPEN' ||
                        campaign.status === 'CLOSED') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            disabled={isMutating}
                            className="text-amber-600 hover:text-amber-600"
                        >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                        </Button>
                    )}
                    {campaign.registrationCount === 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onDeleteRequest}
                            disabled={isMutating}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function formatDate(iso: string): string {
    try {
        return format(new Date(iso), "d 'de' MMM, yyyy HH:mm", { locale: es });
    } catch {
        return iso;
    }
}
