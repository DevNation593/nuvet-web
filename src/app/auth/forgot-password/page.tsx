'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { requestPasswordReset } from '@/features/auth/services/auth-service';
import { toast } from 'sonner';
import { PawPrint, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido'),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await requestPasswordReset(data.email);
      setSent(true);
    } catch {
      toast.error('Error al enviar el correo. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-emerald-950 tracking-tight">NuVet Tech</span>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-emerald-950">Correo enviado</h2>
            </div>
            <p className="text-emerald-800/60">
              Si existe una cuenta con ese correo, recibirás instrucciones para
              restablecer tu contraseña. Revisa tu bandeja de entrada y la carpeta
              de spam.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="mt-4 w-full rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-emerald-950 tracking-tight">
                Restablecer contraseña
              </h2>
              <p className="text-emerald-800/60 text-sm">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu
                contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-emerald-900 font-medium">
                  Correo Electrónico
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 transition-colors group-hover:text-emerald-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    {...register('email')}
                    className="pl-10 h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace de restablecimiento'}
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
