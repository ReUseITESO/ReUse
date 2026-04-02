// Scaffolding: TypeScript types for the gamification module (badges, impact).
// Update these interfaces to match the actual backend response shape
// once the gamification endpoints are implemented.
// See docs/architecture/modules.md (Gamification) for the data model.

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  criteria?: string;
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

export interface UserPoints {
  points: number;
}

export interface LevelDefinition {
  name: string;
  min_points: number;
  icon: string;
}

export interface LevelProgression {
  points: number;
  current_level: LevelDefinition;
  next_level: LevelDefinition | null;
  progress_percent: number;
  points_to_next_level: number;
  is_max_level: boolean;
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

export type ChallengeType = 'donation' | 'exchange' | 'sale' | 'publish' | 'review';

export interface Challenge {
  id: number;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  goal: number;
  bonus_points: number;
  start_date: string;
  end_date: string;
  joined: boolean;
}

export interface UserChallenge {
  id: number;
  challenge_id: number;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  goal: number;
  progress: number;
  bonus_points: number;
  is_completed: boolean;
  joined_at: string;
  completed_at: string | null;
  start_date: string;
  end_date: string;
  is_expired: boolean;
}
export interface PointHistoryEntry {
  id: number;
  action: string;
  action_display: string;
  points: number;
  reference_id: number | null;
  reference_type: 'product' | 'transaction' | null;
  reference_label: string | null;
  created_at: string;
}

export interface PointsHistoryFilters {
  start_date?: string;
  end_date?: string;
  action?: string;
  ordering?: string;
}

