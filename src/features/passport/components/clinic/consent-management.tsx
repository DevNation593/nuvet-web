'use client';

import { useState } from 'react';
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
import {
    ResponsiveDataTable,
    type ResponsiveColumn,
} from '@/shared/components/ui/responsive-data-table';
import {
    type Consent,
    type ConsentStatus,
    useGrantConsent,
    useMyConsents,
    useRevokeConsent,
} from '../../hooks/use-consent';
import { Share2, Trash2, Loader2, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_LABELS: Record<ConsentStatus, string> = {
    GRANTED: 'Activo',
    PENDING: 'Pendiente',
    REVOKED: 'Revocado',
    EXPIRED: 'Expirado',
};

const STATUS_VARIANTS: Record<ConsentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    GRANTED: 'default',
    PENDING: 'outline',
    REVOKED: 'destructive',
    EXPIRED: 'secondary',
};

export function ConsentManagement() {
    const { data, isLoading } = useMyConsents({ limit: 50 });
    const consents: Consent[] = data?.data ?? [];

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4" data-testid="consent-management">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold">Consentimientos otorgados</h2>
                    <p className="text-sm text-muted-foreground">
                        Comparte el historial de tu mascota con otras clínicas.
                    </p>
                </div>
                <GrantConsentDialog />
            </div>
            <ConsentsTable consents={consents} />
        </div>
    );
}

function ConsentsTable({ consents }: { consents: Consent[] }) {
    const revoke = useRevokeConsent();

    const emptyState = (
        <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
                <ClipboardList className="mx-auto h-8 w-8 mb-2" />
                <p>No has compartido historiales con otras clínicas todavía.</p>
            </CardContent>
        </Card>
    );

    const columns: ResponsiveColumn<Consent>[] = [
        {
            key: 'targetClinic',
            header: 'Clínica destino',
            cell: (c: Consent) => (
                <div>
                    <p className="font-medium">{c.targetClinicName ?? c.targetTenantId}</p>
                    <p className="text-xs text-muted-foreground font-mono">{c.targetTenantId}</p>
                </div>
            ),
            mobileLabel: 'Clínica',
        },
        {
            key: 'scopes',
            header: 'Permisos',
            cell: (c: Consent) => (
                <div className="flex flex-wrap gap-1">
                    {c.scopes.map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">
                            {s === 'PASSPORT_READ' ? 'Pasaporte' : 'Historial clínico'}
                        </Badge>
                    ))}
                </div>
            ),
            mobileLabel: 'Permisos',
        },
        {
            key: 'status',
            header: 'Estado',
            cell: (c: Consent) => (
                <Badge variant={STATUS_VARIANTS[c.status]}>
                    {STATUS_LABELS[c.status]}
                </Badge>
            ),
            mobileLabel: 'Estado',
        },
        {
            key: 'expiresAt',
            header: 'Expiración',
            cell: (c: Consent) =>
                c.expiresAt
                    ? new Date(c.expiresAt).toLocaleDateString('es-EC')
                    : 'Sin expiración',
            mobileLabel: 'Expiración',
        },
        {
            key: 'actions',
            header: 'Acciones',
            headerClassName: 'text-right',
            cell: (c: Consent) =>
                c.status === 'GRANTED' ? (
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            revoke.mutate(
                                { id: c.id, reason: 'Revocado desde la UI' },
                                {
                                    onSuccess: () =>
                                        toast.success('Consentimiento revocado'),
                                    onError: (e: unknown) =>
                                        toast.error(
                                            e instanceof Error
                                                ? e.message
                                                : 'Error al revocar',
                                        ),
                                },
                            )
                        }
                        aria-label="Revocar consentimiento"
                    >
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                ) : null,
            cellClassName: 'text-right',
            hideOnMobile: true,
        },
    ];

    const handleRevoke = (c: Consent) => {
        revoke.mutate(
            { id: c.id, reason: 'Revocado desde la UI' },
            {
                onSuccess: () => toast.success('Consentimiento revocado'),
                onError: (e: unknown) =>
                    toast.error(e instanceof Error ? e.message : 'Error al revocar'),
            },
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Historial de consentimientos</CardTitle>
                <CardDescription>
                    {consents.length} consentimiento{consents.length === 1 ? '' : 's'} registrados.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveDataTable
                    data={consents}
                    columns={columns}
                    getRowKey={(c) => c.id}
                    emptyState={emptyState}
                    getMobileTitle={(c) => c.targetClinicName ?? c.targetTenantId}
                    getMobileBadge={(c) => (
                        <Badge variant={STATUS_VARIANTS[c.status]}>
                            {STATUS_LABELS[c.status]}
                        </Badge>
                    )}
                    getMobileActions={(c) =>
                        c.status === 'GRANTED' ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRevoke(c)}
                            >
                                <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                                Revocar
                            </Button>
                        ) : null
                    }
                />
            </CardContent>
        </Card>
    );
}

function GrantConsentDialog() {
    const [open, setOpen] = useState(false);
    const [petId, setPetId] = useState('');
    const [tenantId, setTenantId] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const grant = useGrantConsent();

    const onSubmit = () => {
        if (!petId || !tenantId) {
            toast.error('Mascota y clínica destino son obligatorias');
            return;
        }
        grant.mutate(
            {
                petId,
                targetTenantId: tenantId,
                expiresAt: expiresAt || undefined,
                scopes: ['PASSPORT_READ'],
            },
            {
                onSuccess: () => {
                    toast.success('Consentimiento otorgado');
                    setOpen(false);
                    setPetId('');
                    setTenantId('');
                    setExpiresAt('');
                },
                onError: (e: unknown) =>
                    toast.error(e instanceof Error ? e.message : 'Error al otorgar'),
            },
        );
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir historial
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Compartir historial con otra clínica</DialogTitle>
                    <DialogDescription>
                        La clínica destino podrá leer el pasaporte médico de tu mascota hasta
                        que revoques el consentimiento.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium">ID de la mascota</label>
                        <input
                            type="text"
                            value={petId}
                            onChange={(e) => setPetId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
                            placeholder="uuid"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">ID de la clínica destino</label>
                        <input
                            type="text"
                            value={tenantId}
                            onChange={(e) => setTenantId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
                            placeholder="uuid"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Expiración (opcional)</label>
                        <input
                            type="date"
                            value={expiresAt}
                            onChange={(e) => setExpiresAt(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-md bg-background"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Si no la defines, el consentimiento permanece hasta que lo revoques.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                    </Button>
                    <Button onClick={onSubmit} disabled={grant.isPending}>
                        {grant.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Otorgar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}