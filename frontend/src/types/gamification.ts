// Scaffolding: TypeScript types for the gamification module (badges, impact).
// Update these interfaces to match the actual backend response shape
// once the gamification endpoints are implemented.
// See docs/architecture/modules.md (Gamification) for the data model.

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  criteria: string;
}

export interface UserBadge {
  id: number;
  badge: Badge;
  awarded_at: string;
}

export interface EnvironmentImpact {
  id: number;
  co2_saved: string;
  waste_diverted: string;
  total_transactions: number;
}

export interface GamificationSummary {
  points: number;
  badges: UserBadge[];
  impact: EnvironmentImpact | null;
}

export interface BadgeWithStatus {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  rarity: string;
  points: number;
  earned_at: string | null;
}
export interface UserPoints {
  points: number;
}
