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

export interface AvatarData {
  image: string | null;
	border_thickness: number;
	border_color: string;
	shadow_color: string;
	shadow_thickness: number;
  zoom_level: number;
  offset_x: number;
  offset_y: number;
  border_type: string | null;
  border_name: string | null;
};