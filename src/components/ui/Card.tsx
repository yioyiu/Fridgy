import React from 'react';
import { Card as PaperCard, CardProps as PaperCardProps } from 'react-native-paper';
import { StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '@/utils/constants';

export interface CardProps extends PaperCardProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  style,
  contentStyle,
  ...props
}) => {
  const getMode = () => {
    switch (variant) {
      case 'elevated':
        return 'elevated';
      case 'outlined':
        return 'outlined';
      default:
        return 'contained';
    }
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return 8;
      case 'large':
        return 24;
      default:
        return 16;
    }
  };

  const getMargin = () => {
    switch (margin) {
      case 'none':
        return 0;
      case 'small':
        return 8;
      case 'large':
        return 24;
      default:
        return 16;
    }
  };

  return (
    <PaperCard
      // relax typing to avoid strict union prop narrowing issues from react-native-paper
      mode={getMode() as any}
      style={[
        styles.card,
        { margin: getMargin() },
        style
      ]}
      contentStyle={[
        styles.content,
        { padding: getPadding() },
        contentStyle as any
      ]}
      {...(props as any)}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderColor: COLORS.border,
  },
  content: {
    backgroundColor: 'transparent',
  },
});
