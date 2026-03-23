import { useCallback, useEffect, useState } from 'react';

import { deleteProductReaction, postProductReaction } from '@/lib/api';

import type { ProductReactionSummary, ProductReactionType } from '@/types/product';

import type { UseProductReactionParams } from '@/types/reactionProducts';


function getOptimisticSummary(
    current: ProductReactionSummary,
    nextType: ProductReactionType,
): ProductReactionSummary {
    if (current.user_reaction === nextType) {
        return {
            likes_count: current.likes_count - (nextType === 'like' ? 1 : 0),
            dislikes_count: current.dislikes_count - (nextType === 'dislike' ? 1 : 0),
            user_reaction: null,
        };
    }

    if (!current.user_reaction) {
        return {
            likes_count: current.likes_count + (nextType === 'like' ? 1 : 0),
            dislikes_count: current.dislikes_count + (nextType === 'dislike' ? 1 : 0),
            user_reaction: nextType,
        };
    }

    return {
        likes_count: current.likes_count + (nextType === 'like' ? 1 : -1),
        dislikes_count: current.dislikes_count + (nextType === 'dislike' ? 1 : -1),
        user_reaction: nextType,
    };
}

export function useProductReaction({
    productId,
    initialSummary,
    enabled,
    onChange,
}: UseProductReactionParams) {
    const [summary, setSummary] = useState<ProductReactionSummary>(initialSummary);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setSummary(initialSummary);
    }, [initialSummary]);

    const toggleReaction = useCallback(
        async (type: ProductReactionType) => {
            if (!enabled || isSubmitting) return;

            const previous = summary;
            const optimistic = getOptimisticSummary(previous, type);
            setSummary(optimistic);
            setIsSubmitting(true);
            setError(null);

            try {
                const nextSummary =
                    previous.user_reaction === type
                        ? await deleteProductReaction(productId)
                        : await postProductReaction(productId, type);

                setSummary(nextSummary);
                onChange?.(nextSummary);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'No se pudo actualizar la reaccion';
                setSummary(previous);
                setError(message);
            } finally {
                setIsSubmitting(false);
            }
        },
        [enabled, isSubmitting, summary, productId, onChange],
    );

    return {
        summary,
        isSubmitting,
        error,
        toggleReaction,
    };
}
