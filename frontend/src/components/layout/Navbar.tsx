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
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-blue-600">
          ReUseITESO
        </Link>

        <div className="hidden items-center gap-6 sm:flex">
          <Link
            href="/products"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
          >
            Productos
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/products/my"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Mis artículos
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
              >
                Mi perfil
              </Link>
            </>
          )}

          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
                </span>
                <span className="hidden md:inline">{user?.first_name}</span>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-2 shadow-lg">
                    <div className="border-b border-gray-100 px-4 pb-2">
                      <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Mi perfil
                    </Link>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:hidden"
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
        <div className="border-t border-gray-200 px-4 pb-4 pt-2 sm:hidden">
          <Link
            href="/products"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Productos
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/products/my"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Mis artículos
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Mi perfil
              </Link>
              <div className="my-2 border-t border-gray-100 pt-2">
                <p className="px-3 text-sm font-medium text-gray-900">{user?.full_name}</p>
                <p className="px-3 text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  handleSignOut();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              <Link
                href="/auth/signin"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/signup"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
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
