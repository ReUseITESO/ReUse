import type { Metadata } from 'next';
import './globals.css';

import { AuthProvider } from '@/hooks/useAuth';
import { AvatarProvider } from '@/hooks/profile/useAvatar';

import Navbar from '@/components/layout/Navbar';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ReUseITESO',
  description: 'Plataforma compraventa de artículos de segunda mano para estudiantes del ITESO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn('font-sans', inter.variable)}>
      <body className="bg-bg text-fg">
        <AuthProvider>
          <AvatarProvider>
            <Navbar />
            <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</main>
          </AvatarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
