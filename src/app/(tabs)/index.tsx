import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import { FAB, Searchbar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IngredientCard } from '@/components/ingredients/IngredientCard';
import { QuickAddModal } from '@/components/ingredients/QuickAddModal';
import { EditIngredientModal } from '@/components/ingredients/EditIngredientModal';
import { useIngredientsStore } from '@/store/ingredients/slice';
import { COLORS } from '@/utils/constants';
import { Ingredient } from '@/utils/types/ingredient';
import { useI18n } from '@/utils/i18n';

export default function DashboardScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const {
    ingredients,
    isLoading,
    error,
    fetchIngredients,
    deleteIngredient,
    markAsUsed,
    setSearchQuery,
    searchQuery,
  } = useIngredientsStore();

  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter ingredients based on search query
  const filteredIngredients = useMemo(() => {
    if (!searchQuery.trim()) {
      return ingredients;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return ingredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(query) ||
      ingredient.category.toLowerCase().includes(query) ||
      ingredient.location.toLowerCase().includes(query) ||
      (ingredient.notes && ingredient.notes.toLowerCase().includes(query))
    );
  }, [ingredients, searchQuery]);

  useEffect(() => {
    // Only fetch ingredients if not already initialized
    fetchIngredients();
  }, [fetchIngredients]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchIngredients();
    setRefreshing(false);
  };

  const handleQuickAdd = () => {
    setQuickAddVisible(true);
  };

  const handleQuickAddSuccess = () => {
    setQuickAddVisible(false);
    // No need to refresh since the store is already updated
    // fetchIngredients();
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setEditingIngredient(null);
    // No need to refresh since the store is already updated
  };

  const handleEditClose = () => {
    setEditModalVisible(false);
    setEditingIngredient(null);
  };

  const handleIngredientPress = (ingredient: Ingredient) => {
    // TODO: Navigate to ingredient detail screen
    console.log('Navigate to ingredient detail:', ingredient.id);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setEditingIngredient(ingredient);
    setEditModalVisible(true);
  };

  const handleMarkUsed = async (ingredient: Ingredient) => {
    try {
      await markAsUsed(ingredient.id);
    } catch (error) {
      Alert.alert(t('common.error'), t('dashboard.used'));
    }
  };

  const handleDeleteIngredient = (ingredient: Ingredient) => {
    Alert.alert(
      t('common.delete'),
      `${ingredient.name}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteIngredient(ingredient.id);
            } catch (error) {
              Alert.alert(t('common.error'), t('common.error'));
            }
          },
        },
      ]
    );
  };

  const renderIngredientCard = ({ item }: { item: Ingredient }) => (
    <IngredientCard
      ingredient={item}
      onPress={() => handleIngredientPress(item)}
      onEdit={() => handleEditIngredient(item)}
      onMarkUsed={() => handleMarkUsed(item)}
      onDelete={() => handleDeleteIngredient(item)}
    />
  );

  const renderEmptyState = () => {
    if (searchQuery.trim()) {
      // Show search-specific empty state
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>未找到搜索结果</Text>
          <Text style={styles.emptyStateSubtitle}>
            没有找到包含 "{searchQuery}" 的食材
          </Text>
        </View>
      );
    }
    
    // Show default empty state
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateTitle}>{t('dashboard.noIngredients')}</Text>
        <Text style={styles.emptyStateSubtitle}>{t('dashboard.subtitle')}</Text>
      </View>
    );
  };

  const renderHeader = useCallback(() => {
    // Use original ingredients for status counts to avoid circular dependency
    const freshCount = ingredients.filter(i => i.status === 'fresh').length;
    const nearExpiryCount = ingredients.filter(i => i.status === 'near_expiry').length;
    const expiredCount = ingredients.filter(i => i.status === 'expired').length;
    const usedCount = ingredients.filter(i => i.status === 'used').length;
    
    return (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>{t('dashboard.title')}</Text>
          <Text style={styles.subtitle}>
            {new Date().toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            })} • {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </Text>
        </View>
        
        {/* Status summary */}
        <View style={styles.statusSummary}>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.fresh }]} />
            <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
              {freshCount} {t('dashboard.fresh')}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.nearExpiry }]} />
            <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
              {nearExpiryCount} {t('dashboard.nearExpiry')}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.expired }]} />
            <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
              {expiredCount} {t('dashboard.expired')}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <View style={[styles.statusDot, { backgroundColor: COLORS.used }]} />
            <Text style={styles.statusText} numberOfLines={1} ellipsizeMode="tail">
              {usedCount} {t('dashboard.used')}
            </Text>
          </View>
        </View>
      </View>
    );
  }, [t, ingredients.length]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle1, COLORS.gradientMiddle2, COLORS.gradientMiddle3, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={{ height: insets.top }} />
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={20} 
            color={COLORS.textSecondary} 
            style={styles.searchIcon}
          />
          <TextInput
            placeholder=""
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={filteredIngredients}
        renderItem={renderIngredientCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 140 }]}
        showsVerticalScrollIndicator={false}
      />

      <FAB
        icon="plus"
        color="#FFFFFF"
        customSize={64}
        style={styles.fab}
        onPress={handleQuickAdd}
      />

      <QuickAddModal
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onSuccess={handleQuickAddSuccess}
      />

      <EditIngredientModal
        visible={editModalVisible}
        ingredient={editingIngredient}
        onClose={handleEditClose}
        onSuccess={handleEditSuccess}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 0,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    backgroundColor: 'transparent',
  },
  headerTop: {
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
    opacity: 0.8,
  },
  searchBar: {
    marginBottom: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 0,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    paddingVertical: 0,
    margin: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: 45,
    lineHeight: 45,
  },
  statusSummary: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 140,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
    opacity: 0.8,
  },
  fab: {
    position: 'absolute',
    margin: 24,
    left: 0,
    bottom: 120,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    width: 64,
    height: 64,
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
