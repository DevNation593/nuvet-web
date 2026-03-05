'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AdoptionsManagement } from '@/features/adoptions/components/clinic/adoptions-management';
import { AdoptionsClientView } from '@/features/adoptions/components/client/adoptions-client-view';

export default function AdoptionsPage() {
    const role = useAuthStore((s) => s.user?.role);
    return role === 'CLIENT' ? <AdoptionsClientView /> : <AdoptionsManagement />;
}

