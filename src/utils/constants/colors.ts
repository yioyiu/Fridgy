export const COLORS = {
  // Primary colors - Inspired by the fresh green design
  primary: '#10B981', // Fresh green
  primaryDark: '#047857',
  primaryLight: '#D1FAE5',
  
  // Secondary colors - Bright and vibrant
  secondary: '#F59E0B', // Warm yellow
  secondaryDark: '#D97706',
  secondaryLight: '#FEF3C7',
  
  // Accent colors - Purple and other vibrant colors
  accent: '#8B5CF6', // Purple
  accentDark: '#7C3AED',
  accentLight: '#EDE9FE',
  
  // Fresh green background like in the image
  backgroundGreen: '#B8E651', // Main bright green background
  backgroundGreenLight: '#D4F367',
  backgroundGreenDark: '#9FD842',
  
  // Status colors - Clean and modern
  success: '#10B981', // Emerald green
  warning: '#F59E0B', // Amber
  warningLight: '#FEF3C7', // Light amber background
  warningDark: '#D97706', // Dark amber text
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue
  
  // Background colors - Clean whites and subtle grays
  background: '#F8FAFC', // Very light gray background
  surface: '#FFFFFF', // Pure white for cards
  surfaceVariant: '#F1F5F9',
  card: '#FFFFFF',
  
  // Text colors - High contrast for readability
  text: '#1E293B', // Dark slate for primary text
  textSecondary: '#64748B', // Medium slate for secondary text
  textDisabled: '#CBD5E1',
  textLight: '#FFFFFF', // White text for dark backgrounds
  
  // Border colors - Subtle and clean
  border: '#E2E8F0', // Light gray borders
  borderLight: '#F1F5F9',
  divider: '#E2E8F0',
  
  // Status-specific colors for ingredients
  fresh: '#10B981', // Emerald green
  nearExpiry: '#F59E0B', // Amber
  expired: '#EF4444', // Red
  used: '#6B7280', // Gray
  
  // Vibrant category colors - Inspired by the colorful design
  dairy: '#60A5FA', // Blue
  meat: '#F87171', // Red
  fish: '#34D399', // Emerald
  vegetables: '#10B981', // Green
  fruits: '#FBBF24', // Yellow
  bread: '#D97706', // Orange
  eggs: '#A78BFA', // Purple
  pantry: '#6B7280', // Gray
  
  // Location colors - Consistent with fresh theme
  fridge: '#60A5FA', // Blue
  freezer: '#34D399', // Teal
  storage: '#D97706', // Orange
  counter: '#FBBF24', // Yellow
  
  // Modern UI colors with depth
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowStrong: 'rgba(0, 0, 0, 0.16)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  highlight: '#F8FAFC',
  
  // Fresh gradient colors - Multi-step like the image background
  gradientStart: '#B8E651', // Bright green
  gradientMiddle1: '#A7E642', // Slightly darker
  gradientMiddle2: '#96E533', // Medium green
  gradientMiddle3: '#85E424', // Deeper green
  gradientEnd: '#74E315', // Richest green
} as const;

export type ColorKey = keyof typeof COLORS;
