'use client';

import { useEffect } from 'react';
import { reportError } from '@/shared/lib/error-reporting';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, { digest: error.digest, tags: { boundary: 'global' } });
    }, [error]);

    return (
        <html lang="es">
            <body className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="mx-auto max-w-md text-center">
                    <h1 className="text-4xl font-bold text-gray-900">Error inesperado</h1>
                    <p className="mt-4 text-gray-600">
                        Ocurrió un problema al cargar la aplicación. Por favor, inténtalo de nuevo.
                    </p>
                    {error.digest && (
                        <p className="mt-2 text-xs text-gray-400">Ref: {error.digest}</p>
                    )}
                    <button
                        onClick={reset}
                        className="mt-6 rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Reintentar
                    </button>
                </div>
            </body>
        </html>
    );
}
