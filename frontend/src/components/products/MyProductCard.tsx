'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteProduct } from '@/hooks/useDeleteProduct';
import { useChangeProductStatus } from '@/hooks/useChangeProductStatus';
import { getCategoryStyle, getConditionLabel, getConditionStyle, getPriceColor } from '@/lib/productStyles';

import {
  formatPrice,
  formatTimeAgo,
  formatTransactionLabel,
} from '@/lib/utils';

import type { Product, ProductStatus } from '@/types/product';

interface MyProductCardProps {
  product: Product;
  onProductChanged: () => void;
}

const STATUS_TRANSITIONS: Record<ProductStatus, { label: string; value: ProductStatus }[]> = {
  disponible: [
    { label: 'Marcar en proceso', value: 'en_proceso' },
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
  const { deleteProduct, isLoading: isDeleting } = useDeleteProduct();
  const { changeStatus, isLoading: isChangingStatus } = useChangeProductStatus();

  const isDisponible = product.status === 'disponible';
  const transitions = STATUS_TRANSITIONS[product.status];
  const categoryClass = getCategoryStyle(product.category.name);
  const priceColorClass = getPriceColor(product.transaction_type);

  const isSale = product.transaction_type === 'sale';
  const priceDisplay = isSale && product.price
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
    if (result) {
      onProductChanged();
    }
  }

  return (
    <>
      <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
        <div className="flex h-36 items-center justify-center bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-muted-fg">
              {product.category.name} - Imagen
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge className={categoryClass}>{product.category.name}</Badge>
            <StatusBadge status={product.status} />
          </div>

          <h3 className="line-clamp-2 text-body font-semibold text-card-fg">
            {product.title}
          </h3>

          <p className={`text-h3 font-bold ${priceColorClass}`}>{priceDisplay}</p>

          <div className="flex items-center gap-3 text-xs text-muted-fg">
            <Badge className={getConditionStyle(product.condition)}>{getConditionLabel(product.condition)}</Badge>
            <span>{formatTimeAgo(product.created_at)}</span>
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-border pt-3">
            {transitions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {transitions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    disabled={isChangingStatus}
                    onClick={() => handleStatusChange(t.value)}
                    className="rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              {isDisponible && (
                <Link
                  href={`/products/${product.id}/edit`}
                  className="rounded-lg bg-btn-primary px-3 py-1.5 text-xs font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
                >
                  Editar
                </Link>
              )}

              {isDisponible && (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-error-fg transition-colors hover:opacity-90"
                >
                  Eliminar
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
    </>
  );
}
