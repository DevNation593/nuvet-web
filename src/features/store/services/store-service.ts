import api from '@/shared/lib/api-client';
import type {
    ApiEnvelope,
    CreateOrderRequest,
    CreateProductRequest,
    StockAdjustmentRequest,
    UpdateOrderStatusRequest,
    UpdateProductRequest,
} from '@nuvet/types';
import type { Product, Order } from '../hooks/use-store';

function normalizePaginated<T>(
    raw: { data?: T[] | { data?: T[]; meta?: unknown }; meta?: unknown },
) {
    const payload = raw?.data ?? raw;
    return {
        data: Array.isArray(payload) ? payload : (payload as { data?: T[] })?.data ?? [],
        meta:
            (payload as { meta?: { page?: number; totalPages?: number } })?.meta ??
            raw?.meta ??
            { page: 1, totalPages: 1 },
    };
}

export async function fetchProducts(params: { page?: number; limit?: number; category?: string } = {}) {
    const { data } = await api.get<ApiEnvelope<Product[]>>('/store/products', { params });
    return normalizePaginated<Product>(data);
}

export async function fetchLowStockProducts() {
    const { data } = await api.get<ApiEnvelope<Product[]>>('/inventory/low-stock');
    return (data?.data ?? data ?? []) as Product[];
}

export async function createProduct(input: CreateProductRequest) {
    const { data } = await api.post<ApiEnvelope<Product>>('/store/products', input);
    return (data?.data ?? data) as Product;
}

export async function updateProduct(id: string, input: UpdateProductRequest) {
    const { data } = await api.patch<ApiEnvelope<Product>>(`/store/products/${id}`, input);
    return (data?.data ?? data) as Product;
}

export async function adjustStock(input: StockAdjustmentRequest) {
    const { data } = await api.post<ApiEnvelope<unknown>>('/inventory/adjust', input);
    return data;
}

export async function fetchOrders(params: { page?: number; limit?: number } = {}) {
    const { data } = await api.get<ApiEnvelope<Order[]>>('/store/orders', { params });
    return normalizePaginated<Order>(data);
}

export async function createOrder(input: CreateOrderRequest) {
    const { data } = await api.post<ApiEnvelope<Order>>('/store/orders', input);
    return (data?.data ?? data) as Order;
}

export async function updateOrderStatus(orderId: string, status: UpdateOrderStatusRequest['status']) {
    const { data } = await api.patch<ApiEnvelope<Order>>(`/store/orders/${orderId}/status`, { status });
    return (data?.data ?? data) as Order;
}
