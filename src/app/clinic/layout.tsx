import { AppSidebar } from '@/shared/components/layout/app-sidebar';
import { AppTopbar } from '@/shared/components/layout/app-topbar';
import { AuthHydrationGuard } from '@/shared/components/auth-hydration-guard';

export default function ClinicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthHydrationGuard>
            <div className="min-h-screen bg-background md:grid md:grid-cols-[auto_1fr]">
                <AppSidebar />
                <div className="flex min-h-screen flex-col">
                    <AppTopbar title="Panel clínico" />
                    <main className="flex-1 p-4 md:p-6">{children}</main>
                </div>
            </div>
        </AuthHydrationGuard>
    );
}
