// Mirrors app/api/v1/endpoints/auth.py's request/response models.

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  api_key: string;
  rate_limit: number;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}
