'use client';

import { useRef, useState } from 'react';
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

const MAX_IMAGES = 5;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProductForm() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { createProduct, isLoading: submitting, error: submitError } = useCreateProduct();

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setFileError(null);
    const incoming = Array.from(e.target.files ?? []);

    const invalid = incoming.find((f) => !ACCEPTED_TYPES.includes(f.type));
    if (invalid) {
      setFileError('Solo se permiten imágenes JPEG, PNG o WebP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const remaining = MAX_IMAGES - selectedFiles.length;
    if (remaining <= 0) return;

    const toAdd = incoming.slice(0, remaining);
    const newUrls = toAdd.map((f) => URL.createObjectURL(f));

    setSelectedFiles((prev) => [...prev, ...toAdd]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeFile(index: number) {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  }

  async function onSubmit(data: FormValues) {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('condition', data.condition);
    formData.append('transaction_type', data.transaction_type);
    if (showPrice && data.price) {
      formData.append('price', data.price);
    }
    selectedFiles.forEach((file) => formData.append('images', file));

    const result = await createProduct(formData);
    if (result) {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
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
        {/* ── Información del artículo ── */}
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
              className={INPUT_CLASS}
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
              className={INPUT_CLASS}
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
              ) : categoriesError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  No se pudieron cargar las categorias.
                </p>
              ) : (
                <select
                  id="category"
                  {...register('category', { required: 'Selecciona una categoría' })}
                  className={SELECT_CLASS}
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
                {...register('condition', { required: 'Selecciona la condición' })}
                className={SELECT_CLASS}
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

        {/* ── Tipo de publicación ── */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Tipo de publicación
          </h2>

          <div>
            <input
              type="hidden"
              {...register('transaction_type', { required: 'Selecciona el tipo' })}
            />
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
                    <span
                      className={`block text-sm font-semibold ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}
                    >
                      {option.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${isSelected ? 'text-blue-600' : 'text-gray-500'}`}
                    >
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
                  className={`${INPUT_CLASS} pl-8`}
                  placeholder="0.00"
                />
              </div>
              {errors.price && (
                <p className="mt-1.5 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>
          )}
        </section>

        {/* ── Imágenes ── */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Imágenes
          </h2>

          {/* Drop zone / upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={selectedFiles.length >= MAX_IMAGES}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={selectedFiles.length >= MAX_IMAGES}
              className={`flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                selectedFiles.length >= MAX_IMAGES
                  ? 'cursor-not-allowed border-gray-200 bg-gray-50'
                  : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {/* Upload icon */}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  selectedFiles.length >= MAX_IMAGES ? 'bg-gray-100' : 'bg-blue-100'
                }`}
              >
                <svg
                  className={`h-6 w-6 ${selectedFiles.length >= MAX_IMAGES ? 'text-gray-400' : 'text-blue-600'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>

              <div className="text-center">
                <p
                  className={`text-sm font-medium ${
                    selectedFiles.length >= MAX_IMAGES ? 'text-gray-400' : 'text-gray-700'
                  }`}
                >
                  {selectedFiles.length >= MAX_IMAGES
                    ? 'Límite de imágenes alcanzado'
                    : 'Haz clic para subir imágenes'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  JPEG, PNG o WebP · Máx. {MAX_IMAGES} imágenes
                  {selectedFiles.length > 0 && ` · ${selectedFiles.length}/${MAX_IMAGES} seleccionadas`}
                </p>
              </div>
            </button>

            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}
          </div>

          {/* Preview grid */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {previewUrls.map((url, index) => (
                <div key={index} className="group relative aspect-square">
                  <img
                    src={url}
                    alt={`Vista previa ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />

                  {/* Principal badge */}
                  {index === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      Principal
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    title="Eliminar imagen"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
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
