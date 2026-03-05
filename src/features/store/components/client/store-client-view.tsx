'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { useCreateOrder, useProducts, type Product } from '@/features/store/hooks/use-store';
import { ClientGridSkeleton, ClientStateCard } from '@/shared/components/client/ui-states';

type CartLine = { product: Product; quantity: number };

export function StoreClientView() {
    const [cart, setCart] = useState<Record<string, CartLine>>({});
    const productsQuery = useProducts({ limit: 60 });
    const createOrder = useCreateOrder();

    const products = productsQuery.data?.data ?? [];
    const cartItems = Object.values(cart);
    const total = useMemo(
        () => cartItems.reduce((sum, line) => sum + Number(line.product.price) * line.quantity, 0),
        [cartItems]
    );

    const addToCart = (product: Product) => {
        setCart((prev) => {
            const existing = prev[product.id];
            const nextQty = Math.min(product.stock, (existing?.quantity ?? 0) + 1);
            return { ...prev, [product.id]: { product, quantity: nextQty } };
        });
    };

    const updateQty = (productId: string, qty: number) => {
        setCart((prev) => {
            const line = prev[productId];
            if (!line) return prev;
            if (qty <= 0) {
                const next = { ...prev };
                delete next[productId];
                return next;
            }
            return { ...prev, [productId]: { ...line, quantity: Math.min(line.product.stock, qty) } };
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Tienda</h2>
                <p className="text-muted-foreground">Productos disponibles en tu clínica.</p>
            </div>

            {productsQuery.isLoading ? (
                <ClientGridSkeleton items={6} itemClassName="h-40" />
            ) : productsQuery.isError ? (
                <ClientStateCard message="No se pudo cargar el catálogo." tone="error" />
            ) : products.length === 0 ? (
                <ClientStateCard message="No hay productos disponibles." />
            ) : (
                <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {products.map((product) => {
                            const line = cart[product.id];
                            const disabled = product.stock <= 0;
                            return (
                                <Card key={product.id}>
                                    <CardHeader className="pb-2">
                                        <h3 className="font-semibold">{product.name}</h3>
                                        <p className="text-xs text-muted-foreground">{product.category}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-lg font-semibold">${Number(product.price).toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Stock: {product.stock} · SKU: {product.sku}
                                        </p>
                                        <Button
                                            className="w-full"
                                            disabled={disabled}
                                            variant={line ? 'outline' : 'default'}
                                            onClick={() => addToCart(product)}
                                        >
                                            {disabled ? 'Sin stock' : line ? `En carrito (${line.quantity})` : 'Agregar'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    <Card className="h-fit">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" />
                                <h3 className="font-semibold">Carrito</h3>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {cartItems.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aun no agregas productos.</p>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        {cartItems.map((line) => (
                                            <div key={line.product.id} className="rounded-md border p-2">
                                                <p className="text-sm font-medium">{line.product.name}</p>
                                                <p className="text-xs text-muted-foreground">${Number(line.product.price).toFixed(2)} c/u</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <Button type="button" size="icon" variant="outline" onClick={() => updateQty(line.product.id, line.quantity - 1)}>
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center text-sm">{line.quantity}</span>
                                                    <Button type="button" size="icon" variant="outline" onClick={() => updateQty(line.product.id, line.quantity + 1)} disabled={line.quantity >= line.product.stock}>
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t pt-3 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span>Total</span>
                                            <span className="font-semibold">${total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full"
                                        disabled={createOrder.isPending || cartItems.length === 0}
                                        onClick={async () => {
                                            try {
                                                await createOrder.mutateAsync({
                                                    items: cartItems.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
                                                });
                                                toast.success('Pedido creado');
                                                setCart({});
                                            } catch (error: unknown) {
                                                const msg = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
                                                toast.error(msg ?? 'No se pudo crear el pedido');
                                            }
                                        }}
                                    >
                                        {createOrder.isPending ? 'Procesando...' : 'Realizar pedido'}
                                    </Button>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
