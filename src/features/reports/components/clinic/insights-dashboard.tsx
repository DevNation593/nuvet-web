'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { toast } from 'sonner';
import {
    useClientSegmentation,
    useExecutiveKpis,
    useInventoryKardex,
    usePosDiscountUsageReport,
    useRestockSuggestions,
    useTriggerClinicalReminders,
} from '@/features/reports/hooks/use-reports';
import { usePromotions } from '@/features/promotions/hooks/use-promotions';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    OTHER: 'Otro',
};

function todayISO() {
    return new Date().toISOString().slice(0, 10);
}

function thirtyDaysAgoISO() {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().slice(0, 10);
}

export function InsightsDashboard() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Estado de inputs (lo que el usuario está tipeando)
    const [from, setFrom] = useState(() => searchParams.get('from') ?? thirtyDaysAgoISO());
    const [to, setTo] = useState(() => searchParams.get('to') ?? todayISO());
    const [productId, setProductId] = useState(() => searchParams.get('productId') ?? '');
    const [branchId, setBranchId] = useState(() => searchParams.get('branchId') ?? '');
    const [discountId, setDiscountId] = useState(() => searchParams.get('discountId') ?? '');
    const [lookbackDays, setLookbackDays] = useState(() => Number(searchParams.get('lookbackDays') ?? 30));
    const [inactiveDays, setInactiveDays] = useState(() => Number(searchParams.get('inactiveDays') ?? 60));

    // Estado aplicado (lo que la query realmente consume)
    // Solo cambia cuando el usuario presiona "Buscar".
    const [applied, setApplied] = useState(() => ({
        from: searchParams.get('from') ?? thirtyDaysAgoISO(),
        to: searchParams.get('to') ?? todayISO(),
        productId: searchParams.get('productId') ?? '',
        branchId: searchParams.get('branchId') ?? '',
        discountId: searchParams.get('discountId') ?? '',
        lookbackDays: Number(searchParams.get('lookbackDays') ?? 30),
        inactiveDays: Number(searchParams.get('inactiveDays') ?? 60),
    }));

    const applyFilters = () => {
        const next = {
            from,
            to,
            productId: productId.trim(),
            branchId: branchId.trim(),
            discountId: discountId.trim(),
            lookbackDays,
            inactiveDays,
        };
        setApplied(next);

        const params = new URLSearchParams(searchParams.toString());
        params.set('from', next.from);
        params.set('to', next.to);
        params.set('lookbackDays', String(next.lookbackDays));
        params.set('inactiveDays', String(next.inactiveDays));
        if (next.productId) params.set('productId', next.productId);
        else params.delete('productId');
        if (next.branchId) params.set('branchId', next.branchId);
        else params.delete('branchId');
        if (next.discountId) params.set('discountId', next.discountId);
        else params.delete('discountId');

        const nextQuery = params.toString();
        if (nextQuery !== searchParams.toString()) {
            router.replace(`${pathname}?${nextQuery}`, { scroll: false });
        }
    };

    const kpisQ = useExecutiveKpis(applied.from, applied.to);
    const segmentationQ = useClientSegmentation({ inactiveDays: applied.inactiveDays });
    const kardexQ = useInventoryKardex({
        productId: applied.productId || undefined,
        from: applied.from,
        to: applied.to,
    });
    const posDiscountQ = usePosDiscountUsageReport({
        from: applied.from,
        to: applied.to,
        branchId: applied.branchId || undefined,
        discountId: applied.discountId || undefined,
    });
    const restockQ = useRestockSuggestions({ lookbackDays: applied.lookbackDays });
    const promotionsQ = usePromotions({ isActive: true, limit: 100 }, { enabled: true });
    const triggerReminders = useTriggerClinicalReminders();

    const loading = kpisQ.isLoading || segmentationQ.isLoading || kardexQ.isLoading || posDiscountQ.isLoading || restockQ.isLoading || promotionsQ.isLoading;

    const branchOptions = useMemo(() => {
        const fromKpis = (kpisQ.data?.byBranch ?? [])
            .filter((branch) => Boolean(branch.branchId))
            .map((branch) => ({
                id: branch.branchId as string,
                name: branch.branchName,
            }));

        return Array.from(new Map(fromKpis.map((branch) => [branch.id, branch])).values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [kpisQ.data?.byBranch]);

    const discountOptions = useMemo(() => {
        const activeDiscounts = (promotionsQ.data?.data ?? []).map((discount) => ({
            id: discount.id,
            name: discount.name,
        }));

        const fromUsage = (posDiscountQ.data?.byDiscount ?? []).map((discount) => ({
            id: discount.discountId,
            name: discount.discountName,
        }));

        return Array.from(new Map([...activeDiscounts, ...fromUsage].map((discount) => [discount.id, discount])).values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [promotionsQ.data?.data, posDiscountQ.data?.byDiscount]);

    const salesCards = useMemo(() => {
        const sales = kpisQ.data?.sales;
        if (!sales) return [];
        return [
            { label: 'Ventas', value: `$${sales.total.toFixed(2)}` },
            { label: 'Ticket promedio', value: `$${sales.averageTicket.toFixed(2)}` },
            { label: 'Tickets', value: String(sales.totalTickets) },
            { label: 'Recompra', value: `${sales.repurchaseRate.toFixed(2)}%` },
        ];
    }, [kpisQ.data]);

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reportes operativos</h2>
                    <p className="text-sm text-muted-foreground">Indicadores ejecutivos, CRM e inventario avanzado.</p>
                </div>
                {loading ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Actualizando panel
                    </div>
                ) : null}
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Rango de análisis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 sm:grid-cols-4">
                        <input
                            type="date"
                            aria-label="Fecha inicial"
                            className="h-10 rounded-md border border-input px-3 text-sm"
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                        <input
                            type="date"
                            aria-label="Fecha final"
                            className="h-10 rounded-md border border-input px-3 text-sm"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                        <input
                            type="number"
                            min={7}
                            max={120}
                            className="h-10 rounded-md border border-input px-3 text-sm"
                            value={lookbackDays}
                            onChange={(event) => setLookbackDays(Number(event.target.value) || 30)}
                            placeholder="Días para reposición"
                        />
                        <input
                            type="number"
                            min={15}
                            max={365}
                            className="h-10 rounded-md border border-input px-3 text-sm"
                            value={inactiveDays}
                            onChange={(event) => setInactiveDays(Number(event.target.value) || 60)}
                            placeholder="Días inactividad CRM"
                        />
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <select
                            aria-label="Filtro de sucursal"
                            className="h-10 rounded-md border border-input px-3 text-sm"
                            value={branchId}
                            onChange={(event) => setBranchId(event.target.value)}
                        >
                            <option value="">Todas las sucursales</option>
                            {branchOptions.map((branch) => (
                                <option key={branch.id} value={branch.id}>{branch.name}</option>
                            ))}
                        </select>
                        <select
                            aria-label="Filtro de descuento"
                            className="h-10 rounded-md border border-input px-3 text-sm"
                            value={discountId}
                            onChange={(event) => setDiscountId(event.target.value)}
                        >
                            <option value="">Todos los descuentos</option>
                            {discountOptions.map((discount) => (
                                <option key={discount.id} value={discount.id}>{discount.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-3 flex justify-end">
                        <Button
                            onClick={applyFilters}
                            disabled={loading}
                            title="Aplicar los filtros y refrescar los reportes"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Buscar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="kpis" className="space-y-3">
                <TabsList>
                    <TabsTrigger value="kpis">KPIs</TabsTrigger>
                    <TabsTrigger value="crm">CRM</TabsTrigger>
                    <TabsTrigger value="inventory">Inventario</TabsTrigger>
                </TabsList>

                <TabsContent value="kpis" className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {salesCards.map((card) => (
                            <Card key={card.label}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-semibold">{card.value}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Top clientes</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-full min-w-[640px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Cliente</th>
                                        <th className="px-4 py-3 text-left">Compras</th>
                                        <th className="px-4 py-3 text-left">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(kpisQ.data?.topClients ?? []).map((client) => (
                                        <tr key={client.clientId} className="border-b">
                                            <td className="px-4 py-3">{client.name}</td>
                                            <td className="px-4 py-3">{client.purchases}</td>
                                            <td className="px-4 py-3">${client.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Ventas por método de pago</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-full min-w-[500px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Método</th>
                                        <th className="px-4 py-3 text-right">Transacciones</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(kpisQ.data?.byPaymentMethod ?? []).map((pm) => (
                                        <tr key={pm.method} className="border-b">
                                            <td className="px-4 py-3">{PAYMENT_METHOD_LABELS[pm.method] ?? pm.method}</td>
                                            <td className="px-4 py-3 text-right">{pm.count}</td>
                                            <td className="px-4 py-3 text-right font-mono">${pm.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {(kpisQ.data?.byPaymentMethod ?? []).length === 0 && (
                                        <tr><td colSpan={3} className="px-4 py-3 text-center text-muted-foreground">Sin datos en el rango</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Usos de descuentos POS</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">{posDiscountQ.data?.totalUsages ?? 0}</p>
                                <p className="text-xs text-muted-foreground">Aplicaciones de descuento en el rango</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Ahorro total descuentos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">${(posDiscountQ.data?.totalSavedAmount ?? 0).toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Monto acumulado ahorrado por clientes</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Descuentos mas usados</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Descuento</th>
                                        <th className="px-4 py-3 text-left">Usos</th>
                                        <th className="px-4 py-3 text-left">Ahorro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(posDiscountQ.data?.byDiscount ?? []).slice(0, 10).map((item) => (
                                        <tr key={item.discountId} className="border-b">
                                            <td className="px-4 py-3">{item.discountName}</td>
                                            <td className="px-4 py-3">{item.usageCount}</td>
                                            <td className="px-4 py-3">${item.savedAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="crm" className="space-y-3">
                    <div className="flex justify-end">
                        <Button
                            variant="outline"
                            title="Enviar recordatorios clínicos pendientes"
                            disabled={triggerReminders.isPending}
                            onClick={async () => {
                                try {
                                    const result = await triggerReminders.mutateAsync({
                                        daysAhead: 2,
                                        channels: ['IN_APP', 'EMAIL', 'SMS'],
                                    });
                                    toast.success(
                                        `Recordatorios generados: ${result.totals.notificationsCreated}`,
                                    );
                                } catch {
                                    toast.error('No se pudo ejecutar el envio de recordatorios');
                                }
                            }}
                        >
                            {triggerReminders.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Ejecutar recordatorios ahora
                        </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Frecuentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">{segmentationQ.data?.frequent.length ?? 0}</p>
                                <p className="text-xs text-muted-foreground">
                                    Con minimo de {segmentationQ.data?.minFrequentPurchases ?? 3} compras
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Inactivos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-semibold">{segmentationQ.data?.inactive.length ?? 0}</p>
                                <p className="text-xs text-muted-foreground">
                                    Sin compra en {segmentationQ.data?.inactiveDays ?? inactiveDays} dias
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Clientes inactivos</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-full min-w-[700px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Cliente</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Ultima compra</th>
                                        <th className="px-4 py-3 text-left">Total historico</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(segmentationQ.data?.inactive ?? []).slice(0, 20).map((client) => (
                                        <tr key={client.id} className="border-b">
                                            <td className="px-4 py-3">{client.firstName} {client.lastName}</td>
                                            <td className="px-4 py-3">{client.email || 'N/D'}</td>
                                            <td className="px-4 py-3">
                                                {format(new Date(client.lastPurchaseAt), 'dd MMM yyyy', { locale: es })}
                                            </td>
                                            <td className="px-4 py-3">${client.totalSpent.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inventory" className="space-y-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Kardex</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                <input
                                    className="h-10 flex-1 rounded-md border border-input px-3 text-sm"
                                    placeholder="Filtrar por ID de producto (opcional)"
                                    value={productId}
                                    onChange={(event) => setProductId(event.target.value)}
                                />
                                <Button variant="outline" onClick={() => kardexQ.refetch()} title="Recargar datos del kardex">
                                    Recargar
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[800px] text-sm">
                                    <thead className="border-y bg-muted/30 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Fecha</th>
                                            <th className="px-4 py-3 text-left">Producto</th>
                                            <th className="px-4 py-3 text-left">Tipo</th>
                                            <th className="px-4 py-3 text-left">Delta</th>
                                            <th className="px-4 py-3 text-left">Saldo</th>
                                            <th className="px-4 py-3 text-left">Motivo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(kardexQ.data?.entries ?? []).slice(0, 60).map((entry) => (
                                            <tr key={entry.id} className="border-b">
                                                <td className="px-4 py-3 text-xs">
                                                    {format(new Date(entry.createdAt), 'dd MMM yyyy HH:mm', { locale: es })}
                                                </td>
                                                <td className="px-4 py-3">{entry.productName}</td>
                                                <td className="px-4 py-3">{entry.type}</td>
                                                <td className="px-4 py-3">{entry.delta > 0 ? `+${entry.delta}` : entry.delta}</td>
                                                <td className="px-4 py-3">{entry.runningBalance}</td>
                                                <td className="px-4 py-3">{entry.reason || 'N/D'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Sugerencias de reposicion</CardTitle>
                        </CardHeader>
                        <CardContent className="overflow-x-auto p-0">
                            <table className="w-full min-w-[760px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Producto</th>
                                        <th className="px-4 py-3 text-left">Stock</th>
                                        <th className="px-4 py-3 text-left">Umbral</th>
                                        <th className="px-4 py-3 text-left">Venta diaria</th>
                                        <th className="px-4 py-3 text-left">Sugerido</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(restockQ.data?.suggestions ?? []).map((item) => (
                                        <tr key={item.productId} className="border-b">
                                            <td className="px-4 py-3">{item.name}</td>
                                            <td className="px-4 py-3">{item.currentStock}</td>
                                            <td className="px-4 py-3">{item.lowStockThreshold}</td>
                                            <td className="px-4 py-3">{item.averageDailySales.toFixed(2)}</td>
                                            <td className="px-4 py-3 font-semibold">{item.suggestedReorderQty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
