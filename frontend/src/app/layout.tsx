import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'ReUseITESO',
  description: 'Plataforma compraventa de artículos de segunda mano para estudiantes del ITESO',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
