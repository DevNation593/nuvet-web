'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { AppointmentsScreen } from '@/features/appointments/components/clinic/appointments-screen';
import { AppointmentsClientView } from '@/features/appointments/components/client/appointments-client-view';

export default function AppointmentsPage() {
    const role = useAuthStore((s) => s.user?.role);
    return role === 'CLIENT' ? <AppointmentsClientView /> : <AppointmentsScreen />;
}

