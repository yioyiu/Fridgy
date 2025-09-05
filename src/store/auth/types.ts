import { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  // Authentication status
  isLoading: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  user: AuthUser | null;
  
  // UI states
  showAuthModal: boolean;
  authMode: 'login' | 'register' | 'forgot-password';
  
  // Sync status
  isSyncing: boolean;
  lastSyncAt: string | null;
  syncError: string | null;
}

export interface AuthActions {
  // Authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<ProfileUpdateData>) => Promise<void>;
  
  // Session management
  initializeAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  
  // UI state management
  setShowAuthModal: (show: boolean) => void;
  setAuthMode: (mode: 'login' | 'register' | 'forgot-password') => void;
  
  // Data sync
  syncToCloud: () => Promise<void>;
  syncFromCloud: () => Promise<void>;
  setSyncStatus: (status: { isSyncing: boolean; error?: string | null }) => void;
}

export interface ProfileUpdateData {
  displayName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export type AuthStore = AuthState & AuthActions;