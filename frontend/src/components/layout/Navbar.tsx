'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { NAV_LINKS } from '@/components/layout/navLinks';
import { Bell, User, LogOut, Menu, X, Plus, ArrowLeftRight, History } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  }

  const visibleLinks = NAV_LINKS.filter(l => !l.authOnly || isAuthenticated);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-h3 font-bold text-primary">
          <img
            src="/ReUseITESOLogo.png"
            alt="ReUseITESO logo"
            className="h-12 w-12 object-contain"
          />
          <span className="hidden sm:inline">ReUseITESO</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {visibleLinks.map(link => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-fg hover:bg-muted hover:text-fg'}`}
              >
                <Icon className="h-4 w-4" /> {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop right */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/products/new"
                className="flex items-center gap-1.5 rounded-lg bg-btn-primary px-3 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
              >
                <Plus className="h-4 w-4" /> Publicar
              </Link>
              <button
                className="relative rounded-lg p-2 text-muted-fg transition-colors hover:bg-muted"
                aria-label="Notificaciones"
              >
                <Bell className="h-5 w-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors ${profileOpen ? 'bg-muted' : 'hover:bg-muted'}`}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
                  </span>
                  <span className="hidden text-fg lg:inline">{user?.first_name}</span>
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-card py-1 shadow-lg">
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-sm font-medium text-fg">{user?.full_name}</p>
                        <p className="text-xs text-muted-fg">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-fg transition-colors hover:bg-info/10"
                      >
                        <User className="h-4 w-4 text-info" /> Mi perfil
                      </Link>
                      <Link
                        href="/transactions"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-fg transition-colors hover:bg-info/10"
                      >
                        <ArrowLeftRight className="h-4 w-4 text-info" /> Transacciones
                      </Link>
                      <Link
                        href="/transaction-history"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-fg transition-colors hover:bg-info/10"
                      >
                        <History className="h-4 w-4 text-info" /> Historial de transacciones
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-error transition-colors hover:bg-error/5"
                      >
                        <LogOut className="h-4 w-4" /> Cerrar sesion
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
                className="rounded-lg px-4 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted"
              >
                Iniciar sesion
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

        {/* Mobile hamburger */}
        <button
          onClick={() => {
            setMenuOpen(!menuOpen);
            setProfileOpen(false);
          }}
          className="rounded-lg p-2 text-muted-fg transition-colors hover:bg-muted md:hidden"
          aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-card px-4 pb-4 pt-2 md:hidden">
          <div className="space-y-1">
            {visibleLinks.map(link => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-primary/10 text-primary' : 'text-muted-fg hover:bg-muted'}`}
                >
                  <Icon className="h-5 w-5" /> {link.label}
                </Link>
              );
            })}
            {isAuthenticated && (
              <>
                <Link
                  href="/products/new"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                >
                  <Plus className="h-5 w-5" /> Publicar item
                </Link>
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-fg transition-colors hover:bg-muted">
                  <Bell className="h-5 w-5" /> Notificaciones
                </button>
              </>
            )}
          </div>
          {isAuthenticated ? (
            <div className="mt-3 border-t border-border pt-3">
              <div className="flex items-center gap-3 px-3 py-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
                </span>
                <div>
                  <p className="text-sm font-medium text-fg">{user?.full_name}</p>
                  <p className="text-xs text-muted-fg">{user?.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-fg transition-colors hover:bg-muted"
              >
                <User className="h-5 w-5" /> Mi perfil
              </Link>
              <Link
                href="/transactions"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-info transition-colors hover:bg-info/10"
              >
                <ArrowLeftRight className="h-5 w-5" /> Transacciones
              </Link>
              <Link
                href="/transaction-history"
                onClick={closeMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-info transition-colors hover:bg-info/10"
              >
                <History className="h-5 w-5" /> Historial de transacciones
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-error transition-colors hover:bg-error/5"
              >
                <LogOut className="h-5 w-5" /> Cerrar sesion
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Link
                href="/auth/signin"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-fg hover:bg-muted"
              >
                Iniciar sesion
              </Link>
              <Link
                href="/auth/signup"
                onClick={closeMenu}
                className="rounded-lg bg-btn-primary px-3 py-2.5 text-center text-sm font-medium text-btn-primary-fg hover:bg-primary-hover"
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
