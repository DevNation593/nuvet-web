'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import {
    type PaymentMethod,
    type PosRegisterClosureReport,
    type PosTicketStatus,
    type PosCartItem,
    type PosTransaction,
    type CreatePosTransactionInput,
    useCreatePosTransaction,
    usePosDiscounts,
    usePosDailySummary,
    usePosRegisters,
    useRegisterClosureReport,
    usePosTransactions,
    useVoidPosTransaction,
} from '@/features/pos/hooks/use-pos';
import { useProducts, type Product } from '@/features/store/hooks/use-store';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveUserPermissions } from '@/shared/lib/permissions';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    BadgeDollarSign,
    BarChart3,
    CreditCard,
    Download,
    Loader2,
    Minus,
    Plus,
    Printer,
    ReceiptText,
    Search,
    ShoppingCart,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    fetchExternalInvoiceDocumentUrl,
    fetchExternalInvoiceStatus,
    fetchTicketInvoiceStatus,
} from '@/features/billing/services/billing-service';
import { isInvoicePendingStatus } from '@/features/billing/lib/invoice-status';
import { fetchRegisterClosureReport } from '@/features/pos/services/pos-service';
import { useBranchesStore } from '@/features/branches/store/branches.store';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    OTHER: 'Otro',
};

const POS_STATUS_LABELS: Record<PosTicketStatus, string> = {
    OPEN: 'Abierto',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    PARTIAL_REFUND: 'Reembolso parcial',
    REFUNDED: 'Reembolsado',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function PosScreen() {
    const [view, setView] = useState<'pos' | 'history'>('pos');

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Punto de Venta</h2>
                    <p className="text-sm text-muted-foreground">Procesa ventas rápidas con inventario en tiempo real</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={view === 'pos' ? 'default' : 'outline'}
                        title="Ver caja registradora"
                        onClick={() => setView('pos')}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Caja
                    </Button>
                    <Button
                        variant={view === 'history' ? 'default' : 'outline'}
                        title="Ver historial de ventas"
                        onClick={() => setView('history')}
                    >
                        <ReceiptText className="mr-2 h-4 w-4" />
                        Historial
                    </Button>
                </div>
            </header>

            <DailySummaryBar />

            {view === 'pos' ? <PosRegister /> : <TransactionHistory />}
        </div>
    );
}

// ─── Daily Summary Bar ────────────────────────────────────────────────────────

function DailySummaryBar() {
    const today = new Date().toISOString().slice(0, 10);
    const summaryQ = usePosDailySummary(today);
    const summary = summaryQ.data;

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard
                label="Ventas hoy"
                value={summary?.totalTransactions ?? 0}
                sub="transacciones"
                icon={<BarChart3 className="h-5 w-5 text-muted-foreground" />}
            />
            <SummaryCard
                label="Ingresos hoy"
                value={`$${(summary?.totalRevenue ?? 0).toFixed(2)}`}
                sub="monto total"
                icon={<BadgeDollarSign className="h-5 w-5 text-green-500" />}
                highlight
            />
            <SummaryCard
                label="Descuentos"
                value={`$${(summary?.totalDiscount ?? 0).toFixed(2)}`}
                sub="aplicados"
                icon={<Tag className="h-5 w-5 text-muted-foreground" />}
            />
            <SummaryCard
                label="Efectivo"
                value={`$${(summary?.byPaymentMethod?.CASH?.total ?? 0).toFixed(2)}`}
                sub={`${summary?.byPaymentMethod?.CASH?.count ?? 0} transacciones`}
                icon={<CreditCard className="h-5 w-5 text-muted-foreground" />}
            />
        </div>
    );
}

// ─── POS Register ─────────────────────────────────────────────────────────────

