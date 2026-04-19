import { Suspense } from 'react';
import { BillingManagement } from '@/features/billing/components/clinic/billing-management';

export default function ClinicBillingPage() {
    return (
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando facturación...</div>}>
            <BillingManagement />
        </Suspense>
    );
}
