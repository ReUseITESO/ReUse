import { useEffect, useState } from 'react';

import { getProductById } from '@/lib/api';

import type { ProductCondition, ProductDetail } from '@/types/product';

const PRODUCT_CONDITION_CACHE_PREFIX = 'product-condition:';

function getConditionCacheKey(productId: string | number) {
  return `${PRODUCT_CONDITION_CACHE_PREFIX}${productId}`;
}

function cacheProductCondition(product: ProductDetail) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(getConditionCacheKey(product.id), product.condition);
}

export function getCachedProductCondition(productId: string | number): ProductCondition | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const cachedCondition = localStorage.getItem(getConditionCacheKey(productId));
  if (!cachedCondition) {
    return null;
  }

  const validConditions: ProductCondition[] = ['nuevo', 'como_nuevo', 'buen_estado', 'usado'];

  return validConditions.includes(cachedCondition as ProductCondition)
    ? (cachedCondition as ProductCondition)
    : null;
}

export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function fetchProduct() {
      try {
        setIsLoading(true);
        setError(null);
        try {
          const data = await getProductById(productId);
          const productDetail = data as ProductDetail;
          if (!isCancelled) {
            setProduct(productDetail);
          }
          cacheProductCondition(productDetail);
        } catch {
          const ownProductData = await getProductById(productId, { mine: true });
          const ownProductDetail = ownProductData as ProductDetail;
          if (!isCancelled) {
            setProduct(ownProductDetail);
          }
          cacheProductCondition(ownProductDetail);
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Error al cargar el producto';
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchProduct();
    return () => {
      isCancelled = true;
    };
  }, [productId]);

  return {
    product,
    setProduct,
    isLoading,
    error,
  };
}
