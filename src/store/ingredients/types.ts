import { Ingredient, IngredientFormData, IngredientFilters, IngredientStats } from '@/utils/types/ingredient';

export interface IngredientsState {
  // Data
  ingredients: Ingredient[];
  categories: any[];
  units: any[];
  locations: any[];
  stats: IngredientStats | null;

  // Time filtering
  timeFilteredStats: IngredientStats | null;
  selectedTimeframe: 'week' | 'month' | 'quarter' | 'year';

  // Loading states
  isLoading: boolean;
  isAdding: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Filters and search
  filters: IngredientFilters;
  searchQuery: string;

  // Error handling
  error: string | null;

  // Pagination
  hasMore: boolean;
  page: number;
  limit: number;

  // Initialization flag
  isInitialized: boolean;

  hasLocalChanges: boolean;
}

export interface IngredientsActions {
  // Data fetching
  fetchIngredients: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchUnits: () => Promise<void>;
  fetchLocations: () => Promise<void>;
  fetchStats: () => Promise<void>;

  // Time filtering
  setTimeframe: (timeframe: 'week' | 'month' | 'quarter' | 'year') => void;
  fetchTimeFilteredStats: (timeframe?: 'week' | 'month' | 'quarter' | 'year') => Promise<void>;

  // CRUD operations
  addIngredient: (data: IngredientFormData) => Promise<Ingredient | null>;
  updateIngredient: (id: string, data: Partial<IngredientFormData>) => Promise<Ingredient | null>;
  deleteIngredient: (id: string) => Promise<boolean>;
  markAsUsed: (id: string, quantity?: number) => Promise<boolean>;

  // Local state management
  setIngredients: (ingredients: Ingredient[]) => void;
  addIngredientLocal: (ingredient: Ingredient) => void;
  updateIngredientLocal: (id: string, updates: Partial<Ingredient>) => void;
  removeIngredientLocal: (id: string) => void;
  clearAllIngredients: () => void;

  // Filters and search
  setFilters: (filters: Partial<IngredientFilters>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;

  // Loading states
  setLoading: (loading: boolean) => void;
  setAdding: (adding: boolean) => void;
  setUpdating: (updating: boolean) => void;
  setDeleting: (deleting: boolean) => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;

  // Pagination
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  resetPagination: () => void;

  // Reset
  reset: () => void;

  // Force reload sample data (for testing purposes)
  reloadSampleData: () => void;

}

export type IngredientsStore = IngredientsState & IngredientsActions;
