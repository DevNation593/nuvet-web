'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { StoreManagement } from '@/features/store/components/clinic/store-management';
import { StoreClientView } from '@/features/store/components/client/store-client-view';

export default function StorePage() {
    const role = useAuthStore((s) => s.user?.role);
    return role === 'CLIENT' ? <StoreClientView /> : <StoreManagement />;
}

