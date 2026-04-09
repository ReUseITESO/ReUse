'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, CheckCircle2, ChevronLeft, ChevronRight, PackagePlus } from 'lucide-react';

import SelectableSwapProductCard from '@/components/transactions/swapFlow/SelectableSwapProductCard';
import { useResponsiveSwapPageSize } from '@/components/transactions/swapFlow/useResponsiveSwapPageSize';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';
import { useMyProducts } from '@/hooks/useMyProducts';

interface SwapProposalSectionProps {
  selectedProductId: number | null;
  disabled?: boolean;
  showCreateButton?: boolean;
  onSelectProduct: (productId: number) => void;
  onCreateNewProduct?: () => void;
}

export default function SwapProposalSection({
  selectedProductId,
  disabled = false,
  showCreateButton = false,
  onSelectProduct,
  onCreateNewProduct,
}: SwapProposalSectionProps) {
  const { products, isLoading, error, fetchMyProducts } = useMyProducts();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = useResponsiveSwapPageSize();

  const availableProducts = useMemo(
    () => products.filter(product => product.status === 'disponible'),
    [products],
  );

  const totalPages = Math.max(1, Math.ceil(availableProducts.length / itemsPerPage));
  const selectedProduct = useMemo(
    () => availableProducts.find(product => product.id === selectedProductId) ?? null,
    [availableProducts, selectedProductId],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const sliceStart = (currentPage - 1) * itemsPerPage;
  const visibleProducts = availableProducts.slice(sliceStart, sliceStart + itemsPerPage);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <ErrorMessage message={error} onRetry={() => fetchMyProducts()} />
      </div>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="rounded-lg border border-info/30 bg-info/10 p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-info">
              <ArrowRightLeft className="h-4 w-4" />
              Propuesta de intercambio
            </p>
            <p className="mt-1 text-xs text-info">
              Elige un producto disponible de tus publicaciones para enviarlo como propuesta.
            </p>
          </div>

          <span className="rounded-full border border-info/30 bg-card px-2 py-1 text-xs font-medium text-info">
            {availableProducts.length} disponibles
          </span>
        </div>

        <p className="mt-2 text-xs text-muted-fg">
          {selectedProduct
            ? `Seleccionado: ${selectedProduct.title}`
            : 'Selecciona un artículo para continuar'}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {selectedProduct ? 'Producto listo para enviar' : 'Ningún producto seleccionado'}
        </div>

        {showCreateButton && onCreateNewProduct && (
          <Button variant="secondary" onClick={onCreateNewProduct} disabled={disabled}>
            <PackagePlus className="mr-2 inline h-4 w-4" />
            Crear nuevo producto
          </Button>
        )}
      </div>

      {availableProducts.length === 0 ? (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning-fg">
          <p className="font-medium">No tienes productos disponibles para proponer.</p>
          <p className="mt-1">Publica uno nuevo y vuelve para completar el intercambio.</p>
        </div>
      ) : (
        <>
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1.5">
              <Button
                variant="template"
                disabled={disabled || currentPage <= 1}
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                className="px-2 py-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-fg">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="template"
                disabled={disabled || currentPage >= totalPages}
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                className="px-2 py-1"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="space-y-3 pt-1">
            {visibleProducts.map(product => (
              <SelectableSwapProductCard
                key={product.id}
                product={product}
                isSelected={selectedProductId === product.id}
                disabled={disabled}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
