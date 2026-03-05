import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/shared/components/providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'NuVet - Plataforma SaaS Veterinaria',
    description: 'Gestiona tu clínica veterinaria de forma eficiente',
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
