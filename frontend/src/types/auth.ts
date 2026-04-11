export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  points: number;
  profile_picture: string | null;
  date_joined: string;
  last_login: string | null;
  // HU-CORE-17: flag de desactivación lógica
  is_deactivated?: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}
