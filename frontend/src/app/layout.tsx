import './globals.css';
import type { Metadata } from 'next';

import { AuthProvider } from '@/hooks/useAuth';
import GlobalChallengeToasts from '@/components/gamification/GlobalChallengeToasts';
import { AvatarProvider } from '@/hooks/profile/useAvatar';

import Navbar from '@/components/layout/Navbar';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'ReUseITESO',
  description: 'Plataforma compraventa de artículos de segunda mano para estudiantes del ITESO',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={cn('font-sans', inter.variable)} suppressHydrationWarning>
      <body className="bg-bg text-fg">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GlobalChallengeToasts />
            <AvatarProvider>
              <Navbar />
              <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</main>
            </AvatarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
