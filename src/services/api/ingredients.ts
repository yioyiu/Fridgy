import { supabase } from '@/services/supabase/client';
import { Ingredient, IngredientFormData, IngredientFilters, IngredientStats } from '@/utils/types/ingredient';
import { calculateStatus, calculateFreshnessScore, getCurrentTimestamp } from '@/utils/helpers/date';
import type { Database } from '@/services/supabase/types';

type IngredientInsert = Database['public']['Tables']['ingredients']['Insert'];
type IngredientUpdate = Database['public']['Tables']['ingredients']['Update'];

export class IngredientsAPI {
  static async getIngredients(filters?: IngredientFilters): Promise<Ingredient[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      let query = supabase
        .from('ingredients')
        .select(`
          *,
          categories(name, color),
          units(name, abbreviation),
          locations(name, color)
        `)
        .eq('user_id', user.id)
        .eq('is_archived', false);

      // Apply filters
      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.location) {
        query = query.eq('location_id', filters.location);
      }
      if (filters?.dateRange) {
        query = query
          .gte('expiration_date', filters.dateRange.start)
          .lte('expiration_date', filters.dateRange.end);
      }

      const { data, error } = await query.order('expiration_date', { ascending: true });

      if (error) throw error;

      return data?.map(this.mapDatabaseIngredient) || [];
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      throw error;
    }
  }

  static async getIngredient(id: string): Promise<Ingredient | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ingredients')
        .select(`
          *,
          categories(name, color),
          units(name, abbreviation),
          locations(name, color)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return data ? this.mapDatabaseIngredient(data) : null;
    } catch (error) {
      console.error('Error fetching ingredient:', error);
      throw error;
    }
  }

  static async createIngredient(formData: IngredientFormData): Promise<Ingredient> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate status and freshness score
      const status = calculateStatus(formData.expiration_date, formData.category);
      const freshnessScore = calculateFreshnessScore(
        formData.purchase_date,
        formData.expiration_date,
        formData.category
      );

      const now = getCurrentTimestamp();

      const { data, error } = await (supabase
        .from('ingredients') as any)
        .insert({
          user_id: user.id,
          name: formData.name,
          category_id: formData.category,
          quantity: formData.quantity,
          unit_id: formData.unit,
          purchase_date: formData.purchase_date,
          expiration_date: formData.expiration_date,
          location_id: formData.location,
          images: formData.images || [],
          notes: formData.notes,
          status,
          freshness_score: freshnessScore,
          created_at: now,
          updated_at: now,
        } as IngredientInsert)
        .select(`
          *,
          categories(name, color),
          units(name, abbreviation),
          locations(name, color)
        `)
        .single();

      if (error) throw error;

      return this.mapDatabaseIngredient(data);
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  }

  static async updateIngredient(id: string, updates: Partial<IngredientFormData>): Promise<Ingredient> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Recalculate status and freshness score if relevant fields changed
      let status: string | undefined;
      let freshnessScore: number | undefined;

      if (updates.expiration_date || updates.category || updates.purchase_date) {
        const currentData = await this.getIngredient(id);
        if (currentData) {
          const newExpiry = updates.expiration_date || currentData.expiration_date;
          const newCategory = updates.category || currentData.category;
          const newPurchase = updates.purchase_date || currentData.purchase_date;
          
          status = calculateStatus(newExpiry, newCategory);
          freshnessScore = calculateFreshnessScore(newPurchase, newExpiry, newCategory);
        }
      }

      const updateData: any = {
        ...updates,
        updated_at: getCurrentTimestamp(),
      };

      if (status) updateData.status = status;
      if (freshnessScore !== undefined) updateData.freshness_score = freshnessScore;

      const { data, error } = await (supabase
        .from('ingredients') as any)
        .update(updateData as IngredientUpdate)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          categories(name, color),
          units(name, abbreviation),
          locations(name, color)
        `)
        .single();

      if (error) throw error;

      return this.mapDatabaseIngredient(data);
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  }

  static async deleteIngredient(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('ingredients')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  }

  static async markAsUsed(id: string, quantity?: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const ingredient = await this.getIngredient(id);
      if (!ingredient) throw new Error('Ingredient not found');

      const newQuantity = quantity !== undefined ? ingredient.quantity - quantity : 0;
      const status = newQuantity <= 0 ? 'used' : ingredient.status;

      const { error } = await (supabase
        .from('ingredients') as any)
        .update({
          quantity: Math.max(0, newQuantity),
          status,
          updated_at: getCurrentTimestamp(),
        } as IngredientUpdate)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error marking ingredient as used:', error);
      throw error;
    }
  }

  static async getStats(): Promise<IngredientStats> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_statistics_view')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const row: any = data as any;
      return {
        total: row?.total_ingredients || 0,
        fresh: row?.fresh_count || 0,
        near_expiry: row?.near_expiry_count || 0,
        expired: row?.expired_count || 0,
        used: row?.used_count || 0,
        byCategory: {}, // TODO: Implement category breakdown
        byLocation: {}, // TODO: Implement location breakdown
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  private static mapDatabaseIngredient(dbIngredient: any): Ingredient {
    return {
      id: dbIngredient.id,
      user_id: dbIngredient.user_id,
      name: dbIngredient.name,
      category: dbIngredient.categories?.name || dbIngredient.category_id || '',
      quantity: dbIngredient.quantity,
      unit: dbIngredient.units?.name || dbIngredient.unit_id || '',
      purchase_date: dbIngredient.purchase_date,
      expiration_date: dbIngredient.expiration_date,
      location: dbIngredient.locations?.name || dbIngredient.location_id || '',
      images: dbIngredient.images || [],
      notes: dbIngredient.notes,
      status: dbIngredient.status,
      freshness_score: dbIngredient.freshness_score,
      created_at: dbIngredient.created_at,
      updated_at: dbIngredient.updated_at,
    };
  }
}
