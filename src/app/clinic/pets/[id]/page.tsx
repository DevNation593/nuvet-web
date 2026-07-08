'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { PassportView } from '@/features/passport/components/clinic/passport-view';
import { ArrowLeft, FileSignature } from 'lucide-react';
import Link from 'next/link';

export default function PetDetailPage({
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
                        title="Volver a la lista de mascotas"
                        onClick={() => router.push('/clinic/pets')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Pasaporte médico</h1>
                        <p className="text-sm text-muted-foreground">
                            Vista consolidada del historial clínico de la mascota.
                        </p>
                    </div>
                </div>
                <Button variant="outline" asChild>
                    <Link href={`/clinic/pets/${id}/consents`}>
                        <FileSignature className="h-4 w-4 mr-2" />
                        Consentimientos
                    </Link>
                </Button>
            </div>
            <PassportView petId={id} />
        </div>
    );
}