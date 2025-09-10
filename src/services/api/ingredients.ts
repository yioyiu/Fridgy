import { Ingredient, IngredientFormData, IngredientFilters, IngredientStats } from '@/utils/types/ingredient';
import { calculateStatus, calculateFreshnessScore, getCurrentTimestamp } from '@/utils/helpers/date';

export class IngredientsAPI {
  static async getIngredients(filters?: IngredientFilters): Promise<Ingredient[]> {
    try {
      // 由于移除了认证功能，这个 API 现在只返回空数组
      // 所有数据都存储在本地
      console.log('IngredientsAPI.getIngredients called - returning empty array (local storage only)');
      return [];
    } catch (error) {
      console.error('Error getting ingredients:', error);
      throw error;
    }
  }

  static async getIngredientById(id: string): Promise<Ingredient | null> {
    try {
      // 由于移除了认证功能，这个 API 现在只返回 null
      // 所有数据都存储在本地
      console.log('IngredientsAPI.getIngredientById called - returning null (local storage only)');
      return null;
    } catch (error) {
      console.error('Error getting ingredient by id:', error);
      throw error;
    }
  }

  static async createIngredient(data: IngredientFormData): Promise<Ingredient> {
    try {
      // 由于移除了认证功能，这个 API 现在只抛出错误
      // 所有数据都存储在本地
      console.log('IngredientsAPI.createIngredient called - throwing error (local storage only)');
      throw new Error('云端同步功能已禁用，请使用本地存储');
    } catch (error) {
      console.error('Error creating ingredient:', error);
      throw error;
    }
  }

  static async updateIngredient(id: string, data: Partial<IngredientFormData>): Promise<Ingredient> {
    try {
      // 由于移除了认证功能，这个 API 现在只抛出错误
      // 所有数据都存储在本地
      console.log('IngredientsAPI.updateIngredient called - throwing error (local storage only)');
      throw new Error('云端同步功能已禁用，请使用本地存储');
    } catch (error) {
      console.error('Error updating ingredient:', error);
      throw error;
    }
  }

  static async deleteIngredient(id: string): Promise<void> {
    try {
      // 由于移除了认证功能，这个 API 现在只抛出错误
      // 所有数据都存储在本地
      console.log('IngredientsAPI.deleteIngredient called - throwing error (local storage only)');
      throw new Error('云端同步功能已禁用，请使用本地存储');
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  }

  static async getIngredientStats(): Promise<IngredientStats> {
    try {
      // 由于移除了认证功能，这个 API 现在只返回空统计
      // 所有数据都存储在本地
      console.log('IngredientsAPI.getIngredientStats called - returning empty stats (local storage only)');
      return {
        total: 0,
        expiring: 0,
        expired: 0,
        fresh: 0,
        categories: {},
        locations: {},
        averageFreshness: 0,
        wasteValue: 0,
        consumptionRate: 0,
      };
    } catch (error) {
      console.error('Error getting ingredient stats:', error);
      throw error;
    }
  }

  static async searchIngredients(query: string, filters?: IngredientFilters): Promise<Ingredient[]> {
    try {
      // 由于移除了认证功能，这个 API 现在只返回空数组
      // 所有数据都存储在本地
      console.log('IngredientsAPI.searchIngredients called - returning empty array (local storage only)');
      return [];
    } catch (error) {
      console.error('Error searching ingredients:', error);
      throw error;
    }
  }

  static async getExpiringIngredients(days: number = 3): Promise<Ingredient[]> {
    try {
      // 由于移除了认证功能，这个 API 现在只返回空数组
      // 所有数据都存储在本地
      console.log('IngredientsAPI.getExpiringIngredients called - returning empty array (local storage only)');
      return [];
    } catch (error) {
      console.error('Error getting expiring ingredients:', error);
      throw error;
    }
  }
}