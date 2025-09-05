import { IngredientFormData } from '@/utils/types/ingredient';

export interface ValidationError {
  field: string;
  message: string;
}

export const validateIngredientForm = (data: IngredientFormData): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must be less than 100 characters' });
  }

  // Category validation
  if (!data.category || data.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  // Quantity validation
  if (data.quantity === undefined || data.quantity === null) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (data.quantity <= 0) {
    errors.push({ field: 'quantity', message: 'Quantity must be greater than 0' });
  } else if (data.quantity > 999999) {
    errors.push({ field: 'quantity', message: 'Quantity must be less than 1,000,000' });
  }

  // Unit validation
  if (!data.unit || data.unit.trim().length === 0) {
    errors.push({ field: 'unit', message: 'Unit is required' });
  }

  // Purchase date validation
  if (!data.purchase_date) {
    errors.push({ field: 'purchase_date', message: 'Purchase date is required' });
  } else {
    const purchaseDate = new Date(data.purchase_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (isNaN(purchaseDate.getTime())) {
      errors.push({ field: 'purchase_date', message: 'Invalid purchase date' });
    } else if (purchaseDate > today) {
      errors.push({ field: 'purchase_date', message: 'Purchase date cannot be in the future' });
    }
  }

  // Expiration date validation
  if (!data.expiration_date) {
    errors.push({ field: 'expiration_date', message: 'Expiration date is required' });
  } else {
    const expirationDate = new Date(data.expiration_date);
    const purchaseDate = data.purchase_date ? new Date(data.purchase_date) : new Date();
    
    if (isNaN(expirationDate.getTime())) {
      errors.push({ field: 'expiration_date', message: 'Invalid expiration date' });
    } else if (expirationDate <= purchaseDate) {
      errors.push({ field: 'expiration_date', message: 'Expiration date must be after purchase date' });
    }
  }

  // Location validation
  if (!data.location || data.location.trim().length === 0) {
    errors.push({ field: 'location', message: 'Location is required' });
  }

  // Notes validation (optional)
  if (data.notes && data.notes.length > 500) {
    errors.push({ field: 'notes', message: 'Notes must be less than 500 characters' });
  }

  return errors;
};

export const validateQuantity = (quantity: number): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (quantity === undefined || quantity === null) {
    errors.push({ field: 'quantity', message: 'Quantity is required' });
  } else if (quantity < 0) {
    errors.push({ field: 'quantity', message: 'Quantity cannot be negative' });
  } else if (quantity > 999999) {
    errors.push({ field: 'quantity', message: 'Quantity must be less than 1,000,000' });
  }

  return errors;
};

export const validateDate = (date: string, fieldName: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!date) {
    errors.push({ field: fieldName, message: `${fieldName} is required` });
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: fieldName, message: `Invalid ${fieldName}` });
    }
  }

  return errors;
};

export const validateEmail = (email: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  }

  return errors;
};

export const validatePassword = (password: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one lowercase letter' });
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one uppercase letter' });
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push({ field: 'password', message: 'Password must contain at least one number' });
  }

  return errors;
};

export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  const error = errors.find(err => err.field === field);
  return error ? error.message : null;
};

export const hasErrors = (errors: ValidationError[]): boolean => {
  return errors.length > 0;
};
