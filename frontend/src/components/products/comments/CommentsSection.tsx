'use client';

import { MessageSquare } from 'lucide-react';

import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import CommentCard from '@/components/products/comments/CommentCard';
import CommentForm from '@/components/products/comments/CommentForm';
import CommentsSkeleton from '@/components/products/comments/CommentsSkeleton';
import { useAuth } from '@/hooks/useAuth';
import { useComments } from '@/hooks/useComments';

interface CommentsSectionProps {
  productId: number;
  productSellerId: number;
}

export default function CommentsSection({ productId, productSellerId }: CommentsSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const { comments, count, isLoading, isSubmitting, error, hasMore, loadMore, submitComment, removeComment } =
    useComments(productId);

  function canDeleteComment(authorId: number) {
    if (!user) return false;
    return user.id === authorId || user.id === productSellerId;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-2 border-b border-border pb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h2 className="text-fg">
          Comentarios{' '}
          {!isLoading && <span className="text-muted-fg">({count})</span>}
        </h2>
      </div>

      <CommentForm
        isAuthenticated={isAuthenticated}
        isSubmitting={isSubmitting}
        onSubmit={submitComment}
      />

      {isLoading && <CommentsSkeleton />}

      {!isLoading && error && (
        <ErrorMessage
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && comments.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <MessageSquare className="h-10 w-10 text-muted-fg/40" />
          <p className="text-sm text-muted-fg">Se el primero en comentar</p>
        </div>
      )}

      {!isLoading && !error && comments.length > 0 && (
        <div className="flex flex-col gap-3">
          {comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              canDelete={canDeleteComment(comment.author.id)}
              onDelete={removeComment}
            />
          ))}

          {hasMore && (
            <div className="pt-2 text-center">
              <Button variant="template" onClick={loadMore} className="text-sm">
                Cargar mas comentarios
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
