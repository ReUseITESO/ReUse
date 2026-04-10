'use client';

import { useState } from 'react';
import Link from 'next/link';

import Button from '@/components/ui/Button';

const MAX_LENGTH = 500;

interface CommentFormProps {
  isAuthenticated: boolean;
  isSubmitting: boolean;
  onSubmit: (content: string) => Promise<void>;
}

export default function CommentForm({ isAuthenticated, isSubmitting, onSubmit }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const remaining = MAX_LENGTH - content.length;
  const isOverLimit = remaining < 0;
  const isEmpty = content.trim().length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isEmpty || isOverLimit || isSubmitting) return;

    setSubmitError(null);
    try {
      await onSubmit(content.trim());
      setContent('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No se pudo publicar el comentario');
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-border bg-muted p-4 text-center">
        <p className="text-sm text-muted-fg">
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Inicia sesion
          </Link>{' '}
          para dejar un comentario.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={3}
        disabled={isSubmitting}
        className="w-full resize-none rounded-lg border border-input bg-card p-3 text-sm text-fg placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />

      <div className="flex items-center justify-between gap-3">
        <span className={`text-xs ${isOverLimit ? 'text-error' : 'text-muted-fg'}`}>
          {remaining} / {MAX_LENGTH}
        </span>

        <Button
          type="submit"
          variant="primary"
          disabled={isEmpty || isOverLimit || isSubmitting}
          className="px-5 py-2 text-sm"
        >
          {isSubmitting ? 'Publicando...' : 'Comentar'}
        </Button>
      </div>

      {submitError && <p className="text-xs text-error">{submitError}</p>}
    </form>
  );
}
