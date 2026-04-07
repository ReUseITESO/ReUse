'use client';

import Link from 'next/link';
import { Plus, Search, Package } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ACTIONS = [
  {
    href: '/products/new',
    icon: Plus,
    label: 'Publicar item',
    description: 'Comparte algo con la comunidad',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    href: '/products',
    icon: Search,
    label: 'Explorar marketplace',
    description: 'Encuentra lo que necesitas',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    href: '/products/my',
    icon: Package,
    label: 'Mis publicaciones',
    description: 'Administra tus items',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
] as const;

export default function QuickActions() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ACTIONS.map(a => {
        const Icon = a.icon;
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.bg} transition-transform duration-200 group-hover:scale-110`}
            >
              <Icon className={`h-5 w-5 ${a.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">{a.label}</p>
              <p className="text-xs text-muted-fg">{a.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
