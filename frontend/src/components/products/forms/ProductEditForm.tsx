'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';

import EditProductImageSection from '@/components/products/forms/EditProductImageSection';
import ProductFormActions from '@/components/products/forms/ProductFormActions';
import ProductFormAuthNotice from '@/components/products/forms/ProductFormAuthNotice';
import ProductMainFields from '@/components/products/forms/ProductMainFields';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';

import { apiClient } from '@/lib/api';

import type { EditFormValues, Product, ProductEditFormProps } from '@/types/product';

export default function ProductEditForm({ productId }: ProductEditFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { updateProduct, isLoading: submitting, error: submitError } = useUpdateProduct();

  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<EditFormValues>();

  useEffect(() => {
    async function fetchProduct() {
      setIsLoadingProduct(true);
      setLoadError(null);

      try {
        const product = await apiClient<Product>(`/marketplace/products/${productId}/`);

        form.reset({
          title: product.title,
          description: product.description,
          category: String(product.category.id),
          condition: product.condition,
          transaction_type: product.transaction_type,
          price: product.price ?? '',
          image_url: product.images?.[0]?.image_url ?? '',
        });
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setIsLoadingProduct(false);
      }
    }

    fetchProduct();
  }, [form, productId]);

  async function handleUpdateProduct(values: EditFormValues) {
    const isSale = values.transaction_type === 'sale';

    const result = await updateProduct(productId, {
      title: values.title,
      description: values.description,
      category: Number(values.category),
      condition: values.condition,
      transaction_type: values.transaction_type,
      price: isSale ? Number(values.price) : null,
      image_url: values.image_url || undefined,
    });

    if (result) {
      router.push('/products/my');
    }
  }

  if (!isAuthenticated) {
    return <ProductFormAuthNotice actionLabel="editar" />;
  }

  if (isLoadingProduct) {
    return <Spinner />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} onRetry={() => window.location.reload()} />;
  }

  return (
    <form onSubmit={form.handleSubmit(handleUpdateProduct)} className="mx-auto max-w-2xl">
      {submitError && (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm font-medium text-error">{submitError}</p>
        </div>
      )}

      <fieldset disabled={submitting} className="space-y-8">
        <ProductMainFields
          form={form}
          categories={categories}
          isLoadingCategories={categoriesLoading}
          categoriesError={categoriesError}
        />

        <EditProductImageSection form={form} />

        <ProductFormActions
          isSubmitting={submitting}
          submitLabel={submitting ? 'Guardando...' : 'Guardar cambios'}
          onCancel={() => router.back()}
        />
      </fieldset>
    </form>
  );
}
