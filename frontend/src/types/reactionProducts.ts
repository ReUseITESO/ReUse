import { MouseEvent, ReactNode } from 'react';
import { ProductReactionSummary } from './product';

export interface ProductReactionButtonsProps {
  productId: number | string;
  sellerId: number;
  initialSummary: ProductReactionSummary;
  compact?: boolean;
  stopLinkNavigation?: boolean;
  className?: string;
  onChange?: (summary: ProductReactionSummary) => void;
}

export interface UseProductReactionParams {
  productId: number | string;
  initialSummary: ProductReactionSummary;
  enabled: boolean;
  onChange?: (summary: ProductReactionSummary) => void;
}

export interface ReactionButtonProps {
  label: string;
  count: number;
  active: boolean;
  disabled: boolean;
  disabledReason?: string;
  className: string;
  activeClassName: string;
  icon: ReactNode;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}
