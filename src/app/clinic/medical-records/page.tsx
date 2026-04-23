import { Suspense } from 'react';
import { MedicalRecordsManagement } from '@/features/medical-records/components/clinic/medical-records-management';
import { Loader2 } from 'lucide-react';

export default function ClinicMedicalRecordsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}>
            <MedicalRecordsManagement />
        </Suspense>
    );
}