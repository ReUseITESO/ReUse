import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

import { MockAuthProvider } from '@/context/MockAuthContext';
import MockUserSelector from '@/components/auth/MockUserSelector';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReUseITESO',
  description: 'Plataforma de reuso de articulos para la comunidad ITESO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-slate-50 font-sans text-slate-900 antialiased">
        <MockAuthProvider>
          <header className="border-b border-iteso-800/20 bg-iteso-900">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm">
                    ♻️
                  </span>
                  ReUseITESO
                </Link>
                <nav className="flex items-center gap-4">
                  <Link
                    href="/products"
                    className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    Productos
                  </Link>
                </nav>
              </div>
              <MockUserSelector />
            </div>
          </header>
          <div className="mx-auto max-w-6xl px-6">{children}</div>
        </MockAuthProvider>
      </body>
    </html>
  );
}