function PosRegister() {
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState<PosCartItem[]>([]);
    const [selectedPromotionId, setSelectedPromotionId] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ id?: string; code: string; type: string; value: number } | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const activeBranchId = useBranchesStore((s) => s.activeBranchId);
    const productsQ = useProducts({ limit: 100 });
    const discountsQ = usePosDiscounts();
    const createTransaction = useCreatePosTransaction();

    const products = useMemo(
        () =>
            (productsQ.data?.data ?? []).filter(
                (p) =>
                    p.isActive &&
                    p.stock > 0 &&
                    (search === '' ||
                        p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.sku.toLowerCase().includes(search.toLowerCase())),
            ),
        [productsQ.data, search],
    );

    // ─── Cart calculations ───────────────────────────────────────────────────

    const subtotal = useMemo(
        () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
        [cart],
    );

    const promoDiscount = useMemo(() => {
        if (!appliedPromo) return 0;
        if (appliedPromo.type === 'PERCENTAGE') return (subtotal * appliedPromo.value) / 100;
        if (appliedPromo.type === 'FIXED_AMOUNT' || appliedPromo.type === 'FIXED') return Math.min(appliedPromo.value, subtotal);
        return 0;
    }, [appliedPromo, subtotal]);

    const total = Math.max(0, subtotal - promoDiscount);

    // ─── Cart actions ────────────────────────────────────────────────────────

    function addToCart(product: Product) {
        setCart((prev) => {
            const existing = prev.find((i) => i.productId === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    toast.warning(`Solo hay ${product.stock} unidades disponibles`);
                    return prev;
                }
                return prev.map((i) =>
                    i.productId === product.id
                        ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
                        : i,
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    productName: product.name,
                    sku: product.sku,
                    unitPrice: product.price,
                    quantity: 1,
                    discount: 0,
                    total: product.price,
                },
            ];
        });
    }

    function updateQty(productId: string, delta: number, maxStock: number) {
        setCart((prev) =>
            prev
                .map((i) => {
                    if (i.productId !== productId) return i;
                    const newQty = Math.max(0, Math.min(i.quantity + delta, maxStock));
                    return { ...i, quantity: newQty, total: newQty * i.unitPrice };
                })
                .filter((i) => i.quantity > 0),
        );
    }

    function removeFromCart(productId: string) {
        setCart((prev) => prev.filter((i) => i.productId !== productId));
    }

    function clearCart() {
        setCart([]);
        setAppliedPromo(null);
        setSelectedPromotionId('');
    }

    // ─── Promotion ───────────────────────────────────────────────────────────

    function applyPromoCode() {
        if (!selectedPromotionId) return;
        const selectedDiscount = (discountsQ.data ?? []).find((discount) => discount.id === selectedPromotionId);
        if (!selectedDiscount) {
            toast.error('Descuento no disponible');
            return;
        }

        setAppliedPromo({
            id: selectedDiscount.id,
            code: selectedDiscount.name,
            type: selectedDiscount.type,
            value: Number(selectedDiscount.value ?? 0),
        });
        toast.success(`Descuento "${selectedDiscount.name}" aplicado`);
    }

    // ─── Checkout ────────────────────────────────────────────────────────────

    async function processPayment(
        paymentMethod: PaymentMethod,
        cashReceived?: number,
        notes?: string,
        invoice?: CreatePosTransactionInput['invoice'],
    ) {
        try {
            const result = await createTransaction.mutateAsync({
                items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
                paymentMethod,
                promotionCode: appliedPromo?.id,
                cashReceived,
                notes,
                branchId: activeBranchId ?? undefined,
                invoice,
            });

            if (result.invoiceIssueError) {
                toast.warning(
                    `Venta procesada (Recibo: ${result.receiptNumber}), pero la factura no se pudo emitir: ${result.invoiceIssueError}`,
                    { duration: 8000 },
                );
            } else if (result.invoice?.providerInvoiceId) {
                toast.success(
                    `Venta procesada — Recibo: ${result.receiptNumber} — Factura: ${result.invoice.documentNumber ?? result.invoice.providerInvoiceId}`,
                );
            } else {
                toast.success(`Venta procesada — Recibo: ${result.receiptNumber}`);
            }

            clearCart();
            setPaymentModalOpen(false);
        } catch (error: unknown) {
            const msg =
                error && typeof error === 'object' && 'response' in error
                    ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                    : undefined;
            toast.error(msg ?? 'No se pudo procesar la venta');
        }
    }

    return (
        <div className="grid gap-4 lg:grid-cols-5">
            {/* ── Product Panel ── */}
            <div className="space-y-3 lg:col-span-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm"
                        placeholder="Buscar producto por nombre o SKU…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {productsQ.isLoading ? (
                    <ClinicRowsSkeleton rows={6} />
                ) : products.length === 0 ? (
                    <ClinicStateCard message="Sin productos disponibles." />
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {products.map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                className="flex flex-col rounded-lg border bg-card p-3 text-left shadow-sm transition-all hover:border-primary hover:shadow"
                                onClick={() => addToCart(product)}
                            >
                                <span className="mb-1 text-xs font-mono text-muted-foreground">{product.sku}</span>
                                <span className="text-sm font-medium leading-tight line-clamp-2">{product.name}</span>
                                <div className="mt-2 flex items-end justify-between">
                                    <span className="text-base font-bold text-primary">${product.price.toFixed(2)}</span>
                                    <span className="text-xs text-muted-foreground">
                                        Stock: {product.stock}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Cart ── */}
            <div className="lg:col-span-2">
                <Card className="sticky top-4">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base">
                            <ShoppingCart className="mr-2 inline-block h-4 w-4" />
                            Carrito
                        </CardTitle>
                        {cart.length > 0 && (
                            <Button size="sm" variant="ghost" title="Vaciar carrito de productos" onClick={clearCart}>
                                <X className="mr-1 h-3.5 w-3.5" /> Vaciar
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {cart.length === 0 ? (
                            <p className="py-4 text-center text-sm text-muted-foreground">
                                Selecciona productos del panel
                            </p>
                        ) : (
                            <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                                {cart.map((item) => {
                                    const stock = productsQ.data?.data.find((p) => p.id === item.productId)?.stock ?? 999;
                                    return (
                                        <div key={item.productId} className="flex items-center gap-2 rounded-md border p-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-xs font-medium">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">${item.unitPrice.toFixed(2)} c/u</p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    className="rounded p-0.5 hover:bg-muted"
                                                    aria-label="Disminuir cantidad"
                                                    title="Disminuir cantidad"
                                                    onClick={() => updateQty(item.productId, -1, stock)}
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-5 text-center text-sm tabular-nums">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    className="rounded p-0.5 hover:bg-muted"
                                                    aria-label="Aumentar cantidad"
                                                    title="Aumentar cantidad"
                                                    onClick={() => updateQty(item.productId, 1, stock)}
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                            <span className="w-14 text-right text-xs font-semibold tabular-nums">
                                                ${item.total.toFixed(2)}
                                            </span>
                                            <button
                                                type="button"
                                                className="rounded p-0.5 hover:bg-muted text-destructive"
                                                aria-label="Eliminar producto"
                                                title="Eliminar producto"
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Promotion selector */}
                        <div className="flex gap-1.5">
                            <div className="relative flex-1">
                                <Tag className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <select
                                    className="h-9 w-full rounded-md border border-input pl-7 pr-3 text-xs"
                                    aria-label="Seleccionar descuento"
                                    title="Seleccionar descuento"
                                    value={selectedPromotionId}
                                    onChange={(e) => setSelectedPromotionId(e.target.value)}
                                >
                                    <option value="">Seleccionar descuento activo</option>
                                    {(discountsQ.data ?? []).map((discount) => (
                                        <option key={discount.id} value={discount.id}>
                                            {discount.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                title="Aplicar código de promoción"
                                onClick={applyPromoCode}
                                disabled={!selectedPromotionId}
                            >
                                Aplicar
                            </Button>
                        </div>

                        {appliedPromo && (
                            <div className="flex items-center justify-between rounded-md bg-green-50 px-3 py-1.5 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                <span>
                                    <strong>{appliedPromo.code}</strong> —{' '}
                                    {appliedPromo.type === 'PERCENTAGE'
                                        ? `${appliedPromo.value}% de descuento`
                                        : `$${appliedPromo.value} de descuento`}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Quitar promoción"
                                    title="Quitar promoción"
                                    onClick={() => {
                                        setAppliedPromo(null);
                                        setSelectedPromotionId('');
                                    }}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}

                        {/* Totals */}
                        <div className="space-y-1 border-t pt-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {promoDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Descuento</span>
                                    <span>−${promoDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t pt-1 text-base font-bold">
                                <span>TOTAL</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            title="Proceder al cobro"
                            disabled={cart.length === 0}
                            onClick={() => setPaymentModalOpen(true)}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Cobrar ${total.toFixed(2)}
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                open={paymentModalOpen}
                onOpenChange={setPaymentModalOpen}
                total={total}
                loading={createTransaction.isPending}
                onConfirm={processPayment}
            />
        </div>
    );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

type BuyerIdType = '04' | '05' | '06' | '07' | '08';

const ID_TYPE_OPTIONS: { value: BuyerIdType; label: string }[] = [
    { value: '05', label: 'Cédula' },
    { value: '04', label: 'RUC' },
    { value: '06', label: 'Pasaporte' },
    { value: '07', label: 'Consumidor final' },
    { value: '08', label: 'Identificación del exterior' },
];

function PaymentModal({
    open,
    onOpenChange,
    total,
    loading,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    loading: boolean;
    onConfirm: (
        method: PaymentMethod,
        cashReceived?: number,
        notes?: string,
        invoice?: CreatePosTransactionInput['invoice'],
    ) => Promise<void>;
}) {
    const [method, setMethod] = useState<PaymentMethod>('CASH');
    const [cashReceived, setCashReceived] = useState<string>('');
    const [notes, setNotes] = useState('');

    const [issueInvoice, setIssueInvoice] = useState(true);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
    const [buyerIdType, setBuyerIdType] = useState<BuyerIdType>('07');
    const [buyerTaxId, setBuyerTaxId] = useState('');
    const [buyerName, setBuyerName] = useState('');
    const [buyerEmail, setBuyerEmail] = useState('');
    const [buyerPhone, setBuyerPhone] = useState('');
    const [buyerAddress, setBuyerAddress] = useState('');

    const isConsumidorFinal = buyerIdType === '07';

    const change = method === 'CASH' && cashReceived ? parseFloat(cashReceived) - total : 0;

    function buildInvoicePayload(): CreatePosTransactionInput['invoice'] | undefined {
        if (!issueInvoice) return undefined;

        const taxId = buyerTaxId.trim();
        const name = buyerName.trim();
        const email = buyerEmail.trim();
        const phone = buyerPhone.trim();
        const address = buyerAddress.trim();

        const date = invoiceDate.trim() || undefined;

        if (isConsumidorFinal && !taxId && !name) {
            return { asyncEmission: false, issueDate: date };
        }

        return {
            buyer: {
                legalName: name || 'Consumidor Final',
                taxId: taxId || '9999999999999',
                idType: buyerIdType,
                email: email || undefined,
                phone: phone || undefined,
                address: address || undefined,
            },
            asyncEmission: false,
            issueDate: date,
        };
    }

    const taxIdPlaceholder = buyerIdType === '04'
        ? '0999999999001'
        : buyerIdType === '05'
            ? '0999999999'
            : buyerIdType === '06'
                ? 'Número de pasaporte'
                : buyerIdType === '08'
                    ? 'Identificación exterior'
                    : '9999999999999';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Procesar cobro</DialogTitle>
                    <DialogDescription>Total a cobrar: <strong>${total.toFixed(2)}</strong></DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                    {/* Payment method */}
                    <div>
                        <p className="mb-2 text-sm font-medium">Método de pago</p>
                        <div className="grid grid-cols-2 gap-2">
                            {(Object.entries(PAYMENT_METHOD_LABELS) as [PaymentMethod, string][]).map(([k, label]) => (
                                <button
                                    key={k}
                                    type="button"
                                    className={`rounded-md border py-2 text-sm font-medium transition-colors ${
                                        method === k
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'hover:bg-muted'
                                    }`}
                                    onClick={() => setMethod(k)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {method === 'CASH' && (
                        <label className="block space-y-1">
                            <span className="text-sm font-medium">Efectivo recibido</span>
                            <input
                                type="number"
                                step={0.01}
                                min={total}
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                placeholder={`${total.toFixed(2)}`}
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                            />
                            {change > 0 && (
                                <p className="text-sm font-semibold text-green-600">
                                    Cambio: ${change.toFixed(2)}
                                </p>
                            )}
                        </label>
                    )}

                    <label className="block space-y-1">
                        <span className="text-sm font-medium">Notas (opcional)</span>
                        <input
                            className="h-10 w-full rounded-md border border-input px-3 text-sm"
                            placeholder="Observaciones de la venta…"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </label>

                    {/* Billing section */}
                    <div className="rounded-md border border-input p-3 space-y-3">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input
                                type="checkbox"
                                checked={issueInvoice}
                                onChange={(e) => setIssueInvoice(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            Emitir factura electrónica
                        </label>

                        {issueInvoice && (
                            <div className="space-y-2.5 pt-1">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                        Fecha de emisión
                                    </label>
                                    <input
                                        type="date"
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                        value={invoiceDate}
                                        max={new Date().toISOString().slice(0, 10)}
                                        onChange={(e) => setInvoiceDate(e.target.value)}
                                        aria-label="Fecha de emisión"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                        Tipo de identificación
                                    </label>
                                    <select
                                        value={buyerIdType}
                                        onChange={(e) => {
                                            const val = e.target.value as BuyerIdType;
                                            setBuyerIdType(val);
                                            if (val === '07') {
                                                setBuyerTaxId('');
                                                setBuyerName('');
                                            }
                                        }}
                                        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                        aria-label="Tipo de identificación"
                                    >
                                        {ID_TYPE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {!isConsumidorFinal && (
                                    <>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                {buyerIdType === '04' ? 'RUC' : buyerIdType === '05' ? 'Cédula' : 'Identificación'} *
                                            </label>
                                            <input
                                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                                placeholder={taxIdPlaceholder}
                                                value={buyerTaxId}
                                                onChange={(e) => setBuyerTaxId(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                                Nombre / Razón social *
                                            </label>
                                            <input
                                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                                placeholder="Nombre completo o razón social"
                                                value={buyerName}
                                                onChange={(e) => setBuyerName(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                        Correo electrónico
                                    </label>
                                    <input
                                        type="email"
                                        className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                        placeholder="cliente@correo.com"
                                        value={buyerEmail}
                                        onChange={(e) => setBuyerEmail(e.target.value)}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                            placeholder="+593 999 999 999"
                                            value={buyerPhone}
                                            onChange={(e) => setBuyerPhone(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                                            Dirección
                                        </label>
                                        <input
                                            className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                            placeholder="Dirección del cliente"
                                            value={buyerAddress}
                                            onChange={(e) => setBuyerAddress(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {isConsumidorFinal && (
                                    <p className="text-xs text-muted-foreground">
                                        Se emitirá como Consumidor Final (9999999999999)
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" title="Cancelar cobro" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        title="Confirmar y registrar venta"
                        onClick={() => {
                            void onConfirm(
                                method,
                                parseFloat(cashReceived) || undefined,
                                notes || undefined,
                                buildInvoicePayload(),
                            );
                        }}
                        disabled={
                            loading ||
                            (method === 'CASH' && !!cashReceived && parseFloat(cashReceived) < total) ||
                            (issueInvoice && !isConsumidorFinal && (!buyerTaxId.trim() || !buyerName.trim()))
                        }
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirmar venta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Transaction History ──────────────────────────────────────────────────────

function TransactionHistory() {
    const router = useRouter();
    const [voidTarget, setVoidTarget] = useState<PosTransaction | null>(null);
    const [voidReason, setVoidReason] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [printingId, setPrintingId] = useState<string | null>(null);
    const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
    const [xmlLoadingId, setXmlLoadingId] = useState<string | null>(null);
    const [closureRegisterId, setClosureRegisterId] = useState('');
    const [showOnlyClosedWithDiscrepancy, setShowOnlyClosedWithDiscrepancy] = useState(false);
    const [discrepancyThreshold, setDiscrepancyThreshold] = useState(0);
    const [discrepancySort, setDiscrepancySort] = useState<'none' | 'desc' | 'asc'>('none');
    const [registerDiscrepancies, setRegisterDiscrepancies] = useState<Record<string, number | null>>({});
    const [loadingDiscrepancies, setLoadingDiscrepancies] = useState(false);

    const transactionsQ = usePosTransactions({ limit: 50 });
    const registersQ = usePosRegisters();
    const voidTransaction = useVoidPosTransaction(selectedId);
    const closureReportQ = useRegisterClosureReport(closureRegisterId.trim() || null, { enabled: false });

    const currentUser = useAuthStore((state) => state.user);
    const userPermissions = resolveUserPermissions(currentUser);
    const canCreateBilling = userPermissions.includes('billing:create' as never);
    const canReadBilling = userPermissions.includes('billing:read' as never);

    const transactions = transactionsQ.data?.data ?? [];
    const registers = registersQ.data?.data ?? [];

    const sortedRegisters = useMemo(() => {
        return [...registers].sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === 'CLOSED' ? -1 : 1;
            }
            return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
        });
    }, [registers]);

    const filteredRegisters = useMemo(() => {
        if (!showOnlyClosedWithDiscrepancy) {
            return sortedRegisters;
        }

        return sortedRegisters.filter((register) => {
            if (register.status !== 'CLOSED') {
                return false;
            }
            const discrepancy = registerDiscrepancies[register.id];
            return typeof discrepancy === 'number' && Math.abs(discrepancy) >= discrepancyThreshold;
        });
    }, [discrepancyThreshold, registerDiscrepancies, showOnlyClosedWithDiscrepancy, sortedRegisters]);

    const displayedRegisters = useMemo(() => {
        if (discrepancySort === 'none') {
            return filteredRegisters;
        }

        return [...filteredRegisters].sort((a, b) => {
            const aDiscrepancy = registerDiscrepancies[a.id];
            const bDiscrepancy = registerDiscrepancies[b.id];
            const aValue = typeof aDiscrepancy === 'number' ? Math.abs(aDiscrepancy) : -1;
            const bValue = typeof bDiscrepancy === 'number' ? Math.abs(bDiscrepancy) : -1;

            if (aValue === bValue) {
                return 0;
            }

            if (discrepancySort === 'desc') {
                return bValue - aValue;
            }
            return aValue - bValue;
        });
    }, [discrepancySort, filteredRegisters, registerDiscrepancies]);

    useEffect(() => {
        const closedRegisters = sortedRegisters.filter((register) => register.status === 'CLOSED');
        const pendingRegisters = closedRegisters.filter((register) => !(register.id in registerDiscrepancies));

        if (pendingRegisters.length === 0) {
            return;
        }

        let cancelled = false;
        setLoadingDiscrepancies(true);

        void Promise.allSettled(
            pendingRegisters.map(async (register) => {
                const report = await fetchRegisterClosureReport(register.id);
                return {
                    id: register.id,
                    discrepancy: report.discrepancy,
                };
            }),
        )
            .then((results) => {
                if (cancelled) {
                    return;
                }

                setRegisterDiscrepancies((prev) => {
                    const next = { ...prev };
                    for (const [index, result] of results.entries()) {
                        if (result.status === 'fulfilled') {
                            next[result.value.id] = result.value.discrepancy;
                        }
                        if (result.status === 'rejected') {
                            // Null means data unavailable to avoid retry loops.
                            next[pendingRegisters[index].id] = null;
                        }
                    }
                    return next;
                });
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingDiscrepancies(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [registerDiscrepancies, sortedRegisters]);

    useEffect(() => {
        const hasPendingInvoice = transactions.some((tx) =>
            isInvoicePendingStatus(tx.invoice?.status),
        );

        if (!hasPendingInvoice) return;

        const intervalId = window.setInterval(() => {
            void transactionsQ.refetch();
        }, 15000);

        return () => window.clearInterval(intervalId);
    }, [transactions, transactionsQ]);

    async function confirmVoid() {
        if (!voidTarget) return;
        try {
            await voidTransaction.mutateAsync(voidReason || 'Anulado por operador');
            toast.success('Venta anulada');
            setVoidTarget(null);
            setVoidReason('');
        } catch {
            toast.error('No se pudo anular la venta');
        }
    }

        async function handleFetchClosureReport(registerId?: string) {
            const targetId = (registerId ?? closureRegisterId).trim();
            if (!targetId) {
                        toast.warning('Ingresa un registerId para consultar el cierre');
                        return;
                }

            setClosureRegisterId(targetId);
                await closureReportQ.refetch();
        }

        function printClosureReport(report: PosRegisterClosureReport) {
                const popup = window.open('', '_blank', 'noopener,noreferrer,width=760,height=920');
                if (!popup) {
                        toast.error('No se pudo abrir la vista de impresión. Verifica bloqueador de popups.');
                        return;
                }

                const printableDate = new Date().toLocaleString('es-EC');
                const methods = Object.entries(report.summary.byPaymentMethod)
                        .map(([method, stats]) => `<li>${method}: ${stats.count} pagos / $${stats.total.toFixed(2)}</li>`)
                        .join('');

                popup.document.write(`<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8" />
    <title>Cierre de caja ${report.registerId}</title>
    <style>
        body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
        h1 { margin: 0 0 8px; font-size: 22px; }
        p { margin: 4px 0; }
        .meta { margin-bottom: 18px; color: #334155; }
        .line { border-top: 1px solid #e2e8f0; margin: 16px 0; }
        .row { margin: 10px 0; }
        .label { font-weight: 700; }
        ul { margin: 8px 0 0 20px; }
    </style>
</head>
<body>
    <h1>Reporte de cierre de caja</h1>
    <p class="meta">Generado el ${printableDate}</p>
    <div class="line"></div>
    <div class="row"><span class="label">Caja:</span> ${report.registerId}</div>
    <div class="row"><span class="label">Abierta:</span> ${new Date(report.openedAt).toLocaleString('es-EC')}</div>
    <div class="row"><span class="label">Cerrada:</span> ${new Date(report.closedAt).toLocaleString('es-EC')}</div>
    <div class="row"><span class="label">Saldo inicial:</span> $${report.openingBalance.toFixed(2)}</div>
    <div class="row"><span class="label">Saldo esperado:</span> $${report.expectedClosingBalance.toFixed(2)}</div>
    <div class="row"><span class="label">Saldo declarado:</span> $${report.closingBalance.toFixed(2)}</div>
    <div class="row"><span class="label">Diferencia:</span> $${report.discrepancy.toFixed(2)}</div>
    <div class="line"></div>
    <div class="row"><span class="label">Ventas:</span> $${report.summary.salesTotal.toFixed(2)}</div>
    <div class="row"><span class="label">Reembolsos:</span> $${report.summary.refundsTotal.toFixed(2)}</div>
    <div class="row"><span class="label">Tickets:</span> ${report.summary.ticketsCount}</div>
    <div class="row"><span class="label">Pagos por método:</span>
        <ul>${methods}</ul>
    </div>
</body>
</html>`);
                popup.document.close();
                popup.focus();
                popup.print();
        }

    function buildBillingUrl(tx: PosTransaction, mode: 'issue' | 'status') {
        const externalId = tx.providerInvoiceId || tx.invoice?.providerInvoiceId;
        const query = new URLSearchParams({
            from: 'pos',
            ticketId: tx.id,
        });

        if (externalId) {
            query.set('providerInvoiceId', externalId);
        }
        if (mode === 'status') {
            query.set('focus', 'status');
        }

        return `/clinic/billing?${query.toString()}`;
    }

    function printFallback(tx: PosTransaction, invoiceData?: {
        providerInvoiceId?: string;
        providerStatus?: string;
        documentNumber?: string;
        accessKey?: string;
        authorizedAt?: string;
        rejectedReason?: string;
    }) {
        const popup = window.open('', '_blank', 'noopener,noreferrer,width=760,height=920');
        if (!popup) {
            toast.error('No se pudo abrir la vista de impresión. Verifica bloqueador de popups.');
            return;
        }

        const printableDate = new Date().toLocaleString('es-EC');
        const providerInvoiceId = invoiceData?.providerInvoiceId ?? tx.providerInvoiceId ?? tx.invoice?.providerInvoiceId ?? 'N/D';
        const status = invoiceData?.providerStatus ?? tx.status ?? 'N/D';
        const documentNumber = invoiceData?.documentNumber ?? tx.receiptNumber ?? 'N/D';
        const accessKey = invoiceData?.accessKey ?? 'N/D';
        const authorizedAt = invoiceData?.authorizedAt ?? 'N/D';
        const observation = invoiceData?.rejectedReason ?? 'Sin observaciones';

        popup.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <title>Factura ${documentNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 4px 0; }
    .meta { margin-bottom: 18px; color: #334155; }
    .line { border-top: 1px solid #e2e8f0; margin: 16px 0; }
    .row { margin: 10px 0; }
    .label { font-weight: 700; }
    .value { word-break: break-word; }
  </style>
</head>
<body>
  <h1>Factura electrónica</h1>
  <p class="meta">Documento generado para impresión el ${printableDate}</p>
  <div class="line"></div>
  <div class="row"><span class="label">Provider Invoice ID:</span> <span class="value">${providerInvoiceId}</span></div>
  <div class="row"><span class="label">Estado:</span> <span class="value">${status}</span></div>
  <div class="row"><span class="label">Comprobante:</span> <span class="value">${documentNumber}</span></div>
  <div class="row"><span class="label">Clave de acceso:</span> <span class="value">${accessKey}</span></div>
  <div class="row"><span class="label">Autorizado en:</span> <span class="value">${authorizedAt}</span></div>
  <div class="row"><span class="label">Observación:</span> <span class="value">${observation}</span></div>
  <div class="line"></div>
  <div class="row"><span class="label">Recibo POS:</span> <span class="value">${tx.receiptNumber}</span></div>
  <div class="row"><span class="label">Total:</span> <span class="value">$${tx.total.toFixed(2)}</span></div>
</body>
</html>`);
        popup.document.close();
        popup.focus();
        popup.print();
    }

    async function handlePrintInvoice(tx: PosTransaction) {
        setPrintingId(tx.id);

        try {
            let providerInvoiceId = tx.providerInvoiceId || tx.invoice?.providerInvoiceId;
            if (!providerInvoiceId) {
                const ticketStatus = await fetchTicketInvoiceStatus(tx.id);
                providerInvoiceId = ticketStatus.providerInvoiceId;
            }

            if (!providerInvoiceId) {
                toast.warning('Este ticket aún no tiene factura electrónica asociada.');
                return;
            }

            const status = await fetchExternalInvoiceStatus(providerInvoiceId);
            try {
                const doc = await fetchExternalInvoiceDocumentUrl(providerInvoiceId, 'pdf');
                const tab = window.open(doc.url, '_blank', 'noopener,noreferrer');
                if (!tab) {
                    toast.error('El navegador bloqueó la apertura del PDF. Habilita popups para imprimir.');
                    return;
                }
                return;
            } catch {
                // Continue with fallback print view when PDF URL is unavailable.
            }

            printFallback(tx, status);
        } catch {
            // If external status fails, still allow local printable output.
            printFallback(tx);
        } finally {
            setPrintingId(null);
        }
    }

    async function handleDownloadXml(tx: PosTransaction) {
        setXmlLoadingId(tx.id);

        try {
            let providerInvoiceId = tx.providerInvoiceId || tx.invoice?.providerInvoiceId;
            if (!providerInvoiceId) {
                const ticketStatus = await fetchTicketInvoiceStatus(tx.id);
                providerInvoiceId = ticketStatus.providerInvoiceId;
            }

            if (!providerInvoiceId) {
                toast.warning('Este ticket aún no tiene factura electrónica asociada.');
                return;
            }

            const doc = await fetchExternalInvoiceDocumentUrl(providerInvoiceId, 'xml');
            const tab = window.open(doc.url, '_blank', 'noopener,noreferrer');
            if (!tab) {
                toast.error('El navegador bloqueó la apertura del XML. Habilita popups para continuar.');
            }
        } catch {
            toast.warning('Esta factura no tiene XML disponible o no se pudo obtener su URL.');
        } finally {
            setXmlLoadingId(null);
        }
    }

    async function handleOpenPdf(tx: PosTransaction) {
        setPdfLoadingId(tx.id);

        try {
            let providerInvoiceId = tx.providerInvoiceId || tx.invoice?.providerInvoiceId;
            if (!providerInvoiceId) {
                const ticketStatus = await fetchTicketInvoiceStatus(tx.id);
                providerInvoiceId = ticketStatus.providerInvoiceId;
            }

            if (!providerInvoiceId) {
                toast.warning('Este ticket aún no tiene factura electrónica asociada.');
                return;
            }

            const doc = await fetchExternalInvoiceDocumentUrl(providerInvoiceId, 'pdf');
            const tab = window.open(doc.url, '_blank', 'noopener,noreferrer');
            if (!tab) {
                toast.error('El navegador bloqueó la apertura del PDF. Habilita popups para continuar.');
            }
        } catch {
            toast.warning('Esta factura no tiene PDF disponible o no se pudo obtener su URL.');
        } finally {
            setPdfLoadingId(null);
        }
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <CardTitle className="text-base">Cajas recientes</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                Umbral:
                                <input
                                    type="number"
                                    min={0}
                                    step="0.5"
                                    className="h-8 w-24 rounded-md border border-input px-2 text-xs"
                                    value={discrepancyThreshold}
                                    onChange={(event) => {
                                        const nextValue = Number(event.target.value);
                                        setDiscrepancyThreshold(Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0);
                                    }}
                                />
                            </label>
                            <select
                                aria-label="Ordenar por diferencia"
                                className="h-8 rounded-md border border-input px-2 text-xs"
                                value={discrepancySort}
                                onChange={(event) => {
                                    const value = event.target.value as 'none' | 'desc' | 'asc';
                                    setDiscrepancySort(value);
                                }}
                            >
                                <option value="none">Sin orden por diferencia</option>
                                <option value="desc">Mayor diferencia</option>
                                <option value="asc">Menor diferencia</option>
                            </select>
                            <Button
                                size="sm"
                                variant={showOnlyClosedWithDiscrepancy ? 'default' : 'outline'}
                                onClick={() => setShowOnlyClosedWithDiscrepancy((prev) => !prev)}
                            >
                                {showOnlyClosedWithDiscrepancy ? 'Mostrando con discrepancia' : 'Solo cerradas con discrepancia'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {registersQ.isLoading ? (
                        <ClinicRowsSkeleton rows={4} />
                    ) : displayedRegisters.length === 0 ? (
                        <ClinicStateCard
                            message={
                                showOnlyClosedWithDiscrepancy
                                    ? 'No hay cajas cerradas con discrepancia para ese umbral.'
                                    : 'No hay cajas registradas.'
                            }
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[780px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Caja</th>
                                        <th className="px-4 py-3 text-left font-medium">Sucursal</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Diferencia</th>
                                        <th className="px-4 py-3 text-left font-medium">Apertura</th>
                                        <th className="px-4 py-3 text-left font-medium">Cierre</th>
                                        <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayedRegisters.map((register) => (
                                        <tr key={register.id} className="border-b hover:bg-muted/20">
                                            <td className="px-4 py-3 font-mono text-xs">{register.id}</td>
                                            <td className="px-4 py-3 text-xs">{register.branch?.name ?? 'Principal'}</td>
                                            <td className="px-4 py-3 text-xs">
                                                <Badge variant={register.status === 'CLOSED' ? 'scheduled' : 'outline'}>
                                                    {register.status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {register.status !== 'CLOSED' ? (
                                                    '—'
                                                ) : typeof registerDiscrepancies[register.id] === 'number' ? (
                                                    <span
                                                        className={
                                                            Math.abs(registerDiscrepancies[register.id] ?? 0) >= 5
                                                                ? 'font-semibold text-red-600'
                                                                : 'text-muted-foreground'
                                                        }
                                                    >
                                                        ${(registerDiscrepancies[register.id] ?? 0).toFixed(2)}
                                                    </span>
                                                ) : loadingDiscrepancies ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                ) : (
                                                    'N/D'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {format(new Date(register.openedAt), 'dd MMM yyyy HH:mm', { locale: es })}
                                            </td>
                                            <td className="px-4 py-3 text-xs">
                                                {register.closedAt
                                                    ? format(new Date(register.closedAt), 'dd MMM yyyy HH:mm', { locale: es })
                                                    : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    title="Ver detalle del cierre de caja"
                                                    disabled={register.status !== 'CLOSED' || closureReportQ.isFetching}
                                                    onClick={() => {
                                                        void handleFetchClosureReport(register.id);
                                                    }}
                                                >
                                                    Ver cierre
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Reporte de cierre de caja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            className="h-10 flex-1 rounded-md border border-input px-3 text-sm"
                            placeholder="registerId de la caja cerrada"
                            value={closureRegisterId}
                            onChange={(event) => setClosureRegisterId(event.target.value)}
                        />
                        <Button
                            variant="outline"
                            title="Consultar cierre de caja"
                            onClick={() => {
                                void handleFetchClosureReport();
                            }}
                            disabled={closureReportQ.isFetching || !closureRegisterId.trim()}
                        >
                            {closureReportQ.isFetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Consultar cierre
                        </Button>
                    </div>

                    {closureReportQ.isSuccess && closureReportQ.data ? (
                        <div className="space-y-3 rounded-md border bg-muted/30 p-3 text-sm">
                            <div className="grid gap-2 sm:grid-cols-2">
                                <p><strong>Register:</strong> {closureReportQ.data.registerId}</p>
                                <p><strong>Tickets:</strong> {closureReportQ.data.summary.ticketsCount}</p>
                                <p><strong>Saldo inicial:</strong> ${closureReportQ.data.openingBalance.toFixed(2)}</p>
                                <p><strong>Saldo esperado:</strong> ${closureReportQ.data.expectedClosingBalance.toFixed(2)}</p>
                                <p><strong>Saldo declarado:</strong> ${closureReportQ.data.closingBalance.toFixed(2)}</p>
                                <p
                                    className={
                                        Math.abs(closureReportQ.data.discrepancy) >= 5
                                            ? 'font-semibold text-red-600'
                                            : ''
                                    }
                                >
                                    <strong>Diferencia:</strong> ${closureReportQ.data.discrepancy.toFixed(2)}
                                </p>
                            </div>

                            <div className="rounded-md border bg-background p-3">
                                <p><strong>Ventas:</strong> ${closureReportQ.data.summary.salesTotal.toFixed(2)}</p>
                                <p><strong>Reembolsos:</strong> ${closureReportQ.data.summary.refundsTotal.toFixed(2)}</p>
                                <p><strong>Saldo efectivo esperado:</strong> ${closureReportQ.data.summary.expectedCashBalance.toFixed(2)}</p>
                            </div>

                            <Button
                                variant="secondary"
                                className="w-full"
                                title="Imprimir reporte del cierre"
                                onClick={() => printClosureReport(closureReportQ.data!)}
                            >
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir reporte de cierre
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Transacciones recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {transactionsQ.isLoading ? (
                        <ClinicRowsSkeleton rows={6} />
                    ) : transactions.length === 0 ? (
                        <ClinicStateCard message="No hay transacciones registradas." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Recibo</th>
                                        <th className="px-4 py-3 text-left font-medium">Fecha</th>
                                        <th className="px-4 py-3 text-left font-medium">Productos</th>
                                        <th className="px-4 py-3 text-left font-medium">Descuento</th>
                                        <th className="px-4 py-3 text-left font-medium">Total</th>
                                        <th className="px-4 py-3 text-left font-medium">Método</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b hover:bg-muted/20">
                                            <td className="px-4 py-3 font-mono text-xs">{tx.receiptNumber}</td>
                                            <td className="px-4 py-3 text-xs">
                                                {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                                            </td>
                                            <td className="px-4 py-3">{tx.items.length} artículo(s)</td>
                                            <td className="px-4 py-3 text-green-600">
                                                {tx.discountTotal > 0 ? `-$${tx.discountTotal.toFixed(2)}` : '—'}
                                            </td>
                                            <td className="px-4 py-3 font-semibold">${tx.total.toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant="scheduled">
                                                    {PAYMENT_METHOD_LABELS[tx.paymentMethod] ?? tx.paymentMethod}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {tx.status ? POS_STATUS_LABELS[tx.status] : '—'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Anular venta"
                                                        onClick={() => {
                                                            setSelectedId(tx.id);
                                                            setVoidTarget(tx);
                                                        }}
                                                    >
                                                        Anular
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Emitir factura"
                                                        disabled={!canCreateBilling}
                                                        onClick={() => {
                                                            router.push(buildBillingUrl(tx, 'issue'));
                                                        }}
                                                    >
                                                        Facturar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Imprimir comprobante"
                                                        disabled={!canReadBilling || printingId === tx.id}
                                                        onClick={() => {
                                                            void handlePrintInvoice(tx);
                                                        }}
                                                    >
                                                        {printingId === tx.id ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Printer className="mr-2 h-4 w-4" />
                                                        )}
                                                        Imprimir
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Ver PDF de factura"
                                                        disabled={!canReadBilling || pdfLoadingId === tx.id}
                                                        onClick={() => {
                                                            void handleOpenPdf(tx);
                                                        }}
                                                    >
                                                        {pdfLoadingId === tx.id ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Download className="mr-2 h-4 w-4" />
                                                        )}
                                                        Ver PDF
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        title="Descargar XML de factura"
                                                        disabled={!canReadBilling || xmlLoadingId === tx.id}
                                                        onClick={() => {
                                                            void handleDownloadXml(tx);
                                                        }}
                                                    >
                                                        {xmlLoadingId === tx.id ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Download className="mr-2 h-4 w-4" />
                                                        )}
                                                        Descargar XML
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        title="Consultar estado de factura"
                                                        disabled={!canReadBilling}
                                                        onClick={() => {
                                                            router.push(buildBillingUrl(tx, 'status'));
                                                        }}
                                                    >
                                                        Estado
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

            <Dialog open={!!voidTarget} onOpenChange={(open) => !open && setVoidTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Anular venta</DialogTitle>
                        <DialogDescription>
                            Anular el recibo <strong>{voidTarget?.receiptNumber}</strong> por ${voidTarget?.total.toFixed(2)}. El stock será restaurado.
                        </DialogDescription>
                    </DialogHeader>
                    <label className="block space-y-1">
                        <span className="text-sm font-medium">Motivo de anulación</span>
                        <input
                            className="h-10 w-full rounded-md border border-input px-3 text-sm"
                            placeholder="Ej. Error de cobro, devolución del cliente…"
                            value={voidReason}
                            onChange={(e) => setVoidReason(e.target.value)}
                        />
                    </label>
                    <DialogFooter>
                        <Button variant="outline" title="Cancelar anulación" onClick={() => setVoidTarget(null)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            title="Confirmar anulación de venta"
                            onClick={confirmVoid}
                            disabled={voidTransaction.isPending}
                        >
                            {voidTransaction.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirmar anulación
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ─── SummaryCard ─────────────────────────────────────────────────────────────

function SummaryCard({
    label,
    value,
    sub,
    icon,
    highlight,
}: {
    label: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    highlight?: boolean;
}) {
    return (
        <Card className={highlight ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10' : ''}>
            <CardContent className="flex items-center justify-between p-4">
                <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
                </div>
                {icon}
            </CardContent>
        </Card>
    );
}
