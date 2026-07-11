import VaccinationCampaignsList from '@/features/vaccinations/components/clinic/vaccination-campaigns-list';

export const metadata = {
    title: 'Campañas de vacunación — Clínica',
};

/**
 * Server-component thin wrapper para la lista admin de campañas de
 * vacunación (Fase 3 · Slice 1). Toda la lógica de fetching / mutaciones
 * vive en el cliente `VaccinationCampaignsList` (React Query).
 */
export default function ClinicVaccinationCampaignsPage() {
    return <VaccinationCampaignsList />;
}
