'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useMockAuth } from '@/context/MockAuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct } from '@/hooks/useCreateProduct';

import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

import type { ProductCondition, TransactionType } from '@/types/product';

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface FormValues {
  title: string;
  description: string;
  category: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  price: string;
}

const CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como nuevo',
  buen_estado: 'Buen estado',
  usado: 'Usado',
};

const TRANSACTION_OPTIONS: { value: TransactionType; label: string; description: string }[] = [
  { value: 'sale', label: 'Venta', description: 'Establece un precio' },
  { value: 'donation', label: 'Donación', description: 'Regala a quien lo necesite' },
  { value: 'swap', label: 'Intercambio', description: 'Cambia por otro artículo' },
];

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50';

const selectClass =
  'w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-900 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50';

export default function ProductForm() {
  const router = useRouter();
  const { isAuthenticated } = useMockAuth();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { createProduct, isLoading: submitting, error: submitError } = useCreateProduct();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef<string[]>([]);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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
    },
  });

  const transactionType = watch('transaction_type');
  const showPrice = transactionType === 'sale';

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImageError(null);
    const selected = Array.from(e.target.files ?? []);
    e.target.value = '';

    const invalid = selected.find((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalid) {
      setImageError('Solo se aceptan imágenes JPEG, PNG o WebP.');
      return;
    }

    const remaining = MAX_IMAGES - images.length;
    const toAdd = selected.slice(0, remaining);

    if (selected.length > remaining) {
      setImageError(`Solo puedes agregar ${remaining} imagen${remaining === 1 ? '' : 'es'} más.`);
    }

    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setImages((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setImageError(null);
  }

  async function onSubmit(data: FormValues) {
    const result = await createProduct(
      {
        title: data.title,
        description: data.description,
        category: Number(data.category),
        condition: data.condition,
        transaction_type: data.transaction_type,
        price: showPrice ? Number(data.price) : null,
      },
      images,
    );

    if (result) {
      router.push('/products');
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-lg font-medium text-amber-900">Selecciona un usuario</p>
        <p className="mt-2 text-sm text-amber-700">
          Usa el selector en la parte superior para elegir un usuario antes de publicar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl">
      {submitError && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-800">{submitError}</p>
        </div>
      )}

      <fieldset disabled={submitting} className="space-y-8">
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Información del artículo
          </h2>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              {...register('title', {
                required: 'El título es obligatorio',
                maxLength: { value: 255, message: 'Máximo 255 caracteres' },
              })}
              className={inputClass}
              placeholder="Ej: Libro de Cálculo Diferencial"
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              rows={4}
              {...register('description', {
                required: 'La descripción es obligatoria',
              })}
              className={inputClass}
              placeholder="Describe el artículo que deseas publicar..."
            />
            {errors.description && (
              <p className="mt-1.5 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-gray-700">
                Categoría <span className="text-red-500">*</span>
              </label>
              {categoriesLoading ? (
                <Spinner />
              ) : (
                <select
                  id="category"
                  {...register('category', {
                    required: 'Selecciona una categoría',
                  })}
                  className={selectClass}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.category && (
                <p className="mt-1.5 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="condition" className="mb-1.5 block text-sm font-medium text-gray-700">
                Condición <span className="text-red-500">*</span>
              </label>
              <select
                id="condition"
                {...register('condition', {
                  required: 'Selecciona la condición',
                })}
                className={selectClass}
              >
                {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="mt-1.5 text-sm text-red-600">{errors.condition.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Tipo de publicación
          </h2>

          <div>
            <input type="hidden" {...register('transaction_type', { required: 'Selecciona el tipo' })} />
            <div className="grid gap-3 sm:grid-cols-3">
              {TRANSACTION_OPTIONS.map((option) => {
                const isSelected = transactionType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('transaction_type', option.value)}
                    className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
                      {option.label}
                    </span>
                    <span className={`mt-0.5 block text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}>
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.transaction_type && (
              <p className="mt-1.5 text-sm text-red-600">{errors.transaction_type.message}</p>
            )}
          </div>

          {showPrice && (
            <div>
              <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-gray-700">
                Precio (MXN) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
                  className={`${inputClass} pl-8`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1.5 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Imágenes
            </h2>
            <span className="text-xs text-gray-400">{images.length}/{MAX_IMAGES}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {images.length < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="h-8 w-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 16v-8m0 0-3 3m3-3 3 3M6.5 19h11a2.5 2.5 0 0 0 0-5h-.2A5.5 5.5 0 1 0 6.5 19Z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-600">
                Haz clic para agregar imágenes
              </span>
              <span className="text-xs text-gray-400">JPEG, PNG o WebP · Máximo {MAX_IMAGES}</span>
            </button>
          )}

          {imageError && (
            <p className="text-sm text-red-600">{imageError}</p>
          )}

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {previews.map((url, index) => (
                <div key={url} className="group relative aspect-square">
                  <img
                    src={url}
                    alt={`Vista previa ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                    aria-label="Eliminar imagen"
                  >
                    ×
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1 py-0.5 text-xs text-white">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex items-center gap-3 border-t border-gray-200 pt-6">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Publicando...' : 'Publicar artículo'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
