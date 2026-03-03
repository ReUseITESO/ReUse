'use client';

import Link from 'next/link';
import { Plus, Search, Package } from 'lucide-react';

import { useMockAuth } from '@/context/MockAuthContext';

const ACTIONS = [
  {
    href: '/products/new',
    icon: Plus,
    label: 'Publicar item',
    description: 'Comparte algo con la comunidad',
    color: 'text-iteso-600',
    hoverBg: 'hover:bg-iteso-50',
    iconBg: 'bg-iteso-100',
  },
  {
    href: '/products',
    icon: Search,
    label: 'Explorar marketplace',
    description: 'Encuentra lo que necesitas',
    color: 'text-emerald-600',
    hoverBg: 'hover:bg-emerald-50',
    iconBg: 'bg-emerald-100',
  },
  {
    href: '/products?mine=true',
    icon: Package,
    label: 'Mis publicaciones',
    description: 'Administra tus items',
    color: 'text-amber-600',
    hoverBg: 'hover:bg-amber-50',
    iconBg: 'bg-amber-100',
  },
] as const;

export default function QuickActions() {
  const { isAuthenticated } = useMockAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ACTIONS.map(action => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${action.hoverBg}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.iconBg} transition-transform duration-200 group-hover:scale-110`}
            >
              <Icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{action.label}</p>
              <p className="text-xs text-slate-500">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
