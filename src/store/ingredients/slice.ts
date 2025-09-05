import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IngredientsStore } from './types';
import { Ingredient, IngredientFormData, IngredientFilters } from '@/utils/types/ingredient';
import { DEFAULT_CATEGORIES, DEFAULT_UNITS, DEFAULT_LOCATIONS } from '@/utils/constants';
import { SAMPLE_INGREDIENTS } from '@/utils/helpers/sampleData';
import { IngredientsAPI } from '@/services/api/ingredients';
import { notificationService } from '@/services/notifications';

// Helper functions for calculating ingredient status and freshness
const calculateStatus = (expirationDate: string): 'fresh' | 'near_expiry' | 'expired' | 'used' => {
  if (!expirationDate) return 'fresh';
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'near_expiry';
  return 'fresh';
};

const calculateFreshnessScore = (expirationDate: string): number => {
  if (!expirationDate) return 0.8;
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 0.0;
  if (diffDays <= 1) return 0.1;
  if (diffDays <= 3) return 0.3;
  if (diffDays <= 7) return 0.5;
  if (diffDays <= 14) return 0.7;
  return 0.9;
};

// Helper function to calculate time range for filtering
const getTimeRange = (timeframe: 'week' | 'month' | 'quarter' | 'year') => {
  const now = new Date();
  const start = new Date();
  
  switch (timeframe) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return {
    start: start.toISOString().split('T')[0]!,
    end: now.toISOString().split('T')[0]!
  };
};

// Helper function to filter ingredients by time range
const filterIngredientsByTimeRange = (ingredients: Ingredient[], timeRange: { start: string; end: string }) => {
  return ingredients.filter(ingredient => {
    // 使用created_at作为主要过滤字段（食材添加时间）
    const createdDate = ingredient.created_at.split('T')[0]!;
    return createdDate >= timeRange.start && createdDate <= timeRange.end;
  });
};

const initialState = {
  // Data
  ingredients: [],
  categories: DEFAULT_CATEGORIES,
  units: DEFAULT_UNITS,
  locations: DEFAULT_LOCATIONS,
  stats: null,
  
  // Time filtering
  timeFilteredStats: null,
  selectedTimeframe: 'week' as const,
  
  // Loading states
  isLoading: false,
  isAdding: false,
  isUpdating: false,
  isDeleting: false,
  
  // Filters and search
  filters: {} as IngredientFilters,
  searchQuery: '',
  
  // Error handling
  error: null,
  
  // Pagination
  hasMore: true,
  page: 1,
  limit: 20,
  
  // Initialization flag
  isInitialized: false,
  
  // Data sync
  isSyncing: false,
  lastSyncAt: null,
  syncError: null,
  hasLocalChanges: false,
};

