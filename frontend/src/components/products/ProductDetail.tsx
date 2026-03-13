'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Badge from '@/components/ui/Badge';
import ImageGallery from '@/components/products/ImageGallery';
import { getProductById } from '@/lib/api';
import { getCategoryStyle, getConditionLabel, getConditionStyle, getPriceColor } from '@/lib/productStyles';
import { formatPrice, formatTimeAgo, formatTransactionLabel } from '@/lib/utils';

import type { ProductDetail } from '@/types/product';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getProductById(productId);
        setProduct(data as ProductDetail);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar el producto';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mx-auto" />
          <p className="text-muted-fg">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-lg border border-error/20 bg-error/5 p-6 text-center">
          <p className="mb-4 text-error">{error || 'Producto no encontrado'}</p>
          <button
            onClick={() => router.push('/products')}
            className="rounded-lg bg-btn-primary px-4 py-2 text-btn-primary-fg hover:bg-primary-hover"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const isSale = product.transaction_type === 'sale';
  const transactionDisplay = isSale
    ? formatPrice(product.price)
    : formatTransactionLabel(product.transaction_type);
  const timeAgo = formatTimeAgo(product.created_at);
  const conditionLabel = getConditionLabel(product.condition);
  const priceColorClass = getPriceColor(product.transaction_type);
  const categoryClass = getCategoryStyle(product.category.name);
  const conditionClass = getConditionStyle(product.condition);

  // Prepare images array for gallery
  const galleryImages =
    product.images.length > 0
      ? product.images.map(img => img.image_url)
      : product.image_url
        ? [product.image_url]
        : [];

  return (
    <div className="mx-auto max-w-6xl">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-secondary hover:text-primary"
      >
        ← Volver
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left column: Images */}
        <div>
          <ImageGallery images={galleryImages} productTitle={product.title} />
        </div>

        {/* Right column: Product info */}
        <div className="flex flex-col gap-6">
          {/* Category badge */}
          <div>
            <Badge className={categoryClass}>{product.category.name}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-h1 font-bold text-fg">{product.title}</h1>

          {/* Price/Transaction type */}
          <div className={`text-h1 font-bold ${priceColorClass}`}>{transactionDisplay}</div>

          {/* Condition */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-fg">Condición:</span>
            <Badge className={conditionClass}>{conditionLabel}</Badge>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-h3 font-semibold text-fg">Descripción</h2>
            <p className="whitespace-pre-wrap text-fg">{product.description}</p>
          </div>

          {/* Seller info */}
          <div className="rounded-lg border border-border bg-muted p-4">
            <h3 className="mb-2 text-sm font-semibold text-fg">Vendedor</h3>
            <p className="text-fg">{product.seller_name}</p>
            <p className="text-sm text-muted-fg">{product.seller_email}</p>
          </div>

          {/* Action button */}
          <button
            className="w-full rounded-lg bg-btn-primary px-6 py-3 font-semibold text-btn-primary-fg hover:bg-primary-hover transition-colors"
            onClick={() => alert('Funcionalidad de contacto pendiente de implementación')}
          >
            Contactar vendedor
          </button>

          {/* Publication date */}
          <div className="border-t border-border pt-4 text-sm text-muted-fg">
            Publicado {timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
}
