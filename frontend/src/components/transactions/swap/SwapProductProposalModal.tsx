'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

import SwapSelectableProductCard from '@/components/transactions/swap/SwapSelectableProductCard';
import Button from '@/components/ui/Button';
import { useMyAvailableProducts } from '@/hooks/useMyAvailableProducts';

interface SwapProductProposalModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onSubmit: (proposedProductId: number) => Promise<void>;
}

const ITEMS_PER_PAGE = 6;

export default function SwapProductProposalModal({
  isOpen,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: SwapProductProposalModalProps) {
  const { products, isLoading, error } = useMyAvailableProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return products;
    }

    return products.filter(product => {
      return (
        product.title.toLowerCase().includes(normalizedQuery) ||
        product.category.name.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredProducts]);
  const selectedProduct =
    filteredProducts.find(product => product.id === selectedProductId) ?? null;
  const isPaginationVisible = !isLoading && filteredProducts.length >= ITEMS_PER_PAGE;

  const rangeStart = filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedProductId(null);
      setCurrentPage(1);
      return;
    }
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, isOpen, totalPages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (filteredProducts.length === 0) {
      setSelectedProductId(null);
      return;
    }

    const selectedStillExists = filteredProducts.some(product => product.id === selectedProductId);
    if (!selectedStillExists) {
      setSelectedProductId(null);
    }
  }, [filteredProducts, isOpen, selectedProductId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleSelectProduct(productId: number) {
    setSelectedProductId(current => (current === productId ? null : productId));
  }

  return (
    <div className="fixed inset-0 z-50 !m-0 overflow-y-auto bg-black/50 p-3 sm:p-4 lg:overflow-hidden">
      <div className="mx-auto flex min-h-full w-full max-w-5xl items-start justify-center py-2 sm:py-4 lg:items-center">
        <section className="max-h-[92vh] w-full overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-lg sm:p-6 lg:flex lg:h-[82vh] lg:max-h-[82vh] lg:flex-col lg:overflow-hidden">
          <header>
            <div>
              <h2 className="inline-flex items-center gap-2 text-h3 font-semibold text-card-fg">
                <ArrowLeftRight className="h-5 w-5 text-warning" />
                Proponer artículo de intercambio
              </h2>
              <p className="mt-2 text-sm text-muted-fg">
                Elige uno de tus artículos disponibles. Si lo aceptan, después podrás proponer fecha
                y lugar.
              </p>
            </div>
          </header>

          <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="space-y-2">
              <label
                htmlFor="swap-product-search"
                className="inline-flex items-center gap-2 text-xs font-medium text-muted-fg"
              >
                <Search className="h-3.5 w-3.5" />
                Buscar por nombre o categoría
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
                <input
                  id="swap-product-search"
                  type="text"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Ej. bicicleta, libros, electrónica"
                  className="w-full rounded-lg border border-input bg-card py-2 pl-9 pr-3 text-sm text-fg placeholder:text-muted-fg focus:border-ring focus:outline-none"
                />
              </div>
            </div>

            {isPaginationVisible && (
              <div className="flex justify-center lg:justify-end">
                <div className="inline-flex items-center gap-2 px-2 py-1">
                  <Button
                    variant="template"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <p className="min-w-[108px] text-center text-xs text-muted-fg">
                    Página {currentPage} de {totalPages}
                  </p>
                  <Button
                    variant="template"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 space-y-3 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
            {isLoading && <p className="text-sm text-muted-fg">Cargando tus artículos...</p>}

            {!isLoading && filteredProducts.length === 0 && products.length === 0 && (
              <p className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-fg">
                No tienes artículos disponibles para intercambio.
              </p>
            )}

            {!isLoading && filteredProducts.length === 0 && products.length > 0 && (
              <p className="rounded-lg border border-info/30 bg-info/10 p-3 text-sm text-info">
                No encontramos artículos con ese criterio. Prueba con otro nombre o categoría.
              </p>
            )}

            {!isLoading && filteredProducts.length > 0 && (
              <>
                <p className="inline-flex items-center gap-2 text-xs text-muted-fg">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Mostrando {rangeStart}-{rangeEnd} de {filteredProducts.length} artículos
                </p>
                <div className="grid gap-2 sm:grid-cols-2 lg:min-h-[332px] lg:content-start">
                  {paginatedProducts.map(product => (
                    <SwapSelectableProductCard
                      key={product.id}
                      product={product}
                      isSelected={product.id === selectedProductId}
                      onSelect={handleSelectProduct}
                    />
                  ))}
                </div>
              </>
            )}

            {(error || submitError) && <p className="text-sm text-error">{error || submitError}</p>}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <Link
              href="/products/new"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-2 text-sm text-fg hover:bg-muted"
            >
              <PlusCircle className="h-4 w-4" /> Crear nuevo producto
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="danger-outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                disabled={isSubmitting || !selectedProduct}
                onClick={() => selectedProductId && onSubmit(selectedProductId)}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar propuesta'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
