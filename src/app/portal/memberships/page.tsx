import PortalMembershipsList from '@/features/memberships/components/portal/memberships-list';

export const metadata = {
    title: 'Mis membresías — NuVet',
};

/**
 * Portal del propietario · gestión de membresías.
 *
 * Página server-component delgada: delega todo el render y las
 * mutaciones al componente cliente (`PortalMembershipsList`), que ya
 * usa `useMySubscriptions` y las mutaciones de React Query. Aquí solo
 * se monta el árbol cliente dentro del layout del portal.
 */
export default function PortalMembershipsPage() {
    return <PortalMembershipsList />;
}
