import Link from 'next/link';
import { Eye } from 'lucide-react';

import { getTransactionTypeStyle } from '@/lib/productStyles';
import { formatPrice, formatTransactionLabel } from '@/lib/utils';

import type { Transaction } from '@/types/transaction';

interface SwapProductsSnapshotProps {
  transaction: Transaction;
}

function ProductRow({ label, product }: { label: string; product: Transaction['product'] }) {
  return (
    <article className="rounded-md border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-muted-fg">{label}</p>
          <Link
            href={`/products/${product.id}`}
            className="text-sm font-semibold text-fg hover:text-primary"
          >
            {product.title}
          </Link>
        </div>
        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs text-fg hover:bg-muted"
        >
          <Eye className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${getTransactionTypeStyle(product.transaction_type)}`}
        >
          {formatTransactionLabel(product.transaction_type)}
        </span>
        {formatPrice(product.price) && (
          <span className="rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs text-success">
            {formatPrice(product.price)}
          </span>
        )}
      </div>
    </article>
  );
}

export default function SwapProductsSnapshot({ transaction }: SwapProductsSnapshotProps) {
  if (!transaction.proposed_product) {
    return null;
  }

  const sellerName = `${transaction.seller.first_name} ${transaction.seller.last_name}`.trim();
  const buyerName = `${transaction.buyer.first_name} ${transaction.buyer.last_name}`.trim();

  return (
    <section className="rounded-md border border-border bg-muted/30 p-3">
      <div className="grid gap-2 lg:grid-cols-2">
        <ProductRow label={`Producto publicado por ${sellerName}`} product={transaction.product} />
        <ProductRow
          label={`Producto propuesto por ${buyerName}`}
          product={transaction.proposed_product}
        />
      </div>
    </section>
  );
}
