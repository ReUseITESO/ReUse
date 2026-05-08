'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import type { FormValues } from '@/types/product';
import Image from 'next/image';

const MAX_IMAGES = 5;
const ACCEPTED = 'image/jpeg,image/png,image/webp';

interface Props {
  form: UseFormReturn<FormValues>;
}

export default function CreateProductImagesSection({ form }: Props) {
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
    setValue('imageFiles', [...files, ...selected].slice(0, MAX_IMAGES));
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove(index: number) {
    setValue(
      'imageFiles',
      files.filter((_, i) => i !== index),
    );
  }

  const remaining = MAX_IMAGES - files.length;

  return (
    <section className="space-y-5">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-fg">
        <ImagePlus className="h-4 w-4" />
        Imágenes
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={remaining === 0}
      />

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-fg">
            Imágenes seleccionadas ({files.length}/{MAX_IMAGES})
          </p>
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

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={remaining === 0}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-8 text-sm text-muted-fg transition-colors hover:border-primary/50 hover:text-fg disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ImagePlus className="h-5 w-5" />
        {files.length === 0 ? 'Seleccionar imágenes' : `Agregar más (${remaining} disponibles)`}
      </button>
      <p className="text-xs text-muted-fg">
        Máximo {MAX_IMAGES} imágenes · JPEG, PNG o WebP · Se mostrarán en orden.
      </p>
    </section>
  );
}
