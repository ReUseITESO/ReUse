'use client';

import { useState } from 'react';
import { ArrowLeft, CircleCheckBig, Clock3, Flag, Mail, ShoppingBag } from 'lucide-react';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ImageGallery from '@/components/products/ImageGallery';
import ShareButton from '@/components/products/ShareButton';
import ProductReactionButtons from '@/components/products/ProductReactionButtons';

import { formatTimeAgo } from '@/lib/utils';
import {
  getCategoryStyle,
  getConditionLabel,
  getConditionStyle,
  getTransactionTypeStyle,
} from '@/lib/productStyles';
import { formatPrice, formatTransactionLabel } from '@/lib/utils';

import type { ProductDetail, ProductReactionSummary } from '@/types/product';
import { DESCRIPTION_LIMIT } from '@/lib/constants';

interface ProductDetailContentProps {
  product: ProductDetail;
  ctaLabel: string;
  canCreateTransaction: boolean;
  transactionNotice: string | null;
  canReport: boolean;
  hasReported: boolean;
  onBack: () => void;
  onMainAction: () => void;
  onReport: () => void;
  onReactionChange: (summary: ProductReactionSummary) => void;
}

export default function ProductDetailContent({
  product,
  ctaLabel,
  canCreateTransaction,
  transactionNotice,
  canReport,
  hasReported,
  onBack,
  onMainAction,
  onReport,
  onReactionChange,
}: ProductDetailContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const timeAgo = formatTimeAgo(product.created_at);

  const galleryImages = product.images.length > 0 ? product.images.map(img => img.image_url) : [];

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <ImageGallery
            images={galleryImages}
            productTitle={product.title}
            categoryName={product.category.name}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-h1 font-bold text-fg">{product.title}</h1>
              <ProductReactionButtons
                productId={product.id}
                sellerId={product.seller_id}
                initialSummary={{
                  likes_count: product.likes_count,
                  dislikes_count: product.dislikes_count,
                  user_reaction: product.user_reaction,
                }}
                onChange={onReactionChange}
                className="shrink-0"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getCategoryStyle(product.category.name)}>
                {product.category.name}
              </Badge>
              <Badge
                className={
                  product.condition
                    ? getConditionStyle(product.condition)
                    : 'bg-muted text-muted-fg border border-border'
                }
              >
                {product.condition ? getConditionLabel(product.condition) : 'Sin condición'}
              </Badge>
              {product.transaction_type && (
                <Badge className={getTransactionTypeStyle(product.transaction_type)}>
                  {product.transaction_type === 'sale'
                    ? (() => {
                        const formattedPrice = formatPrice(product.price ?? null);
                        return formattedPrice ? `Venta ${formattedPrice}` : 'Venta';
                      })()
                    : formatTransactionLabel(product.transaction_type)}
                </Badge>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-body text-fg">
                {product.description.length > DESCRIPTION_LIMIT && !isExpanded
                  ? `${product.description.slice(0, DESCRIPTION_LIMIT).trimEnd()}...`
                  : product.description}
              </p>

              {product.description.length > DESCRIPTION_LIMIT && (
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="relative rounded-full border border-border bg-card px-4 py-1 text-xs font-medium text-info transition-colors hover:bg-muted hover:text-info/80"
                  >
                    {isExpanded ? 'Ver menos' : 'Ver más'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Vendedor</h3>
            <p className="text-fg"> {product.seller_name}</p>
            <p className="inline-flex items-center gap-2 text-sm text-muted-fg">
              <Mail className="h-4 w-4" />
              {product.seller_email}
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              className="inline-flex flex-1 items-center justify-center gap-2 px-6 py-3"
              onClick={onMainAction}
              disabled={!canCreateTransaction}
            >
              <ShoppingBag className="h-4 w-4" />
              {ctaLabel}
            </Button>
            <ShareButton productId={product.id} productTitle={product.title} />
          </div>

          {transactionNotice && (
            <p className="inline-flex items-center gap-2 rounded-lg border border-info/30 bg-info/10 px-3 py-2 text-sm text-info">
              <CircleCheckBig className="h-4 w-4" />
              {transactionNotice}
            </p>
          )}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="inline-flex items-center gap-2 text-sm text-muted-fg">
              <Clock3 className="h-4 w-4" />
              Publicado {timeAgo}
            </p>

            {hasReported ? (
              <p className="inline-flex items-center gap-1.5 text-xs text-success">
                <Flag className="h-3.5 w-3.5" />
                Producto reportado correctamente
              </p>
            ) : (
              canReport && (
                <button
                  type="button"
                  onClick={onReport}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-fg transition-colors hover:text-error"
                >
                  <Flag className="h-3.5 w-3.5" />
                  Reportar
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
