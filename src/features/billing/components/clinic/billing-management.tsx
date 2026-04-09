'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveUserPermissions } from '@/shared/lib/permissions';
import { useExternalInvoiceStatus, useIssuePosTicketInvoice } from '@/features/billing/hooks/use-billing';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { Loader2, ReceiptText, SearchCheck } from 'lucide-react';
import { toast } from 'sonner';

export function BillingManagement() {
    const searchParams = useSearchParams();
    const initialTicketId = searchParams.get('ticketId')?.trim() ?? '';
    const initialProviderInvoiceId = searchParams.get('providerInvoiceId')?.trim() ?? '';
    const currentUser = useAuthStore((state) => state.user);
    const userPermissions = resolveUserPermissions(currentUser);

    const canCreateBilling = userPermissions.includes('billing:create' as never);
    const canReadBilling = userPermissions.includes('billing:read' as never);

    const [ticketId, setTicketId] = useState(initialTicketId);
    const [providerInvoiceId, setProviderInvoiceId] = useState(initialProviderInvoiceId);
    const [lastIssuedId, setLastIssuedId] = useState<string | null>(null);

    const [invoiceForm, setInvoiceForm] = useState({
        legalName: '',
        taxId: '',
        email: '',
        address: '',
        establishmentCode: '',
        emissionPointCode: '',
        asyncEmission: false,
    });

    const issueInvoice = useIssuePosTicketInvoice(ticketId.trim() || null);
    const statusQuery = useExternalInvoiceStatus(providerInvoiceId.trim() || null, {
        enabled: false,
    });
    const fromPos = searchParams.get('from') === 'pos';
    const focusStatus = searchParams.get('focus') === 'status';

    const canShowPage = canCreateBilling || canReadBilling;

    const payloadPreview = useMemo(() => {
        const hasBuyer = invoiceForm.legalName.trim() && invoiceForm.taxId.trim();
        return {
            buyer: hasBuyer
                ? {
                      legalName: invoiceForm.legalName.trim(),
                      taxId: invoiceForm.taxId.trim(),
                      email: invoiceForm.email.trim() || undefined,
                      address: invoiceForm.address.trim() || undefined,
                  }
                : undefined,
            establishmentCode: invoiceForm.establishmentCode.trim() || undefined,
            emissionPointCode: invoiceForm.emissionPointCode.trim() || undefined,
            asyncEmission: invoiceForm.asyncEmission,
        };
    }, [invoiceForm]);

    async function handleIssueInvoice() {
        if (!ticketId.trim()) {
            toast.warning('Ingresa un ticketId para emitir factura');
            return;
        }

        try {
            const result = await issueInvoice.mutateAsync(payloadPreview);
            setLastIssuedId(result.invoice.providerInvoiceId);
            setProviderInvoiceId(result.invoice.providerInvoiceId);
            toast.success(`Factura emitida. ID externo: ${result.invoice.providerInvoiceId}`);
        } catch (error: unknown) {
            const message =
                error && typeof error === 'object' && 'response' in error
                    ? (error as { response?: { data?: { message?: string; error?: { message?: string } } } }).response
                          ?.data?.error?.message ??
                      (error as { response?: { data?: { message?: string; error?: { message?: string } } } }).response
                          ?.data?.message
                    : undefined;
            toast.error(message ?? 'No se pudo emitir la factura electrónica');
        }
    }

    async function handleCheckStatus() {
        if (!providerInvoiceId.trim()) {
            toast.warning('Ingresa un providerInvoiceId para consultar estado');
            return;
        }
        await statusQuery.refetch();
    }

    if (!canShowPage) {
        return <ClinicStateCard message="No tienes permisos para acceder a facturación electrónica." />;
    }

    return (
        <div className="space-y-4">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">Facturación electrónica</h2>
                <p className="text-sm text-muted-foreground">
                    Emite facturas desde tickets POS completados y consulta su estado en el proveedor.
                </p>
                {fromPos ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                        Llegaste desde POS. Puedes emitir o consultar sin salir de este módulo centralizado.
                    </p>
                ) : null}
                {focusStatus ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                        Sugerencia: usa el panel de estado para validar la factura externa del ticket seleccionado.
                    </p>
                ) : null}
            </header>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <ReceiptText className="h-4 w-4" />
                            Emitir desde ticket POS
                        </CardTitle>
                        <CardDescription>
                            Solo aplica para tickets completados. Los campos del comprador son opcionales.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <label className="block space-y-1">
                            <span className="text-sm font-medium">Ticket ID</span>
                            <Input
                                placeholder="UUID del ticket POS"
                                value={ticketId}
                                onChange={(event) => setTicketId(event.target.value)}
                            />
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="block space-y-1 sm:col-span-2">
                                <span className="text-sm font-medium">Nombre legal (opcional)</span>
                                <Input
                                    placeholder="Cliente de Mostrador"
                                    value={invoiceForm.legalName}
                                    onChange={(event) =>
                                        setInvoiceForm((prev) => ({ ...prev, legalName: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="text-sm font-medium">Identificación (opcional)</span>
                                <Input
                                    placeholder="0999999999001"
                                    value={invoiceForm.taxId}
                                    onChange={(event) =>
                                        setInvoiceForm((prev) => ({ ...prev, taxId: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="text-sm font-medium">Email (opcional)</span>
                                <Input
                                    type="email"
                                    placeholder="cliente@correo.com"
                                    value={invoiceForm.email}
                                    onChange={(event) =>
                                        setInvoiceForm((prev) => ({ ...prev, email: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="block space-y-1 sm:col-span-2">
                                <span className="text-sm font-medium">Dirección (opcional)</span>
                                <Input
                                    placeholder="Quito - Ecuador"
                                    value={invoiceForm.address}
                                    onChange={(event) =>
                                        setInvoiceForm((prev) => ({ ...prev, address: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="text-sm font-medium">Establecimiento (opcional)</span>
                                <Input
                                    maxLength={3}
                                    placeholder="001"
                                    value={invoiceForm.establishmentCode}
                                    onChange={(event) =>
                                        setInvoiceForm((prev) => ({ ...prev, establishmentCode: event.target.value }))
                                    }
                                />
                            </label>
                            <label className="block space-y-1">
                                <span className="text-sm font-medium">Punto de emisión (opcional)</span>
                                <Input
                                    maxLength={3}
                                    placeholder="001"
                                    value={invoiceForm.emissionPointCode}
                                    onChange={(event) =>
                                        setInvoiceForm((prev) => ({ ...prev, emissionPointCode: event.target.value }))
                                    }
                                />
                            </label>
                        </div>

                        <label className="flex items-center gap-2">
                            <Checkbox
                                checked={invoiceForm.asyncEmission}
                                onCheckedChange={(checked) =>
                                    setInvoiceForm((prev) => ({ ...prev, asyncEmission: checked === true }))
                                }
                            />
                            <span className="text-sm text-muted-foreground">Emitir en modo asíncrono</span>
                        </label>

                        <Button
                            className="w-full"
                            disabled={!canCreateBilling || issueInvoice.isPending || !ticketId.trim()}
                            onClick={handleIssueInvoice}
                        >
                            {issueInvoice.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Emitir factura
                        </Button>

                        {lastIssuedId ? (
                            <p className="text-xs text-muted-foreground">
                                Última factura emitida: <strong>{lastIssuedId}</strong>
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <SearchCheck className="h-4 w-4" />
                            Consultar estado externo
                        </CardTitle>
                        <CardDescription>
                            Consulta estado de autorización usando providerInvoiceId.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <label className="block space-y-1">
                            <span className="text-sm font-medium">Provider invoice ID</span>
                            <Input
                                placeholder="ID externo del proveedor"
                                value={providerInvoiceId}
                                onChange={(event) => setProviderInvoiceId(event.target.value)}
                            />
                        </label>

                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={!canReadBilling || statusQuery.isFetching || !providerInvoiceId.trim()}
                            onClick={handleCheckStatus}
                        >
                            {statusQuery.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Consultar estado
                        </Button>

                        {statusQuery.isSuccess && statusQuery.data ? (
                            <div className="rounded-md border bg-muted/30 p-3 text-sm">
                                <p><strong>Estado:</strong> {statusQuery.data.providerStatus}</p>
                                <p><strong>Comprobante:</strong> {statusQuery.data.documentNumber ?? '—'}</p>
                                <p><strong>Clave de acceso:</strong> {statusQuery.data.accessKey ?? '—'}</p>
                                <p><strong>Autorizado en:</strong> {statusQuery.data.authorizedAt ?? '—'}</p>
                                <p><strong>Observación:</strong> {statusQuery.data.rejectedReason ?? '—'}</p>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
