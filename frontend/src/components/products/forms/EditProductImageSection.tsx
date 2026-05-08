'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import type { EditFormValues, ProductImage } from '@/types/product';
import Image from 'next/image';

const MAX_IMAGES = 5;
const ACCEPTED = 'image/jpeg,image/png,image/webp';

interface Props {
  form: UseFormReturn<EditFormValues>;
  existingImages: ProductImage[];
}

export default function EditProductImageSection({ form, existingImages }: Props) {
  const { setValue, watch } = form;
  const inputRef = useRef<HTMLInputElement>(null);
  const files = watch('imageFiles');
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(u => URL.revokeObjectURL(u));
  }, [files]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setValue('imageFiles', selected.slice(0, MAX_IMAGES));
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove(index: number) {
    setValue(
      'imageFiles',
      files.filter((_, i) => i !== index),
    );
  }

  const showingNew = files.length > 0;

  return (
    <section className="space-y-5">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-fg">
        <ImagePlus className="h-4 w-4" />
        Imágenes
      </h2>

      {!showingNew && existingImages.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-fg">Imágenes actuales</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {existingImages.map((img, index) => (
              <div key={img.id} className="relative aspect-square">
                <Image
                  src={img.image_url}
                  alt={`Imagen ${index + 1}`}
                  className="rounded-lg object-cover"
                  fill
                />
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs text-white">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showingNew && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-fg">
              Nuevas imágenes ({files.length}/{MAX_IMAGES})
            </p>
            <button
              type="button"
              onClick={() => setValue('imageFiles', [])}
              className="text-xs text-muted-fg underline hover:text-fg"
            >
              Cancelar y mantener actuales
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {previews.map((url, index) => (
              <div key={index} className="group relative aspect-square">
                <Image
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="rounded-lg object-cover"
                  fill
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  title="Eliminar"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs text-white">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-6 text-sm text-muted-fg transition-colors hover:border-primary/50 hover:text-fg"
      >
        <ImagePlus className="h-5 w-5" />
        {existingImages.length > 0 ? 'Reemplazar imágenes' : 'Seleccionar imágenes'}
      </button>
      {existingImages.length > 0 && !showingNew && (
        <p className="text-xs text-muted-fg">
          Seleccionar nuevas imágenes reemplazará todas las actuales.
        </p>
      )}
    </section>
  );
}
