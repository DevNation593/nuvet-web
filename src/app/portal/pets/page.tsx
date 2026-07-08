import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

/**
 * Portal — Mis mascotas.
 *
 * Placeholder shell. Real list rendering, registration flows and
 * medical history cross-link will be added once the owner-side
 * pets API is wired up.
 */
export default function PortalPetsPage() {
    return (
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <CardTitle>Mis mascotas</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">
                    Próximamente. Aquí verás las mascotas registradas y su
                    historial.
                </p>
            </CardContent>
        </Card>
    );
}