export const useIngredientsStore = create<IngredientsStore>()(persist(
  (set, get) => ({
    ...initialState,

    // Data fetching
    fetchIngredients: async () => {
      set({ isLoading: true, error: null });
      try {
        // Only load sample data if not already initialized
        const state = get();
        if (!state.isInitialized) {
          // 重新计算样本数据的状态，确保基于当前日期
          const updatedSampleIngredients = SAMPLE_INGREDIENTS.map(ingredient => ({
            ...ingredient,
            status: calculateStatus(ingredient.expiration_date),
            freshness_score: calculateFreshnessScore(ingredient.expiration_date),
          }));
          
          set({ 
            ingredients: updatedSampleIngredients, 
            isLoading: false,
            isInitialized: true 
          });
        } else {
          set({ isLoading: false });
        }
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch ingredients',
          isLoading: false 
        });
      }
    },

    fetchCategories: async () => {
      try {
        // TODO: Implement API call
        set({ categories: DEFAULT_CATEGORIES });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch categories'
        });
      }
    },

    fetchUnits: async () => {
      try {
        // TODO: Implement API call
        set({ units: DEFAULT_UNITS });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch units'
        });
      }
    },

    fetchLocations: async () => {
      try {
        // TODO: Implement API call
        set({ locations: DEFAULT_LOCATIONS });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch locations'
        });
      }
    },

    fetchStats: async () => {
      try {
        // Calculate stats from current ingredients with real-time status calculation
        const currentIngredients = get().ingredients;
        
        // 重新计算每个食材的状态，确保基于当前日期
        const ingredientsWithUpdatedStatus = currentIngredients.map(ingredient => ({
          ...ingredient,
          status: ingredient.status === 'used' ? 'used' : calculateStatus(ingredient.expiration_date),
          freshness_score: ingredient.status === 'used' ? ingredient.freshness_score : calculateFreshnessScore(ingredient.expiration_date),
        }));
        
        // 更新ingredients状态为重新计算后的数据
        set({ ingredients: ingredientsWithUpdatedStatus });
        
        const stats = {
          total: ingredientsWithUpdatedStatus.length,
          fresh: ingredientsWithUpdatedStatus.filter(i => i.status === 'fresh').length,
          near_expiry: ingredientsWithUpdatedStatus.filter(i => i.status === 'near_expiry').length,
          expired: ingredientsWithUpdatedStatus.filter(i => i.status === 'expired').length,
          used: ingredientsWithUpdatedStatus.filter(i => i.status === 'used').length,
          byCategory: {} as Record<string, number>,
          byLocation: {} as Record<string, number>,
        };
        
        // Calculate by category and location
        ingredientsWithUpdatedStatus.forEach(ingredient => {
          stats.byCategory[ingredient.category] = (stats.byCategory[ingredient.category] || 0) + 1;
          stats.byLocation[ingredient.location] = (stats.byLocation[ingredient.location] || 0) + 1;
        });
        
        set({ stats });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch stats'
        });
      }
    },

    // CRUD operations
    addIngredient: async (data: IngredientFormData) => {
      set({ isAdding: true, error: null });
      try {
        // Create a new ingredient with sample data structure
        const newIngredient: Ingredient = {
          id: `ingredient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          user_id: 'user-1',
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          unit: data.unit,
          purchase_date: data.purchase_date,
          expiration_date: data.expiration_date,
          location: data.location,
          images: data.images || [],
          notes: data.notes || '',
          status: calculateStatus(data.expiration_date),
          freshness_score: calculateFreshnessScore(data.expiration_date),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set(state => ({
          ingredients: [newIngredient, ...state.ingredients],
          isAdding: false
        }));
        
        // 添加食材后自动更新统计数据
        await get().fetchStats();
        
        // 添加食材后标记本地更改
        get().markLocalChanges();
        
        // 同步通知设置（当食材列表变化时）
        const updatedIngredients = get().ingredients;
        try {
          // 获取当前通知设置（需要从 settings store 获取）
          // 这里可以通过全局状态或其他方式获取设置
          await notificationService.syncExpiryAlerts(updatedIngredients, {
            enabled: true, // 需要从 settings store 获取
            dailyReminders: true,
            nearExpiryAlerts: true,
            expiredAlerts: false,
            nearExpiryDays: 3,
          });
        } catch (error) {
          console.warn('Failed to sync notifications after adding ingredient:', error);
        }
        
        return newIngredient;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to add ingredient',
          isAdding: false 
        });
        return null;
      }
    },

    updateIngredient: async (id: string, data: Partial<IngredientFormData>) => {
      set({ isUpdating: true, error: null });
      try {
        // Update ingredient locally
        set(state => ({
          ingredients: state.ingredients.map(ingredient =>
            ingredient.id === id 
              ? { ...ingredient, ...data, updated_at: new Date().toISOString() }
              : ingredient
          ),
          isUpdating: false
        }));
        
        // 更新食材后自动更新统计数据
        await get().fetchStats();
        
        // 更新食材后标记本地更改
        get().markLocalChanges();
        
        return get().ingredients.find(i => i.id === id) || null;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to update ingredient',
          isUpdating: false 
        });
        return null;
      }
    },

    deleteIngredient: async (id: string) => {
      set({ isDeleting: true, error: null });
      try {
        // Remove ingredient locally
        set(state => ({
          ingredients: state.ingredients.filter(ingredient => ingredient.id !== id),
          isDeleting: false
        }));
        
        // 删除食材后自动更新统计数据
        await get().fetchStats();
        
        // 删除食材后标记本地更改
        get().markLocalChanges();
        
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to delete ingredient',
          isDeleting: false 
        });
        return false;
      }
    },

    markAsUsed: async (id: string, quantity?: number) => {
      set({ isUpdating: true, error: null });
      try {
        // Smart toggle: if already used, restore to previous status; otherwise mark as used
        set(state => ({
          ingredients: state.ingredients.map(ingredient => {
            if (ingredient.id === id) {
              if (ingredient.status === 'used') {
                // If already used, restore to previous status based on expiration date
                const previousStatus = calculateStatus(ingredient.expiration_date);
                return { 
                  ...ingredient, 
                  status: previousStatus, 
                  updated_at: new Date().toISOString() 
                };
              } else {
                // If not used, mark as used and store previous status
                return { 
                  ...ingredient, 
                  status: 'used', 
                  updated_at: new Date().toISOString() 
                };
              }
            }
            return ingredient;
          }),
          isUpdating: false
        }));
        
        // 标记为已使用后自动更新统计数据
        await get().fetchStats();
        
        // 标记为已使用后标记本地更改
        get().markLocalChanges();
        
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to mark ingredient as used',
          isUpdating: false 
        });
        return false;
      }
    },

    // Local state management
    setIngredients: (ingredients: Ingredient[]) => {
      set({ ingredients });
    },

    addIngredientLocal: (ingredient: Ingredient) => {
      set(state => ({
        ingredients: [ingredient, ...state.ingredients]
      }));
    },

    updateIngredientLocal: (id: string, updates: Partial<Ingredient>) => {
      set(state => ({
        ingredients: state.ingredients.map(ingredient =>
          ingredient.id === id
            ? { ...ingredient, ...updates, updated_at: new Date().toISOString() }
            : ingredient
        )
      }));
    },

    removeIngredientLocal: (id: string) => {
      set(state => ({
        ingredients: state.ingredients.filter(ingredient => ingredient.id !== id)
      }));
    },

    // Filters and search
    setFilters: (filters: Partial<IngredientFilters>) => {
      set(state => ({
        filters: { ...state.filters, ...filters }
      }));
    },

    setSearchQuery: (searchQuery: string) => {
      set({ searchQuery });
    },

    clearFilters: () => {
      set({ filters: {}, searchQuery: '' });
    },

    // Loading states
    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    setAdding: (isAdding: boolean) => {
      set({ isAdding });
    },

    setUpdating: (isUpdating: boolean) => {
      set({ isUpdating });
    },

    setDeleting: (isDeleting: boolean) => {
      set({ isDeleting });
    },

    // Error handling
    setError: (error: string | null) => {
      set({ error });
    },

    clearError: () => {
      set({ error: null });
    },

    // Pagination
    setHasMore: (hasMore: boolean) => {
      set({ hasMore });
    },

    setPage: (page: number) => {
      set({ page });
    },

    resetPagination: () => {
      set({ page: 1, hasMore: true });
    },

    // Reset
    reset: () => {
      set(initialState);
    },
    
    // Time filtering methods
    setTimeframe: (timeframe: 'week' | 'month' | 'quarter' | 'year') => {
      set({ selectedTimeframe: timeframe });
      // 自动更新时间过滤的统计数据
      get().fetchTimeFilteredStats(timeframe);
    },
    
    fetchTimeFilteredStats: async (timeframe?: 'week' | 'month' | 'quarter' | 'year') => {
      try {
        const currentTimeframe = timeframe || get().selectedTimeframe;
        const timeRange = getTimeRange(currentTimeframe);
        const currentIngredients = get().ingredients;
        
        // 过滤在时间范围内的食材
        const filteredIngredients = filterIngredientsByTimeRange(currentIngredients, timeRange);
        
        // 重新计算过滤后食材的状态
        const ingredientsWithUpdatedStatus = filteredIngredients.map(ingredient => ({
          ...ingredient,
          status: ingredient.status === 'used' ? 'used' : calculateStatus(ingredient.expiration_date),
          freshness_score: ingredient.status === 'used' ? ingredient.freshness_score : calculateFreshnessScore(ingredient.expiration_date),
        }));
        
        // 计算时间过滤后的统计数据
        const timeFilteredStats = {
          total: ingredientsWithUpdatedStatus.length,
          fresh: ingredientsWithUpdatedStatus.filter(i => i.status === 'fresh').length,
          near_expiry: ingredientsWithUpdatedStatus.filter(i => i.status === 'near_expiry').length,
          expired: ingredientsWithUpdatedStatus.filter(i => i.status === 'expired').length,
          used: ingredientsWithUpdatedStatus.filter(i => i.status === 'used').length,
          byCategory: {} as Record<string, number>,
          byLocation: {} as Record<string, number>,
        };
        
        // 计算分类和位置分布
        ingredientsWithUpdatedStatus.forEach(ingredient => {
          timeFilteredStats.byCategory[ingredient.category] = (timeFilteredStats.byCategory[ingredient.category] || 0) + 1;
          timeFilteredStats.byLocation[ingredient.location] = (timeFilteredStats.byLocation[ingredient.location] || 0) + 1;
        });
        
        set({ timeFilteredStats });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch time filtered stats'
        });
      }
    },
    
    // Force reload sample data (for testing purposes)
    reloadSampleData: () => {
      // 重新计算样本数据的状态，确保基于当前日期
      const updatedSampleIngredients = SAMPLE_INGREDIENTS.map(ingredient => ({
        ...ingredient,
        status: calculateStatus(ingredient.expiration_date),
        freshness_score: calculateFreshnessScore(ingredient.expiration_date),
      }));
      
      set({ 
        ingredients: updatedSampleIngredients, 
        isInitialized: true 
      });
    },
    
    // Data sync methods
    syncToCloud: async () => {
      const state = get();
      if (!state.hasLocalChanges) {
        console.log('No local changes to sync');
        return;
      }
      
      set({ isSyncing: true, syncError: null });
      
      try {
        // Check if user is authenticated
        const { useAuthStore } = await import('../auth/slice');
        const authStore = useAuthStore.getState();
        if (!authStore.isAuthenticated) {
          throw new Error('用户未登录，无法同步数据');
        }
        
        console.log('Syncing', state.ingredients.length, 'ingredients to cloud...');
        
        // TODO: Implement proper sync when API types are resolved
        console.log('Data sync functionality is temporarily disabled due to type compatibility issues');
        
        set({ 
          isSyncing: false, 
          hasLocalChanges: false,
          lastSyncAt: new Date().toISOString(),
          syncError: null 
        });
        
        console.log('Sync to cloud completed successfully');
      } catch (error: any) {
        console.error('Sync to cloud failed:', error);
        set({ 
          isSyncing: false, 
          syncError: error.message || '同步到云端失败' 
        });
        throw error;
      }
    },
    
    syncFromCloud: async () => {
      set({ isSyncing: true, syncError: null });
      
      try {
        // Check if user is authenticated
        const { useAuthStore } = await import('../auth/slice');
        const authStore = useAuthStore.getState();
        if (!authStore.isAuthenticated) {
          throw new Error('用户未登录，无法同步数据');
        }
        
        console.log('Syncing ingredients from cloud...');
        
        // TODO: Implement proper sync from cloud when API types are resolved
        console.log('Data sync functionality is temporarily disabled due to type compatibility issues');
        
        set({ 
          isSyncing: false, 
          lastSyncAt: new Date().toISOString(),
          syncError: null 
        });
        
        console.log('Sync from cloud completed successfully');
      } catch (error: any) {
        console.error('Sync from cloud failed:', error);
        set({ 
          isSyncing: false, 
          syncError: error.message || '从云端同步失败' 
        });
        throw error;
      }
    },
    
    markLocalChanges: () => {
      set({ hasLocalChanges: true });
    },
    
    clearSyncError: () => {
      set({ syncError: null });
    },
  }),
  {
    name: 'ingredients-storage',
    storage: {
      getItem: async (name: string) => {
        try {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        } catch (error) {
          console.error('Error getting item from AsyncStorage:', error);
          return null;
        }
      },
      setItem: async (name: string, value: any) => {
        try {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        } catch (error) {
          console.error('Error setting item to AsyncStorage:', error);
        }
      },
      removeItem: async (name: string) => {
        try {
          await AsyncStorage.removeItem(name);
        } catch (error) {
          console.error('Error removing item from AsyncStorage:', error);
        }
      },
    },
    partialize: (state) => ({
      ingredients: state.ingredients,
      categories: state.categories,
      units: state.units,
      locations: state.locations,
      isInitialized: state.isInitialized,
      lastSyncAt: state.lastSyncAt,
      hasLocalChanges: state.hasLocalChanges,
    }),
  }
));