'use client';

import { useState } from 'react';
import { Package, RefreshCcw, Search } from 'lucide-react';

import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';
import { useMyProducts } from '@/hooks/useMyProducts';
import type { Product } from '@/types/product';

interface SwapProductPickerModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: (productId: number) => Promise<void>;
}

export default function SwapProductPickerModal({
  isOpen,
  isSubmitting,
  onCancel,
  onConfirm,
}: SwapProductPickerModalProps) {
  const { products, isLoading, error } = useMyProducts();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const availableProducts = products.filter(p => p.status === 'disponible');

  function handleToggle(product: Product) {
    setSelectedId(prev => (prev === product.id ? null : product.id));
  }

  async function handleConfirm() {
    if (!selectedId) return;
    await onConfirm(selectedId);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-2xl items-end sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="swap-picker-modal-title"
          className="max-h-[94vh] w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="max-h-[94vh] overflow-y-auto p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <RefreshCcw className="h-5 w-5 text-accent" />
              <h2
                id="swap-picker-modal-title"
                className="text-h3 font-semibold text-card-fg"
              >
                Proponer artículo para intercambio
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-fg">
              Selecciona uno de tus artículos disponibles para proponer al vendedor.
            </p>

            <div className="mt-4">
              {isLoading && <Spinner />}

              {error && <ErrorMessage message={error} />}

              {!isLoading && !error && availableProducts.length === 0 && (
                <div className="rounded-lg border border-border bg-muted/40 p-6 text-center text-sm text-muted-fg">
                  <Search className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  <p>No tienes artículos disponibles para intercambiar.</p>
                  <p className="mt-1">Publica un artículo primero.</p>
                </div>
              )}

              {!isLoading && availableProducts.length > 0 && (
                <ul className="space-y-2">
                  {availableProducts.map(product => {
                    const isSelected = selectedId === product.id;
                    return (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleToggle(product)}
                          className={[
                            'w-full rounded-lg border p-3 text-left transition-colors',
                            isSelected
                              ? 'border-secondary bg-secondary/10 ring-1 ring-secondary'
                              : 'border-border bg-card hover:bg-muted/60',
                          ].join(' ')}
                        >
                          <div className="flex items-center gap-3">
                            {product.images[0] ? (
                              <img
                                src={product.images[0].image_url}
                                alt={product.title}
                                className="h-12 w-12 shrink-0 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted">
                                <Package className="h-6 w-6 text-muted-fg" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-fg">{product.title}</p>
                              <p className="text-xs text-muted-fg">{product.category.name}</p>
                            </div>
                            <div
                              className={[
                                'h-4 w-4 shrink-0 rounded-full border-2 transition-colors',
                                isSelected
                                  ? 'border-secondary bg-secondary'
                                  : 'border-muted-fg bg-transparent',
                              ].join(' ')}
                            />
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <p className="mt-4 text-xs text-muted-fg">
              {/* TODO(core-team): Notificar al vendedor cuando se proponga el artículo. */}
              El vendedor recibirá tu propuesta y decidirá si acepta o la rechaza.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="danger-outline" onClick={onCancel} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!selectedId || isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Proponer artículo'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
