import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { Ingredient } from '@/utils/types/ingredient';

interface StatusItemsModalProps {
  visible: boolean;
  onClose: () => void;
  status: 'fresh' | 'near_expiry' | 'expired' | 'used';
  items: Ingredient[];
  timeframe?: 'week' | 'month' | 'quarter' | 'year';
}

export const StatusItemsModal: React.FC<StatusItemsModalProps> = ({
  visible,
  onClose,
  status,
  items,
  timeframe = 'week',
}) => {
  const { t } = useI18n();

  const getStatusConfig = () => {
    switch (status) {
      case 'fresh':
        return {
          title: t('dashboard.fresh'),
          icon: 'check-circle',
          color: COLORS.fresh,
          emptyMessage: t('statistics.noFreshItems'),
        };
      case 'near_expiry':
        return {
          title: t('dashboard.nearExpiry'),
          icon: 'alert-circle',
          color: COLORS.nearExpiry,
          emptyMessage: t('statistics.noNearExpiryItems'),
        };
      case 'expired':
        return {
          title: t('dashboard.expired'),
          icon: 'close-circle',
          color: COLORS.expired,
          emptyMessage: t('statistics.noExpiredItems'),
        };
      case 'used':
        return {
          title: t('dashboard.used'),
          icon: 'check',
          color: COLORS.used,
          emptyMessage: t('statistics.noUsedItems'),
        };
      default:
        return {
          title: '',
          icon: 'help-circle',
          color: COLORS.textSecondary,
          emptyMessage: '',
        };
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case 'week':
        return t('statistics.timeframeWeek');
      case 'month':
        return t('statistics.timeframeMonth');
      case 'quarter':
        return t('statistics.timeframeQuarter');
      case 'year':
        return t('statistics.timeframeYear');
      default:
        return t('statistics.timeframeWeek');
    }
  };

  const config = getStatusConfig();

  const renderItem = ({ item }: { item: Ingredient }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={[styles.statusIndicator, { backgroundColor: config.color }]} />
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.itemBadges}>
          {item.category && (
            <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
              <Text style={[styles.badgeText, { color: config.color }]}>
                {item.category}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <View style={styles.itemDetails}>
        {item.location && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="map-marker" 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        )}
        
        {item.quantity && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="scale" 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.detailText}>
              {item.quantity} {item.unit || ''}
            </Text>
          </View>
        )}
        
        {item.expiryDate && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons 
              name="calendar" 
              size={16} 
              color={COLORS.textSecondary} 
            />
            <Text style={styles.detailText}>
              {new Date(item.expiryDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <MaterialCommunityIcons 
              name={config.icon as any} 
              size={24} 
              color={config.color} 
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.timeframeLabel}>{getTimeframeLabel()}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          {items.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons 
                name={config.icon as any} 
                size={64} 
                color={COLORS.textSecondary} 
              />
              <Text style={styles.emptyTitle}>{config.emptyMessage}</Text>
              <Text style={styles.emptySubtitle}>
                {t('statistics.checkBackLater')}
              </Text>
            </View>
          ) : (
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsCount}>
                {items.length} {t('statistics.items')}
              </Text>
            </View>
          )}
          
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              items.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons 
                    name={config.icon as any} 
                    size={64} 
                    color={COLORS.textSecondary} 
                  />
                  <Text style={styles.emptyTitle}>{config.emptyMessage}</Text>
                  <Text style={styles.emptySubtitle}>
                    {t('statistics.checkBackLater')}
                  </Text>
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  timeframeLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  itemsHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemsCount: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  listContent: {
    paddingVertical: 16,
  },
  itemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  itemBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
