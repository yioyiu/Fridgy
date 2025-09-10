import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import { Card, Title, Paragraph, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { useIngredientsStore } from '@/store/ingredients/slice';
import { CookingAdviceModal } from '@/components/ai';
import { StatusItemsModal } from '@/components/StatusItemsModal';

const { width } = Dimensions.get('window');

export default function StatisticsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { 
    stats, 
    timeFilteredStats, 
    selectedTimeframe, 
    ingredients, 
    fetchStats, 
    fetchTimeFilteredStats,
    setTimeframe,
    isLoading 
  } = useIngredientsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [cookingModalVisible, setCookingModalVisible] = useState(false);
  const [nearExpiryIngredients, setNearExpiryIngredients] = useState<string[]>([]);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'fresh' | 'near_expiry' | 'expired' | 'used'>('fresh');

  useEffect(() => {
    fetchStats();
    fetchTimeFilteredStats(); // 初始化时也获取时间过滤的统计数据
  }, []);

  // 获取即将过期的食材名称
  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      const nearExpiryItems = ingredients
        .filter(item => item.status === 'near_expiry')
        .map(item => item.name);
      setNearExpiryIngredients(nearExpiryItems);
    }
  }, [ingredients]);

  const handleActionRequiredPress = () => {
    if (nearExpiryIngredients.length > 0) {
      setCookingModalVisible(true);
    }
  };

  const handleStatusCardPress = (status: 'fresh' | 'near_expiry' | 'expired' | 'used') => {
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

  const getStatusItems = (status: 'fresh' | 'near_expiry' | 'expired' | 'used') => {
    // 获取当前时间范围
    const getTimeRange = (timeframe: 'week' | 'month' | 'quarter' | 'year') => {
      const now = new Date();
      const start = new Date();
      
      switch (timeframe) {
        case 'week':
          start.setDate(now.getDate() - 7);
          break;
        case 'month':
          start.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          start.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          start.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      return {
        start: start.toISOString().split('T')[0]!,
        end: now.toISOString().split('T')[0]!
      };
    };

    // 过滤食材按时间范围
    const filterIngredientsByTimeRange = (ingredients: any[], timeRange: { start: string; end: string }) => {
      return ingredients.filter(ingredient => {
        // 使用created_at作为主要过滤字段（食材添加时间）
        const createdDate = ingredient.created_at.split('T')[0]!;
        return createdDate >= timeRange.start && createdDate <= timeRange.end;
      });
    };

    // 获取当前时间范围
    const timeRange = getTimeRange(selectedTimeframe);
    
    // 先按时间范围过滤，再按状态过滤
    const timeFilteredItems = filterIngredientsByTimeRange(ingredients, timeRange);
    
    return timeFilteredItems.filter(item => item.status === status);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    await fetchTimeFilteredStats();
    setRefreshing(false);
  };

  // 获取当前显示的统计数据（基于时间过滤）
  const getCurrentStats = () => {
    return timeFilteredStats || stats;
  };

  // Calculate additional stats
  const getCategoryDistribution = () => {
    const currentStats = getCurrentStats();
    if (!currentStats?.byCategory) return [];
    return Object.entries(currentStats.byCategory)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 categories
  };

  const getLocationDistribution = () => {
    const currentStats = getCurrentStats();
    if (!currentStats?.byLocation) return [];
    return Object.entries(currentStats.byLocation)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getWastePercentage = () => {
    const currentStats = getCurrentStats();
    if (!currentStats?.total || currentStats.total === 0) return 0;
    return ((currentStats.expired + currentStats.used) / currentStats.total) * 100;
  };

  const getFreshnessScore = () => {
    const currentStats = getCurrentStats();
    if (!currentStats?.total || currentStats.total === 0) return 0;
    const freshWeight = currentStats.fresh * 1;
    const nearExpiryWeight = currentStats.near_expiry * 0.5;
    const expiredWeight = currentStats.expired * 0;
    const usedWeight = (currentStats.used || 0) * 0.8;
    
    return ((freshWeight + nearExpiryWeight + expiredWeight + usedWeight) / currentStats.total) * 100;
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend, onPress }: {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    subtitle?: string;
    trend?: string;
    onPress?: () => void;
  }) => {
    const CardContent = (
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
            <MaterialCommunityIcons name={icon as any} size={24} color={color} />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statTitle}>{title}</Text>
            {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {trend && (
          <View style={styles.trendContainer}>
            <MaterialCommunityIcons 
              name="trending-up" 
              size={16} 
              color={COLORS.success} 
            />
            <Text style={styles.trendText}>{trend}</Text>
          </View>
        )}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={[styles.statCard, { borderLeftColor: color }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {CardContent}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.statCard, { borderLeftColor: color }]}>
        {CardContent}
      </View>
    );
  };

  const ProgressCard = ({ title, current, total, color, showPercentage = true }: {
    title: string;
    current: number;
    total: number;
    color: string;
    showPercentage?: boolean;
  }) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return (
      <Card style={styles.progressCard}>
        <Card.Content style={styles.progressContent}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{title}</Text>
            {showPercentage && (
              <Text style={styles.progressPercentage}>{percentage.toFixed(1)}%</Text>
            )}
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${percentage}%`,
                  backgroundColor: color 
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {current} {t('statistics.of')} {total} {t('statistics.items')}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  const DistributionCard = ({ title, data, type }: {
    title: string;
    data: Array<{ category?: string; location?: string; count: number }>;
    type: 'category' | 'location';
  }) => {
    const currentStats = getCurrentStats();
    
    return (
      <Card style={styles.distributionCard}>
        <Card.Content>
          <Text style={styles.distributionTitle}>{title}</Text>
          {data.map((item, index) => {
            const name = type === 'category' ? item.category : item.location;
            const percentage = currentStats?.total ? (item.count / currentStats.total) * 100 : 0;
            
            return (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionItemHeader}>
                  <Text style={styles.distributionItemName}>{name}</Text>
                  <Text style={styles.distributionItemCount}>{item.count}</Text>
                </View>
                <View style={styles.distributionBar}>
                  <View 
                    style={[
                      styles.distributionFill, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: COLORS.primary 
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.distributionPercentage}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </Card.Content>
      </Card>
    );
  };

  const InsightCard = ({ icon, title, message, color, action, onPress }: {
    icon: string;
    title: string;
    message: string;
    color: string;
    action?: string;
    onPress?: () => void;
  }) => {
    const CardContent = (
      <View style={styles.insightContent}>
        <View style={styles.insightHeader}>
          <MaterialCommunityIcons name={icon as any} size={24} color={color} />
          <Text style={styles.insightTitle}>{title}</Text>
        </View>
        <Text style={styles.insightMessage}>{message}</Text>
        {action && (
          <Text style={[styles.insightAction, { color }]}>{action}</Text>
        )}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          style={[styles.insightCard, { borderLeftColor: color }]}
          onPress={onPress}
          activeOpacity={0.8}
        >
          {CardContent}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[styles.insightCard, { borderLeftColor: color }]}>
        {CardContent}
      </View>
    );
  };

  const TimeframeSelector = () => (
    <View style={styles.timeframeContainer}>
      <Text style={styles.timeframeLabel}>{t('statistics.timeframeLabel')}</Text>
      <View style={styles.timeframeChips}>
        {[
          { key: 'week', label: t('statistics.periodWeek') },
          { key: 'month', label: t('statistics.periodMonth') },
          { key: 'quarter', label: t('statistics.periodQuarter') },
          { key: 'year', label: t('statistics.periodYear') }
        ].map((timeframe) => (
          <Chip
            key={timeframe.key}
            selected={selectedTimeframe === timeframe.key}
            onPress={() => setTimeframe(timeframe.key as 'week' | 'month' | 'quarter' | 'year')}
            style={[
              styles.timeframeChip,
              selectedTimeframe === timeframe.key && styles.timeframeChipSelected
            ]}
            textStyle={[
              styles.timeframeChipText,
              selectedTimeframe === timeframe.key && styles.timeframeChipTextSelected
            ]}
          >
            {timeframe.label}
          </Chip>
        ))}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle1, COLORS.gradientMiddle2, COLORS.gradientMiddle3, COLORS.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={{ height: insets.top }} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('statistics.title')}</Text>
          <Text style={styles.subtitle}>{t('statistics.subtitle')}</Text>
        </View>

        <TimeframeSelector />

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.keyMetrics')}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title={t('statistics.totalItems')}
              value={getCurrentStats()?.total || 0}
              icon="food-apple"
              color={COLORS.primary}
              subtitle={t('statistics.inInventory')}
            />
            <StatCard
              title={t('statistics.freshnessScore')}
              value={`${getFreshnessScore().toFixed(0)}%`}
              icon="star"
              color={COLORS.fresh}
              subtitle={t('statistics.overallQuality')}
              trend="+5%"
            />
          </View>
        </View>

        {/* Status Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.statusOverview')}</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusRow}>
              <StatCard
                title={t('dashboard.fresh')}
                value={getCurrentStats()?.fresh || 0}
                icon="check-circle"
                color={COLORS.fresh}
                subtitle={t('statistics.readyToUse')}
                onPress={() => handleStatusCardPress('fresh')}
              />
              <StatCard
                title={t('dashboard.nearExpiry')}
                value={getCurrentStats()?.near_expiry || 0}
                icon="alert-circle"
                color={COLORS.nearExpiry}
                subtitle={t('statistics.useSoon')}
                onPress={() => handleStatusCardPress('near_expiry')}
              />
            </View>
            <View style={styles.statusRow}>
              <StatCard
                title={t('dashboard.expired')}
                value={getCurrentStats()?.expired || 0}
                icon="close-circle"
                color={COLORS.expired}
                subtitle={t('statistics.needsDisposal')}
                onPress={() => handleStatusCardPress('expired')}
              />
              <StatCard
                title={t('dashboard.used')}
                value={getCurrentStats()?.used || 0}
                icon="check"
                color={COLORS.used}
                subtitle={t('statistics.consumed')}
                onPress={() => handleStatusCardPress('used')}
              />
            </View>
          </View>
        </View>

        {/* Progress Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.performance')}</Text>
          
          <ProgressCard
            title={t('dashboard.fresh')}
            current={getCurrentStats()?.fresh || 0}
            total={getCurrentStats()?.total || 0}
            color={COLORS.fresh}
          />
          
          <ProgressCard
            title={t('dashboard.nearExpiry')}
            current={getCurrentStats()?.near_expiry || 0}
            total={getCurrentStats()?.total || 0}
            color={COLORS.nearExpiry}
          />
          
          <ProgressCard
            title={t('dashboard.expired')}
            current={getCurrentStats()?.expired || 0}
            total={getCurrentStats()?.total || 0}
            color={COLORS.expired}
          />

          <ProgressCard
            title={t('statistics.comingSoon')}
            current={Math.round(getWastePercentage())}
            total={100}
            color={COLORS.error}
            showPercentage={false}
          />
        </View>

        {/* Distribution Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.storageDistribution')}</Text>
          
          <View style={styles.distributionGrid}>
            <DistributionCard
              title={t('statistics.keyMetrics')}
              data={getCategoryDistribution()}
              type="category"
            />
            
            <DistributionCard
              title={t('overview.title')}
              data={getLocationDistribution()}
              type="location"
            />
          </View>
        </View>

        {/* Smart Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.insights')}</Text>
          
          {getCurrentStats()?.near_expiry && getCurrentStats()!.near_expiry > 0 ? (
            <InsightCard
              icon="alert"
              title={t('statistics.actionRequired')}
              message={`${t('statistics.youHave')} ${getCurrentStats()!.near_expiry} ${t('statistics.itemsExpiringSoon')}`}
              color={COLORS.nearExpiry}
              action={t('statistics.planMeals')}
              onPress={handleActionRequiredPress}
            />
          ) : null}
          
          {getCurrentStats()?.expired && getCurrentStats()!.expired > 0 ? (
            <InsightCard
              icon="close-circle"
              title={t('statistics.cleanupNeeded')}
              message={`${t('statistics.youHave')} ${getCurrentStats()!.expired} ${t('statistics.itemsExpired')}`}
              color={COLORS.expired}
              action={t('statistics.disposeExpired')}
            />
          ) : null}
          
          {getWastePercentage() > 20 ? (
            <InsightCard
              icon="trash-can"
              title={t('statistics.highWasteRate')}
              message={`${t('statistics.yourWasteRateIs')} ${getWastePercentage().toFixed(1)}%. ${t('statistics.considerImproving')}`}
              color={COLORS.error}
              action={t('statistics.reviewHabits')}
            />
          ) : null}
          
          {(!getCurrentStats()?.near_expiry || getCurrentStats()!.near_expiry === 0) && 
           (!getCurrentStats()?.expired || getCurrentStats()!.expired === 0) ? (
            <InsightCard
              icon="check-circle"
              title={t('statistics.excellentManagement')}
              message={`${t('statistics.maintainPractices')} - ${t('statistics.readyToUse')}`}
              color={COLORS.success}
              action={t('statistics.maintainPractices')}
            />
          ) : null}
        </View>

        {/* Performance Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.performance')}</Text>
          <Card style={styles.performanceCard}>
            <Card.Content>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>{t('statistics.efficiencyScore')}:</Text>
                <Text style={styles.performanceValue}>
                  {getFreshnessScore().toFixed(0)}%
                </Text>
              </View>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>{t('statistics.wasteRate')}:</Text>
                <Text style={styles.performanceValue}>
                  {getWastePercentage().toFixed(1)}%
                </Text>
              </View>
              <View style={styles.performanceRow}>
                <Text style={styles.performanceLabel}>{t('statistics.inventoryTurnover')}:</Text>
                <Text style={styles.performanceValue}>
                  {getCurrentStats()?.used ? Math.round((getCurrentStats()!.used / (getCurrentStats()!.total || 1)) * 100) : 0}%
                </Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Coming Soon Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.comingSoon')}</Text>
          <Card style={styles.comingSoonCard}>
            <Card.Content>
              <Text style={styles.comingSoonTitle}>{t('statistics.comingSoonTitle')}</Text>
              <View style={styles.comingSoonFeatures}>
                <Text style={styles.comingSoonFeature}>📊 {t('statistics.comingSoonChart')}</Text>
                <Text style={styles.comingSoonFeature}>📈 {t('statistics.comingSoonTrends')}</Text>
                <Text style={styles.comingSoonFeature}>🛒 {t('statistics.comingSoonShopping')}</Text>
                <Text style={styles.comingSoonFeature}>💰 {t('statistics.comingSoonCost')}</Text>
                <Text style={styles.comingSoonFeature}>🌱 {t('statistics.comingSoonSustain')}</Text>
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* 烹饪建议模态框 */}
      <CookingAdviceModal
        visible={cookingModalVisible}
        ingredients={nearExpiryIngredients}
        onClose={() => setCookingModalVisible(false)}
      />

      {/* 状态物品列表模态框 */}
      <StatusItemsModal
        visible={statusModalVisible}
        onClose={() => setStatusModalVisible(false)}
        status={selectedStatus}
        items={getStatusItems(selectedStatus)}
        timeframe={selectedTimeframe}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  timeframeContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  timeframeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  timeframeChips: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeChip: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  timeframeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  timeframeChipText: {
    color: COLORS.textSecondary,
  },
  timeframeChipTextSelected: {
    color: COLORS.surface,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statusGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: width * 0.35,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  statContent: {
    // padding moved to statCard
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 12,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  progressCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressContent: {
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  distributionGrid: {
    paddingHorizontal: 16,
    gap: 16,
  },
  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  distributionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    flex: 1,
  },
  distributionItemCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  distributionBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    marginBottom: 4,
  },
  distributionFill: {
    height: '100%',
    borderRadius: 3,
  },
  distributionPercentage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  insightCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightContent: {
    padding: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 12,
  },
  insightMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  insightAction: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  performanceCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  performanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  comingSoonCard: {
    marginHorizontal: 16,
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  comingSoonFeatures: {
    gap: 8,
  },
  comingSoonFeature: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
