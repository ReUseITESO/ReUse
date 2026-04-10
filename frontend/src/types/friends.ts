export interface SocialUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture: string | null;
}

export interface UserConnection {
  id: number;
  requester: SocialUser;
  addressee: SocialUser;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface FrequentContact {
  id: number;
  contact: SocialUser;
  created_at: string;
}

export interface FriendRequest {
  id: number;
  from_user: SocialUser;
  created_at: string;
}