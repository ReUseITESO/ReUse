import {
  Controller,
  type FieldValues,
  type Path,
  type PathValue,
  type UseFormReturn,
} from 'react-hook-form';
import { Info, Repeat2, Users } from 'lucide-react';

import AppSelect from '@/components/ui/AppSelect';
import Spinner from '@/components/ui/Spinner';
import {
  CONDITION_LABELS,
  INPUT_CLASS,
  TRANSACTION_OPTIONS,
} from '@/components/products/forms/formConstants';

import type { Category, ProductCondition, TransactionType } from '@/types/product';
import type { Community } from '@/types/community';

interface ProductFormBaseValues extends FieldValues {
  title: string;
  description: string;
  category: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  price: string;
  community?: string;
}

interface ProductMainFieldsProps<TFormValues extends ProductFormBaseValues> {
  form: UseFormReturn<TFormValues>;
  categories: Category[];
  isLoadingCategories: boolean;
  categoriesError: string | null;
  communities?: Community[];
  titlePlaceholder?: string;
  descriptionPlaceholder?: string;
}

export default function ProductMainFields<TFormValues extends ProductFormBaseValues>({
  form,
  categories,
  isLoadingCategories,
  categoriesError,
  communities = [],
  titlePlaceholder,
  descriptionPlaceholder,
}: ProductMainFieldsProps<TFormValues>) {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const transactionType = watch('transaction_type' as Path<TFormValues>) as TransactionType;
  const showPrice = transactionType === 'sale';

  const titleName = 'title' as Path<TFormValues>;
  const descriptionName = 'description' as Path<TFormValues>;
  const categoryName = 'category' as Path<TFormValues>;
  const conditionName = 'condition' as Path<TFormValues>;
  const transactionTypeName = 'transaction_type' as Path<TFormValues>;
  const priceName = 'price' as Path<TFormValues>;
  const communityName = 'community' as Path<TFormValues>;

  const titleError = errors.title?.message;
  const descriptionError = errors.description?.message;
  const categoryError = errors.category?.message;
  const conditionError = errors.condition?.message;
  const transactionTypeError = errors.transaction_type?.message;
  const priceError = errors.price?.message;

  return (
    <>
      <section className="space-y-5">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-fg">
          <Info className="h-4 w-4" />
          Información del artículo
        </h2>

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-fg">
            Título <span className="text-error">*</span>
          </label>
          <input
            id="title"
            type="text"
            {...register(titleName, {
              required: 'El título es obligatorio',
              maxLength: { value: 255, message: 'Máximo 255 caracteres' },
            })}
            className={INPUT_CLASS}
            placeholder={titlePlaceholder}
          />
          {titleError && <p className="mt-1.5 text-sm text-error">{String(titleError)}</p>}
        </div>

        <div>
          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-fg">
            Descripción <span className="text-error">*</span>
          </label>
          <textarea
            id="description"
            rows={4}
            {...register(descriptionName, {
              required: 'La descripción es obligatoria',
            })}
            className={INPUT_CLASS}
            placeholder={descriptionPlaceholder}
          />
          {descriptionError && (
            <p className="mt-1.5 text-sm text-error">{String(descriptionError)}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-fg">
              Categoría <span className="text-error">*</span>
            </label>
            {isLoadingCategories ? (
              <Spinner />
            ) : categoriesError ? (
              <p className="rounded-lg border border-error/20 bg-error/5 px-4 py-2.5 text-sm text-error">
                No se pudieron cargar las categorias.
              </p>
            ) : (
              <Controller
                name={categoryName}
                control={control}
                rules={{ required: 'Selecciona una categoría' }}
                render={({ field }) => (
                  <AppSelect
                    value={String(field.value) || 'placeholder'}
                    onValueChange={field.onChange}
                    placeholder="Seleccionar categoría"
                    options={[
                      { value: 'placeholder', label: 'Seleccionar categoría', disabled: true },
                      ...categories.map(category => ({
                        value: String(category.id),
                        label: category.name,
                      })),
                    ]}
                  />
                )}
              />
            )}
            {categoryError && <p className="mt-1.5 text-sm text-error">{String(categoryError)}</p>}
          </div>

          <div>
            <label htmlFor="condition" className="mb-1.5 block text-sm font-medium text-fg">
              Condición <span className="text-error">*</span>
            </label>
            <Controller
              name={conditionName}
              control={control}
              rules={{ required: 'Selecciona la condición' }}
              render={({ field }) => (
                <AppSelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Selecciona condición"
                  options={Object.entries(CONDITION_LABELS).map(([value, label]) => ({
                    value,
                    label,
                  }))}
                />
              )}
            />
            {conditionError && (
              <p className="mt-1.5 text-sm text-error">{String(conditionError)}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-fg">
          <Repeat2 className="h-4 w-4" />
          Tipo de publicación
        </h2>

        <div>
          <input
            type="hidden"
            {...register(transactionTypeName, { required: 'Selecciona el tipo' })}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {TRANSACTION_OPTIONS.map(option => {
              const isSelected = transactionType === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue(
                      transactionTypeName,
                      option.value as PathValue<TFormValues, Path<TFormValues>>,
                    )
                  }
                  className={`rounded-lg border-2 px-4 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-ring bg-primary/5'
                      : 'border-border bg-card hover:border-muted-fg hover:bg-muted'
                  }`}
                >
                  <span
                    className={`block text-sm font-semibold ${
                      isSelected ? 'text-primary' : 'text-fg'
                    }`}
                  >
                    {option.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      isSelected ? 'text-secondary' : 'text-muted-fg'
                    }`}
                  >
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
          {transactionTypeError && (
            <p className="mt-1.5 text-sm text-error">{String(transactionTypeError)}</p>
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
                {...register(priceName, {
                  required: showPrice ? 'El precio es obligatorio para ventas' : false,
                  min: { value: 0.01, message: 'El precio debe ser mayor a 0' },
                })}
                className={`${INPUT_CLASS} pl-8`}
                placeholder="0.00"
              />
            </div>
            {priceError && <p className="mt-1.5 text-sm text-error">{String(priceError)}</p>}
          </div>
        )}
      </section>

      {communities && communities.length > 0 && (
        <section className="space-y-5">
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-fg">
            <Users className="h-4 w-4" />
            Comunidad (opcional)
          </h2>

          <div>
            <label htmlFor="community" className="mb-1.5 block text-sm font-medium text-fg">
              Publicar para comunidad
            </label>
            <p className="mb-3 text-xs text-muted-fg">
              Deja vacío para publicar en el marketplace público. Selecciona una comunidad para que solo sus miembros vean el artículo.
            </p>
            <Controller
              name={communityName}
              control={control}
              render={({ field }) => (
                <AppSelect
                  value={field.value ?? 'none'}
                  onValueChange={value => {
                    // Convert 'none' back to undefined for the form
                    field.onChange(value === 'none' ? undefined : value);
                  }}
                  placeholder="Sin comunidad (público)"
                  options={[
                    { value: 'none', label: 'Sin comunidad (público)' },
                    ...communities.map(community => ({
                      value: String(community.id),
                      label: community.name,
                    })),
                  ]}
                />
              )}
            />
          </div>
        </section>
      )}
    </>
  );
}
