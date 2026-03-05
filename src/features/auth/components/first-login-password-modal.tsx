'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { useChangeMyPassword } from '@/features/profile/hooks/use-profile';
import { useAuthStore } from '@/features/auth/store/auth.store';

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Ingresa la contraseña temporal'),
    newPassword: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 'Debe incluir mayúscula, minúscula y número o símbolo'),
    confirmPassword: z.string().min(1, 'Confirma la nueva contraseña'),
}).refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export function FirstLoginPasswordModal() {
    const router = useRouter();
    const mustChangePassword = useAuthStore((state) => state.mustChangePassword);
    const clearMustChangePassword = useAuthStore((state) => state.clearMustChangePassword);
    const logout = useAuthStore((state) => state.logout);
    const changePassword = useChangeMyPassword();

    const form = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        values: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });

    if (!mustChangePassword) return null;

    return (
        <Dialog open onOpenChange={() => undefined}>
            <DialogContent showClose={false}>
                <DialogHeader>
                    <DialogTitle>Cambio de contraseña recomendado</DialogTitle>
                    <DialogDescription>
                        Es tu primer inicio de sesión. Actualiza tu contraseña para continuar.
                    </DialogDescription>
                </DialogHeader>
                <form
                    className="space-y-3"
                    onSubmit={form.handleSubmit(async (values) => {
                        try {
                            await changePassword.mutateAsync({
                                currentPassword: values.currentPassword,
                                newPassword: values.newPassword,
                            });
                            clearMustChangePassword();
                            toast.success('Contraseña actualizada correctamente');
                        } catch (error: unknown) {
                            const message =
                                error && typeof error === 'object' && 'response' in error
                                    ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                    : undefined;
                            toast.error(message ?? 'No se pudo actualizar la contraseña');
                        }
                    })}
                >
                    <Field label="Contraseña temporal" error={form.formState.errors.currentPassword?.message}>
                        <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('currentPassword')} />
                    </Field>
                    <Field label="Nueva contraseña" error={form.formState.errors.newPassword?.message}>
                        <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('newPassword')} />
                    </Field>
                    <Field label="Confirmar nueva contraseña" error={form.formState.errors.confirmPassword?.message}>
                        <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('confirmPassword')} />
                    </Field>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                logout();
                                router.push('/auth/login');
                            }}
                        >
                            Cerrar sesión
                        </Button>
                        <Button type="submit" disabled={changePassword.isPending}>
                            {changePassword.isPending ? 'Actualizando...' : 'Actualizar contraseña'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <label className="block space-y-1">
            <span className="text-sm font-medium">{label}</span>
            {children}
            {error ? <span className="text-xs text-destructive">{error}</span> : null}
        </label>
    );
}
