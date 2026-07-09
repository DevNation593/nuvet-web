import BillingFailuresDashboard from '@/features/memberships/components/clinic/billing-failures-dashboard';

export const metadata = {
    title: 'Intentos de cobro — Membresías',
};

/**
 * Fase 2 · Slice 2 — Reporte admin de intentos de cobro fallidos.
 * Wrapper server-component del cliente `BillingFailuresDashboard`
 * (que hace todo el fetching / mutation vía React Query).
 */
export default function ClinicBillingAttemptsPage() {
    return <BillingFailuresDashboard />;
}
