import type { Product } from '@/types/product';

export interface GamificationSummary {
  points: number;
  badges_count: number;
}

export interface DashboardData {
  recent_products: Product[];
  user_products: Product[];
  user_products_count: number;
  active_transactions_count: number;
  gamification: GamificationSummary;
}
