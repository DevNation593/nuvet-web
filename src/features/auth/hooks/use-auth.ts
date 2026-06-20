import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { login as loginService, logout as logoutService } from '../services/auth-service';
import { cancelAllRequests, resetLogoutFlag } from '@/shared/lib/api-client';
import type { LoginRequest } from '@nuvet/types';

export function useLogin() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const login = useCallback(
        async (input: LoginRequest, redirectTo?: string) => {
            // Resetear el flag de logout por si acaso
            resetLogoutFlag();
            
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
    const queryClient = useQueryClient();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = useCallback(async () => {
        // 1. INMEDIATAMENTE marcar que estamos haciendo logout para bloquear nuevas peticiones
        cancelAllRequests();
        
        // 2. Cancelar queries de React Query en vuelo
        await queryClient.cancelQueries();
        
        // 3. Intentar logout en servidor (esta petición podría fallar, ignoramos el error)
        try {
            await logoutService();
        } catch {
            // silently ignore server-side logout errors
        }
        
        // 4. Limpiar el token y estado de autenticación INMEDIATAMENTE
        logout();
        
        // 5. Limpiar toda la caché de React Query
        queryClient.clear();
        
        // 6. Redirigir a login usando window.location para forzar recarga completa
        // Esto previene que cualquier componente monte y haga peticiones
        window.location.href = '/auth/login';
    }, [logout, router, queryClient]);

    return { logout: handleLogout };
}
