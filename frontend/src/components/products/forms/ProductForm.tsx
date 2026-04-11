'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct } from '@/hooks/useCreateProduct';
import { useCommunities } from '@/hooks/useCommunities';

import CreateProductImagesSection from '@/components/products/forms/CreateProductImagesSection';
import ProductFormActions from '@/components/products/forms/ProductFormActions';
import ProductFormAuthNotice from '@/components/products/forms/ProductFormAuthNotice';
import ProductMainFields from '@/components/products/forms/ProductMainFields';

import type { FormValues } from '@/types/product';

export default function ProductForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { communities } = useCommunities({ onlyJoined: true });
  const { createProduct, isLoading: submitting, error: submitError } = useCreateProduct();

  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: 'placeholder',
      condition: 'buen_estado',
      transaction_type: 'sale',
      price: '',
      image_url: '',
      images: [],
      community: 'none',
    },
  });

  // Initialize category with first available category when loaded
  useEffect(() => {
    if (categories.length > 0) {
      const currentValue = form.getValues('category');
      if (!currentValue || currentValue === 'placeholder') {
        form.setValue('category', String(categories[0].id));
      }
    }
  }, [categories, form]);

  async function handleCreateProduct(values: FormValues) {
    const isSale = values.transaction_type === 'sale';
    const hasImageList = values.images.length > 0;

    // Validate category selection (not placeholder)
    if (!values.category || values.category === 'placeholder') {
      return;
    }

    const result = await createProduct({
      title: values.title,
      description: values.description,
      category: Number(values.category),
      condition: values.condition,
      transaction_type: values.transaction_type,
      price: isSale ? Number(values.price) : null,
      image_url: hasImageList ? values.images[0] : values.image_url || undefined,
      images: hasImageList ? values.images : undefined,
      community: values.community && values.community !== 'none' ? Number(values.community) : undefined,
    });

    if (result) {
      router.push('/products');
    }
  }

  if (!isAuthenticated) {
    return <ProductFormAuthNotice actionLabel="publicar" />;
  }

  return (
    <form onSubmit={form.handleSubmit(handleCreateProduct)} className="mx-auto max-w-2xl">
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
          communities={communities}
          titlePlaceholder="Ej: Libro de Cálculo Diferencial"
          descriptionPlaceholder="Describe el artículo que deseas publicar..."
        />

        <CreateProductImagesSection form={form} />

        <ProductFormActions
          isSubmitting={submitting}
          submitLabel={submitting ? 'Publicando...' : 'Publicar artículo'}
          onCancel={() => router.back()}
        />
      </fieldset>
    </form>
  );
}
