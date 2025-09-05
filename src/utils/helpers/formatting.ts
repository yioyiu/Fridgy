import { Ingredient } from '@/utils/types/ingredient';
import { calculateDaysToExpiry, formatRelativeDate } from './date';

export const formatQuantity = (quantity: number, unit: string): string => {
  // Format quantity based on unit type
  if (unit.toLowerCase() === 'piece' || unit.toLowerCase() === 'pc') {
    return `${Math.round(quantity)} ${quantity === 1 ? 'piece' : 'pieces'}`;
  }
  
  if (unit.toLowerCase() === 'pack') {
    return `${Math.round(quantity)} ${quantity === 1 ? 'pack' : 'packs'}`;
  }
  
  if (unit.toLowerCase() === 'bottle') {
    return `${Math.round(quantity)} ${quantity === 1 ? 'bottle' : 'bottles'}`;
  }
  
  // For weight and volume units, show decimal places if needed
  if (quantity % 1 === 0) {
    return `${quantity} ${unit}`;
  } else {
    return `${quantity.toFixed(2)} ${unit}`;
  }
};

export const formatExpiryStatus = (ingredient: Ingredient): string => {
  const daysToExpiry = calculateDaysToExpiry(ingredient.expiration_date);
  
  if (daysToExpiry < 0) {
    return `Expired ${Math.abs(daysToExpiry)} days ago`;
  } else if (daysToExpiry === 0) {
    return 'Expires today';
  } else if (daysToExpiry === 1) {
    return 'Expires tomorrow';
  } else if (daysToExpiry <= 7) {
    return `Expires in ${daysToExpiry} days`;
  } else {
    return formatRelativeDate(ingredient.expiration_date);
  }
};

export const formatFreshnessScore = (score: number): string => {
  if (score >= 0.8) {
    return 'Excellent';
  } else if (score >= 0.6) {
    return 'Good';
  } else if (score >= 0.4) {
    return 'Fair';
  } else if (score >= 0.2) {
    return 'Poor';
  } else {
    return 'Very Poor';
  }
};

export const formatCategoryName = (category: string): string => {
  return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
};

export const formatLocationName = (location: string): string => {
  return location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(1)}%`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'fresh':
      return '#4CAF50';
    case 'near_expiry':
      return '#FF9800';
    case 'expired':
      return '#F44336';
    case 'used':
      return '#9E9E9E';
    default:
      return '#757575';
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'fresh':
      return 'Fresh';
    case 'near_expiry':
      return 'Expires Soon';
    case 'expired':
      return 'Expired';
    case 'used':
      return 'Used';
    default:
      return 'Unknown';
  }
};
