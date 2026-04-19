'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { resetPassword } from '@/features/auth/services/auth-service';
import { toast } from 'sonner';
import { PawPrint, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).+$/;

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .max(64, 'Máximo 64 caracteres')
      .regex(PASSWORD_REGEX, 'Debe incluir mayúscula, minúscula y un número o carácter especial'),
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">Cargando...</div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    if (!token) {
      toast.error('Token de restablecimiento no encontrado.');
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(token, data.newPassword);
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch {
      toast.error('El enlace es inválido o ha expirado. Solicita uno nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <h2 className="text-2xl font-bold text-emerald-950">Enlace inválido</h2>
          <p className="text-emerald-800/60">
            El enlace de restablecimiento no contiene un token válido.
          </p>
          <Link href="/auth/forgot-password">
            <Button variant="outline" className="rounded-xl">Solicitar nuevo enlace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-emerald-950 tracking-tight">NuVet Tech</span>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-emerald-950">Contraseña actualizada</h2>
            </div>
            <p className="text-emerald-800/60">
              Tu contraseña ha sido restablecida. Serás redirigido al inicio de sesión...
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-emerald-950 tracking-tight">
                Nueva contraseña
              </h2>
              <p className="text-emerald-800/60 text-sm">Ingresa tu nueva contraseña.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-emerald-900 font-medium">
                  Nueva contraseña
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <Input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    {...register('newPassword')}
                    className="pl-10 pr-10 h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-emerald-600/50 ml-1">
                  Mayúscula, minúscula y un número o carácter especial
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-emerald-900 font-medium">
                  Confirmar contraseña
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    {...register('confirmPassword')}
                    className="pl-10 h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl"
                    disabled={isLoading}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
              </Button>
            </form>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-emerald-600 font-semibold hover:underline underline-offset-4 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                Volver al inicio de sesión
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
