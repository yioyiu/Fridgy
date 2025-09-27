import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ingredient } from '@/utils/types/ingredient';
import { COLORS } from '@/utils/constants';
import { formatRelativeDate, calculateDaysToExpiry } from '@/utils/helpers';

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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const daysToExpiry = calculateDaysToExpiry(ingredient.expiration_date);

  // 动画值
  const editButtonAnimation = useRef(new Animated.Value(0)).current;
  const deleteButtonAnimation = useRef(new Animated.Value(0)).current;
  const editButtonScale = useRef(new Animated.Value(0)).current;
  const deleteButtonScale = useRef(new Animated.Value(0)).current;

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


  const getExpiryText = () => {
    if (ingredient.status === 'used') {
      return 'Used';
    }
    return formatRelativeDate(ingredient.expiration_date);
  };

  const handleEdit = () => {
    onEdit?.();
  };

  const handleDelete = () => {
    onDelete?.();
  };

  // 动画效果
  useEffect(() => {
    if (showMoreMenu) {
      // 确保动画值从0开始
      editButtonAnimation.setValue(0);
      deleteButtonAnimation.setValue(0);
      editButtonScale.setValue(0);
      deleteButtonScale.setValue(0);

      // 显示动画：编辑和删除按钮从左侧滑入
      Animated.parallel([
        Animated.timing(editButtonAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(deleteButtonAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(editButtonScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(deleteButtonScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 隐藏动画：滑出效果
      Animated.parallel([
        Animated.timing(editButtonAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(deleteButtonAnimation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(editButtonScale, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(deleteButtonScale, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 动画完成后重置值
        editButtonAnimation.setValue(0);
        deleteButtonAnimation.setValue(0);
        editButtonScale.setValue(0);
        deleteButtonScale.setValue(0);
      });
    }
  }, [showMoreMenu]);

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
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {ingredient.name}
              </Text>
              <Text style={styles.location} numberOfLines={1}>
                {ingredient.location}
              </Text>
            </View>
          </View>

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
          {/* Left side buttons - Edit/Delete when menu is open */}
          {showMoreMenu && (
            <View style={styles.leftButtons}>
              {/* Edit button */}
              <Animated.View
                style={{
                  opacity: editButtonAnimation,
                  transform: [
                    {
                      translateX: editButtonAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0], // 进一步缩短滑入距离
                      }),
                    },
                    {
                      scale: editButtonScale,
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
                  onPress={handleEdit}
                >
                  <MaterialCommunityIcons name="pencil" size={16} color={COLORS.textLight} />
                </TouchableOpacity>
              </Animated.View>

              {/* Delete button */}
              <Animated.View
                style={{
                  opacity: deleteButtonAnimation,
                  transform: [
                    {
                      translateX: deleteButtonAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-30, 0], // 进一步缩短滑入距离
                      }),
                    },
                    {
                      scale: deleteButtonScale,
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: COLORS.error }]}
                  onPress={handleDelete}
                >
                  <MaterialCommunityIcons name="delete" size={16} color={COLORS.textLight} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}

          {/* Right side buttons - Always visible */}
          <View style={styles.rightButtons}>
            {/* Mark as Used button */}
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

            {/* More button */}
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#E0E0E0' }]}
              onPress={() => setShowMoreMenu(!showMoreMenu)}
            >
              <MaterialCommunityIcons name="dots-horizontal" size={16} color={COLORS.text} />
            </TouchableOpacity>
          </View>
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
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 4,
    padding: 16,
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0,
  },
  statusIndicator: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    marginBottom: 25,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
    flex: 1,
    marginRight: 8,
  },
  location: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
    fontWeight: '500',
  },
  metaInfo: {
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  leftButtons: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'column',
    gap: 8,
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadowMedium,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  statusHint: {
    position: 'absolute',
    bottom: -6,
    left: 12,
    backgroundColor: COLORS.warning,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusHintText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});
