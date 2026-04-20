'use client';

import Link from 'next/link';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';

import { useCommunityProducts } from '@/hooks/useCommunityProducts';
import { useCommunities } from '@/hooks/useCommunities';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ProductCard from '@/components/products/ProductCard';
import Spinner from '@/components/ui/Spinner';
import AppSelect from '@/components/ui/AppSelect';
import { useState } from 'react';

export default function CommunitiesMarketplacePage() {
  const { communities } = useCommunities({ onlyJoined: true });
  const [selectedCommunity, setSelectedCommunity] = useState<string>('placeholder');
  const communityId =
    selectedCommunity && selectedCommunity !== 'placeholder'
      ? Number(selectedCommunity)
      : undefined;
  const { products, isLoading, error, totalCount } = useCommunityProducts(communityId);

  return (
    <ProtectedRoute>
      <main className="space-y-6 px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-6xl space-y-4">
          <Link
            href="/communities"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a comunidades
          </Link>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h1 className="text-h1 font-bold text-fg">Marketplace de Comunidades</h1>
            </div>
            <p className="text-sm text-muted-fg">
              Descubre artículos exclusivos publicados por miembros de tus comunidades.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Filter Section */}
          {communities.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <label htmlFor="community-filter" className="mb-2 block text-sm font-medium text-fg">
                Filtrar por comunidad
              </label>
              <AppSelect
                value={selectedCommunity}
                onValueChange={setSelectedCommunity}
                placeholder="Todas mis comunidades"
                options={[
                  { value: 'placeholder', label: 'Todas mis comunidades' },
                  ...communities.map(c => ({
                    value: String(c.id),
                    label: c.name,
                  })),
                ]}
              />
            </div>
          )}


          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-error/20 bg-error/5 px-4 py-8 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-error opacity-50" />
              <p className="mt-4 text-sm font-medium text-error">{error}</p>
              <p className="mt-2 text-xs text-muted-fg">
                Intenta recargar la página o selecciona otra comunidad.
              </p>
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-4 py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-fg opacity-50" />
              <p className="mt-4 text-sm font-medium text-fg">
                {selectedCommunity !== 'placeholder'
                  ? 'Esta comunidad no tiene artículos publicados'
                  : 'No hay artículos en tus comunidades'}
              </p>
              <p className="mt-2 text-xs text-muted-fg">
                {selectedCommunity !== 'placeholder'
                  ? 'Sé el primero en publicar un artículo exclusivo'
                  : 'Únete a más comunidades o publica tu primer artículo'}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-4 text-sm text-muted-fg">
                {totalCount === 1 ? '1 artículo' : `${totalCount} artículos`}
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} showCommunityBadge />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
