import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IngredientsStore } from './types';
import { Ingredient, IngredientFormData, IngredientFilters } from '@/utils/types/ingredient';
import { DEFAULT_CATEGORIES, DEFAULT_UNITS, DEFAULT_LOCATIONS } from '@/utils/constants';
import { SAMPLE_INGREDIENTS } from '@/utils/helpers/sampleData';
import { IngredientsAPI } from '@/services/api/ingredients';
import { statusMonitor } from '@/services/notifications/statusMonitor';

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

// Helper function to calculate time range for filtering - 按照日历周期计算
const getTimeRange = (timeframe: 'week' | 'month' | 'quarter' | 'year') => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (timeframe) {
    case 'week':
      // 本周：从本周一开始到今天（如果本周还没过完）
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay() + 1); // 本周一
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      // 本月：从本月1号到今天
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'quarter':
      // 本季度：从本季度第一个月开始到今天
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), quarterStartMonth, 1);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      // 本年：从今年1月1号到今天
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(now);
      end = new Date(now);
  }

  return {
    start: start.toISOString().split('T')[0]!,
    end: end.toISOString().split('T')[0]!
  };
};

// Helper function to filter ingredients by time range
const filterIngredientsByTimeRange = (ingredients: Ingredient[], timeRange: { start: string; end: string }) => {
  return ingredients.filter(ingredient => {
    // 对于统计页面，应该显示在当前时间段内存在的食材
    // 即食材的创建时间在当前时间段内，且没有被删除
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

          // 启动状态监控
          statusMonitor.startMonitoring(updatedSampleIngredients);

          // 立即检查一次状态变化
          await statusMonitor.checkStatusChangesNow(updatedSampleIngredients);
        } else {
          // 已初始化：执行一次性迁移，将旧英文地点映射为中文
          const nameMap: Record<string, string> = {
            'Fridge': '冰箱',
            'Freezer': '冷冻室',
            'Pantry': '储物柜',
            'Counter': '台面',
          };
          const current = get().ingredients;
          const hasEnglish = current.some(i => nameMap[i.location]);
          if (hasEnglish) {
            const migrated = current.map(i => ({
              ...i,
              location: nameMap[i.location] || i.location,
            }));
            set({ ingredients: migrated });
          }
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
        const currentIngredients = get().ingredients;

        // 优化：只在必要时重新计算状态，避免每次都重新计算所有食材
        const now = new Date();
        const needsUpdate = currentIngredients.some(ingredient => {
          if (ingredient.status === 'used') return false; // 已使用的食材不需要更新
          const expDate = new Date(ingredient.expiration_date);
          const diffTime = expDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // 只有状态可能发生变化的食材才需要重新计算
          const currentStatus = ingredient.status;
          let newStatus: 'fresh' | 'near_expiry' | 'expired' = 'fresh';
          if (diffDays < 0) newStatus = 'expired';
          else if (diffDays <= 3) newStatus = 'near_expiry';

          return currentStatus !== newStatus;
        });

        let ingredientsToUse = currentIngredients;

        // 只有在需要时才重新计算状态
        if (needsUpdate) {
          ingredientsToUse = currentIngredients.map(ingredient => ({
            ...ingredient,
            status: ingredient.status === 'used' ? 'used' : calculateStatus(ingredient.expiration_date),
            freshness_score: ingredient.status === 'used' ? ingredient.freshness_score : calculateFreshnessScore(ingredient.expiration_date),
          }));

          // 只有在状态真正变化时才更新ingredients
          set({ ingredients: ingredientsToUse });
        }

        // 计算统计数据
        const stats = {
          total: ingredientsToUse.length,
          fresh: ingredientsToUse.filter(i => i.status === 'fresh').length,
          near_expiry: ingredientsToUse.filter(i => i.status === 'near_expiry').length,
          expired: ingredientsToUse.filter(i => i.status === 'expired').length,
          used: ingredientsToUse.filter(i => i.status === 'used').length,
          byCategory: {} as Record<string, number>,
          byLocation: {} as Record<string, number>,
        };

        // Calculate by category and location
        ingredientsToUse.forEach(ingredient => {
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


        // 更新状态监控
        const updatedIngredients = get().ingredients;
        statusMonitor.updateIngredients(updatedIngredients);

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


        // 更新状态监控
        const updatedIngredients = get().ingredients;
        statusMonitor.updateIngredients(updatedIngredients);

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


        // 更新状态监控
        const updatedIngredients = get().ingredients;
        statusMonitor.updateIngredients(updatedIngredients);

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


        // 更新状态监控
        const updatedIngredients = get().ingredients;
        statusMonitor.updateIngredients(updatedIngredients);

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

    clearAllIngredients: () => {
      set({ ingredients: [] });
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

    // 按周清理已使用的食材
    cleanupUsedIngredients: async () => {
      set({ isDeleting: true, error: null });
      try {
        // 获取一周前的时间范围
        const timeRange = getTimeRange('week');
        const currentIngredients = get().ingredients;

        // 找到一周前标记为已使用的食材
        const ingredientsToDelete = currentIngredients.filter(ingredient => {
          // 检查是否为已使用状态
          if (ingredient.status !== 'used') return false;

          // 检查更新时间是否在一周前
          const updatedDate = ingredient.updated_at.split('T')[0]!;
          return updatedDate < timeRange.start;
        });

        if (ingredientsToDelete.length === 0) {
          set({ isDeleting: false });
          return { deletedCount: 0, message: '没有需要清理的已使用食材' };
        }

        // 删除这些食材
        const deletedIds = ingredientsToDelete.map(ingredient => ingredient.id);
        set(state => ({
          ingredients: state.ingredients.filter(ingredient => !deletedIds.includes(ingredient.id)),
          isDeleting: false
        }));

        // 更新统计数据
        await get().fetchStats();

        // 更新状态监控
        const updatedIngredients = get().ingredients;
        statusMonitor.updateIngredients(updatedIngredients);

        return {
          deletedCount: ingredientsToDelete.length,
          message: `成功清理了 ${ingredientsToDelete.length} 个已使用的食材`
        };
      } catch (error) {
        set({
          error: error instanceof Error ? error.message : '清理已使用食材失败',
          isDeleting: false
        });
        return { deletedCount: 0, message: '清理失败' };
      }
    },

    // 获取可清理的已使用食材数量
    getCleanupableUsedIngredients: () => {
      const timeRange = getTimeRange('week');
      const currentIngredients = get().ingredients;

      return currentIngredients.filter(ingredient => {
        if (ingredient.status !== 'used') return false;
        const updatedDate = ingredient.updated_at.split('T')[0]!;
        return updatedDate < timeRange.start;
      });
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
      hasLocalChanges: state.hasLocalChanges,
    }),
  }
));