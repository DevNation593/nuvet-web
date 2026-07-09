import MembershipPlansAdmin from '@/features/memberships/components/clinic/membership-plans-admin';

export const metadata = {
    title: 'Planes de Membresía — Configuración',
};

/**
 * Wrapper server-component de la pantalla admin de planes de membresía.
 * Toda la lógica de fetching/mutaciones vive en `MembershipPlansAdmin`
 * (componente cliente) para aprovechar React Query sin hydration mismatch.
 */
export default function ClinicSettingsMembershipPlansPage() {
    return <MembershipPlansAdmin />;
}
