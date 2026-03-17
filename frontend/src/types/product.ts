export type ProductStatus = 'disponible' | 'en_proceso' | 'completado' | 'cancelado';

export type ProductCondition = 'nuevo' | 'como_nuevo' | 'buen_estado' | 'usado';

export type TransactionType = 'donation' | 'sale' | 'swap';

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  order_number: number;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  status: ProductStatus;
  price: string | null;
  image_url: string;
  category: Category;
  seller_id: number;
  seller_name: string;
  created_at: string;
  updated_at: string;
}

export interface ProductDetail extends Product {
  seller_email: string;
  images: ProductImage[];
}

export interface ProductCreatePayload {
  title: string;
  description: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  price?: number | null;
  image_url?: string;
  category: number;
  images?: string[];
}

export interface ProductUpdatePayload {
  title?: string;
  description?: string;
  condition?: ProductCondition;
  transaction_type?: TransactionType;
  price?: number | null;
  image_url?: string;
  category?: number;
}

export interface EditFormValues {
  title: string;
  description: string;
  category: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  price: string;
  image_url: string;
}

export interface ProductEditFormProps {
  productId: number;
}

export interface FormValues {
  title: string;
  description: string;
  category: string;
  condition: ProductCondition;
  transaction_type: TransactionType;
  price: string;
  image_url: string;
  images: string[];
}
