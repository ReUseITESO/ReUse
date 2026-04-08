'use client';

import { useState } from 'react';

import StarRating from '@/components/transactions/StarRating';
import { submitTransactionReview } from '@/lib/api';
import type { TransactionReview } from '@/types/transaction';

interface TransactionReviewFormProps {
  transactionId: number;
  onSubmitted: (review: TransactionReview) => void;
}

export default function TransactionReviewForm({
  transactionId,
  onSubmitted,
}: TransactionReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError('Selecciona una calificacion.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const review = await submitTransactionReview(transactionId, {
        rating,
        ...(comment.trim() && { comment: comment.trim() }),
      });
      onSubmitted(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar la calificacion.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-border pt-3">
      <p className="text-xs font-medium text-fg">Califica esta transaccion</p>

      <StarRating value={rating} onChange={setRating} />

      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Comentario opcional..."
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {error && <p className="text-xs text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isLoading || rating === 0}
        className="rounded-xl bg-btn-primary px-4 py-1.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Enviando...' : 'Enviar calificacion'}
      </button>
    </form>
  );
}
