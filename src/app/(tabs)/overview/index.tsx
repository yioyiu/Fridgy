import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIngredientsStore } from '@/store/ingredients/slice';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { AIAnalysisModal } from '@/components/ai/AIAnalysisModal';

export default function OverviewScreen() {
  const { ingredients, fetchIngredients, isLoading } = useIngredientsStore();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>('');

  useEffect(() => {
    // Only fetch ingredients if not already initialized
    fetchIngredients();
  }, [fetchIngredients]);

  const handleRefresh = async () => {
    await fetchIngredients();
  };

  const handleItemPress = (itemName: string) => {
    setSelectedItem(itemName);
    setAiModalVisible(true);
  };

  const handleCloseAiModal = () => {
    setAiModalVisible(false);
    setSelectedItem('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fresh':
        return COLORS.fresh;
      case 'near_expiry':
        return COLORS.nearExpiry;
      case 'expired':
        return COLORS.expired;
      case 'used':
        return COLORS.used;
      default:
        return COLORS.textSecondary;
    }
  };

  // Group ingredients by storage location
  const groupedByLocation = ingredients.reduce((acc, ingredient) => {
    const location = ingredient.location || 'Unknown Location';
    if (!acc[location]) {
      acc[location] = [];
    }
    acc[location].push(ingredient);
    return acc;
  }, {} as Record<string, typeof ingredients>);

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle1, COLORS.gradientMiddle2, COLORS.gradientMiddle3, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={{ height: insets.top }} />

      <ScrollView 
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('overview.title')}</Text>
          <Text style={styles.subtitle}>
            {t('overview.subtitle')}
          </Text>
        </View>
        {Object.entries(groupedByLocation).map(([location, locationIngredients]) => (
          <View key={location} style={styles.storageLocationBox}>
            <View style={styles.locationHeader}>
              <Text style={styles.storageLocationTitle}>{location}</Text>
              <Text style={styles.itemCount}>
                {locationIngredients.length} {locationIngredients.length !== 1 ? 'items' : 'item'}
              </Text>
            </View>
            
            <View style={styles.itemsList}>
              {locationIngredients.map((ingredient) => (
                <TouchableOpacity 
                  key={ingredient.id} 
                  style={styles.itemRow}
                  onPress={() => handleItemPress(ingredient.name)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{ingredient.name}</Text>
                    <Text style={styles.itemDetails}>
                      {ingredient.quantity} {ingredient.unit} • {ingredient.category}
                    </Text>
                  </View>
                  <View style={styles.itemStatus}>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(ingredient.status) }]} />
                    <Text style={styles.statusText}>
                      {ingredient.status === 'fresh' && t('dashboard.fresh')}
                      {ingredient.status === 'near_expiry' && t('dashboard.nearExpiry')}
                      {ingredient.status === 'expired' && t('dashboard.expired')}
                      {ingredient.status === 'used' && t('dashboard.used')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {ingredients.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>{t('dashboard.noIngredients')}</Text>
            <Text style={styles.emptyStateSubtitle}>
              {t('overview.subtitle')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        visible={aiModalVisible}
        itemName={selectedItem}
        onClose={handleCloseAiModal}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  storageLocationBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageLocationTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  itemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
