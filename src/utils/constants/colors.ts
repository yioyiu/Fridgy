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
  backgroundGreen: '#D4F367', // Main bright green background (调淡)
  backgroundGreenLight: '#E8F7A3', // 更淡的绿色
  backgroundGreenDark: '#C1E85A', // 稍深的绿色
  
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
  gradientStart: '#D4F367', // Bright green (调淡)
  gradientMiddle1: '#C8F05A', // Slightly darker (调淡)
  gradientMiddle2: '#BCED4D', // Medium green (调淡)
  gradientMiddle3: '#B0EA40', // Deeper green (调淡)
  gradientEnd: '#A4E733', // Richest green (调淡)
} as const;

export type ColorKey = keyof typeof COLORS;
