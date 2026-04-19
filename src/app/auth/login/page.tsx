'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Componentes de tu sistema real
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useAuthStore } from '@/features/auth/store/auth.store';
import api from '@/shared/lib/api-client';
import { toast } from 'sonner';

// Iconos (Estilo Lovable/Lucide)
import { PawPrint, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import type { ApiEnvelope, LoginResponse } from '@nuvet/types';

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-background">Cargando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
    const resolveAuthErrorMessage = (error: unknown): string => {
      if (typeof error !== 'object' || error === null) return 'Credenciales inválidas';

      const maybeResponse = (error as {
        response?: { data?: { error?: { message?: string } } };
      }).response;

      return maybeResponse?.data?.error?.message ?? 'Credenciales inválidas';
    };

  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const res = await api.post<ApiEnvelope<LoginResponse>>('/auth/login', data);
      const payload = res.data?.data ?? res.data;
      const { user, tenant, accessToken, refreshToken, recommendPasswordChange } = payload;

      if (!user || !accessToken) throw new Error('Error en la respuesta del servidor');

      setAuth(accessToken, refreshToken ?? '', {
        ...user,
        tenantPlan: tenant?.plan ?? user.tenantPlan,
      }, {
        mustChangePassword: Boolean(recommendPasswordChange),
      });

      toast.success('¡Bienvenido de nuevo!');
      
      const from = searchParams.get('from') || (user.role === 'CLIENT' ? '/client' : '/clinic');
      router.push(from);
    } catch (err: unknown) {
      const message = resolveAuthErrorMessage(err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F1FDF9] p-12 flex-col justify-between relative border-r border-emerald-50 h-full">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/gato-login.webp" 
            alt="Fondo NuVet Tech" 
            fill
            priority
            className="object-cover object-center opacity-85 mix-blend-multiply" 
          />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-black/60 to-[#1F5C52]/90" />
          <div className="absolute inset-0 bg-black backdrop-blur-[1px] opacity-15" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">NuVet Tech</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
            Cuidamos de quienes <br />
            <span className="text-emerald-300 italic font-serif text-5xl">más te quieren.</span>
          </h1>
          <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-md">
            Inicia sesión para revisar el carnet digital de tu mascota, agendar su próxima cita o consultar sus últimos resultados médicos.
          </p>
          <div className="w-fit flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-emerald-200 border-2 border-[#1F5C52] flex items-center justify-center text-xs font-bold text-emerald-700 shadow-sm">U</div>
              ))}
            </div>
            <p className="text-emerald-50 text-sm font-medium">
              Más de <span className="font-bold text-white">500 veterinarias</span> ya confían en NuVet Tech.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-emerald-200/40 text-xs flex justify-between items-center w-full">
          <p>© 2026 NuVet Tech. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-white cursor-pointer transition-colors">Términos</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 h-full bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-emerald-950 tracking-tight">¡Hola de nuevo!</h2>
            <p className="text-emerald-800/60 font-medium">Entra para revisar la salud y bienestar de tu mejor amigo.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              {/* INPUT EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-emerald-900 font-medium">Correo Electrónico</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 transition-colors group-hover:text-emerald-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo..."
                    {...register('email')}
                    /* CLASES CLAVE: transition-all, hover:border-emerald-500, hover:bg-white */
                    className="pl-10 h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 font-medium ml-1">{errors.email.message}</p>}
              </div>

              {/* INPUT PASSWORD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-emerald-900 font-medium">Contraseña</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400 transition-colors group-hover:text-emerald-600" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña..."
                    {...register('password')}
                    /* CLASES CLAVE: transition-all, hover:border-emerald-500, hover:bg-white */
                    className="pl-10 pr-10 h-12 bg-emerald-50/30 border-emerald-100 focus:ring-emerald-500 focus:border-emerald-500 hover:border-emerald-500 hover:bg-white transition-all rounded-xl outline-none"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400 hover:text-emerald-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 font-medium ml-1">{errors.password.message}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base shadow-lg shadow-emerald-200 transition-all active:scale-[0.98] group" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : (
                <span className="flex items-center justify-center">
                  Iniciar Sesión
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-xs text-emerald-800/40 font-medium">
              El acceso es proporcionado por el administrador de tu clínica.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}