import type { ApiEnvelope } from '@nuvet/types';

export interface PaginatedResponse<T> {
    data: T[];
    meta: { page: number; totalPages: number; [key: string]: unknown };
}

const DEFAULT_META = { page: 1, totalPages: 1 };

/**
 * Unwraps a single-item API envelope into its payload.
 * Handles both `{ data: { data: T } }` and `{ data: T }` shapes.
 */
export function unwrapResponse<T>(envelope: ApiEnvelope<T>): T {
    return ((envelope as { data?: T })?.data ?? envelope) as T;
}

/**
 * Unwraps a paginated API envelope into `{ data: T[], meta }`.
 * Handles inconsistent backend shapes (nested vs flat arrays).
 */
export function unwrapPaginatedResponse<T>(
    envelope: ApiEnvelope<T[]>,
): PaginatedResponse<T> {
    const payload = (envelope as { data?: unknown })?.data ?? envelope;
    const data = Array.isArray(payload)
        ? payload
        : ((payload as { data?: T[] })?.data ?? []);
    const meta =
        (payload as { meta?: PaginatedResponse<T>['meta'] })?.meta ??
        (envelope as { meta?: PaginatedResponse<T>['meta'] })?.meta ??
        DEFAULT_META;

    return { data, meta };
}

/**
 * Unwraps a list API response into a plain array.
 * Handles both `{ data: T[] }` and direct array shapes.
 */
export function unwrapArrayResponse<T>(envelope: ApiEnvelope<T[]>): T[] {
    const payload = (envelope as { data?: unknown })?.data ?? envelope;
    return Array.isArray(payload)
        ? payload
        : ((payload as { data?: T[] })?.data ?? []);
}
