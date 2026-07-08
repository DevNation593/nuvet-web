import Link from 'next/link';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

/**
 * Portal home — landing for pet owners.
 *
 * No data fetching yet: this is a static shell so the route exists
 * in the build pipeline before the owner API is wired up.
 */
export default function PortalHomePage() {
    return (
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <CardTitle>Bienvenido al portal de tu mascota</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild>
                        <Link href="/portal/pets">Mis mascotas</Link>
                    </Button>
                    <Button asChild variant="outline">
                        <Link href="/portal/passport">Pasaporte médico</Link>
                    </Button>
                </div>
                <p className="text-muted-foreground text-xs italic">
                    Esta es una vista preliminar. Algunas funciones se
                    habilitarán cuando el backend esté disponible.
                </p>
            </CardContent>
        </Card>
    );
}
