'use client';

import { useState } from 'react';
import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import Image from 'next/image';

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
  categoryName: string;
}

export default function ImageGallery({ images, productTitle, categoryName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-2 rounded-lg bg-muted">
        <CategoryPlaceholderIcon categoryName={categoryName} className="h-10 w-10" />
        <span className="text-sm text-muted-fg">Sin imagen</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <Image
          fill
          src={selectedImage}
          alt={`${productTitle} - imagen ${selectedIndex + 1}`}
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative aspect-square overflow-hidden rounded-lg border-2 transition-all
                ${
                  index === selectedIndex ? 'border-primary' : 'border-border hover:border-muted-fg'
                }
              `}
            >
              <Image
                fill
                src={image}
                alt={`${productTitle} - miniatura ${index + 1}`}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
