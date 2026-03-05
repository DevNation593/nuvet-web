import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
    CreateOrderRequest,
    CreateProductRequest,
    OrderStatus,
    StockAdjustmentRequest,
    UpdateProductRequest,
    UpdateOrderStatusRequest,
} from '@nuvet/types';
import {
    fetchProducts,
    fetchLowStockProducts,
    createProduct,
    updateProduct,
    adjustStock,
    fetchOrders,
    createOrder,
    updateOrderStatus,
} from '../services/store-service';

export interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    lowStockThreshold: number;
    isActive: boolean;
}

export type CreateProductInput = CreateProductRequest;
export type UpdateProductInput = UpdateProductRequest;

export type CreateOrderInput = CreateOrderRequest;

export interface Order {
    id: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number; total: number }>;
}

export function useProducts(
    params: { page?: number; limit?: number; category?: string } = {},
    options: { enabled?: boolean } = {},
) {
    return useQuery({
        queryKey: ['store-products', params],
        queryFn: () => fetchProducts(params),
        enabled: options.enabled ?? true,
    });
}

export function useLowStockProducts(options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['inventory-low-stock'],
        queryFn: () => fetchLowStockProducts(),
        enabled: options.enabled ?? true,
    });
}

export function useCreateProduct() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateProductInput) => createProduct(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] });
        },
    });
}

export function useUpdateProduct(id: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: UpdateProductInput) => updateProduct(id!, input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] });
        },
    });
}

export function useAdjustStock() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: StockAdjustmentRequest) => adjustStock(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-low-stock'] });
        },
    });
}

export function useOrders(params: { page?: number; limit?: number } = {}, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['store-orders', params],
        queryFn: () => fetchOrders(params),
        enabled: options.enabled ?? true,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateOrderInput) => createOrder(input),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-orders'] });
            queryClient.invalidateQueries({ queryKey: ['store-products'] });
        },
    });
}

export function useUpdateOrderStatus(orderId: string | null) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (status: UpdateOrderStatusRequest['status']) => updateOrderStatus(orderId!, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['store-orders'] });
        },
    });
}
