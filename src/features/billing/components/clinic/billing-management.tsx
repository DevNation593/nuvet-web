'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveUserPermissions } from '@/shared/lib/permissions';
import {
    type ElectronicInvoiceStatus,
    type InvoiceListItem,
    type IssuedInvoice,
    useExternalInvoiceStatus,
    useInvoices,
    useIssuePosTicketInvoice,
} from '@/features/billing/hooks/use-billing';
import { fetchExternalInvoiceDocumentUrl } from '@/features/billing/services/billing-service';
import { isInvoicePendingStatus } from '@/features/billing/lib/invoice-status';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    FileText,
    Loader2,
    Plus,
    Printer,
    ReceiptText,
    Search,
    SearchCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const INVOICE_STATUS_VARIANT: Record<string, 'default' | 'outline' | 'secondary' | 'destructive' | 'scheduled'> = {
    AUTHORIZED: 'default',
    PENDING: 'secondary',
    SUBMITTED: 'secondary',
    PROCESSING: 'secondary',
    IN_PROGRESS: 'secondary',
    REJECTED: 'destructive',
    ERROR: 'destructive',
    CANCELLED: 'destructive',
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
    AUTHORIZED: 'Autorizada',
    PENDING: 'Pendiente',
    SUBMITTED: 'Enviada al SRI',
    PROCESSING: 'Procesando',
    IN_PROGRESS: 'En proceso',
    REJECTED: 'Rechazada',
    ERROR: 'Error',
    CANCELLED: 'Anulada',
};

const PAYMENT_LABELS: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    OTHER: 'Otro',
};

