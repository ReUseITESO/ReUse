'use client';

import { useState } from 'react';

interface ImageGalleryProps {
  images: string[];
  productTitle: string;
}

export default function ImageGallery({ images, productTitle }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex h-96 w-full items-center justify-center rounded-lg bg-muted">
        <span className="text-muted-fg">Sin imagen</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={selectedImage}
          alt={`${productTitle} - imagen ${selectedIndex + 1}`}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Thumbnail grid - only show if multiple images */}
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
              <img
                src={image}
                alt={`${productTitle} - miniatura ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
