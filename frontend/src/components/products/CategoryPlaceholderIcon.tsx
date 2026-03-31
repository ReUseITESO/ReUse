import { BookOpenText, Package, Shirt, Smartphone } from 'lucide-react';

import { getCategoryIconKind, getCategoryTextColorClass } from '@/lib/productStyles';

interface CategoryPlaceholderIconProps {
  categoryName: string;
  className?: string;
}

export default function CategoryPlaceholderIcon({
  categoryName,
  className = 'h-8 w-8',
}: CategoryPlaceholderIconProps) {
  const iconKind = getCategoryIconKind(categoryName);
  const iconClassName = `${className} ${getCategoryTextColorClass(categoryName)}`;

  if (iconKind === 'books') {
    return <BookOpenText className={iconClassName} />;
  }

  if (iconKind === 'electronics') {
    return <Smartphone className={iconClassName} />;
  }

  if (iconKind === 'clothing') {
    return <Shirt className={iconClassName} />;
  }

  return <Package className={iconClassName} />;
}
