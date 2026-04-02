'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct } from '@/hooks/useCreateProduct';

import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import {
  CONDITION_LABELS,
  INPUT_CLASS,
  SELECT_CLASS,
  TRANSACTION_OPTIONS,
} from '@/components/products/formConstants';

import type { FormValues } from '@/types/product';

export default function ProductForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { createProduct, isLoading: submitting, error: submitError } = useCreateProduct();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      condition: 'buen_estado',
      transaction_type: 'sale',
      price: '',
      image_url: '',
      images: [],
    },
  });

  const transactionType = watch('transaction_type');
  const images = watch('images');
  const showPrice = transactionType === 'sale';

  function addImage() {
    const imageUrl = watch('image_url');
    if (imageUrl && !images.includes(imageUrl)) {
      setValue('images', [...images, imageUrl]);
      setValue('image_url', '');
    }
  }

  function removeImage(index: number) {
    setValue(
      'images',
      images.filter((_, i) => i !== index),
    );
  }

  async function onSubmit(data: FormValues) {
    const result = await createProduct({
      title: data.title,
      description: data.description,
      category: Number(data.category),
      condition: data.condition,
      transaction_type: data.transaction_type,
      price: showPrice ? Number(data.price) : null,
      image_url: data.images.length > 0 ? data.images[0] : data.image_url || undefined,
      images: data.images.length > 0 ? data.images : undefined,
    });

    if (result) {
      router.push('/products');
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-warning/20 bg-warning/5 p-8 text-center">
        <p className="text-body font-medium text-fg">Selecciona un usuario</p>
        <p className="mt-2 text-sm text-warning">
          Usa el selector en la parte superior para elegir un usuario antes de publicar.
        </p>
      </div>
    );
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
              placeholder="Ej: Libro de Cálculo Diferencial"
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
              placeholder="Describe el artículo que deseas publicar..."
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-fg">Imágenes</h2>

          <div>
            <label htmlFor="image_url" className="mb-1.5 block text-sm font-medium text-fg">
              URL de imagen
            </label>
            <div className="flex gap-2 min-w-0">
              <input
                id="image_url"
                type="url"
                {...register('image_url')}
                className={`${INPUT_CLASS} flex-1 min-w-0`}
                placeholder="https://ejemplo.com/imagen.jpg"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImage();
                  }
                }}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addImage}
                disabled={!watch('image_url')}
                className="flex-shrink-0"
              >
                Agregar
              </Button>
            </div>
            <p className="mt-1.5 text-xs text-muted-fg">
              Agrega URLs de imágenes del artículo. Se mostrarán en orden.
            </p>
          </div>

          {images.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-fg">Imágenes agregadas ({images.length})</p>
              <div className="space-y-2">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg border border-border bg-muted p-3"
                  >
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {index + 1}
                    </span>
                    <span className="flex-1 text-sm text-muted-fg break-all overflow-wrap-anywhere">
                      {url}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="flex-shrink-0 text-error hover:opacity-80"
                      title="Eliminar imagen"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <div className="flex items-center gap-3 border-t border-border pt-6">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Publicando...' : 'Publicar artículo'}
          </Button>
          <Button type="button" variant="danger-outline" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
