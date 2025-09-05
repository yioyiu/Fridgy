export interface Ingredient {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_date: string;
  expiration_date: string;
  location: string;
  images: string[];
  notes?: string;
  status: 'fresh' | 'near_expiry' | 'expired' | 'used';
  freshness_score: number;
  created_at: string;
  updated_at: string;
}

export interface IngredientFormData {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchase_date: string;
  expiration_date: string;
  location: string;
  images: string[];
  notes: string;
}

export interface IngredientFilters {
  category?: string;
  status?: string;
  location?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface IngredientStats {
  total: number;
  fresh: number;
  near_expiry: number;
  expired: number;
  used: number;
  byCategory: Record<string, number>;
  byLocation: Record<string, number>;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  default_shelf_life_days: number;
  near_expiry_threshold_days: number;
  sort_order: number;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
  is_weight: boolean;
  is_volume: boolean;
  is_count: boolean;
}

export interface Location {
  id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface Reminder {
  id: string;
  type: 'daily_summary' | 'item_specific' | 'custom';
  title: string;
  message?: string;
  scheduled_for: string;
  is_recurring: boolean;
  is_sent: boolean;
  is_actioned: boolean;
}

export interface ConsumptionHistory {
  id: string;
  ingredient_id: string;
  quantity_consumed: number;
  consumption_date: string;
  consumption_type: 'used' | 'wasted' | 'donated';
  notes?: string;
}
