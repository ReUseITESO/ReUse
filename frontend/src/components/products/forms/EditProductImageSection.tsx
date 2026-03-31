import { ImagePlus } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import { INPUT_CLASS } from '@/components/products/forms/formConstants';

import type { EditFormValues } from '@/types/product';

interface EditProductImageSectionProps {
    form: UseFormReturn<EditFormValues>;
}

export default function EditProductImageSection({ form }: EditProductImageSectionProps) {
    const { register } = form;

    return (
        <section className="space-y-5">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-fg">
                <ImagePlus className="h-4 w-4" />
                Imagen
            </h2>

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
    );
}
