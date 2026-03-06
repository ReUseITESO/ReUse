import Badge from '@/components/ui/Badge';

import type { ProductStatus } from '@/types/product';

interface StatusBadgeProps {
  status: ProductStatus;
}

const STATUS_CONFIG: Record<ProductStatus, { label: string; variant: 'green' | 'blue' | 'gray' | 'red' | 'yellow' }> = {
  disponible: { label: 'Disponible', variant: 'green' },
  en_proceso: { label: 'En proceso', variant: 'yellow' },
  completado: { label: 'Completado', variant: 'blue' },
  cancelado: { label: 'Cancelado', variant: 'red' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
