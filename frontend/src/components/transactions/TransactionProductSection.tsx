'use client';

import { useEffect, useMemo, useState } from 'react';

import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import ProductBasicDetails from '@/components/products/ProductBasicDetails';
import { getCachedProductCondition, useProductDetail } from '@/hooks/useProductDetail';

import type { TransactionProductSummary } from '@/types/transaction';
import Image from 'next/image';

interface TransactionProductSectionProps {
  product: TransactionProductSummary;
}

const DESCRIPTION_LIMIT = 180;

export default function TransactionProductSection({ product }: TransactionProductSectionProps) {
  const { product: fullProduct, isLoading: isLoadingFullProduct } = useProductDetail(
    String(product.id),
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    setIsDescriptionExpanded(false);
  }, [product.id]);

  const cachedCondition = useMemo(() => getCachedProductCondition(product.id), [product.id]);

  const resolvedCondition = useMemo(
    () => product.condition ?? fullProduct?.condition ?? cachedCondition ?? null,
    [product.condition, fullProduct?.condition, cachedCondition],
  );

  const isConditionLoading = !product.condition && isLoadingFullProduct;

  const hasLongDescription = product.description.length > DESCRIPTION_LIMIT;
  const description =
    hasLongDescription && !isDescriptionExpanded
      ? `${product.description.slice(0, DESCRIPTION_LIMIT).trimEnd()}...`
      : product.description;

  return (
    <div className="space-y-3">
      <h2 className="text-h2 font-semibold text-fg">Producto de la transacción</h2>
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {product.image_url ? (
              <Image
                height={160}
                width={160}
                src={product.image_url}
                alt={product.title}
                className="h-40 w-full object-cover"
              />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-2 bg-muted text-muted-fg">
                <CategoryPlaceholderIcon categoryName={product.category.name} />
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <ProductBasicDetails
              title={product.title}
              description={description}
              categoryName={product.category.name}
              condition={resolvedCondition}
              fallbackConditionLabel={
                isConditionLoading ? 'Cargando condición...' : 'Sin condición'
              }
              transactionType={product.transaction_type}
              price={product.price}
              showTransactionBadge
            />

            {hasLongDescription && (
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(prev => !prev)}
                className="text-sm font-medium text-primary transition-colors hover:text-primary-hover"
              >
                {isDescriptionExpanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
