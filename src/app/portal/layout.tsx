import Link from 'next/link';

import { buttonVariants } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

/**
 * Portal layout — owner-facing shell.
 *
 * Distinct from the clinical dashboard (`/clinic`) which uses `AppSidebar` +
 * `AppTopbar` + `AuthHydrationGuard`. The portal is intentionally lightweight:
 * it must work even before authentication, owner-sessions and the partner
 * consent flow land. No global state, no React Query — just chrome.
 */
export default function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-background flex min-h-screen flex-col">
            <header className="bg-card border-b">
                <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
                    <Link
                        href="/portal"
                        className="text-foreground text-base font-semibold tracking-tight md:text-lg"
                    >
                        NuVet
                        <span className="text-muted-foreground font-normal">
                            {' '}— Portal de Propietarios
                        </span>
                    </Link>
                    <nav aria-label="Portal" className="flex items-center gap-2 md:gap-4">
                        <Link
                            href="/portal/pets"
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'sm' }),
                                'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Mis mascotas
                        </Link>
                        <Link
                            href="/portal/passport"
                            className={cn(
                                buttonVariants({ variant: 'ghost', size: 'sm' }),
                                'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            Pasaporte médico
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-6 md:py-10">
                {children}
            </main>

            <footer className="border-t">
                <div className="text-muted-foreground mx-auto w-full max-w-5xl px-4 py-4 text-xs md:px-6">
                    Portal del propietario — demo
                </div>
            </footer>
        </div>
    );
}
