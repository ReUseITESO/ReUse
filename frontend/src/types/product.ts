export type ProductStatus = 'disponible' | 'en_proceso' | 'completado' | 'cancelado';

export type ProductCondition = 'nuevo' | 'como_nuevo' | 'buen_estado' | 'usado';

export type TransactionType = 'donation' | 'sale' | 'swap';

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  status: ProductStatus;
  price: string;
  image_url: string;
  category: Category;
  seller_name: string;
  created_at: string;
}

export interface ProductCreatePayload {
  title: string;
  description: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  price?: number | null;
  image_url?: string;
  category: number;
}