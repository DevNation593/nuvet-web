'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import api from '@/shared/lib/api-client';
import { PawPrint, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">Verificando...</div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    api
      .post('/auth/verify-email', { token })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-emerald-950 tracking-tight">NuVet</span>
        </div>

        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <p className="text-emerald-800/60">Verificando tu correo electrónico...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h2 className="text-2xl font-bold text-emerald-950">Correo verificado</h2>
            <p className="text-emerald-800/60">
              Tu correo electrónico ha sido verificado exitosamente. Ya puedes iniciar sesión.
            </p>
            <Link href="/auth/login">
              <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold">
                Iniciar sesión
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold text-emerald-950">Verificación fallida</h2>
            <p className="text-emerald-800/60">
              El enlace de verificación es inválido o ha expirado.
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="mt-4 rounded-xl">Ir al inicio de sesión</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
