export interface CommunityMember {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture: string | null;
}

export interface Membership {
  id: number;
  user: CommunityMember;
  role: 'admin' | 'member';
  joined_at: string;
}

export interface Community {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  created_by_name: string;
  member_count: number;
  created_at: string;
}

export interface CommunityDetail extends Community {
  created_by: number;
  is_member: boolean;
  user_role: 'admin' | 'member' | null;
  updated_at: string;
}

export interface CommunityPost {
  id: number;
  author: CommunityMember;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommunityInvitation {
  id: number;
  community: number;
  community_name: string;
  invited_by: CommunityMember;
  invited_user: CommunityMember;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}
