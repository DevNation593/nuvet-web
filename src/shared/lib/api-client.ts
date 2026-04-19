import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { env } from './env-validation';

function resolveApiBaseUrl(raw?: string) {
    const fallback = 'https://dev.nuvet.tech/api/v1';
    const value = raw?.trim();

    if (!value) return fallback;

    const normalized = value.replace(/\/+$/, '');
    if (/\/api\/v\d+$/.test(normalized)) return normalized;
    if (/\/api$/.test(normalized)) return `${normalized}/v1`;
    return `${normalized}/api/v1`;
}

const baseURL = resolveApiBaseUrl(env.NEXT_PUBLIC_API_URL);

export const api = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false,
});

let isRefreshing = false;
let failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (err: AxiosError) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null) {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token!)));
    failedQueue = [];
}

api.interceptors.request.use((config) => {
    if (typeof window === 'undefined') return config;
    const { accessToken, tenantId } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        if (tenantId) config.headers['x-tenant-id'] = tenantId;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        if (typeof window === 'undefined') {
            return Promise.reject(error);
        }

        const { refreshToken, setAuth, logout } = useAuthStore.getState();
        if (!refreshToken) {
            logout();
            window.location.href = '/auth/login';
            return Promise.reject(error);
        }

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({
                    resolve: (token: string) => {
                        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    },
                    reject,
                });
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const { data } = await axios.post<{ data?: { accessToken: string; refreshToken: string; user: unknown } }>(
                `${baseURL}/auth/refresh`,
                { refreshToken }
            );
            const raw = data as unknown as {
                data?: { accessToken?: string; refreshToken?: string; user?: unknown };
                accessToken?: string;
                refreshToken?: string;
                user?: unknown;
            };
            const payload: { accessToken?: string; refreshToken?: string; user?: unknown } = raw?.data ?? raw;
            const newAccess = payload?.accessToken;
            const newRefresh = payload?.refreshToken;
            const user = payload?.user;
            if (newAccess && user) {
                setAuth(newAccess, newRefresh ?? refreshToken, user as Parameters<typeof setAuth>[2]);
                processQueue(null, newAccess);
                if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                return api(originalRequest);
            }
        } catch (refreshError) {
            processQueue(refreshError as AxiosError, null);
            logout();
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }

        return Promise.reject(error);
    }
);

export default api;


