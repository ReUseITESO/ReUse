import { ArrowRightLeft, Tag } from 'lucide-react';

import Button from '@/components/ui/Button';
import { STATUS_FILTERS } from '@/components/transactions/transactionsConfig';

import type { TransactionStatus } from '@/types/transaction';

interface TransactionsFiltersProps {
  role: 'buyer' | 'seller';
  status?: TransactionStatus;
  buyerCount?: number;
  sellerCount?: number;
  onRoleChange: (role: 'buyer' | 'seller') => void;
  onStatusChange: (status?: TransactionStatus) => void;
}

const COMPACT_BUTTON = 'px-2.5 py-1 text-xs';

const ROLE_STYLES: Record<'buyer' | 'seller', { active: string; inactive: string }> = {
  buyer: {
    active: 'border border-secondary/60 bg-secondary/15 text-fg',
    inactive: 'border border-secondary/40 bg-transparent text-fg hover:bg-secondary/10',
  },
  seller: {
    active: 'border border-primary/60 bg-primary/15 text-fg',
    inactive: 'border border-primary/40 bg-transparent text-fg hover:bg-primary/10',
  },
};

const STATUS_STYLES: Record<TransactionStatus | 'all', { active: string; inactive: string }> = {
  all: {
    active: 'bg-info/15 text-fg border border-info/40',
    inactive: 'border border-info/30 text-fg hover:bg-info/10',
  },
  pendiente: {
    active: 'bg-warning/20 text-fg border border-warning/60',
    inactive: 'border border-warning/50 text-fg hover:bg-warning/10',
  },
  confirmada: {
    active: 'bg-success/20 text-fg border border-success/55',
    inactive: 'border border-success/35 text-fg hover:bg-success/10',
  },
  completada: {
    active: 'bg-success/20 text-fg border border-success/55',
    inactive: 'border border-success/35 text-fg hover:bg-success/10',
  },
  cancelada: {
    active: 'bg-error/15 text-fg border border-error/45',
    inactive: 'border border-error/35 text-fg hover:bg-error/10',
  },
};

export default function TransactionsFilters({
  role,
  status,
  buyerCount,
  sellerCount,
  onRoleChange,
  onStatusChange,
}: TransactionsFiltersProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
      <div className="rounded-lg border border-transparent bg-card p-3">
        <label className="text-xs font-medium text-fg">Rol</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            variant="template"
            onClick={() => onRoleChange('buyer')}
            className={`${COMPACT_BUTTON} ${role === 'buyer' ? ROLE_STYLES.buyer.active : ROLE_STYLES.buyer.inactive}`}
          >
            <ArrowRightLeft className="mr-1 inline h-3.5 w-3.5" /> Tus compras{' '}
            {buyerCount ? `(${buyerCount})` : ''}
          </Button>
          <Button
            variant="template"
            onClick={() => onRoleChange('seller')}
            className={`${COMPACT_BUTTON} ${role === 'seller' ? ROLE_STYLES.seller.active : ROLE_STYLES.seller.inactive}`}
          >
            <ArrowRightLeft className="mr-1 inline h-3.5 w-3.5" />
            Tus Entregas {sellerCount ? `(${sellerCount})` : ''}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-transparent bg-card p-3 sm:pl-5">
        <label className="text-xs font-medium text-fg">Estado</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_FILTERS.map(filter =>
            (() => {
              const key = filter.value ?? 'all';
              const style = STATUS_STYLES[key];
              const isActive = status === filter.value;

              return (
                <Button
                  key={filter.label}
                  variant="template"
                  onClick={() => onStatusChange(filter.value)}
                  className={`${COMPACT_BUTTON} ${isActive ? style.active : style.inactive}`}
                >
                  <Tag className="mr-1 inline h-3.5 w-3.5" /> {filter.label}
                </Button>
              );
            })(),
          )}
        </div>
      </div>
    </div>
  );
}
