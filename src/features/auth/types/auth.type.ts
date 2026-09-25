export type AuthRole = 'BUYER' | 'SELLER';

export interface RegisterFormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AuthRole;
  agreeTerms: boolean;
}

export interface RegisterPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: AuthRole;
}

export interface RegisterResponseData {
  userId: string;
  email: string;
  name: string;
  role: AuthRole;
  accessToken?: string;
  refreshToken?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  data: RegisterResponseData;
}

// ─────────────────────────────────────────
// Login
// ─────────────────────────────────────────

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  userId: string;
  email: string;
  name: string;
  role: AuthRole;
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data: LoginResponseData;
}

