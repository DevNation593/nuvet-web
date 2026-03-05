import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { login as loginService, logout as logoutService } from '../services/auth-service';
import type { LoginRequest } from '@nuvet/types';

export function useLogin() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const login = useCallback(
        async (input: LoginRequest, redirectTo?: string) => {
            const { user, tenant, accessToken, refreshToken, recommendPasswordChange } =
                await loginService(input);

            setAuth(accessToken, refreshToken ?? '', {
                ...user,
                tenantPlan: tenant?.plan ?? user.tenantPlan,
            }, { mustChangePassword: Boolean(recommendPasswordChange) });

            const fallback = user.role === 'CLIENT' ? '/clinic' : '/clinic';
            router.push(redirectTo ?? fallback);
        },
        [setAuth, router],
    );

    return { login };
}

export function useLogout() {
    const router = useRouter();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = useCallback(async () => {
        try {
            await logoutService();
        } catch {
            // silently ignore server-side logout errors
        }
        logout();
        router.push('/auth/login');
    }, [logout, router]);

    return { logout: handleLogout };
}
