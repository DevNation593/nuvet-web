'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    AppPermission,
    OrderStatus,
    PermissionAction,
    PermissionModule,
    StockMovementType,
    hasAnyPermission,
} from '@nuvet/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import {
    useAdjustStock,
    useCreateProduct,
    useLowStockProducts,
    useOrders,
    useProducts,
    useUpdateOrderStatus,
} from '@/features/store/hooks/use-store';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { getStatusLabel } from '@/shared/lib/status-labels';
import { PackagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveUserPermissions } from '@/shared/lib/permissions';

const productSchema = z.object({
    name: z.string().min(2),
    sku: z.string().min(2),
    category: z.string().min(2),
    description: z.string().optional(),
    price: z.coerce.number().positive(),
    stock: z.coerce.number().int().min(0),
    lowStockThreshold: z.coerce.number().int().min(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

export function StoreManagement() {
    const [productModalOpen, setProductModalOpen] = useState(false);
    const [stockDialogProductId, setStockDialogProductId] = useState<string | null>(null);

    const user = useAuthStore((state) => state.user);
    const permissions = resolveUserPermissions(user);
    const canReadStore = hasAnyPermission(permissions, [
        `${PermissionModule.STORE}:${PermissionAction.READ}` as AppPermission,
    ]);
    const canReadInventory = hasAnyPermission(permissions, [
        `${PermissionModule.INVENTORY}:${PermissionAction.READ}` as AppPermission,
    ]);

    const productsQuery = useProducts({ limit: 100 }, { enabled: canReadStore });
    const lowStockQuery = useLowStockProducts({ enabled: canReadInventory });
    const ordersQuery = useOrders({ limit: 20 }, { enabled: canReadStore });
    const createProduct = useCreateProduct();
    const adjustStock = useAdjustStock();
    const updateOrderStatus = useUpdateOrderStatus(null);

    const products = useMemo(() => (canReadStore ? (productsQuery.data?.data ?? []) : []), [canReadStore, productsQuery.data?.data]);
    const orders = useMemo(() => (canReadStore ? (ordersQuery.data?.data ?? []) : []), [canReadStore, ordersQuery.data?.data]);
    const lowStock = useMemo(() => (canReadInventory ? (lowStockQuery.data ?? []) : []), [canReadInventory, lowStockQuery.data]);
    const stockTarget = useMemo(() => products.find((p) => p.id === stockDialogProductId), [products, stockDialogProductId]);

    return (
        <div className="space-y-4">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tienda / Inventario</h2>
                    <p className="text-sm text-muted-foreground">Catálogo de productos y control de stock</p>
                </div>
                <Button onClick={() => setProductModalOpen(true)}>
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Nuevo producto
                </Button>
            </header>

            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Productos</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {!canReadStore ? (
                            <ClinicStateCard message="Sin permiso para ver catálogo de tienda." />
                        ) : productsQuery.isLoading ? (
                            <ClinicRowsSkeleton rows={6} />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-sm">
                                    <thead className="border-y bg-muted/30 text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium">Producto</th>
                                            <th className="px-4 py-3 text-left font-medium">SKU</th>
                                            <th className="px-4 py-3 text-left font-medium">Categoría</th>
                                            <th className="px-4 py-3 text-left font-medium">Precio</th>
                                            <th className="px-4 py-3 text-left font-medium">Stock</th>
                                            <th className="px-4 py-3 text-left font-medium">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product) => (
                                            <tr key={product.id} className="border-b">
                                                <td className="px-4 py-3 font-medium">{product.name}</td>
                                                <td className="px-4 py-3">{product.sku}</td>
                                                <td className="px-4 py-3">{product.category}</td>
                                                <td className="px-4 py-3">${Number(product.price).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={product.stock <= product.lowStockThreshold ? 'text-destructive' : 'text-green-700'}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setStockDialogProductId(product.id)}
                                                    >
                                                        Ajustar stock
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
                        <CardTitle className="text-base">Bajo stock</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {canReadInventory && lowStockQuery.isLoading && <ClinicRowsSkeleton compact />}
                        {!canReadInventory && (
                            <p className="text-sm text-muted-foreground">Sin permiso para ver alertas de inventario.</p>
                        )}
                        {canReadInventory && !lowStockQuery.isLoading && lowStock.length === 0 && (
                            <p className="text-sm text-muted-foreground">No hay alertas.</p>
                        )}
                        {canReadInventory && lowStock.map((product) => (
                            <div key={product.id} className="rounded-md border bg-muted/20 p-2 text-xs">
                                <p className="font-medium">{product.name}</p>
                                <p className="text-muted-foreground">
                                    Stock: {product.stock} / Umbral: {product.lowStockThreshold}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Órdenes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {!canReadStore ? (
                        <ClinicStateCard message="Sin permiso para ver órdenes de tienda." />
                    ) : ordersQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={6} />
                    ) : orders.length === 0 ? (
                        <ClinicStateCard message="No hay órdenes registradas." />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[720px] text-sm">
                                <thead className="border-y bg-muted/30 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">ID</th>
                                        <th className="px-4 py-3 text-left font-medium">Total</th>
                                        <th className="px-4 py-3 text-left font-medium">Estado</th>
                                        <th className="px-4 py-3 text-left font-medium">Items</th>
                                        <th className="px-4 py-3 text-left font-medium">Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-b">
                                            <td className="px-4 py-3 font-medium">{order.id.slice(0, 8)}...</td>
                                            <td className="px-4 py-3">${Number(order.total).toFixed(2)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={order.status === 'COMPLETED' ? 'confirmed' : 'scheduled'}>
                                                    {getStatusLabel(order.status)}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">{order.items?.length ?? 0}</td>
                                            <td className="px-4 py-3">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={async () => {
                                                        try {
                                                            await updateOrderStatus.mutateAsync(OrderStatus.COMPLETED);
                                                            toast.success('Orden actualizada');
                                                        } catch {
                                                            toast.error('No se pudo actualizar la orden');
                                                        }
                                                    }}
                                                >
                                                    Completar
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

            <ProductModal
                open={productModalOpen}
                onOpenChange={setProductModalOpen}
                loading={createProduct.isPending}
                onSubmit={async (values) => {
                    try {
                        await createProduct.mutateAsync(values);
                        toast.success('Producto creado');
                        setProductModalOpen(false);
                    } catch (error: unknown) {
                        const message =
                            error && typeof error === 'object' && 'response' in error
                                ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                : undefined;
                        toast.error(message ?? 'No se pudo crear el producto');
                    }
                }}
            />

            <StockAdjustDialog
                open={!!stockTarget}
                onOpenChange={(open) => !open && setStockDialogProductId(null)}
                product={stockTarget}
                onSubmit={async (values) => {
                    if (!stockTarget) return;
                    try {
                        await adjustStock.mutateAsync({
                            productId: stockTarget.id,
                            type: values.type,
                            quantity: values.quantity,
                            reason: values.reason,
                        });
                        toast.success('Stock actualizado');
                        setStockDialogProductId(null);
                    } catch {
                        toast.error('No se pudo ajustar el stock');
                    }
                }}
                loading={adjustStock.isPending}
            />
        </div>
    );
}

function ProductModal({
    open,
    onOpenChange,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    onSubmit: (values: ProductFormValues) => Promise<void>;
}) {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        values: {
            name: '',
            sku: '',
            category: '',
            description: '',
            price: 0,
            stock: 0,
            lowStockThreshold: 5,
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nuevo producto</DialogTitle>
                    <DialogDescription>Agregar ítem al catálogo</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <Field label="Nombre" error={form.formState.errors.name?.message}>
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('name')} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="SKU" error={form.formState.errors.sku?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('sku')} />
                        </Field>
                        <Field label="Categoría" error={form.formState.errors.category?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('category')} />
                        </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label="Precio" error={form.formState.errors.price?.message}>
                            <input type="number" step="0.01" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('price')} />
                        </Field>
                        <Field label="Stock inicial" error={form.formState.errors.stock?.message}>
                            <input type="number" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('stock')} />
                        </Field>
                        <Field label="Umbral" error={form.formState.errors.lowStockThreshold?.message}>
                            <input type="number" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('lowStockThreshold')} />
                        </Field>
                    </div>
                    <Field label="Descripción" error={form.formState.errors.description?.message}>
                        <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('description')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

const stockSchema = z.object({
    type: z.nativeEnum(StockMovementType),
    quantity: z.coerce.number().int().positive(),
    reason: z.string().optional(),
});

function StockAdjustDialog({
    open,
    onOpenChange,
    product,
    onSubmit,
    loading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: { name: string } | undefined;
    onSubmit: (values: z.infer<typeof stockSchema>) => Promise<void>;
    loading: boolean;
}) {
    const form = useForm<z.infer<typeof stockSchema>>({
        resolver: zodResolver(stockSchema),
        values: { type: StockMovementType.IN, quantity: 1, reason: '' },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Ajustar stock</DialogTitle>
                    <DialogDescription>{product?.name}</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <Field label="Tipo">
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('type')}>
                            <option value={StockMovementType.IN}>Entrada</option>
                            <option value={StockMovementType.OUT}>Salida</option>
                            <option value={StockMovementType.ADJUSTMENT}>Ajuste absoluto</option>
                        </select>
                    </Field>
                    <Field label="Cantidad">
                        <input type="number" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('quantity')} />
                    </Field>
                    <Field label="Razón">
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('reason')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Aplicando...' : 'Aplicar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}
