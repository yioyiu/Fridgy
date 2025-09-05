import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ingredient } from '@/utils/types/ingredient';
import { COLORS } from '@/utils/constants';
import { formatQuantity, formatRelativeDate, calculateDaysToExpiry } from '@/utils/helpers';

export interface IngredientCardProps {
  ingredient: Ingredient;
  onPress?: () => void;
  onEdit?: () => void;
  onMarkUsed?: () => void;
  onDelete?: () => void;
}

export const IngredientCard: React.FC<IngredientCardProps> = ({
  ingredient,
  onPress,
  onEdit,
  onMarkUsed,
  onDelete,
}) => {
  const daysToExpiry = calculateDaysToExpiry(ingredient.expiration_date);
  
  const getStatusColor = () => {
    switch (ingredient.status) {
      case 'expired':
        return COLORS.expired;
      case 'near_expiry':
        return COLORS.nearExpiry;
      case 'used':
        return COLORS.used;
      default:
        return COLORS.fresh;
    }
  };

  const getStatusIcon = () => {
    switch (ingredient.status) {
      case 'expired':
        return 'close-circle';
      case 'near_expiry':
        return 'alert-circle';
      case 'used':
        return 'check-circle';
      default:
        return 'check-circle';
    }
  };

  const getQuantityText = () => {
    return formatQuantity(ingredient.quantity, ingredient.unit);
  };

  const getExpiryText = () => {
    if (ingredient.status === 'used') {
      return 'Used';
    }
    return formatRelativeDate(ingredient.expiration_date);
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.container}>
        {/* Status indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <MaterialCommunityIcons 
            name={getStatusIcon() as any} 
            size={20} 
            color={COLORS.textLight} 
          />
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {ingredient.name}
            </Text>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>
                {ingredient.category}
              </Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {getQuantityText()} • {ingredient.location}
          </Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <MaterialCommunityIcons 
                name="calendar-clock" 
                size={16} 
                color={COLORS.textSecondary} 
              />
              <Text style={[styles.metaText, { color: getStatusColor() }]}>
                {getExpiryText()}
              </Text>
            </View>

            {ingredient.notes && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons 
                  name="note-text" 
                  size={16} 
                  color={COLORS.textSecondary} 
                />
                <Text style={styles.metaText} numberOfLines={1}>
                  {ingredient.notes}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            onPress={onEdit}
          >
            <MaterialCommunityIcons name="pencil" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton, 
              { 
                backgroundColor: ingredient.status === 'used' ? COLORS.warning : COLORS.success 
              }
            ]}
            onPress={onMarkUsed}
          >
            <MaterialCommunityIcons 
              name={ingredient.status === 'used' ? 'refresh' : 'check'} 
              size={16} 
              color={COLORS.textLight} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: COLORS.error }]}
            onPress={onDelete}
          >
            <MaterialCommunityIcons name="delete" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>
        
        {/* Status hint for used items */}
        {ingredient.status === 'used' && (
          <View style={styles.statusHint}>
            <Text style={styles.statusHintText}>
              Tap ✓ to restore
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 16,
    marginHorizontal: 4,
    padding: 20,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    borderWidth: 0,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginRight: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.2,
  },
  categoryTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  metaInfo: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  statusHint: {
    position: 'absolute',
    bottom: -8,
    left: 16,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusHintText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});
