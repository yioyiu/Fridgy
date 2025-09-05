import { Category } from '@/utils/types/ingredient';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Dairy',
    icon: 'milk',
    color: '#87CEEB',
    default_shelf_life_days: 10,
    near_expiry_threshold_days: 2,
    sort_order: 1,
  },
  {
    id: '2',
    name: 'Meat',
    icon: 'food-steak',
    color: '#FF6B6B',
    default_shelf_life_days: 5,
    near_expiry_threshold_days: 1,
    sort_order: 2,
  },
  {
    id: '3',
    name: 'Fish',
    icon: 'fish',
    color: '#4ECDC4',
    default_shelf_life_days: 3,
    near_expiry_threshold_days: 1,
    sort_order: 3,
  },
  {
    id: '4',
    name: 'Vegetables',
    icon: 'food-apple',
    color: '#51CF66',
    default_shelf_life_days: 7,
    near_expiry_threshold_days: 2,
    sort_order: 4,
  },
  {
    id: '5',
    name: 'Fruits',
    icon: 'food-apple',
    color: '#FFD93D',
    default_shelf_life_days: 5,
    near_expiry_threshold_days: 2,
    sort_order: 5,
  },
  {
    id: '6',
    name: 'Bread',
    icon: 'bread-slice',
    color: '#D4A574',
    default_shelf_life_days: 7,
    near_expiry_threshold_days: 1,
    sort_order: 6,
  },
  {
    id: '7',
    name: 'Eggs',
    icon: 'egg',
    color: '#F8F9FA',
    default_shelf_life_days: 28,
    near_expiry_threshold_days: 5,
    sort_order: 7,
  },
  {
    id: '8',
    name: 'Pantry',
    icon: 'food-variant',
    color: '#6C757D',
    default_shelf_life_days: 365,
    near_expiry_threshold_days: 30,
    sort_order: 8,
  },
];

export const getCategoryByName = (name: string): Category | undefined => {
  return DEFAULT_CATEGORIES.find(category => category.name === name);
};

export const getCategoryById = (id: string): Category | undefined => {
  return DEFAULT_CATEGORIES.find(category => category.id === id);
};

export const getDefaultShelfLife = (categoryName: string): number => {
  const category = getCategoryByName(categoryName);
  return category?.default_shelf_life_days || 7;
};

export const getNearExpiryThreshold = (categoryName: string): number => {
  const category = getCategoryByName(categoryName);
  return category?.near_expiry_threshold_days || 3;
};
