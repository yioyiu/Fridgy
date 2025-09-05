import { supabase } from './client';
import { Database } from './types';
import { User, Session } from '@supabase/supabase-js';

type UserProfile = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: string;
}

export interface ProfileResponse {
  profile: UserProfile | null;
  error?: string;
}

export class AuthService {
  /**
   * Get current user session
   */
  static async getCurrentSession(): Promise<{ session: Session | null; error?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      return { session };
    } catch (error: any) {
      console.error('Error getting current session:', error);
      return { session: null, error: error.message };
    }
  }

  /**
   * Get current user
   */
  static async getCurrentUser(): Promise<{ user: User | null; error?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      return { user };
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return { user: null, error: error.message };
    }
  }

  /**
   * Sign in with email and password
   */
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        user: null,
        session: null,
        error: error.message || '登录失败，请检查邮箱和密码',
      };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            display_name: displayName?.trim(),
            full_name: displayName?.trim(),
          },
        },
      });

      if (error) throw error;

      // If user is created successfully, create profile
      if (data.user && !data.user.email_confirmed_at) {
        // Email confirmation required
        return {
          user: data.user,
          session: data.session,
          error: '请检查您的邮箱并点击确认链接完成注册',
        };
      }

      if (data.user) {
        // Create user profile
        await this.createUserProfile(data.user, displayName);
      }

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        user: null,
        session: null,
        error: error.message || '注册失败，请稍后重试',
      };
    }
  }

  /**
   * Sign out
   */
  static async signOut(): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      return {};
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message || '退出登录失败' };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${process.env.EXPO_PUBLIC_APP_URL || 'fridgy://'}reset-password`,
        }
      );

      if (error) throw error;
      
      return {};
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { error: error.message || '重置密码失败，请稍后重试' };
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(newPassword: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      
      return {};
    } catch (error: any) {
      console.error('Update password error:', error);
      return { error: error.message || '更新密码失败' };
    }
  }

  /**
   * Update user email
   */
  static async updateEmail(newEmail: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim().toLowerCase(),
      });

      if (error) throw error;
      
      return {};
    } catch (error: any) {
      console.error('Update email error:', error);
      return { error: error.message || '更新邮箱失败' };
    }
  }

  /**
   * Get user profile from database
   */
  static async getUserProfile(userId: string): Promise<ProfileResponse> {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return { profile };
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      return { 
        profile: null, 
        error: error.message || '获取用户资料失败' 
      };
    }
  }

  /**
   * Create user profile in database
   */
  static async createUserProfile(user: User, displayName?: string): Promise<ProfileResponse> {
    try {
      const userProfile: UserInsert = {
        id: user.id,
        email: user.email || null,
        display_name: displayName || user.user_metadata?.display_name || user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        is_anonymous: user.is_anonymous || false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notification_preferences: {
          dailyReminders: true,
          nearExpiryAlerts: true,
          expiredAlerts: true,
          pushNotifications: true,
        },
        settings: {
          defaultNearExpiryDays: 3,
          autoSuggestExpiry: true,
          language: 'zh',
          theme: 'system',
        },
      };

      const { data: profile, error } = await supabase
        .from('users')
        .insert(userProfile as any)
        .select()
        .single();

      if (error) throw error;

      return { profile };
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      return { 
        profile: null, 
        error: error.message || '创建用户资料失败' 
      };
    }
  }

  /**
   * Update user profile in database
   */
  static async updateUserProfile(userId: string, updates: Partial<UserUpdate>): Promise<ProfileResponse> {
    try {
      const updateData: UserUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data: profile, error } = await (supabase as any)
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      return { profile };
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      return { 
        profile: null, 
        error: error.message || '更新用户资料失败' 
      };
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<{ error?: string }> {
    try {
      // First, delete user profile and related data
      const { error: profileError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      // Then delete auth user (this requires admin privileges)
      // In a real app, this would be handled by a server-side function
      // For now, we'll just sign out the user
      await this.signOut();
      
      return {};
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return { error: error.message || '删除账户失败' };
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * Set up auth state change listener
   */
  static onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
      callback(event, session);
    });
  }

  /**
   * Refresh session
   */
  static async refreshSession(): Promise<{ session: Session | null; error?: string }> {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      return { session };
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      return { session: null, error: error.message };
    }
  }
}