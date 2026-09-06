import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
  title: 'Finanzas MVP',
  description: 'Sistema de Gestión de Finanzas Personales',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-background text-slate-100 font-sans min-h-screen overflow-x-hidden antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
