import api from '@/shared/lib/api-client';
import { unwrapResponse, unwrapPaginatedResponse, unwrapArrayResponse } from '@/shared/lib/api-helpers';
import type {
    ApiEnvelope,
    CreateOrderRequest,
    CreateProductRequest,
    StockAdjustmentRequest,
    UpdateOrderStatusRequest,
    UpdateProductRequest,
} from '@nuvet/types';
import type { Product, Order } from '../hooks/use-store';

export async function fetchProducts(params: { page?: number; limit?: number; category?: string } = {}) {
    const { data } = await api.get<ApiEnvelope<Product[]>>('/store/products', { params });
    return unwrapPaginatedResponse<Product>(data);
}

export async function fetchLowStockProducts() {
    const { data } = await api.get<ApiEnvelope<Product[]>>('/inventory/low-stock');
    return unwrapArrayResponse<Product>(data);
}

export async function createProduct(input: CreateProductRequest) {
    const { data } = await api.post<ApiEnvelope<Product>>('/store/products', input);
    return unwrapResponse<Product>(data);
}

export async function updateProduct(id: string, input: UpdateProductRequest) {
    const { data } = await api.patch<ApiEnvelope<Product>>(`/store/products/${id}`, input);
    return unwrapResponse<Product>(data);
}

export async function adjustStock(input: StockAdjustmentRequest) {
    const { data } = await api.post<ApiEnvelope<unknown>>('/inventory/adjust', input);
    return unwrapResponse(data);
}

export async function fetchOrders(params: { page?: number; limit?: number } = {}) {
    const { data } = await api.get<ApiEnvelope<Order[]>>('/store/orders', { params });
    return unwrapPaginatedResponse<Order>(data);
}

export async function createOrder(input: CreateOrderRequest) {
    const { data } = await api.post<ApiEnvelope<Order>>('/store/orders', input);
    return unwrapResponse<Order>(data);
}

export async function updateOrderStatus(orderId: string, status: UpdateOrderStatusRequest['status']) {
    const { data } = await api.patch<ApiEnvelope<Order>>(`/store/orders/${orderId}/status`, { status });
    return unwrapResponse<Order>(data);
}
