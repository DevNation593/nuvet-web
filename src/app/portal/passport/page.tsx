import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

/**
 * Portal — Pasaporte médico.
 *
 * Placeholder shell. The digital pet passport (vaccines, treatments,
 * follow-ups, partner consents) will be rendered once the API contract
 * and owner-token flow are stable.
 */
export default function PortalPassportPage() {
    return (
        <Card className="mx-auto max-w-2xl">
            <CardHeader>
                <CardTitle>Pasaporte médico</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">
                    Próximamente. Aquí verás vacunas, tratamientos y controles.
                </p>
            </CardContent>
        </Card>
    );
}
