'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { reportError } from '@/shared/lib/error-reporting';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        reportError(error, { digest: error.digest, tags: { boundary: 'app' } });
    }, [error]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-semibold text-foreground">Algo salió mal</h2>
            <p className="max-w-md text-center text-sm text-muted-foreground">
                Ocurrió un error inesperado. Si el problema persiste, contacta al soporte.
            </p>
            {error.digest && (
                <p className="text-xs text-muted-foreground">Ref: {error.digest}</p>
            )}
            <Button onClick={reset} variant="default">
                Reintentar
            </Button>
        </div>
    );
}
