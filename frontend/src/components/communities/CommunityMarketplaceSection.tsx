'use client';

import { ShoppingBag, Package, Lock, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ProductCard from '@/components/products/ProductCard';
import Spinner from '@/components/ui/Spinner';
import { apiClient } from '@/lib/api';
import type { Product } from '@/types/product';

interface CommunityMarketplaceSectionProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  communityName?: string;
  isAdmin?: boolean;
  communityId?: number;
  onProductRemoved?: () => void;
}

export default function CommunityMarketplaceSection({
  products,
  isLoading,
  error,
  isAdmin = false,
  communityId,
  onProductRemoved,
}: CommunityMarketplaceSectionProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleRemoveProduct = async (productId: number) => {
    if (!communityId) return;

    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto de la comunidad?')) {
      return;
    }

    setDeletingId(productId);
    setDeleteError(null);
    try {
      await apiClient(`/social/communities/${communityId}/products/${productId}/`, {
        method: 'DELETE',
      });
      onProductRemoved?.();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error al eliminar producto');
      setDeletingId(null);
    }
  };
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-center gap-2">
          <Spinner />
          <span className="text-sm text-muted-fg">Cargando marketplace...</span>
        </div>
      </div>
    );
  }

  if (error) {
    const is403 =
      error.includes('403') ||
      error.toLowerCase().includes('permission') ||
      error.toLowerCase().includes('not a member');

    if (is403) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
          <Lock className="mx-auto h-12 w-12 text-amber-600 opacity-50" />
          <p className="mt-4 text-sm font-medium text-amber-900">
            Debes ser miembro de esta comunidad para ver el marketplace
          </p>
          <p className="mt-2 text-xs text-amber-700">
            Haz clic en el botón &quot;Unirse&quot; arriba para acceder a los artículos exclusivos
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-error/20 bg-error/5 p-6">
        <p className="text-sm font-medium text-error">{error}</p>
        <p className="mt-2 text-xs text-muted-fg">Intenta recargar la página</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-fg opacity-50" />
        <p className="mt-4 text-sm font-medium text-fg">
          Esta comunidad no tiene artículos publicados
        </p>
        <p className="mt-2 text-xs text-muted-fg">
          Sé el primero en compartir algo exclusivo con la comunidad
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deleteError && (
        <div className="rounded-lg border border-error/20 bg-error/5 p-3">
          <p className="text-xs font-medium text-error">{deleteError}</p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-fg">Marketplace</h3>
          <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary">
            {products.length}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <div key={product.id} className="relative">
            <ProductCard product={product} showCommunityBadge={false} />
            {isAdmin && (
              <button
                onClick={() => handleRemoveProduct(product.id)}
                disabled={deletingId === product.id}
                className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-red-600 px-2 py-1 text-xs font-medium text-white transition-all hover:bg-red-700 disabled:opacity-50"
                title="Eliminar producto de la comunidad"
              >
                <Trash2 className="h-3 w-3" />
                {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
