import { CheckCircle2, CircleDotDashed } from 'lucide-react';

interface TransactionDeliveryConfirmationsProps {
  sellerConfirmation: boolean;
  buyerConfirmation: boolean;
}

export default function TransactionDeliveryConfirmations({
  sellerConfirmation,
  buyerConfirmation,
}: TransactionDeliveryConfirmationsProps) {
  const sellerStatusClass = sellerConfirmation ? 'text-success' : 'text-error';
  const buyerStatusClass = buyerConfirmation ? 'text-success' : 'text-error';

  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <h2 className="text-sm font-semibold text-fg">Confirmaciones de entrega</h2>
      <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
        <p className="inline-flex items-center gap-2">
          {sellerConfirmation ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <CircleDotDashed className="h-4 w-4 text-error" />
          )}
          <span className="text-muted-fg">Vendedor:</span>
          <span className={`font-medium ${sellerStatusClass}`}>
            {sellerConfirmation ? 'Confirmado' : 'Pendiente'}
          </span>
        </p>
        <p className="inline-flex items-center gap-2">
          {buyerConfirmation ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <CircleDotDashed className="h-4 w-4 text-error" />
          )}
          <span className="text-muted-fg">Comprador:</span>
          <span className={`font-medium ${buyerStatusClass}`}>
            {buyerConfirmation ? 'Confirmado' : 'Pendiente'}
          </span>
        </p>
      </div>
    </div>
  );
}
