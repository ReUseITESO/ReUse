import type { Category, ProductCondition, ProductStatus, TransactionType } from '@/types/product';

export type { TransactionType } from '@/types/product';
export type TransactionStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
export type UpdatableTransactionStatus = 'confirmada' | 'completada' | 'cancelada';
export type TransactionRole = 'seller' | 'buyer';
export type SwapStage =
  | 'proposal_pending'
  | 'proposal_rejected'
  | 'proposal_accepted'
  | 'agenda_pending'
  | 'agenda_rejected'
  | 'agenda_accepted';

export interface TransactionUserSummary {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface TransactionProductSummary {
  id: number;
  title: string;
  description: string;
  condition?: ProductCondition | null;
  transaction_type: TransactionType;
  status: ProductStatus;
  price: string | null;
  image_url: string | null;
  category: Category;
}

export interface TransactionReview {
  id: number;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  product: TransactionProductSummary;
  seller: TransactionUserSummary;
  buyer: TransactionUserSummary;
  transaction_type: TransactionType;
  status: TransactionStatus;
  seller_confirmation: boolean;
  seller_confirmed_at: string | null;
  buyer_confirmation: boolean;
  buyer_confirmed_at: string | null;
  delivery_date: string | null;
  delivery_location: string;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
  swap_stage?: SwapStage | null;
  proposed_product?: TransactionProductSummary | null;
  // Present only from the /history/ endpoint
  can_review?: boolean;
  my_review?: TransactionReview | null;
}

export interface CreateTransactionPayload {
  product_id: number;
  delivery_location?: string;
  delivery_date?: string;
  proposed_product_id?: number;
}

export interface UpdateTransactionStatusPayload {
  status: UpdatableTransactionStatus;
}

export interface SwapProposalPayload {
  proposed_product_id: number;
}

export interface SwapDecisionPayload {
  accepted: boolean;
}

export interface SwapAgendaPayload {
  delivery_location: string;
  delivery_date: string;
}

// CreateTransactionDialog
export interface CreateTransactionDialogProps {
  isOpen: boolean;
  productTitle: string;
  sellerName: string;
  sellerEmail: string;
  transactionType: TransactionType;
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (deliveryLocation: string, deliveryDate: Date) => Promise<void>;
}

// MeetingLocationFields

export interface MeetingLocationFieldsProps {
  buildingCode: string;
  roomNumber: string;
  meetingDateTime: Date | null;
  disabled: boolean;
  onBuildingChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onDateTimeChange: (value: Date | null) => void;
  onTimeErrorChange?: (message: string | null) => void;
}

// TransactionsPagination

export interface TransactionsPaginationProps {
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export interface TransactionFilters {
  transaction_type?: TransactionType;
  date_from?: string;
  date_to?: string;
}

export interface SubmitReviewPayload {
  rating: number;
  comment?: string;
}
