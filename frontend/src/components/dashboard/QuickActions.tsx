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
    color: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
    iconBg: 'bg-blue-100',
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
    href: '/profile',
    icon: Package,
    label: 'Mis publicaciones',
    description: 'Administra tus items',
    color: 'text-amber-600',
    hoverBg: 'hover:bg-amber-50',
    iconBg: 'bg-amber-100',
  },
] as const;

export default function QuickActions() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {ACTIONS.map(action => {
        const Icon = action.icon;
        return (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${action.hoverBg}`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${action.iconBg} transition-transform duration-200 group-hover:scale-110`}
            >
              <Icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