export function BillingManagement() {
    const searchParams = useSearchParams();
    const initialTicketId = searchParams.get('ticketId')?.trim() ?? '';
    const currentUser = useAuthStore((state) => state.user);
    const userPermissions = resolveUserPermissions(currentUser);

    const canCreateBilling = userPermissions.includes('billing:create' as never);
    const canReadBilling = userPermissions.includes('billing:read' as never);
    const canShowPage = canCreateBilling || canReadBilling;

    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [issueDialogOpen, setIssueDialogOpen] = useState(!!initialTicketId);
    const [detailInvoice, setDetailInvoice] = useState<InvoiceListItem | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const queryParams = useMemo(() => ({
        page,
        limit: 15,
        ...(statusFilter && { invoiceStatus: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
        ...(debouncedSearch && { search: debouncedSearch }),
    }), [page, statusFilter, dateFrom, dateTo, debouncedSearch]);

    const invoicesQ = useInvoices(queryParams, { enabled: canReadBilling });
    const invoices = invoicesQ.data?.data ?? [];
    const meta = invoicesQ.data?.meta as
        | { page: number; totalPages: number; total: number; hasNextPage: boolean; hasPrevPage: boolean }
        | undefined;

    if (!canShowPage) {
        return <ClinicStateCard message="No tienes permisos para acceder a facturación electrónica." />;
    }

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Facturación electrónica</h2>
                    <p className="text-sm text-muted-foreground">
                        Facturas emitidas desde el punto de venta
                    </p>
                </div>
                {canCreateBilling && (
                    <Button onClick={() => setIssueDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Emitir factura
                    </Button>
                )}
            </header>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por N° factura, clave de acceso, cliente..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                            />
                        </div>
                        <select
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            aria-label="Filtrar por estado"
                        >
                            <option value="">Todos los estados</option>
                            <option value="AUTHORIZED">Autorizada (SRI)</option>
                            <option value="PENDING">Pendiente</option>
                            <option value="SUBMITTED">Enviada al SRI</option>
                            <option value="REJECTED">Rechazada (SRI)</option>
                            <option value="ERROR">Error</option>
                        </select>
                        <Input
                            type="date"
                            className="w-[160px]"
                            value={dateFrom}
                            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                            aria-label="Fecha desde"
                        />
                        <Input
                            type="date"
                            className="w-[160px]"
                            value={dateTo}
                            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                            aria-label="Fecha hasta"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Invoices Table */}
            <Card>
                <CardContent className="p-0">
                    {invoicesQ.isLoading ? (
                        <div className="p-4"><ClinicRowsSkeleton /></div>
                    ) : invoices.length === 0 ? (
                        <div className="p-8">
                            <ClinicStateCard
                                message={debouncedSearch || statusFilter || dateFrom || dateTo
                                    ? 'No se encontraron facturas con los filtros aplicados.'
                                    : 'No hay facturas electrónicas emitidas.'}
                            />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left">
                                        <th className="px-4 py-3 font-medium">N° Factura</th>
                                        <th className="px-4 py-3 font-medium">Cliente</th>
                                        <th className="px-4 py-3 font-medium">Total</th>
                                        <th className="px-4 py-3 font-medium">Pago</th>
                                        <th className="px-4 py-3 font-medium">Estado</th>
                                        <th className="px-4 py-3 font-medium">Emisión</th>
                                        <th className="px-4 py-3 font-medium text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv) => (
                                        <tr key={inv.id} className="border-b hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-mono text-xs font-medium">
                                                    {inv.invoiceNumber ?? '—'}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground truncate max-w-[180px]" title={inv.providerInvoiceId}>
                                                    {inv.providerInvoiceId}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {inv.client ? (
                                                    <div>
                                                        <p className="font-medium text-xs">{inv.client.name || 'Sin nombre'}</p>
                                                        {inv.client.identification && (
                                                            <p className="text-[10px] text-muted-foreground">{inv.client.identification}</p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">Consumidor final</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs font-semibold">
                                                ${inv.total.toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {PAYMENT_LABELS[inv.paymentMethod] ?? inv.paymentMethod}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge variant={INVOICE_STATUS_VARIANT[inv.invoiceStatus?.toUpperCase()] ?? 'outline'}>
                                                    {INVOICE_STATUS_LABEL[inv.invoiceStatus?.toUpperCase()] ?? inv.invoiceStatus ?? 'N/D'}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                                {inv.issuedAt
                                                    ? format(new Date(inv.issuedAt), 'dd MMM yyyy HH:mm', { locale: es })
                                                    : format(new Date(inv.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        title="Ver detalle"
                                                        onClick={() => setDetailInvoice(inv)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        title={inv.accessKey ? 'Descargar PDF' : 'PDF no disponible (sin clave de acceso)'}
                                                        disabled={!inv.accessKey}
                                                        onClick={() => void openDocument(inv.providerInvoiceId, 'pdf')}
                                                    >
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        title={inv.accessKey ? 'Descargar XML' : 'XML no disponible (sin clave de acceso)'}
                                                        disabled={!inv.accessKey}
                                                        onClick={() => void openDocument(inv.providerInvoiceId, 'xml')}
                                                    >
                                                        <Download className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {meta && meta.totalPages > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
                            <span>
                                Página {meta.page} de {meta.totalPages} ({meta.total} facturas)
                            </span>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={!meta.hasPrevPage}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    disabled={!meta.hasNextPage}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Issue Invoice Dialog */}
            <IssueInvoiceDialog
                open={issueDialogOpen}
                onOpenChange={setIssueDialogOpen}
                initialTicketId={initialTicketId}
                canCreate={canCreateBilling}
            />

            {/* Invoice Detail Dialog */}
            <InvoiceDetailDialog
                invoice={detailInvoice}
                onClose={() => setDetailInvoice(null)}
            />
        </div>
    );
}

// ─── Issue Invoice Dialog ──────────────────────────────────────────────────────

function IssueInvoiceDialog({
    open,
    onOpenChange,
    initialTicketId,
    canCreate,
}: {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initialTicketId: string;
    canCreate: boolean;
}) {
    const [ticketId, setTicketId] = useState(initialTicketId);
    const [lastIssuedInvoice, setLastIssuedInvoice] = useState<IssuedInvoice | null>(null);
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

    async function handleIssue() {
        if (!ticketId.trim()) {
            toast.warning('Ingresa un ticketId para emitir factura');
            return;
        }
        try {
            const result = await issueInvoice.mutateAsync(payloadPreview);
            setLastIssuedInvoice(result.invoice);
            toast.success(`Factura emitida. N°: ${result.invoice.documentNumber ?? result.invoice.providerInvoiceId}`);
        } catch (error: unknown) {
            const message = extractErrorMessage(error);
            toast.error(message ?? 'No se pudo emitir la factura electrónica');
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ReceiptText className="h-5 w-5" />
                        Emitir factura desde ticket POS
                    </DialogTitle>
                    <DialogDescription>
                        Ingresa el ID del ticket completado y opcionalmente los datos del comprador.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                    <label className="block space-y-1">
                        <span className="text-sm font-medium">Ticket ID</span>
                        <Input
                            placeholder="UUID del ticket POS"
                            value={ticketId}
                            onChange={(e) => setTicketId(e.target.value)}
                        />
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block space-y-1 sm:col-span-2">
                            <span className="text-sm font-medium">Nombre legal (opcional)</span>
                            <Input
                                placeholder="Cliente de Mostrador"
                                value={invoiceForm.legalName}
                                onChange={(e) => setInvoiceForm((p) => ({ ...p, legalName: e.target.value }))}
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-sm font-medium">Identificación (opcional)</span>
                            <Input
                                placeholder="0999999999001"
                                value={invoiceForm.taxId}
                                onChange={(e) => setInvoiceForm((p) => ({ ...p, taxId: e.target.value }))}
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-sm font-medium">Email (opcional)</span>
                            <Input
                                type="email"
                                placeholder="cliente@correo.com"
                                value={invoiceForm.email}
                                onChange={(e) => setInvoiceForm((p) => ({ ...p, email: e.target.value }))}
                            />
                        </label>
                        <label className="block space-y-1 sm:col-span-2">
                            <span className="text-sm font-medium">Dirección (opcional)</span>
                            <Input
                                placeholder="Quito - Ecuador"
                                value={invoiceForm.address}
                                onChange={(e) => setInvoiceForm((p) => ({ ...p, address: e.target.value }))}
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-sm font-medium">Establecimiento</span>
                            <Input
                                maxLength={3}
                                placeholder="001"
                                value={invoiceForm.establishmentCode}
                                onChange={(e) => setInvoiceForm((p) => ({ ...p, establishmentCode: e.target.value }))}
                            />
                        </label>
                        <label className="block space-y-1">
                            <span className="text-sm font-medium">Punto de emisión</span>
                            <Input
                                maxLength={3}
                                placeholder="001"
                                value={invoiceForm.emissionPointCode}
                                onChange={(e) => setInvoiceForm((p) => ({ ...p, emissionPointCode: e.target.value }))}
                            />
                        </label>
                    </div>

                    <label className="flex items-center gap-2">
                        <Checkbox
                            checked={invoiceForm.asyncEmission}
                            onCheckedChange={(checked) =>
                                setInvoiceForm((p) => ({ ...p, asyncEmission: checked === true }))
                            }
                        />
                        <span className="text-sm text-muted-foreground">Emitir en modo asíncrono</span>
                    </label>

                    <Button
                        className="w-full"
                        disabled={!canCreate || issueInvoice.isPending || !ticketId.trim()}
                        onClick={() => void handleIssue()}
                    >
                        {issueInvoice.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Emitir factura
                    </Button>

                    {lastIssuedInvoice && (
                        <div className="space-y-2 rounded-md border bg-muted/30 p-3">
                            <p className="text-xs font-medium">Factura emitida exitosamente</p>
                            <p className="text-xs text-muted-foreground">
                                <strong>ID:</strong> {lastIssuedInvoice.providerInvoiceId}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                <strong>Estado:</strong> {lastIssuedInvoice.providerStatus}
                            </p>
                            {lastIssuedInvoice.documentNumber && (
                                <p className="text-xs text-muted-foreground">
                                    <strong>N°:</strong> {lastIssuedInvoice.documentNumber}
                                </p>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => void openDocument(lastIssuedInvoice.providerInvoiceId, 'pdf')}
                                >
                                    <FileText className="mr-1 h-3 w-3" /> PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => void openDocument(lastIssuedInvoice.providerInvoiceId, 'xml')}
                                >
                                    <Download className="mr-1 h-3 w-3" /> XML
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Invoice Detail Dialog ─────────────────────────────────────────────────────

function InvoiceDetailDialog({
    invoice,
    onClose,
}: {
    invoice: InvoiceListItem | null;
    onClose: () => void;
}) {
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [externalStatus, setExternalStatus] = useState<ElectronicInvoiceStatus | null>(null);

    async function handleCheckStatus() {
        if (!invoice?.providerInvoiceId) return;
        setCheckingStatus(true);
        try {
            const { fetchExternalInvoiceStatus } = await import('@/features/billing/services/billing-service');
            const status = await fetchExternalInvoiceStatus(invoice.providerInvoiceId);
            setExternalStatus(status);
        } catch {
            toast.error('No se pudo consultar el estado externo');
        } finally {
            setCheckingStatus(false);
        }
    }

    useEffect(() => {
        if (!invoice) {
            setExternalStatus(null);
        }
    }, [invoice]);

    if (!invoice) return null;

    return (
        <Dialog open={!!invoice} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Detalle de factura
                    </DialogTitle>
                    <DialogDescription>
                        Factura {invoice.invoiceNumber ?? invoice.providerInvoiceId}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Invoice Info */}
                    <div className="grid gap-3 sm:grid-cols-2 text-sm">
                        <div>
                            <span className="text-muted-foreground">N° Factura</span>
                            <p className="font-mono font-medium">{invoice.invoiceNumber ?? '—'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Provider ID</span>
                            <p className="font-mono text-xs break-all">{invoice.providerInvoiceId}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Estado SRI</span>
                            <div className="mt-0.5">
                                <Badge variant={INVOICE_STATUS_VARIANT[invoice.invoiceStatus?.toUpperCase()] ?? 'outline'}>
                                    {INVOICE_STATUS_LABEL[invoice.invoiceStatus?.toUpperCase()] ?? invoice.invoiceStatus ?? 'N/D'}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Método de pago</span>
                            <p className="font-medium">{PAYMENT_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod}</p>
                        </div>
                        {invoice.accessKey && (
                            <div className="sm:col-span-2">
                                <span className="text-muted-foreground">Clave de acceso</span>
                                <p className="font-mono text-xs break-all">{invoice.accessKey}</p>
                            </div>
                        )}
                        <div>
                            <span className="text-muted-foreground">Emisión</span>
                            <p>{invoice.issuedAt
                                ? format(new Date(invoice.issuedAt), "dd MMM yyyy HH:mm", { locale: es })
                                : '—'}</p>
                        </div>
                        {invoice.authorizedAt && (
                            <div>
                                <span className="text-muted-foreground">Autorización</span>
                                <p>{format(new Date(invoice.authorizedAt), "dd MMM yyyy HH:mm", { locale: es })}</p>
                            </div>
                        )}
                    </div>

                    {/* Client */}
                    {invoice.client && (
                        <div className="rounded-md border p-3 text-sm">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Cliente</p>
                            <p className="font-medium">{invoice.client.name || 'Consumidor Final'}</p>
                            {invoice.client.identification && (
                                <p className="text-muted-foreground">{invoice.client.identification}</p>
                            )}
                            {invoice.client.email && (
                                <p className="text-muted-foreground">{invoice.client.email}</p>
                            )}
                        </div>
                    )}

                    {/* Items */}
                    {invoice.items.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-2">Detalle de items</p>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="px-3 py-2 text-left font-medium">Descripción</th>
                                            <th className="px-3 py-2 text-right font-medium">Cant.</th>
                                            <th className="px-3 py-2 text-right font-medium">P. Unit.</th>
                                            <th className="px-3 py-2 text-right font-medium">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoice.items.map((item, idx) => (
                                            <tr key={idx} className="border-b last:border-0">
                                                <td className="px-3 py-2">{item.description}</td>
                                                <td className="px-3 py-2 text-right">{item.quantity}</td>
                                                <td className="px-3 py-2 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                                                <td className="px-3 py-2 text-right font-mono">${item.total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="flex justify-end">
                        <div className="w-48 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">${invoice.subtotal.toFixed(2)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Descuento</span>
                                    <span className="font-mono text-red-500">-${invoice.discount.toFixed(2)}</span>
                                </div>
                            )}
                            {invoice.tax > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">IVA</span>
                                    <span className="font-mono">${invoice.tax.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-1 font-semibold">
                                <span>Total</span>
                                <span className="font-mono">${invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* External status */}
                    {externalStatus && (
                        <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Estado externo (proveedor)</p>
                            <p><strong>Estado:</strong> {externalStatus.providerStatus}</p>
                            {externalStatus.documentNumber && <p><strong>Comprobante:</strong> {externalStatus.documentNumber}</p>}
                            {externalStatus.accessKey && <p><strong>Clave:</strong> <span className="font-mono text-xs break-all">{externalStatus.accessKey}</span></p>}
                            {externalStatus.authorizedAt && <p><strong>Autorizado:</strong> {externalStatus.authorizedAt}</p>}
                            {externalStatus.rejectedReason && <p className="text-destructive"><strong>Motivo rechazo:</strong> {externalStatus.rejectedReason}</p>}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleCheckStatus()}
                            disabled={checkingStatus}
                        >
                            {checkingStatus ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <SearchCheck className="mr-1 h-3 w-3" />}
                            Consultar estado
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!invoice.accessKey}
                            title={invoice.accessKey ? undefined : 'PDF no disponible (sin clave de acceso)'}
                            onClick={() => void openDocument(invoice.providerInvoiceId, 'pdf')}
                        >
                            <FileText className="mr-1 h-3 w-3" /> Ver PDF
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!invoice.accessKey}
                            title={invoice.accessKey ? undefined : 'XML no disponible (sin clave de acceso)'}
                            onClick={() => void openDocument(invoice.providerInvoiceId, 'xml')}
                        >
                            <Download className="mr-1 h-3 w-3" /> Descargar XML
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void printInvoice(invoice)}
                        >
                            <Printer className="mr-1 h-3 w-3" /> Imprimir
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

async function openDocument(providerInvoiceId: string, format: 'pdf' | 'xml') {
    try {
        const doc = await fetchExternalInvoiceDocumentUrl(providerInvoiceId, format);
        const tab = window.open(doc.url, '_blank', 'noopener,noreferrer');
        if (!tab) {
            toast.error(`El navegador bloqueó la apertura del ${format.toUpperCase()}. Habilita popups.`);
        }
    } catch {
        toast.warning(`No se pudo obtener el ${format.toUpperCase()} de esta factura.`);
    }
}

function printInvoice(invoice: InvoiceListItem) {
    const popup = window.open('', '_blank', 'noopener,noreferrer,width=760,height=920');
    if (!popup) {
        toast.error('No se pudo abrir la vista de impresión.');
        return;
    }

    const itemsHtml = invoice.items.map((item) =>
        `<tr>
            <td style="padding:4px 8px;border-bottom:1px solid #e2e8f0">${item.description}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;text-align:right">${item.quantity}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;text-align:right">$${item.unitPrice.toFixed(2)}</td>
            <td style="padding:4px 8px;border-bottom:1px solid #e2e8f0;text-align:right">$${item.total.toFixed(2)}</td>
        </tr>`
    ).join('');

    popup.document.write(`<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <title>Factura ${invoice.invoiceNumber ?? invoice.providerInvoiceId}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; font-size: 13px; }
        h1 { margin: 0 0 4px; font-size: 20px; }
        .meta { color: #64748b; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th { text-align: left; padding: 6px 8px; background: #f1f5f9; font-size: 12px; }
        .totals { text-align: right; margin-top: 12px; }
        .totals .row { margin: 4px 0; }
        .totals .total-row { font-weight: bold; font-size: 15px; border-top: 2px solid #0f172a; padding-top: 4px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
        .info-grid .label { color: #64748b; font-size: 11px; }
    </style>
</head>
<body>
    <h1>Factura electrónica</h1>
    <p class="meta">${invoice.invoiceNumber ?? 'Sin número'} — ${new Date().toLocaleString('es-EC')}</p>
    <div class="info-grid">
        <div><span class="label">Provider ID</span><br/>${invoice.providerInvoiceId}</div>
        <div><span class="label">Estado</span><br/>${invoice.invoiceStatus ?? 'N/D'}</div>
        <div><span class="label">Cliente</span><br/>${invoice.client?.name || 'Consumidor Final'}${invoice.client?.identification ? ` (${invoice.client.identification})` : ''}</div>
        <div><span class="label">Método de pago</span><br/>${PAYMENT_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod}</div>
        ${invoice.accessKey ? `<div style="grid-column:span 2"><span class="label">Clave de acceso</span><br/><span style="font-family:monospace;font-size:11px;word-break:break-all">${invoice.accessKey}</span></div>` : ''}
    </div>
    <table>
        <thead><tr><th>Descripción</th><th style="text-align:right">Cant.</th><th style="text-align:right">P. Unit.</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>${itemsHtml}</tbody>
    </table>
    <div class="totals">
        <div class="row">Subtotal: $${invoice.subtotal.toFixed(2)}</div>
        ${invoice.discount > 0 ? `<div class="row">Descuento: -$${invoice.discount.toFixed(2)}</div>` : ''}
        ${invoice.tax > 0 ? `<div class="row">IVA: $${invoice.tax.toFixed(2)}</div>` : ''}
        <div class="row total-row">Total: $${invoice.total.toFixed(2)}</div>
    </div>
</body>
</html>`);
    popup.document.close();
    popup.focus();
    popup.print();
}

function extractErrorMessage(error: unknown): string | undefined {
    if (!error || typeof error !== 'object' || !('response' in error)) return undefined;
    const resp = (error as { response?: { data?: { message?: string; error?: { message?: string } } } }).response;
    return resp?.data?.error?.message ?? resp?.data?.message;
}
