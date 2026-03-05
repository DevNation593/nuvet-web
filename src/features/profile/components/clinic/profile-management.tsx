'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useMyProfile, useUpdateMyProfile } from '@/features/profile/hooks/use-profile';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
    firstName: z.string().min(1, 'Nombre es requerido'),
    lastName: z.string().min(1, 'Apellido es requerido'),
    phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileManagement() {
    const { data: profile, isLoading } = useMyProfile();
    const updateProfile = useUpdateMyProfile();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        values: profile
            ? { firstName: profile.firstName, lastName: profile.lastName, phone: (profile as { phone?: string }).phone ?? '' }
            : undefined,
    });

    const onSubmit = async (values: ProfileFormValues) => {
        try {
            await updateProfile.mutateAsync(values);
            toast.success('Perfil actualizado');
        } catch {
            toast.error('Error al actualizar el perfil');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nombre</label>
                        <input
                            {...form.register('firstName')}
                            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {form.formState.errors.firstName && (
                            <p className="mt-1 text-xs text-red-500">{form.formState.errors.firstName.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Apellido</label>
                        <input
                            {...form.register('lastName')}
                            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                        />
                        {form.formState.errors.lastName && (
                            <p className="mt-1 text-xs text-red-500">{form.formState.errors.lastName.message}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium">Teléfono</label>
                        <input
                            {...form.register('phone')}
                            className="mt-1 block w-full rounded-md border px-3 py-2 text-sm"
                        />
                    </div>
                    <Button type="submit" disabled={updateProfile.isPending}>
                        {updateProfile.isPending ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
