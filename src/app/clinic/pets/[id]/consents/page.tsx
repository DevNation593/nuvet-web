'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { ConsentManagement } from '@/features/passport/components/clinic/consent-management';
import { ArrowLeft, FileSignature } from 'lucide-react';

export default function PetConsentsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();

    return (
        <div className="space-y-4 p-4 md:p-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        title="Volver al pasaporte"
                        onClick={() => router.push(`/clinic/pets/${id}`)}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Consentimientos</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona con qué clínicas se ha compartido el historial de la mascota.
                        </p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/clinic/pets/${id}`}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        Ver pasaporte
                    </Link>
                </Button>
            </div>
            <ConsentManagement />
        </div>
    );
}