'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { useAuthStore } from '@/features/auth/store/auth.store';
import api from '@/shared/lib/api-client';
import { toast } from 'sonner';
import type { ApiEnvelope, LoginRequest, LoginResponse } from '@nuvet/types';

const loginSchema = z.object({
    email: z.string().email('Correo inválido'),
    password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">Cargando...</div>}>
            <LoginPageContent />
        </Suspense>
    );
}

function LoginPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        try {
            const payloadData: LoginRequest = data;
            const res = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', payloadData);
            const payload = res.data?.data ?? res.data;
            const { user, tenant, accessToken, refreshToken, recommendPasswordChange } = payload;
            if (!user || !accessToken) throw new Error('Respuesta inválida');
            setAuth(accessToken, refreshToken ?? '', {
                ...user,
                tenantPlan: tenant?.plan ?? user.tenantPlan,
            }, {
                mustChangePassword: Boolean(recommendPasswordChange),
            });
            toast.success('Sesión iniciada');
            const from = searchParams.get('from') || (user.role === 'CLIENT' ? '/client' : '/clinic');
            router.push(from);
        } catch (err: unknown) {
            const message = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                : 'No se pudo iniciar sesión';
            toast.error(message || 'No se pudo iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
            <div className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Inicia sesión en NuVet</h1>
                <p className="mt-2 text-sm text-muted-foreground">Ingresa con las credenciales proporcionadas por el administrador.</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                        Correo electrónico
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        {...register('email')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
                    )}
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        {...register('password')}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
                    )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
                </Button>
            </form>
        </div>
    );
}
