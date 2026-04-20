'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import ProductBasicDetails from '@/components/products/ProductBasicDetails';
import { getCachedProductCondition, useProductDetail } from '@/hooks/useProductDetail';

import type { TransactionProductSummary } from '@/types/transaction';

interface TransactionProductSectionProps {
  product: TransactionProductSummary;
  title?: string;
}

const DESCRIPTION_LIMIT = 180;

export default function TransactionProductSection({
  product,
  title = 'Producto de la transacción',
}: TransactionProductSectionProps) {
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
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-h2 font-semibold text-fg">{title}</h2>
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1 rounded-lg border border-input px-2.5 py-1.5 text-xs text-fg transition-colors hover:bg-muted"
        >
          <Eye className="h-3.5 w-3.5" /> Ver producto
        </Link>
      </div>
      <div className="rounded-lg border border-border bg-muted/40 p-4">
        <div className="grid items-start gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-lg border border-border bg-card h-40">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover"
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
              disableShowMore
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
