'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-h3 font-bold text-primary">
          <img
            src="/ReUseITESOLogo.png"
            alt="ReUseITESO logo"
            className="h-12 w-12 object-contain"
          />
          <span>ReUseITESO</span>
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-fg underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Productos
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/products/my"
                className="text-sm font-medium text-muted-fg underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Mis artículos
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-fg underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                Dashboard
              </Link>
            </>
          )}

          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-muted"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
                </span>
                <span className="hidden md:inline">{user?.first_name}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card py-2 shadow-lg">
                    <div className="border-b border-border px-4 pb-2">
                      <p className="text-sm font-medium text-fg">{user?.full_name}</p>
                      <p className="text-xs text-muted-fg">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-fg transition-colors hover:bg-muted"
                    >
                      Mi perfil
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-error transition-colors hover:bg-error/5"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/signin"
                className="rounded-lg px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-muted-fg hover:bg-muted sm:hidden"
          aria-label="Menú"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border px-4 pb-4 pt-2 sm:hidden">
          <Link
            href="/products"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-fg hover:bg-muted"
          >
            Productos
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/products/my"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-fg hover:bg-muted"
              >
                Mis artículos
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-fg hover:bg-muted"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-muted-fg hover:bg-muted"
              >
                Mi perfil
              </Link>
              <div className="my-2 border-t border-border pt-2">
                <p className="px-3 text-sm font-medium text-fg">{user?.full_name}</p>
                <p className="px-3 text-xs text-muted-fg">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-error hover:bg-error/5"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/auth/signin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-center text-sm font-medium text-fg hover:bg-muted"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-btn-primary px-3 py-2 text-center text-sm font-medium text-btn-primary-fg hover:bg-primary-hover"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
