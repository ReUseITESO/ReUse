import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ReUseITESO',
  description: 'Plataforma de compraventa de artículos de segunda mano para estudiantes del ITESO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
