// src/types/auth.ts

export interface UserCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  username: string;
  deviceId: string;
  createdAt: string;
  lastLogin: string;
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginResult {
  success: boolean;
  user?: UserProfile;
  message: string;
  suggestions: string[];
}

export interface RegistrationResult {
  success: boolean;
  user?: UserProfile;
  message: string;
  suggestions: string[];
} 