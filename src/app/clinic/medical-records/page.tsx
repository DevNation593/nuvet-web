'use client';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { MedicalRecordsManagement } from '@/features/medical-records/components/clinic/medical-records-management';
import { HistoryClientView } from '@/features/medical-records/components/client/history-client-view';

export default function ClinicMedicalRecordsPage() {
    const role = useAuthStore((s) => s.user?.role);
    return role === 'CLIENT' ? <HistoryClientView /> : <MedicalRecordsManagement />;
}

