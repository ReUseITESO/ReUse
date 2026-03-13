'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Badge from '@/components/ui/Badge';
import ImageGallery from '@/components/products/ImageGallery';
import { getProductById } from '@/lib/api';
import { formatPrice, formatTimeAgo, formatTransactionLabel } from '@/lib/utils';

import type { ProductDetail } from '@/types/product';

interface ProductDetailProps {
  productId: string;
}

const CONDITION_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como Nuevo',
  buen_estado: 'Buen Estado',
  usado: 'Usado',
};

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
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 mx-auto" />
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="mb-4 text-red-800">{error || 'Producto no encontrado'}</p>
          <button
            onClick={() => router.push('/products')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
  const conditionLabel = CONDITION_LABELS[product.condition] || product.condition;

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
        className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
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
            <Badge className="bg-blue-100 text-blue-700">{product.category.name}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

          {/* Price/Transaction type */}
          <div className="text-3xl font-bold text-blue-600">{transactionDisplay}</div>

          {/* Condition */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Condición:</span>
            <span className="font-semibold text-gray-900">{conditionLabel}</span>
          </div>

          {/* Description */}
          <div>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Descripción</h2>
            <p className="whitespace-pre-wrap text-gray-700">{product.description}</p>
          </div>

          {/* Seller info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Vendedor</h3>
            <p className="text-gray-800">{product.seller_name}</p>
            <p className="text-sm text-gray-600">{product.seller_email}</p>
          </div>

          {/* Action button */}
          <button
            className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors"
            onClick={() => alert('Funcionalidad de contacto pendiente de implementación')}
          >
            Contactar vendedor
          </button>

          {/* Publication date */}
          <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
            Publicado {timeAgo}
          </div>
        </div>
      </div>
    </div>
  );
}
