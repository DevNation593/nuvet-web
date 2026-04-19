import { Suspense } from 'react';
import { InsightsDashboard } from '@/features/reports/components/clinic/insights-dashboard';

export default function ClinicInsightsPage() {
    return (
        <Suspense fallback={<div className="p-4 text-sm text-muted-foreground">Cargando insights...</div>}>
            <InsightsDashboard />
        </Suspense>
    );
}
