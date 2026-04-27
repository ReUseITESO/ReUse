'use client';

import { useState, useMemo, useEffect } from 'react';
import { RefreshCcw, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { useMyProducts } from '@/hooks/useMyProducts';
import type { Product } from '@/types/product';
import SwapProductCard from './SwapProductCard';

interface SwapProductPickerModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (productId: number) => Promise<void>;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
}

export default function SwapProductPickerModal({
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}: SwapProductPickerModalProps) {
  const { products, isLoading, error } = useMyProducts();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const isLargeScreen = useMediaQuery('(min-width: 640px)');
  const itemsPerPage = isLargeScreen ? 6 : 3;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null);
      setSearchQuery('');
      setCurrentPage(1);
    }
  }, [isOpen]);

  const availableProducts = useMemo(
    () => products.filter(p => p.status === 'disponible'),
    [products],
  );
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return availableProducts;
    return availableProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [availableProducts, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredProducts.length, itemsPerPage, currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, currentPage, itemsPerPage]);

  if (!isOpen) return null;

  function handleToggle(product: Product) {
    setSelectedId(prev => (prev === product.id ? null : product.id));
  }

  async function handleConfirm() {
    if (!selectedId) return;
    await onConfirm(selectedId);
  }

  const startCount = (currentPage - 1) * itemsPerPage + 1;
  const endCount = Math.min(currentPage * itemsPerPage, filteredProducts.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm transition-opacity sm:p-4">
      <div className="mx-auto flex h-auto w-full max-w-4xl items-center justify-center">
        <div
          role="dialog"
          aria-modal="true"
          className="flex h-fit max-h-[90vh] w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-lg sm:max-w-2xl"
        >
          <div className="flex flex-col overflow-hidden p-4 sm:p-6">
            <div className="mb-2 flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-warning" />
              <h2 className="text-h3 font-semibold text-card-fg">
                Proponer artículo de intercambio
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted-fg">
              Elige uno de tus artículos disponibles. Si lo aceptan, después podrás proponer fecha y
              lugar.
            </p>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
              <input
                type="text"
                placeholder="Ej. bicicleta, libros, electrónica"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/25"
              />
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-fg">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>
                  Mostrando {filteredProducts.length > 0 ? startCount : 0}-{endCount} de{' '}
                  {filteredProducts.length} artículos
                </span>
              </div>

              {!isLoading && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="template"
                    className="h-7 px-2 text-xs border-border"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="template"
                    className="h-7 px-2 text-xs border-border"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="overflow-y-auto min-h-[280px] sm:min-h-[350px]">
              {isLoading && (
                <div className="flex py-12 items-center justify-center">
                  <Spinner />
                </div>
              )}
              {error && <ErrorMessage message={error} />}

              {!isLoading && !error && availableProducts.length === 0 && (
                <EmptyState message="No tienes artículos disponibles. Publica algo primero para poder intercambiar." />
              )}

              {!isLoading &&
                !error &&
                availableProducts.length > 0 &&
                filteredProducts.length === 0 && (
                  <EmptyState message="No se encontraron resultados. Intenta con otro término de búsqueda." />
                )}

              {!isLoading && filteredProducts.length > 0 && (
                <div className="grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2">
                  {paginatedProducts.map(product => (
                    <SwapProductCard
                      key={product.id}
                      product={product}
                      isSelected={selectedId === product.id}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="danger-outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm sm:px-4 sm:py-2"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!selectedId || isSubmitting}
                className="px-3 py-1.5 text-sm sm:px-4 sm:py-2"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar propuesta'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
