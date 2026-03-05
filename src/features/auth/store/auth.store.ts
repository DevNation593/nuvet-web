import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppPermission, PermissionModule, TenantPlan, UserRole } from '@nuvet/types';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    tenantId: string | null;
    mustChangePassword: boolean;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        tenantId: string;
        tenantPlan?: TenantPlan;
        permissions?: AppPermission[];
        /** Módulos activos configurados por el tenant (anula PLAN_MODULES cuando está presente) */
        activeModules?: PermissionModule[];
    } | null;
    setAuth: (
        accessToken: string,
        refreshToken: string,
        user: AuthState['user'],
        options?: { mustChangePassword?: boolean },
    ) => void;
    updateUser: (user: Partial<NonNullable<AuthState['user']>>) => void;
    clearMustChangePassword: () => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            tenantId: null,
            mustChangePassword: false,
            user: null,
            setAuth: (accessToken, refreshToken, user, options) => {
                set({
                    accessToken,
                    refreshToken,
                    tenantId: user?.tenantId ?? null,
                    mustChangePassword: options?.mustChangePassword ?? false,
                    user,
                });
                if (typeof document !== 'undefined' && user?.role) {
                    document.cookie = `nuvet-role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
                    document.cookie = `nuvet-tenant-id=${user.tenantId ?? ''}; path=/; max-age=604800; SameSite=Lax`;
                }
            },
            updateUser: (userPatch) => {
                set((state) => {
                    if (!state.user) return state;
                    const mergedUser = { ...state.user, ...userPatch };
                    return {
                        ...state,
                        user: mergedUser,
                        tenantId: mergedUser.tenantId ?? state.tenantId,
                    };
                });
            },
            clearMustChangePassword: () => set({ mustChangePassword: false }),
            logout: () => {
                set({
                    accessToken: null,
                    refreshToken: null,
                    tenantId: null,
                    mustChangePassword: false,
                    user: null,
                });
                if (typeof document !== 'undefined') {
                    document.cookie = 'nuvet-role=; path=/; max-age=0';
                    document.cookie = 'nuvet-tenant-id=; path=/; max-age=0';
                }
            },
        }),
        {
            name: 'nuvet-auth',
        }
    )
);
