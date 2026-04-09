export interface SocialUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture: string | null;
}

export interface CommunityMember {
  id: number;
  user: SocialUser;
  role: string;
  joined_at: string;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  icon: string | null;
  is_private: boolean;
  is_active: boolean;
  creator: SocialUser;
  members_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityDetail extends Community {
  members: CommunityMember[];
}

export interface CommunityPost {
  id: number;
  community: number;
  user: number;
  author_name: string;
  title: string;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityInvitation {
  id: number;
  community: number;
  community_name: string;
  invited_by: SocialUser;
}
