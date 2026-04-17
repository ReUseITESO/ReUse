'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteProduct } from '@/hooks/useDeleteProduct';
import {
  getCategoryStyle,
  getConditionLabel,
  getConditionStyle,
  getPriceColor,
} from '@/lib/productStyles';

import { formatPrice, formatTimeAgo, formatTransactionLabel } from '@/lib/utils';

import type { Product } from '@/types/product';

interface MyProductCardProps {
  product: Product;
  onProductChanged: () => void;
}

export default function MyProductCard({ product, onProductChanged }: MyProductCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const { deleteProduct, isLoading: isDeleting } = useDeleteProduct();

  const isDisponible = product.status === 'disponible';
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
    </>
  );
}
