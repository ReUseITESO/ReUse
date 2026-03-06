'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useDeleteProduct } from '@/hooks/useDeleteProduct';
import { useChangeProductStatus } from '@/hooks/useChangeProductStatus';

import {
  formatConditionLabel,
  formatPrice,
  formatTimeAgo,
  formatTransactionLabel,
} from '@/lib/utils';

import type { Product, ProductStatus } from '@/types/product';

interface MyProductCardProps {
  product: Product;
  onProductChanged: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Libros: 'bg-[#2B7FFF]/10 text-[#2B7FFF]',
  Electronica: 'bg-[#AD46FF]/10 text-[#AD46FF]',
  'Ropa ITESO': 'bg-[#F6339A]/10 text-[#F6339A]',
  Calculadoras: 'bg-[#FF6900]/10 text-[#FF6900]',
  Apuntes: 'bg-[#10B981]/10 text-[#10B981]',
};

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
  const categoryClass = CATEGORY_COLORS[product.category.name] ?? 'bg-gray-100 text-gray-700';

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
      <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="flex h-36 items-center justify-center bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-400">
              {product.category.name} - Imagen
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <Badge className={categoryClass}>{product.category.name}</Badge>
            <StatusBadge status={product.status} />
          </div>

          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
            {product.title}
          </h3>

          <p className="text-lg font-bold text-blue-600">{priceDisplay}</p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{formatConditionLabel(product.condition)}</span>
            <span>{formatTimeAgo(product.created_at)}</span>
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-3">
            {transitions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {transitions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    disabled={isChangingStatus}
                    onClick={() => handleStatusChange(t.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
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
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Editar
                </Link>
              )}

              {isDisponible && (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
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
