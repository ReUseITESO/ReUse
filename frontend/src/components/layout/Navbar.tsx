'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  ShoppingBag,
  Package,
  Bell,
  Trophy,
  User,
  LogOut,
  Menu,
  X,
  Plus,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
  authOnly: boolean;
}

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Inicio', icon: Home, authOnly: false },
  { href: '/products', label: 'Marketplace', icon: ShoppingBag, authOnly: false },
  { href: '/products/my', label: 'Mis items', icon: Package, authOnly: true },
  { href: '/dashboard', label: 'Gamificacion', icon: Trophy, authOnly: true },
];

export default function Navbar() {
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  function handleSignOut() {
    signOut();
    setMenuOpen(false);
    setProfileOpen(false);
    router.push('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  function isActive(href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  }

  const visibleLinks = NAV_LINKS.filter(link => !link.authOnly || isAuthenticated);

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm text-white">
            R
          </span>
          <span className="hidden sm:inline">ReUseITESO</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />
          ) : isAuthenticated ? (
            <>
              {/* Publish button */}
              <Link
                href="/products/new"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Publicar
              </Link>

              {/* Notifications placeholder */}
              <button
                className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${
                    profileOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  <span className="hidden text-gray-700 lg:inline">{user?.first_name}</span>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        Mi perfil
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesion
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Iniciar sesion
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

        {/* Mobile hamburger button */}
        <button
          onClick={() => { setMenuOpen(!menuOpen); setProfileOpen(false); }}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
          aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 pb-4 pt-2 md:hidden">
          {/* Nav links */}
          <div className="space-y-1">
            {visibleLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <Link
                  href="/products/new"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <Plus className="h-5 w-5" />
                  Publicar item
                </Link>
                <button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                  aria-label="Notificaciones"
                >
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </button>
              </>
            )}
          </div>

          {/* Mobile user section */}
          {isAuthenticated ? (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                  {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                <User className="h-5 w-5" />
                Mi perfil
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Cerrar sesion
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
              <Link
                href="/auth/signin"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/auth/signup"
                onClick={closeMenu}
                className="rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700"
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
