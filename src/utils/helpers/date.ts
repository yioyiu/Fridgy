import { differenceInDays, addDays, format, isAfter, isBefore, startOfDay } from 'date-fns';
import { getDefaultShelfLife, getNearExpiryThreshold } from '@/utils/constants/categories';

export const calculateDaysToExpiry = (expirationDate: string): number => {
  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(expirationDate));
  return differenceInDays(expiry, today);
};

export const calculateStatus = (
  expirationDate: string,
  categoryName: string
): 'fresh' | 'near_expiry' | 'expired' | 'used' => {
  const daysToExpiry = calculateDaysToExpiry(expirationDate);
  
  if (daysToExpiry <= 0) {
    return 'expired';
  }
  
  const threshold = getNearExpiryThreshold(categoryName);
  if (daysToExpiry <= threshold) {
    return 'near_expiry';
  }
  
  return 'fresh';
};

export const calculateFreshnessScore = (
  purchaseDate: string,
  expirationDate: string,
  categoryName: string
): number => {
  const today = new Date();
  const purchase = new Date(purchaseDate);
  const expiry = new Date(expirationDate);
  
  // Calculate time-based score (0-1)
  const totalShelfLife = getDefaultShelfLife(categoryName);
  const daysSincePurchase = differenceInDays(today, purchase);
  const timeBasedScore = Math.max(0, Math.min(1, 1 - (daysSincePurchase / totalShelfLife)));
  
  // Calculate expiry-based score (0-1)
  const daysToExpiry = calculateDaysToExpiry(expirationDate);
  const threshold = getNearExpiryThreshold(categoryName);
  const expiryBasedScore = Math.max(0, Math.min(1, daysToExpiry / threshold));
  
  // Combine scores (60% time-based, 40% expiry-based)
  const combinedScore = (0.6 * timeBasedScore) + (0.4 * expiryBasedScore);
  
  return Math.round(combinedScore * 100) / 100; // Round to 2 decimal places
};

export const suggestExpirationDate = (
  purchaseDate: string,
  categoryName: string
): string => {
  const shelfLife = getDefaultShelfLife(categoryName);
  const suggestedDate = addDays(new Date(purchaseDate), shelfLife);
  return format(suggestedDate, 'yyyy-MM-dd');
};

export const formatDate = (date: string, formatString: string = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatString);
};

export const formatRelativeDate = (date: string): string => {
  const daysToExpiry = calculateDaysToExpiry(date);
  
  if (daysToExpiry < 0) {
    return `${Math.abs(daysToExpiry)} days ago`;
  } else if (daysToExpiry === 0) {
    return 'Today';
  } else if (daysToExpiry === 1) {
    return 'Tomorrow';
  } else if (daysToExpiry <= 7) {
    return `In ${daysToExpiry} days`;
  } else {
    return formatDate(date);
  }
};

export const isExpired = (expirationDate: string): boolean => {
  return calculateDaysToExpiry(expirationDate) <= 0;
};

export const isNearExpiry = (expirationDate: string, categoryName: string): boolean => {
  const daysToExpiry = calculateDaysToExpiry(expirationDate);
  const threshold = getNearExpiryThreshold(categoryName);
  return daysToExpiry > 0 && daysToExpiry <= threshold;
};

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
