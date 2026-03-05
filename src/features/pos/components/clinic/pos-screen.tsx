'use client';

import { useMemo, useState } from 'react';
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
    type PosCartItem,
    type PosTransaction,
    useCreatePosTransaction,
    usePosDailySummary,
    usePosTransactions,
    useVoidPosTransaction,
} from '@/features/pos/hooks/use-pos';
import { useValidatePromotionCode } from '@/features/promotions/hooks/use-promotions';
import { useProducts, type Product } from '@/features/store/hooks/use-store';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    BadgeDollarSign,
    BarChart3,
    CreditCard,
    Loader2,
    Minus,
    Plus,
    ReceiptText,
    Search,
    ShoppingCart,
    Tag,
    Trash2,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    OTHER: 'Otro',
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
                        onClick={() => setView('pos')}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Caja
                    </Button>
                    <Button
                        variant={view === 'history' ? 'default' : 'outline'}
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
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<{ id?: string; code: string; type: string; value: number } | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    const productsQ = useProducts({ limit: 200 });
    const validateCode = useValidatePromotionCode();
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
        if (appliedPromo.type === 'FIXED_AMOUNT') return Math.min(appliedPromo.value, subtotal);
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
        setPromoCode('');
    }

    // ─── Promotion ───────────────────────────────────────────────────────────

    async function applyPromoCode() {
        if (!promoCode.trim()) return;
        try {
            const promo = await validateCode.mutateAsync(promoCode.trim().toUpperCase());
            setAppliedPromo({ id: promo.id, code: promo.code ?? promoCode, type: promo.type, value: promo.value });
            toast.success(`Código "${promo.code}" aplicado`);
        } catch {
            toast.error('Código inválido o expirado');
        }
    }

    // ─── Checkout ────────────────────────────────────────────────────────────

    async function processPayment(paymentMethod: PaymentMethod, cashReceived?: number, notes?: string) {
        try {
            const result = await createTransaction.mutateAsync({
                items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
                paymentMethod,
                promotionCode: appliedPromo?.code,
                cashReceived,
                notes,
            });
            toast.success(`Venta procesada — Recibo: ${result.receiptNumber}`);
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
                            <Button size="sm" variant="ghost" onClick={clearCart}>
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
                                                    onClick={() => updateQty(item.productId, -1, stock)}
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="w-5 text-center text-sm tabular-nums">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    className="rounded p-0.5 hover:bg-muted"
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
                                                onClick={() => removeFromCart(item.productId)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Promo code */}
                        <div className="flex gap-1.5">
                            <div className="relative flex-1">
                                <Tag className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    className="h-9 w-full rounded-md border border-input pl-7 pr-3 text-xs uppercase"
                                    placeholder="Código promocional"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                                />
                            </div>
                            <Button size="sm" variant="outline" onClick={applyPromoCode} disabled={validateCode.isPending}>
                                {validateCode.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Aplicar'}
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
                                <button type="button" onClick={() => { setAppliedPromo(null); setPromoCode(''); }}>
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
    onConfirm: (method: PaymentMethod, cashReceived?: number, notes?: string) => Promise<void>;
}) {
    const [method, setMethod] = useState<PaymentMethod>('CASH');
    const [cashReceived, setCashReceived] = useState<string>('');
    const [notes, setNotes] = useState('');

    const change = method === 'CASH' && cashReceived ? parseFloat(cashReceived) - total : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Procesar cobro</DialogTitle>
                    <DialogDescription>Total a cobrar: <strong>${total.toFixed(2)}</strong></DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
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
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => onConfirm(method, parseFloat(cashReceived) || undefined, notes || undefined)}
                        disabled={loading || (method === 'CASH' && !!cashReceived && parseFloat(cashReceived) < total)}
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
    const [voidTarget, setVoidTarget] = useState<PosTransaction | null>(null);
    const [voidReason, setVoidReason] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const transactionsQ = usePosTransactions({ limit: 50 });
    const voidTransaction = useVoidPosTransaction(selectedId);

    const transactions = transactionsQ.data?.data ?? [];

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

    return (
        <>
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
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedId(tx.id);
                                                        setVoidTarget(tx);
                                                    }}
                                                >
                                                    Anular
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
                        <Button variant="outline" onClick={() => setVoidTarget(null)}>
                            Cancelar
                        </Button>
                        <Button variant="destructive" onClick={confirmVoid} disabled={voidTransaction.isPending}>
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
