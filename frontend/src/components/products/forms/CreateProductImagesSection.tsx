import { ImagePlus, X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import Button from '@/components/ui/Button';
import { INPUT_CLASS } from '@/components/products/forms/formConstants';

import type { FormValues } from '@/types/product';

interface CreateProductImagesSectionProps {
    form: UseFormReturn<FormValues>;
}

export default function CreateProductImagesSection({ form }: CreateProductImagesSectionProps) {
    const { register, setValue, watch } = form;

    const imageUrl = watch('image_url');
    const images = watch('images');

    function handleAddImage() {
        if (imageUrl && !images.includes(imageUrl)) {
            setValue('images', [...images, imageUrl]);
            setValue('image_url', '');
        }
    }

    function handleRemoveImage(index: number) {
        setValue(
            'images',
            images.filter((_, imageIndex) => imageIndex !== index),
        );
    }

    return (
        <section className="space-y-5">
            <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-fg">
                <ImagePlus className="h-4 w-4" />
                Imágenes
            </h2>

            <div>
                <label htmlFor="image_url" className="mb-1.5 block text-sm font-medium text-fg">
                    URL de imagen
                </label>
                <div className="flex min-w-0 gap-2">
                    <input
                        id="image_url"
                        type="url"
                        {...register('image_url')}
                        className={`${INPUT_CLASS} min-w-0 flex-1`}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        onKeyDown={event => {
                            if (event.key === 'Enter') {
                                event.preventDefault();
                                handleAddImage();
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleAddImage}
                        disabled={!imageUrl}
                        className="inline-flex flex-shrink-0 items-center gap-2"
                    >
                        <ImagePlus className="h-4 w-4" />
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
                                <span className="flex-1 break-all overflow-wrap-anywhere text-sm text-muted-fg">
                                    {url}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveImage(index)}
                                    className="flex-shrink-0 rounded-md p-1 text-error transition-opacity hover:opacity-80"
                                    title="Eliminar imagen"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
