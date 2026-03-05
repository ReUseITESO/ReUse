'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { useMockAuth } from '@/context/MockAuthContext';
import { useCategories } from '@/hooks/useCategories';
import { useCreateProduct } from '@/hooks/useCreateProduct';

import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

import type { ProductCondition, TransactionType } from '@/types/product';

interface FormValues {
  title: string;
  description: string;
  category: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  price: string;
  image_url: string;
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
    },
  });

  const transactionType = watch('transaction_type');
  const showPrice = transactionType === 'sale';

  async function onSubmit(data: FormValues) {
    const result = await createProduct({
      title: data.title,
      description: data.description,
      category: Number(data.category),
      condition: data.condition,
      transaction_type: data.transaction_type,
      price: showPrice ? Number(data.price) : null,
      image_url: data.image_url || undefined,
    });

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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Imagen
          </h2>

          <div>
            <label htmlFor="image_url" className="mb-1.5 block text-sm font-medium text-gray-700">
              URL de imagen
            </label>
            <input
              id="image_url"
              type="url"
              {...register('image_url')}
              className={inputClass}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            <p className="mt-1.5 text-xs text-gray-500">
              Opcional. Pega la URL de una imagen del artículo.
            </p>
          </div>
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
