'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteProduct } from '@/hooks/useDeleteProduct';
import { useChangeProductStatus } from '@/hooks/useChangeProductStatus';
import {
  getCategoryStyle,
  getConditionLabel,
  getConditionStyle,
  getPriceColor,
} from '@/lib/productStyles';

import { formatPrice, formatTimeAgo, formatTransactionLabel } from '@/lib/utils';

import type { Product, ProductStatus } from '@/types/product';

interface MyProductCardProps {
  product: Product;
  onProductChanged: () => void;
}

const STATUS_TRANSITIONS: Record<ProductStatus, { label: string; value: ProductStatus }[]> = {
  disponible: [
    { label: 'Pausar', value: 'pausado' },
    { label: 'Marcar en proceso', value: 'en_proceso' },
    { label: 'Cancelar', value: 'cancelado' },
  ],
  pausado: [
    { label: 'Reactivar', value: 'disponible' },
    { label: 'Cancelar', value: 'cancelado' },
  ],
  en_proceso: [
    { label: 'Marcar disponible', value: 'disponible' },
    { label: 'Marcar completado', value: 'completado' },
    { label: 'Cancelar', value: 'cancelado' },
  ],
  completado: [],
  cancelado: [],
};

export default function MyProductCard({ product, onProductChanged }: MyProductCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [statusFeedbackKind, setStatusFeedbackKind] = useState<'success' | 'error'>('success');
  const { deleteProduct, isLoading: isDeleting } = useDeleteProduct();
  const { changeStatus, isLoading: isChangingStatus } = useChangeProductStatus();

  const isDisponible = product.status === 'disponible';
  const transitions = STATUS_TRANSITIONS[product.status];
  const categoryClass = getCategoryStyle(product.category.name);
  const priceColorClass = getPriceColor(product.transaction_type);

  const isSale = product.transaction_type === 'sale';
  const priceDisplay =
    isSale && product.price
      ? formatPrice(product.price)
      : formatTransactionLabel(product.transaction_type);

  async function handleDelete() {
    const success = await deleteProduct(product.id);
    if (success) {
      setIsDeleteOpen(false);
      onProductChanged();
    }
  }

  async function handleStatusChange(newStatus: ProductStatus) {
    const result = await changeStatus(product.id, newStatus);
    if (result.product) {
      const message =
        newStatus === 'pausado'
          ? 'Publicacion pausada exitosamente.'
          : newStatus === 'disponible' && product.status === 'pausado'
            ? 'Publicacion reactivada exitosamente.'
            : 'Estado actualizado exitosamente.';
      setStatusFeedbackKind('success');
      setStatusFeedback(message);
      onProductChanged();
      return;
    }

    if (result.error) {
      setStatusFeedbackKind('error');
      setStatusFeedback(result.error);
    }
  }

  async function confirmPause() {
    setIsPauseOpen(false);
    await handleStatusChange('pausado');
  }

  return (
    <>
      <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <div className="flex h-36 items-center justify-center bg-muted">
          {product.images?.[0]?.image_url ? (
            <img
              src={product.images[0].image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-fg">
              <CategoryPlaceholderIcon categoryName={product.category.name} />
              <span className="text-sm"> Sin imagen </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge className={categoryClass}>{product.category.name}</Badge>
            <StatusBadge status={product.status} />
          </div>

          <h3 className="line-clamp-2 text-body font-semibold text-card-fg">{product.title}</h3>

          <p className={`text-h3 font-bold ${priceColorClass}`}>{priceDisplay}</p>

          <div className="flex items-center gap-3 text-xs text-muted-fg">
            <Badge className={getConditionStyle(product.condition)}>
              {getConditionLabel(product.condition)}
            </Badge>
            <span>{formatTimeAgo(product.created_at)}</span>
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
            {transitions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {transitions.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    disabled={
                      isChangingStatus ||
                      (t.value === 'pausado' && Boolean(product.has_active_transaction))
                    }
                    title={
                      t.value === 'pausado' && product.has_active_transaction
                        ? 'No puedes pausar este articulo porque tiene una transaccion activa.'
                        : undefined
                    }
                    onClick={() => {
                      if (t.value === 'pausado') {
                        setIsPauseOpen(true);
                        return;
                      }
                      handleStatusChange(t.value);
                    }}
                    className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            {statusFeedback && (
              <p
                className={`text-xs ${
                  statusFeedbackKind === 'success' ? 'text-success' : 'text-error'
                }`}
              >
                {statusFeedback}
              </p>
            )}

            <div className="flex items-center gap-2">
              {isDisponible && (
                <Link
                  href={`/products/${product.id}/edit`}
                  className="inline-flex items-center rounded-lg bg-btn-primary p-2 text-btn-primary-fg transition-colors hover:bg-primary-hover"
                  title="Editar producto"
                  aria-label="Editar producto"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              )}

              {isDisponible && (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="inline-flex items-center rounded-lg bg-error p-2 text-error-fg transition-colors hover:opacity-90"
                  title="Eliminar producto"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Eliminar producto"
        message={`Se eliminara permanentemente "${product.title}". Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />

      <ConfirmDialog
        isOpen={isPauseOpen}
        title="Pausar publicacion"
        message="¿Estas seguro de que quieres pausar esta publicacion? No sera visible en el marketplace."
        confirmLabel="Pausar"
        variant="primary"
        isLoading={isChangingStatus}
        onConfirm={confirmPause}
        onCancel={() => setIsPauseOpen(false)}
      />
    </>
  );
}
