'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useProducts } from '@/features/store/hooks/use-store';

export function StoreDashboardTable() {
    const { data, isLoading, error } = useProducts({ page: 1, limit: 10 });
    const rows = data?.data ?? [];

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
        );
    }

    if (error) {
        return <div className="p-4 text-red-500">Error al cargar productos</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Tienda e Inventario
                </h1>
                <Button>Agregar producto</Button>
            </div>

            <div className="rounded-md border bg-white dark:bg-gray-800 dark:border-gray-700">
                <div className="relative w-full overflow-auto max-h-[600px]">
                    <table className="w-full caption-bottom text-sm text-left">
                        <thead className="[&_tr]:border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Producto</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">SKU</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Categoría</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Precio</th>
                                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-4 text-center text-gray-500">
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            ) : (
                                rows.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                                    >
                                        <td className="p-4 align-middle font-medium">{product.name}</td>
                                        <td className="p-4 align-middle text-gray-500">{product.sku}</td>
                                        <td className="p-4 align-middle">{product.category}</td>
                                        <td className="p-4 align-middle">${Number(product.price).toFixed(2)}</td>
                                        <td className="p-4 align-middle">
                                            <span
                                                className={`font-medium ${
                                                    product.stock <= product.lowStockThreshold
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }`}
                                            >
                                                {product.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
