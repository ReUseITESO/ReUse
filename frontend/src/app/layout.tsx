import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

import { MockAuthProvider } from '@/context/MockAuthContext';
import MockUserSelector from '@/components/auth/MockUserSelector';

export const metadata: Metadata = {
  title: 'ReUseITESO',
  description: 'Plataforma de compraventa de artículos de segunda mano para estudiantes del ITESO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <MockAuthProvider>
          <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
              <div className="flex items-center gap-6">
                <Link href="/" className="text-lg font-bold text-blue-600">
                  ReUseITESO
                </Link>
                <nav className="flex items-center gap-4">
                  <Link
                    href="/products"
                    className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                  >
                    Productos
                  </Link>
                </nav>
              </div>
              <MockUserSelector />
            </div>
          </header>
          <div className="mx-auto max-w-6xl">{children}</div>
        </MockAuthProvider>
      </body>
    </html>
  );
}
