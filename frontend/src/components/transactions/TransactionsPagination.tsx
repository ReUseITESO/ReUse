import Button from '@/components/ui/Button';
import { TransactionsPaginationProps } from '@/types/transaction';

export default function TransactionsPagination({
  currentPage,
  totalCount,
  hasNextPage,
  hasPrevPage,
  onNext,
  onPrevious,
}: TransactionsPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant="template" disabled={!hasPrevPage} onClick={onPrevious}>
        Anterior
      </Button>
      <span className="text-sm text-muted-fg">
        Página {currentPage} · {totalCount} transacciones
      </span>
      <Button variant="template" disabled={!hasNextPage} onClick={onNext}>
        Siguiente
      </Button>
    </div>
  );
}
