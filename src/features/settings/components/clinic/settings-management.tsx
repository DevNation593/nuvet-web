'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { NotificationChannel, UserRole } from '@nuvet/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/components/ui/dialog';
import { useCreateUser, useUsers } from '@/features/users/hooks/use-users';
import {
    useBillingConfig,
    useCreateNotificationTemplate,
    useNotificationTemplates,
    useTenantSettings,
    useUpdateBillingConfig,
    useUpdateTenantSettings,
} from '@/features/settings/hooks/use-settings';
import { useChangeMyPassword } from '@/features/profile/hooks/use-profile';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { ClinicRowsSkeleton, ClinicStateCard } from '@/shared/components/clinic/ui-states';
import { toast } from 'sonner';

const tenantSchema = z.object({
    name: z.string().min(2),
    phone: z.string().optional(),
    address: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
});

const userSchema = z.object({
    email: z.string().email(),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    role: z.nativeEnum(UserRole),
    password: z.string().min(8),
    phone: z.string().optional(),
});

const templateSchema = z.object({
    key: z.string().min(2),
    channel: z.nativeEnum(NotificationChannel),
    subject: z.string().optional(),
    bodyTemplate: z.string().min(3),
});

const billingSchema = z.object({
    billingApiKey: z.string().optional(),
    billingApiSecret: z.string().optional(),
    billingEstablishmentCode: z.string().max(10).optional(),
    billingEmissionPointCode: z.string().max(10).optional(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
    newPassword: z
        .string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 'Debe incluir mayúscula, minúscula y número o símbolo'),
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
}).refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export function SettingsManagement() {
    const [userModalOpen, setUserModalOpen] = useState(false);
    const [templateModalOpen, setTemplateModalOpen] = useState(false);

    const tenantQuery = useTenantSettings();
    const usersQuery = useUsers({ limit: 100 });
    const templatesQuery = useNotificationTemplates();
    const billingQuery = useBillingConfig();
    const updateTenant = useUpdateTenantSettings();
    const updateBilling = useUpdateBillingConfig();
    const createUser = useCreateUser();
    const createTemplate = useCreateNotificationTemplate();
    const changePassword = useChangeMyPassword();
    const { logout } = useAuthStore();

    const tenantForm = useForm<z.infer<typeof tenantSchema>>({
        resolver: zodResolver(tenantSchema),
        values: {
            name: tenantQuery.data?.name ?? '',
            phone: tenantQuery.data?.phone ?? '',
            address: tenantQuery.data?.address ?? '',
            email: tenantQuery.data?.email ?? '',
            website: tenantQuery.data?.website ?? '',
        },
    });
    const passwordForm = useForm<z.infer<typeof passwordSchema>>({
        resolver: zodResolver(passwordSchema),
        values: { currentPassword: '', newPassword: '', confirmPassword: '' },
    });
    const billingForm = useForm<z.infer<typeof billingSchema>>({
        resolver: zodResolver(billingSchema),
        values: {
            billingApiKey: billingQuery.data?.billingApiKey ?? '',
            billingApiSecret: '',
            billingEstablishmentCode: billingQuery.data?.billingEstablishmentCode ?? '001',
            billingEmissionPointCode: billingQuery.data?.billingEmissionPointCode ?? '001',
        },
    });

    return (
        <div className="space-y-4">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">Ajustes</h2>
                <p className="text-sm text-muted-foreground">Configuración general, usuarios y notificaciones</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Datos de clínica</CardTitle>
                </CardHeader>
                <CardContent>
                    {tenantQuery.isLoading ? (
                        <ClinicRowsSkeleton rows={5} />
                    ) : tenantQuery.isError ? (
                        <ClinicStateCard message="No se pudo cargar la configuración de la clínica." tone="error" />
                    ) : (
                    <form
                        className="grid gap-3 sm:grid-cols-2"
                        onSubmit={tenantForm.handleSubmit(async (values) => {
                            try {
                                await updateTenant.mutateAsync({
                                    ...values,
                                    email: values.email || undefined,
                                    website: values.website || undefined,
                                });
                                toast.success('Configuración actualizada');
                            } catch {
                                toast.error('No se pudo actualizar');
                            }
                        })}
                    >
                        <Field label="Nombre" error={tenantForm.formState.errors.name?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...tenantForm.register('name')} />
                        </Field>
                        <Field label="Teléfono">
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...tenantForm.register('phone')} />
                        </Field>
                        <Field label="Dirección">
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...tenantForm.register('address')} />
                        </Field>
                        <Field label="Correo">
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...tenantForm.register('email')} />
                        </Field>
                        <Field label="Sitio web">
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...tenantForm.register('website')} />
                        </Field>
                        <div className="sm:col-span-2">
                            <Button type="submit" disabled={updateTenant.isPending}>
                                {updateTenant.isPending ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </form>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Seguridad</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Recomendación: cambia tu contraseña en tu primer inicio de sesión.
                    </p>
                    <form
                        className="grid gap-3 sm:grid-cols-2"
                        onSubmit={passwordForm.handleSubmit(async (values) => {
                            try {
                                await changePassword.mutateAsync({
                                    currentPassword: values.currentPassword,
                                    newPassword: values.newPassword,
                                });
                                toast.success('Contraseña actualizada. Inicia sesión nuevamente.');
                                logout();
                                window.location.assign('/auth/login');
                            } catch (error: unknown) {
                                const message =
                                    error && typeof error === 'object' && 'response' in error
                                        ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
                                        : undefined;
                                toast.error(message ?? 'No se pudo actualizar la contraseña');
                            }
                        })}
                    >
                        <Field label="Contraseña actual" error={passwordForm.formState.errors.currentPassword?.message}>
                            <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...passwordForm.register('currentPassword')} />
                        </Field>
                        <Field label="Nueva contraseña" error={passwordForm.formState.errors.newPassword?.message}>
                            <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...passwordForm.register('newPassword')} />
                        </Field>
                        <Field label="Confirmar nueva contraseña" error={passwordForm.formState.errors.confirmPassword?.message}>
                            <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...passwordForm.register('confirmPassword')} />
                        </Field>
                        <div className="sm:col-span-2">
                            <Button type="submit" disabled={changePassword.isPending}>
                                {changePassword.isPending ? 'Actualizando...' : 'Cambiar contraseña'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Facturación electrónica</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-3 text-xs text-muted-foreground">
                        Configura las credenciales de Faktur para la emisión de facturas electrónicas.
                        {billingQuery.data?.hasBillingApiSecret && (
                            <span className="ml-1 font-medium text-green-600">API Secret configurado.</span>
                        )}
                    </p>
                    <form
                        className="grid gap-3 sm:grid-cols-2"
                        onSubmit={billingForm.handleSubmit(async (values) => {
                            try {
                                const payload: Record<string, string> = {};
                                if (values.billingApiKey) payload.billingApiKey = values.billingApiKey;
                                if (values.billingApiSecret) payload.billingApiSecret = values.billingApiSecret;
                                if (values.billingEstablishmentCode) payload.billingEstablishmentCode = values.billingEstablishmentCode;
                                if (values.billingEmissionPointCode) payload.billingEmissionPointCode = values.billingEmissionPointCode;
                                await updateBilling.mutateAsync(payload);
                                toast.success('Configuración de facturación actualizada');
                                billingForm.setValue('billingApiSecret', '');
                            } catch {
                                toast.error('No se pudo actualizar la configuración');
                            }
                        })}
                    >
                        <Field label="API Key (Faktur)">
                            <input
                                className="h-10 w-full rounded-md border border-input px-3 text-sm font-mono"
                                placeholder="fk_live_..."
                                {...billingForm.register('billingApiKey')}
                            />
                        </Field>
                        <Field label="API Secret (Faktur)">
                            <input
                                type="password"
                                className="h-10 w-full rounded-md border border-input px-3 text-sm font-mono"
                                placeholder={billingQuery.data?.hasBillingApiSecret ? '••••••••••' : 'Ingresa el secret'}
                                {...billingForm.register('billingApiSecret')}
                            />
                        </Field>
                        <Field label="Código de Establecimiento">
                            <input
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                placeholder="001"
                                {...billingForm.register('billingEstablishmentCode')}
                            />
                        </Field>
                        <Field label="Código Punto de Emisión">
                            <input
                                className="h-10 w-full rounded-md border border-input px-3 text-sm"
                                placeholder="001"
                                {...billingForm.register('billingEmissionPointCode')}
                            />
                        </Field>
                        <div className="sm:col-span-2">
                            <Button type="submit" disabled={updateBilling.isPending}>
                                {updateBilling.isPending ? 'Guardando...' : 'Guardar configuración'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">Usuarios del personal</CardTitle>
                        <Button size="sm" onClick={() => setUserModalOpen(true)}>
                            Nuevo usuario
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {usersQuery.isLoading && <ClinicRowsSkeleton rows={4} />}
                        {usersQuery.isError && (
                            <ClinicStateCard message="No se pudieron cargar los usuarios del personal." tone="error" />
                        )}
                        {!usersQuery.isLoading && !usersQuery.isError && (usersQuery.data?.data?.length ?? 0) === 0 && (
                            <ClinicStateCard message="No hay usuarios del personal registrados." />
                        )}
                        {usersQuery.data?.data?.map((user) => (
                            <div key={user.id} className="rounded-md border bg-muted/20 p-2 text-sm">
                                <p className="font-medium">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {user.email} · {user.role}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base">Plantillas de notificación</CardTitle>
                        <Button size="sm" onClick={() => setTemplateModalOpen(true)}>
                            Nueva plantilla
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {templatesQuery.isLoading && <ClinicRowsSkeleton rows={4} />}
                        {templatesQuery.isError && (
                            <ClinicStateCard message="No se pudieron cargar las plantillas." tone="error" />
                        )}
                        {!templatesQuery.isLoading && !templatesQuery.isError && (templatesQuery.data?.length ?? 0) === 0 && (
                            <ClinicStateCard message="No hay plantillas registradas." />
                        )}
                        {templatesQuery.data?.map((template) => (
                            <div key={template.id} className="rounded-md border bg-muted/20 p-2 text-sm">
                                <p className="font-medium">
                                    {template.key} {template.isSystem ? '(Sistema)' : ''}
                                </p>
                                <p className="text-xs text-muted-foreground">{template.channel}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <UserModal
                open={userModalOpen}
                onOpenChange={setUserModalOpen}
                loading={createUser.isPending}
                onSubmit={async (values) => {
                    try {
                        await createUser.mutateAsync(values);
                        toast.success('Usuario creado');
                        setUserModalOpen(false);
                    } catch {
                        toast.error('No se pudo crear el usuario');
                    }
                }}
            />

            <TemplateModal
                open={templateModalOpen}
                onOpenChange={setTemplateModalOpen}
                loading={createTemplate.isPending}
                onSubmit={async (values) => {
                    try {
                        await createTemplate.mutateAsync(values);
                        toast.success('Plantilla creada');
                        setTemplateModalOpen(false);
                    } catch {
                        toast.error('No se pudo crear la plantilla');
                    }
                }}
            />
        </div>
    );
}

function UserModal({
    open,
    onOpenChange,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    onSubmit: (values: z.infer<typeof userSchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        values: {
            email: '',
            firstName: '',
            lastName: '',
            role: UserRole.VET,
            password: '',
            phone: '',
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nuevo usuario</DialogTitle>
                    <DialogDescription>Crea un usuario del personal</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <Field label="Correo" error={form.formState.errors.email?.message}>
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('email')} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Nombre" error={form.formState.errors.firstName?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('firstName')} />
                        </Field>
                        <Field label="Apellido" error={form.formState.errors.lastName?.message}>
                            <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('lastName')} />
                        </Field>
                    </div>
                    <Field label="Rol" error={form.formState.errors.role?.message}>
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('role')}>
                            {Object.values(UserRole)
                                .filter((role) => role !== UserRole.CLIENT)
                                .map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                        </select>
                    </Field>
                    <Field label="Contraseña" error={form.formState.errors.password?.message}>
                        <input type="password" className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('password')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function TemplateModal({
    open,
    onOpenChange,
    loading,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    loading: boolean;
    onSubmit: (values: z.infer<typeof templateSchema>) => Promise<void>;
}) {
    const form = useForm<z.infer<typeof templateSchema>>({
        resolver: zodResolver(templateSchema),
        values: {
            key: '',
            channel: NotificationChannel.IN_APP,
            subject: '',
            bodyTemplate: '',
        },
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva plantilla</DialogTitle>
                    <DialogDescription>Configura mensaje reutilizable</DialogDescription>
                </DialogHeader>
                <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                    <Field label="Clave" error={form.formState.errors.key?.message}>
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('key')} />
                    </Field>
                    <Field label="Canal" error={form.formState.errors.channel?.message}>
                        <select className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('channel')}>
                            {Object.values(NotificationChannel).map((channel) => (
                                <option key={channel} value={channel}>
                                    {channel}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Asunto">
                        <input className="h-10 w-full rounded-md border border-input px-3 text-sm" {...form.register('subject')} />
                    </Field>
                    <Field label="Plantilla del mensaje" error={form.formState.errors.bodyTemplate?.message}>
                        <textarea rows={3} className="w-full rounded-md border border-input px-3 py-2 text-sm" {...form.register('bodyTemplate')} />
                    </Field>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar'}
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
            {error && <span className="text-xs text-destructive">{error}</span>}
        </label>
    );
}
