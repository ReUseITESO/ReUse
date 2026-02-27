import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'ReUseITESO',
  description: 'Plataforma de compraventa de artículos de segunda mano para estudiantes del ITESO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
