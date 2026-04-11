import { ArrowLeft, CircleCheckBig, Clock3, Flag, Mail, ShoppingBag } from 'lucide-react';

import Button from '@/components/ui/Button';
import ProductBasicDetails from '@/components/products/ProductBasicDetails';
import ImageGallery from '@/components/products/ImageGallery';
import ShareButton from '@/components/products/ShareButton';

import { formatTimeAgo } from '@/lib/utils';

import type { ProductDetail } from '@/types/product';

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
}: ProductDetailContentProps) {
  const timeAgo = formatTimeAgo(product.created_at);

  const galleryImages =
    product.images.length > 0
      ? product.images.map(img => img.image_url)
      : product.image_url
        ? [product.image_url]
        : [];

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
          <ProductBasicDetails
            title={product.title}
            description={product.description}
            categoryName={product.category.name}
            condition={product.condition}
            transactionType={product.transaction_type}
            price={product.price}
            showTransactionBadge={true}
          />

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
            ) : canReport && (
              <button
                type="button"
                onClick={onReport}
                className="inline-flex items-center gap-1.5 text-xs text-muted-fg transition-colors hover:text-error"
              >
                <Flag className="h-3.5 w-3.5" />
                Reportar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
