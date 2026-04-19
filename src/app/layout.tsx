import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/shared/components/providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://nuvet.app'),
    title: {
        default: 'NuVet - Plataforma SaaS Veterinaria',
        template: '%s | NuVet',
    },
    description:
        'Gestiona tu clínica veterinaria de forma eficiente. Citas, historiales médicos, inventario, facturación electrónica y más.',
    openGraph: {
        type: 'website',
        locale: 'es_EC',
        siteName: 'NuVet',
        title: 'NuVet - Plataforma SaaS Veterinaria',
        description:
            'Gestiona tu clínica veterinaria de forma eficiente. Citas, historiales médicos, inventario, facturación electrónica y más.',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body className={inter.className}>
                <Providers>
                    {children}
                    <Toaster position="top-right" />
                </Providers>
            </body>
        </html>
    );
}
