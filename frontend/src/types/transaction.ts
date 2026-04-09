import type { Category, ProductCondition, ProductStatus, TransactionType } from '@/types/product';

export type TransactionStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
export type UpdatableTransactionStatus = 'confirmada' | 'completada' | 'cancelada';
export type SwapMeetingStatus = 'not_defined' | 'pending_acceptance' | 'accepted';

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
  swap_product: TransactionProductSummary | null;
  swap_meeting_status: SwapMeetingStatus | null;
  swap_meeting_proposed_by: 'buyer' | 'seller' | null;
  created_at: string;
  expires_at: string;
  is_expired: boolean;
}

export interface CreateTransactionPayload {
  product_id: number;
  delivery_location?: string;
  delivery_date?: string;
  swap_product_id?: number;
}

export interface UpdateTransactionStatusPayload {
  status: UpdatableTransactionStatus;
}

export interface SwapProposalPayload {
  swap_product_id: number;
}

export interface SwapMeetingProposalPayload {
  delivery_location: string;
  delivery_date: string;
}

export interface SwapMeetingResponsePayload {
  accepted: boolean;
}

export interface CreateTransactionDialogSubmitPayload {
  deliveryLocation?: string;
  deliveryDate?: Date;
  swapProductId?: number;
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
  onCreateNewProduct: () => void;
  onSubmit: (payload: CreateTransactionDialogSubmitPayload) => Promise<void>;
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
