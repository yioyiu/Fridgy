import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/services/supabase/client';
import { AuthStore, AuthUser, ProfileUpdateData } from './types';
import { Session, User } from '@supabase/supabase-js';

// Helper function to convert Supabase User to AuthUser
const mapSupabaseUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email || null,
    phone: user.phone || null,
    displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || null,
    avatarUrl: user.user_metadata?.avatar_url || null,
    isAnonymous: user.is_anonymous || false,
    createdAt: user.created_at,
    updatedAt: user.updated_at || user.created_at,
  };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoading: false,
      isAuthenticated: false,
      session: null,
      user: null,
      showAuthModal: false,
      authMode: 'login',
      isSyncing: false,
      lastSyncAt: null,
      syncError: null,

      // Initialize authentication
      initializeAuth: async () => {
        set({ isLoading: true });
        
        try {
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            set({ isLoading: false, isAuthenticated: false, session: null, user: null });
            return;
          }

          if (session) {
            const authUser = mapSupabaseUser(session.user);
            set({
              isAuthenticated: true,
              session,
              user: authUser,
              isLoading: false,
            });
            
            // Sync data from cloud on initial auth
            get().syncFromCloud();
          } else {
            set({ isLoading: false, isAuthenticated: false, session: null, user: null });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (event === 'SIGNED_IN' && session) {
              const authUser = mapSupabaseUser(session.user);
              set({
                isAuthenticated: true,
                session,
                user: authUser,
                showAuthModal: false,
              });
              
              // Sync data when user signs in
              get().syncFromCloud();
            } else if (event === 'SIGNED_OUT') {
              set({
                isAuthenticated: false,
                session: null,
                user: null,
                lastSyncAt: null,
                syncError: null,
              });
            } else if (event === 'TOKEN_REFRESHED' && session) {
              const authUser = mapSupabaseUser(session.user);
              set({
                session,
                user: authUser,
              });
            }
          });
          
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ isLoading: false, isAuthenticated: false, session: null, user: null });
        }
      },

      // Refresh session
      refreshSession: async () => {
        try {
          const { data: { session }, error } = await supabase.auth.refreshSession();
          if (error) throw error;
          
          if (session) {
            const authUser = mapSupabaseUser(session.user);
            set({ session, user: authUser });
          }
        } catch (error) {
          console.error('Error refreshing session:', error);
        }
      },

      // Sign in
      signIn: async (email: string, password: string) => {
        set({ isLoading: true, syncError: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Auth state will be updated by the onAuthStateChange listener
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Sign in error:', error);
          set({ isLoading: false });
          throw new Error(error.message || '登录失败，请检查邮箱和密码');
        }
      },

      // Sign up
      signUp: async (email: string, password: string, displayName?: string) => {
        set({ isLoading: true, syncError: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName,
                full_name: displayName,
              },
            },
          });

          if (error) throw error;

          // Create user profile in database
          if (data.user) {
            try {
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email || null,
                  display_name: displayName || null,
                  is_anonymous: false,
                  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  notification_preferences: {
                    dailyReminders: true,
                    nearExpiryAlerts: true,
                    expiredAlerts: true,
                  },
                  settings: {
                    defaultNearExpiryDays: 3,
                    autoSuggestExpiry: true,
                  },
                } as any);

            if (profileError) {
              console.error('Error creating user profile:', profileError);
            }
          } catch (profileError) {
            console.error('Error creating user profile:', profileError);
          }
        }

          set({ isLoading: false });
        } catch (error: any) {
          console.error('Sign up error:', error);
          set({ isLoading: false });
          throw new Error(error.message || '注册失败，请稍后重试');
        }
      },

      // Sign out
      signOut: async () => {
        set({ isLoading: true });
        
        try {
          // Sync to cloud before signing out
          await get().syncToCloud();
          
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          // Auth state will be updated by the onAuthStateChange listener
          set({ isLoading: false });
        } catch (error: any) {
          console.error('Sign out error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      // Reset password
      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });

          if (error) throw error;
        } catch (error: any) {
          console.error('Reset password error:', error);
          throw new Error(error.message || '重置密码失败，请稍后重试');
        }
      },

      // Update profile
      updateProfile: async (updates: ProfileUpdateData) => {
        const { user } = get();
        if (!user) throw new Error('用户未登录');

        set({ isLoading: true });

        try {
          // Update auth user metadata
          const updateData: any = {
            data: {
              display_name: updates.displayName,
              full_name: updates.displayName,
              avatar_url: updates.avatarUrl,
            },
          };
          
          if (updates.email) {
            updateData.email = updates.email;
          }
          
          const { error: authError } = await supabase.auth.updateUser(updateData);

          if (authError) throw authError;

          // Update user profile in database
          const profileUpdateData: any = {
            updated_at: new Date().toISOString(),
          };
          
          if (updates.email) profileUpdateData.email = updates.email;
          if (updates.phone) profileUpdateData.phone = updates.phone;
          if (updates.displayName) profileUpdateData.display_name = updates.displayName;
          if (updates.avatarUrl) profileUpdateData.avatar_url = updates.avatarUrl;
          
          const { error: profileError } = await (supabase as any)
            .from('users')
            .update(profileUpdateData)
            .eq('id', user.id);

          if (profileError) throw profileError;

          // Update local state
          set({
            user: {
              ...user,
              email: updates.email || user.email,
              phone: updates.phone || user.phone,
              displayName: updates.displayName || user.displayName,
              avatarUrl: updates.avatarUrl || user.avatarUrl,
              updatedAt: new Date().toISOString(),
            },
            isLoading: false,
          });
        } catch (error: any) {
          console.error('Update profile error:', error);
          set({ isLoading: false });
          throw new Error(error.message || '更新资料失败，请稍后重试');
        }
      },

      // UI state management
      setShowAuthModal: (show: boolean) => set({ showAuthModal: show }),
      setAuthMode: (mode: 'login' | 'register' | 'forgot-password') => set({ authMode: mode }),

      // Data sync methods
      syncToCloud: async () => {
        const { user } = get();
        if (!user) return;

        set({ isSyncing: true, syncError: null });

        try {
          // Get ingredients store instance
          const { useIngredientsStore } = await import('../ingredients/slice');
          const ingredientsStore = useIngredientsStore.getState();
          
          // Sync ingredients to cloud
          await ingredientsStore.syncToCloud();
          
          set({ 
            isSyncing: false, 
            lastSyncAt: new Date().toISOString(),
            syncError: null 
          });
        } catch (error: any) {
          console.error('Sync to cloud error:', error);
          set({ 
            isSyncing: false, 
            syncError: error.message || '同步失败' 
          });
          throw error;
        }
      },

      syncFromCloud: async () => {
        const { user } = get();
        if (!user) return;

        set({ isSyncing: true, syncError: null });

        try {
          // Get ingredients store instance
          const { useIngredientsStore } = await import('../ingredients/slice');
          const ingredientsStore = useIngredientsStore.getState();
          
          // Sync ingredients from cloud
          await ingredientsStore.syncFromCloud();
          
          set({ 
            isSyncing: false, 
            lastSyncAt: new Date().toISOString(),
            syncError: null 
          });
        } catch (error: any) {
          console.error('Sync from cloud error:', error);
          set({ 
            isSyncing: false, 
            syncError: error.message || '同步失败' 
          });
          throw error;
        }
      },

      setSyncStatus: ({ isSyncing, error }) => {
        set({ 
          isSyncing, 
          syncError: error || null 
        });
      },
    }),
    {
      name: 'auth-store',
      storage: {
        getItem: async (key: string) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key: string, value: any) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key: string) => {
          await AsyncStorage.removeItem(key);
        },
      },
      // Only persist non-sensitive UI state
      partialize: (state: AuthStore) => ({
        lastSyncAt: state.lastSyncAt,
        authMode: state.authMode,
      }),
    }
  )
);