'use client';

import type { MouseEvent } from 'react';

import { ThumbsDown, ThumbsUp } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useProductReaction } from '@/hooks/useProductReaction';
import { cn } from '@/lib/utils';

import type { ProductReactionType } from '@/types/product';
import type { ProductReactionButtonsProps, ReactionButtonProps } from '@/types/reactionProducts';

export default function ProductReactionButtons({
    productId,
    sellerId,
    initialSummary,
    compact = false,
    stopLinkNavigation = false,
    className,
    onChange,
}: ProductReactionButtonsProps) {
    const { isAuthenticated, user } = useAuth();
    const isOwner = user?.id === sellerId;
    const canReact = isAuthenticated && !isOwner;

    const { summary, isSubmitting, error, toggleReaction } = useProductReaction({
        productId,
        initialSummary,
        enabled: canReact,
        onChange,
    });

    const disabledReason = !isAuthenticated
        ? 'Inicia sesión para reaccionar'
        : isOwner
            ? 'No puedes reaccionar a tu propia publicación'
            : undefined;

    const handleClick = (event: MouseEvent<HTMLButtonElement>, type: ProductReactionType) => {
        if (stopLinkNavigation) {
            event.preventDefault();
            event.stopPropagation();
        }
        toggleReaction(type);
    };

    const buttonSize = compact ? 'h-8 min-w-14 px-2' : 'h-10 min-w-20 px-3';
    const iconSize = compact ? 14 : 16;

    return (
        <div className={cn('flex flex-col items-end gap-1', className)}>
            <div className="flex items-center gap-2">
                <ReactionButton
                    label="Me gusta"
                    count={summary.likes_count}
                    active={summary.user_reaction === 'like'}
                    disabled={!canReact || isSubmitting}
                    disabledReason={disabledReason}
                    className={buttonSize}
                    activeClassName="border-success/60 bg-success/10 text-success"
                    onClick={event => handleClick(event, 'like')}
                    icon={<ThumbsUp size={iconSize} />}
                />

                <ReactionButton
                    label="No me gusta"
                    count={summary.dislikes_count}
                    active={summary.user_reaction === 'dislike'}
                    disabled={!canReact || isSubmitting}
                    disabledReason={disabledReason}
                    className={buttonSize}
                    activeClassName="border-error/60 bg-error/10 text-error"
                    onClick={event => handleClick(event, 'dislike')}
                    icon={<ThumbsDown size={iconSize} />}
                />
            </div>

            {error && <span className="text-xs text-error">{error}</span>}
        </div>
    );
}

function ReactionButton({
    label,
    count,
    active,
    disabled,
    disabledReason,
    className,
    activeClassName,
    icon,
    onClick,
}: ReactionButtonProps) {
    return (
        <button
            type="button"
            title={disabledReason}
            aria-label={`${label}: ${count}`}
            disabled={disabled}
            onClick={onClick}
            className={cn(
                'inline-flex items-center justify-center gap-1 rounded-lg border border-border bg-card text-muted-fg transition-colors',
                'hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60',
                className,
                active && activeClassName,
            )}
        >
            <span aria-hidden="true" className="inline-flex items-center">
                {icon}
            </span>
            <span className="text-xs font-semibold">{count}</span>
        </button>
    );
}
