'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { formatTimeAgo } from '@/lib/utils';

import type { Comment } from '@/types/comment';

interface CommentCardProps {
  comment: Comment;
  canDelete: boolean;
  onDelete: (id: number) => Promise<void>;
}

function AuthorAvatar({ name, avatar }: { name: string; avatar: string | null }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-border"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
      <span className="text-xs font-semibold text-primary">{initials}</span>
    </div>
  );
}

export default function CommentCard({ comment, canDelete, onDelete }: CommentCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await onDelete(comment.id);
    } finally {
      setIsDeleting(false);
      setIsConfirming(false);
    }
  }

  return (
    <>
      <div className="flex gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/40">
        <AuthorAvatar name={comment.author.name} avatar={comment.author.avatar} />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-fg">{comment.author.name}</span>
              <span className="text-xs text-muted-fg">{formatTimeAgo(comment.created_at)}</span>
            </div>

            {canDelete && (
              <button
                onClick={() => setIsConfirming(true)}
                aria-label="Eliminar comentario"
                className="rounded p-1 text-muted-fg transition-colors hover:bg-error/10 hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <p className="text-sm text-fg">{comment.content}</p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirming}
        title="Eliminar comentario"
        message="Esta accion no se puede deshacer."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
