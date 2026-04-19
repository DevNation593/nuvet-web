import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-xl font-semibold text-foreground">Página no encontrada</h2>
            <p className="max-w-md text-center text-sm text-muted-foreground">
                La página que buscas no existe o fue movida.
            </p>
            <Button asChild variant="default">
                <Link href="/clinic">Volver al panel</Link>
            </Button>
        </div>
    );
}
