'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { PetsManagement } from '@/features/pets/components/clinic/pets-management';
import { PetsClientView } from '@/features/pets/components/client/pets-client-view';

export default function PetsPage() {
    const role = useAuthStore((s) => s.user?.role);
    return role === 'CLIENT' ? <PetsClientView /> : <PetsManagement />;
}

