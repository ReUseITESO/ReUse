export interface FriendUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_picture: string | null;
}

export interface FriendRequest {
  id: number;
  from_user: FriendUser;
  to_user: FriendUser;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface FriendsListResponse {
  count: number;
  results: FriendUser[];
}
