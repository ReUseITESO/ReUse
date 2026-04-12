import Badge from '@/components/ui/Badge';

import type { TransactionStatus } from '@/types/transaction';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; variant: 'green' | 'blue' | 'gray' | 'red' | 'yellow' }
> = {
  pendiente: { label: 'Pendiente', variant: 'yellow' },
  // Treat confirmed as pending in the UI (unified view)
  confirmada: { label: 'Pendiente', variant: 'yellow' },
  completada: { label: 'Completada', variant: 'green' },
  cancelada: { label: 'Cancelada', variant: 'red' },
};

export default function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
