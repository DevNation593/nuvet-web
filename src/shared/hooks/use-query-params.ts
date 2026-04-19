'use client';

import { useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/**
 * Hook to sync key-value pairs with URL search params.
 * Filters, search text, pagination, etc. survive page refresh and are shareable.
 *
 * Usage:
 *   const { params, setParam, setParams, removeParam } = useQueryParams();
 *   const page = params.get('page') ?? '1';
 *   setParam('page', '2');
 */
export function useQueryParams() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (updates: Record<string, string | null>) => {
            const params = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === '') {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            }
            return params.toString();
        },
        [searchParams],
    );

    const setParam = useCallback(
        (key: string, value: string | null) => {
            const qs = createQueryString({ [key]: value });
            router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
        },
        [createQueryString, pathname, router],
    );

    const setParams = useCallback(
        (updates: Record<string, string | null>) => {
            const qs = createQueryString(updates);
            router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false });
        },
        [createQueryString, pathname, router],
    );

    const removeParam = useCallback(
        (key: string) => setParam(key, null),
        [setParam],
    );

    return {
        params: searchParams,
        setParam,
        setParams,
        removeParam,
    };
}

/**
 * Returns a numeric param or a default.
 */
export function useNumericParam(key: string, defaultValue: number): number {
    const searchParams = useSearchParams();
    const raw = searchParams.get(key);
    if (!raw) return defaultValue;
    const parsed = parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : defaultValue;
}
