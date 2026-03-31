'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import ProductDetailContent from '@/components/products/ProductDetailContent';
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog';
import { useAuth } from '@/hooks/useAuth';
import { useCreateTransaction } from '@/hooks/useCreateTransaction';
import { useProductDetail } from '@/hooks/useProductDetail';

interface ProductDetailProps {
  productId: string;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { create, isLoading: isCreatingTransaction, error: createTransactionError } =
    useCreateTransaction();
  const { product, setProduct, isLoading, error } = useProductDetail(productId);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [transactionNotice, setTransactionNotice] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary mx-auto" />
          <p className="text-muted-fg">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-lg border border-error/20 bg-error/5 p-6 text-center">
          <p className="mb-4 text-error">{error || 'Producto no encontrado'}</p>
          <button
            onClick={() => router.push('/products')}
            className="rounded-lg bg-btn-primary px-4 py-2 text-btn-primary-fg hover:bg-primary-hover"
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user?.email === product.seller_email;
  const canCreateTransaction =
    isAuthenticated && !isOwner && !product.has_active_transaction && product.status === 'disponible';

  async function handleCreateTransaction(deliveryLocation: string, deliveryDate: Date) {
    if (!product) {
      return;
    }

    const transaction = await create({
      product_id: product.id,
      delivery_location: deliveryLocation,
      delivery_date: deliveryDate.toISOString(),
    });

    if (!transaction) {
      return;
    }

    setIsTransactionDialogOpen(false);
    setTransactionNotice('Solicitud enviada. Notificación pendiente: integración con CORE.');
    setProduct(previous =>
      previous
        ? {
            ...previous,
            has_active_transaction: true,
            status: 'en_proceso',
          }
        : previous,
    );
  }

  function handleMainAction() {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    if (!canCreateTransaction) {
      return;
    }

    setIsTransactionDialogOpen(true);
  }

  const ctaLabel = (() => {
    if (!isAuthenticated) return 'Inicia sesión para solicitar';
    if (isOwner) return 'Este producto te pertenece';
    if (product.has_active_transaction || product.status !== 'disponible') {
      return 'Transacción en proceso';
    }
    return 'Solicitar artículo';
  })();

  return (
    <>
      <ProductDetailContent
        product={product}
        ctaLabel={ctaLabel}
        canCreateTransaction={canCreateTransaction}
        transactionNotice={transactionNotice}
        onBack={() => router.back()}
        onMainAction={handleMainAction}
      />

      <CreateTransactionDialog
        isOpen={isTransactionDialogOpen}
        productTitle={product.title}
        sellerName={product.seller_name}
        sellerEmail={product.seller_email}
        transactionType={product.transaction_type}
        isLoading={isCreatingTransaction}
        error={createTransactionError}
        onCancel={() => setIsTransactionDialogOpen(false)}
        onSubmit={handleCreateTransaction}
      />
    </>
  );
}
