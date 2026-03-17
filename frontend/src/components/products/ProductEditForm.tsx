'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useUpdateProduct } from '@/hooks/useUpdateProduct';

import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import {
  CONDITION_LABELS,
  INPUT_CLASS,
  SELECT_CLASS,
  TRANSACTION_OPTIONS,
} from '@/components/products/formConstants';

import { apiClient } from '@/lib/api';

import type { Product, EditFormValues, ProductEditFormProps } from '@/types/product';

export default function ProductEditForm({ productId }: ProductEditFormProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { updateProduct, isLoading: submitting, error: submitError } = useUpdateProduct();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<EditFormValues>();

  const transactionType = watch('transaction_type');
  const showPrice = transactionType === 'sale';

  useEffect(() => {
    async function fetchProduct() {
      setIsLoadingProduct(true);
      setLoadError(null);

      try {
        const data = await apiClient<Product>(`/marketplace/products/${productId}/`);
        setProduct(data);
        reset({
          title: data.title,
          description: data.description,
          category: String(data.category.id),
          condition: data.condition,
          transaction_type: data.transaction_type,
          price: data.price ?? '',
          image_url: data.image_url ?? '',
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar el producto';
        setLoadError(message);
      } finally {
        setIsLoadingProduct(false);
      }
    }

    fetchProduct();
  }, [productId, reset]);

  async function onSubmit(data: EditFormValues) {
    const result = await updateProduct(productId, {
      title: data.title,
      description: data.description,
      category: Number(data.category),
      condition: data.condition,
      transaction_type: data.transaction_type,
      price: showPrice ? Number(data.price) : null,
      image_url: data.image_url || undefined,
    });

    if (result) {
      router.push('/products/my');
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-warning/20 bg-warning/5 p-8 text-center">
        <p className="text-body font-medium text-fg">Selecciona un usuario</p>
        <p className="mt-2 text-sm text-warning">
          Usa el selector en la parte superior para elegir un usuario antes de editar.
        </p>
      </div>
    );
  }

  if (isLoadingProduct) {
    return <Spinner />;
  }

  if (loadError) {
    return <ErrorMessage message={loadError} onRetry={() => window.location.reload()} />;
  }

  if (!product) {
    return <ErrorMessage message="Producto no encontrado" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl">
      {submitError && (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/5 px-4 py-3">
          <p className="text-sm font-medium text-error">{submitError}</p>
        </div>
      )}

      <fieldset disabled={submitting} className="space-y-8">
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">
            Información del artículo
          </h2>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-fg">
              Título <span className="text-error">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', {
                required: 'El título es obligatorio',
                maxLength: { value: 255, message: 'Máximo 255 caracteres' },
              })}
              className={INPUT_CLASS}
            />
            {errors.title && <p className="mt-1.5 text-sm text-error">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-fg">
              Descripción <span className="text-error">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', {
                required: 'La descripción es obligatoria',
              })}
              className={INPUT_CLASS}
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-error">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-fg">
                Categoría <span className="text-error">*</span>
              </label>
              {categoriesLoading ? (
                <Spinner />
              ) : categoriesError ? (
                <p className="rounded-lg border border-error/20 bg-error/5 px-4 py-2.5 text-sm text-error">
                  No se pudieron cargar las categorias.
                </p>
              ) : (
                <select
                  id="category"
                  {...register('category', {
                    required: 'Selecciona una categoría',
                  })}
                  className={SELECT_CLASS}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && (
                <p className="mt-1.5 text-sm text-error">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="condition" className="mb-1.5 block text-sm font-medium text-fg">
                Condición <span className="text-error">*</span>
              </label>
              <select
                id="condition"
                {...register('condition', {
                  required: 'Selecciona la condición',
                })}
                className={SELECT_CLASS}
              >
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="mt-1.5 text-sm text-error">{errors.condition.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">
            Tipo de publicación
          </h2>

          <div>
            <input
              type="hidden"
              {...register('transaction_type', { required: 'Selecciona el tipo' })}
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {TRANSACTION_OPTIONS.map(option => {
                const isSelected = transactionType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('transaction_type', option.value)}
                    className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-ring bg-primary/5'
                        : 'border-border bg-card hover:border-muted-fg hover:bg-muted'
                    }`}
                  >
                    <span
                      className={`block text-sm font-semibold ${isSelected ? 'text-primary' : 'text-fg'}`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${isSelected ? 'text-secondary' : 'text-muted-fg'}`}
                    >
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.transaction_type && (
              <p className="mt-1.5 text-sm text-error">{errors.transaction_type.message}</p>
            )}
          </div>

          {showPrice && (
            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-fg">
                Precio (MXN) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-fg">
                  $
                </span>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('price', {
                    required: showPrice ? 'El precio es obligatorio para ventas' : false,
                    min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
                  })}
                  className={`${INPUT_CLASS} pl-8`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && <p className="mt-1.5 text-sm text-error">{errors.price.message}</p>}
            </div>
          )}
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">Imagen</h2>

          <div>
            <label htmlFor="image_url" className="mb-1.5 block text-sm font-medium text-fg">
              URL de imagen
            </label>
            <input
              id="image_url"
              type="url"
              {...register('image_url')}
              className={INPUT_CLASS}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="mt-1.5 text-xs text-muted-fg">
              Opcional. Pega la URL de una imagen del artículo.
            </p>
          </div>
        </section>

        <div className="flex items-center gap-3 border-t border-border pt-6">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          <Button type="button" variant="danger-outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
