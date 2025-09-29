import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { BarChart } from 'react-native-chart-kit';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { useIngredientsStore } from '@/store/ingredients/slice';
import { CookingAdviceModal, SeasonalFruitsCard } from '@/components/ai';
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
  const [freshnessScoreModalVisible, setFreshnessScoreModalVisible] = useState(false);

  // 初始化数据
  useEffect(() => {
    fetchStats();
    fetchTimeFilteredStats();
  }, []);

  // 监听ingredients变化，实时更新统计数据（优化版本）
  useEffect(() => {
    if (ingredients) {
      // 使用防抖避免频繁更新
      const timeoutId = setTimeout(() => {
        fetchStats();
        fetchTimeFilteredStats();
      }, 500); // 500ms防抖，减少更新频率

      return () => clearTimeout(timeoutId);
    }
    return undefined; // 确保所有代码路径都有返回值
  }, [ingredients.length]); // 只监听数组长度变化，避免无限循环

  // 获取即将过期的食材名称（优化版本）
  useEffect(() => {
    if (ingredients && ingredients.length > 0) {
      const nearExpiryItems = ingredients
        .filter(item => item.status === 'near_expiry')
        .map(item => item.name);
      setNearExpiryIngredients(nearExpiryItems);
    } else {
      setNearExpiryIngredients([]);
    }
  }, [ingredients.length]); // 只监听数组长度变化

  const handleActionRequiredPress = () => {
    if (nearExpiryIngredients.length > 0) {
      setCookingModalVisible(true);
    }
  };

  const handleStatusCardPress = (status: 'fresh' | 'near_expiry' | 'expired' | 'used') => {
    setSelectedStatus(status);
    setStatusModalVisible(true);
  };

  const handleFreshnessScorePress = () => {
    setFreshnessScoreModalVisible(true);
  };

  // 优化：使用useMemo缓存时间范围计算
  const timeRange = useMemo(() => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (selectedTimeframe) {
      case 'week':
        // 本周：从本周一开始到今天
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay() + 1); // 本周一
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        // 本月：从本月1号到今天
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'quarter':
        // 本季度：从本季度第一个月开始到今天
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStartMonth, 1);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        // 本年：从今年1月1号到今天
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = new Date(now);
        end = new Date(now);
    }

    return {
      start: start.toISOString().split('T')[0]!,
      end: end.toISOString().split('T')[0]!
    };
  }, [selectedTimeframe]);

  // 优化：使用useMemo缓存过滤后的食材
  const timeFilteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const createdDate = ingredient.created_at.split('T')[0]!;
      return createdDate >= timeRange.start && createdDate <= timeRange.end;
    });
  }, [ingredients, timeRange]);

  const getStatusItems = useCallback((status: 'fresh' | 'near_expiry' | 'expired' | 'used') => {
    return timeFilteredIngredients.filter(item => item.status === status);
  }, [timeFilteredIngredients]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    await fetchTimeFilteredStats();
    setRefreshing(false);
  };

  // 优化：使用useMemo缓存当前统计数据
  const currentStats = useMemo(() => {
    return timeFilteredStats || stats;
  }, [timeFilteredStats, stats]);

  // 获取当前所有食材的统计数据（不基于时间过滤）
  const getAllIngredientsStats = () => {
    return stats;
  };

  // 优化：使用useMemo缓存新鲜度趋势数据
  const freshnessTrendData = useMemo(() => {
    const now = new Date();
    const periods = [];

    // 根据选择的时间段获取过去5个周期的数据
    for (let i = 4; i >= 0; i--) {
      let periodStart: Date;
      let periodEnd: Date;
      let dateLabel: string;

      switch (selectedTimeframe) {
        case 'week':
          // 获取过去5周的数据，本周从周一到今天
          const weekStart = new Date(now);
          const daysFromMonday = (now.getDay() + 6) % 7;
          weekStart.setDate(now.getDate() - daysFromMonday - (7 * i));
          weekStart.setHours(0, 0, 0, 0);
          periodStart = weekStart;

          if (i === 0) {
            // 本周：从周一到今天
            periodEnd = new Date(now);
            periodEnd.setHours(23, 59, 59, 999);
          } else {
            // 过去几周：完整的周（周一到周日）
            periodEnd = new Date(weekStart);
            periodEnd.setDate(weekStart.getDate() + 6);
            periodEnd.setHours(23, 59, 59, 999);
          }

          const month = weekStart.getMonth() + 1;
          const day = weekStart.getDate();
          dateLabel = `${month}.${day}`;
          break;

        case 'month':
          // 获取过去5个月的数据
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          monthStart.setHours(0, 0, 0, 0);
          periodStart = monthStart;

          periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          periodEnd.setHours(23, 59, 59, 999);

          dateLabel = `${monthStart.getMonth() + 1}月`;
          break;

        case 'quarter':
          // 获取过去5个季度的数据
          const quarterStartMonth = Math.floor((now.getMonth() - (i * 3)) / 3) * 3;
          const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);
          quarterStart.setHours(0, 0, 0, 0);
          periodStart = quarterStart;

          periodEnd = new Date(now.getFullYear(), quarterStartMonth + 3, 0);
          periodEnd.setHours(23, 59, 59, 999);

          const quarterNum = Math.floor(quarterStartMonth / 3) + 1;
          dateLabel = `Q${quarterNum}`;
          break;

        case 'year':
          // 获取过去5年的数据
          const yearStart = new Date(now.getFullYear() - i, 0, 1);
          yearStart.setHours(0, 0, 0, 0);
          periodStart = yearStart;

          periodEnd = new Date(now.getFullYear() - i, 11, 31);
          periodEnd.setHours(23, 59, 59, 999);

          dateLabel = `${yearStart.getFullYear()}年`;
          break;

        default:
          periodStart = new Date();
          periodEnd = new Date();
          dateLabel = '';
      }

      // 过滤该周期的食材
      const periodIngredients = ingredients.filter(ingredient => {
        const createdDate = new Date(ingredient.created_at);
        return createdDate >= periodStart && createdDate <= periodEnd;
      });

      // 计算该周期的新鲜度评分
      const periodStats = {
        fresh: periodIngredients.filter(i => i.status === 'fresh').length,
        near_expiry: periodIngredients.filter(i => i.status === 'near_expiry').length,
        expired: periodIngredients.filter(i => i.status === 'expired').length,
        used: periodIngredients.filter(i => i.status === 'used').length,
        total: periodIngredients.length
      };

      // 当该周期没有物品时，显示满分（100分）
      const freshnessScore = periodStats.total > 0
        ? ((periodStats.fresh * 1.0 + periodStats.near_expiry * 0.5 + periodStats.expired * 0.0 + periodStats.used * 0.8) / periodStats.total) * 100
        : 100; // 没有物品时显示满分，表示管理完美

      periods.push({
        period: dateLabel,
        score: Math.round(freshnessScore),
        date: periodStart.toISOString().split('T')[0]!
      });
    }

    return periods;
  }, [ingredients, selectedTimeframe]);

  // Calculate additional stats - Category distribution removed

  const getLocationDistribution = () => {
    const allStats = getAllIngredientsStats();
    if (!allStats?.byLocation) return [];
    return Object.entries(allStats.byLocation)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getWastePercentage = () => {
    const allStats = getAllIngredientsStats();
    if (!allStats?.total || allStats.total === 0) return 0;
    // 只有过期的食材才算浪费，已使用的食材不算浪费
    return (allStats.expired / allStats.total) * 100;
  };

  const getFreshnessScore = () => {
    if (!currentStats?.total || currentStats.total === 0) return 100; // 没有食材时显示满分，表示管理完美
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

  const DistributionCard = ({ title, data }: {
    title: string;
    data: Array<{ location: string; count: number }>;
  }) => {
    const allStats = getAllIngredientsStats();

    return (
      <Card style={styles.distributionCard}>
        <Card.Content>
          <Text style={styles.distributionTitle}>{title}</Text>
          {data.map((item, index) => {
            const name = item.location;
            const percentage = allStats?.total ? (item.count / allStats.total) * 100 : 0;

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
            selected={false}
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

        {/* Seasonal Fruits Card */}
        <View style={styles.seasonalFruitsSection}>
          <SeasonalFruitsCard onRefresh={handleRefresh} />
        </View>

        {/* Weekly Freshness Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.freshnessTrend')}</Text>
          <Card style={styles.chartCard}>
            <Card.Content style={styles.chartCardContent}>
              <BarChart
                data={{
                  labels: freshnessTrendData.map(period => period.period),
                  datasets: [
                    {
                      data: freshnessTrendData.map(period => period.score),
                    },
                  ],
                }}
                width={Dimensions.get('window').width - 64}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                chartConfig={{
                  backgroundColor: '#FFFFFF',
                  backgroundGradientFrom: '#FFFFFF',
                  backgroundGradientTo: '#FFFFFF',
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // COLORS.primary
                  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // COLORS.textSecondary
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '6',
                    strokeWidth: '2',
                    stroke: COLORS.primary,
                  },
                  barPercentage: 0.6,
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                showValuesOnTopOfBars={true}
                fromZero={true}
                withInnerLines={false}
                withVerticalLabels={true}
                withHorizontalLabels={true}
                segments={4}
              />
            </Card.Content>
          </Card>
        </View>

        <TimeframeSelector />

        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.keyMetrics')}</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title={t('statistics.totalItems')}
              value={currentStats?.total || 0}
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
              onPress={handleFreshnessScorePress}
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
                value={currentStats?.fresh || 0}
                icon="check-circle"
                color={COLORS.fresh}
                subtitle={t('statistics.readyToUse')}
                onPress={() => handleStatusCardPress('fresh')}
              />
              <StatCard
                title={t('dashboard.nearExpiry')}
                value={currentStats?.near_expiry || 0}
                icon="alert-circle"
                color={COLORS.nearExpiry}
                subtitle={t('statistics.useSoon')}
                onPress={() => handleStatusCardPress('near_expiry')}
              />
            </View>
            <View style={styles.statusRow}>
              <StatCard
                title={t('dashboard.expired')}
                value={currentStats?.expired || 0}
                icon="close-circle"
                color={COLORS.expired}
                subtitle={t('statistics.needsDisposal')}
                onPress={() => handleStatusCardPress('expired')}
              />
              <StatCard
                title={t('dashboard.used')}
                value={currentStats?.used || 0}
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
            current={currentStats?.fresh || 0}
            total={currentStats?.total || 0}
            color={COLORS.fresh}
          />

          <ProgressCard
            title={t('dashboard.nearExpiry')}
            current={currentStats?.near_expiry || 0}
            total={currentStats?.total || 0}
            color={COLORS.nearExpiry}
          />

          <ProgressCard
            title={t('dashboard.expired')}
            current={currentStats?.expired || 0}
            total={currentStats?.total || 0}
            color={COLORS.expired}
          />

        </View>

        {/* Distribution Charts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.storageDistribution')}</Text>

          <View style={styles.distributionGrid}>
            {/* Category distribution removed */}

            <DistributionCard
              title={t('overview.title')}
              data={getLocationDistribution()}
            />
          </View>
        </View>

        {/* Smart Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('statistics.insights')}</Text>

          {getAllIngredientsStats()?.near_expiry && getAllIngredientsStats()!.near_expiry > 0 ? (
            <InsightCard
              icon="alert"
              title={t('statistics.actionRequired')}
              message={`${t('statistics.youHave')} ${getAllIngredientsStats()!.near_expiry} ${t('statistics.itemsExpiringSoon')}`}
              color={COLORS.nearExpiry}
              action={t('statistics.planMeals')}
              onPress={handleActionRequiredPress}
            />
          ) : null}

          {getAllIngredientsStats()?.expired && getAllIngredientsStats()!.expired > 0 ? (
            <InsightCard
              icon="close-circle"
              title={t('statistics.cleanupNeeded')}
              message={`${t('statistics.youHave')} ${getAllIngredientsStats()!.expired} ${t('statistics.itemsExpired')}`}
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

          {(!getAllIngredientsStats()?.near_expiry || getAllIngredientsStats()!.near_expiry === 0) &&
            (!getAllIngredientsStats()?.expired || getAllIngredientsStats()!.expired === 0) ? (
            <InsightCard
              icon="check-circle"
              title={t('statistics.excellentManagement')}
              message={t('statistics.maintainPractices')}
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
                  {currentStats?.used ? Math.round((currentStats!.used / (currentStats!.total || 1)) * 100) : 0}%
                </Text>
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

      {/* 新鲜度评分说明模态框 */}
      {freshnessScoreModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('statistics.freshnessScore')}</Text>
              <TouchableOpacity
                onPress={() => setFreshnessScoreModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>{t('statistics.freshnessScoreCalculation')}</Text>

              <View style={styles.calculationSection}>
                <Text style={styles.calculationTitle}>{t('statistics.scoringWeights')}</Text>
                <View style={styles.weightItem}>
                  <View style={styles.weightIndicator} />
                  <Text style={styles.weightText}>{t('statistics.freshItems')}: 100%</Text>
                </View>
                <View style={styles.weightItem}>
                  <View style={[styles.weightIndicator, { backgroundColor: COLORS.nearExpiry }]} />
                  <Text style={styles.weightText}>{t('statistics.nearExpiryItems')}: 50%</Text>
                </View>
                <View style={styles.weightItem}>
                  <View style={[styles.weightIndicator, { backgroundColor: COLORS.expired }]} />
                  <Text style={styles.weightText}>{t('statistics.expiredItems')}: 0%</Text>
                </View>
                <View style={styles.weightItem}>
                  <View style={[styles.weightIndicator, { backgroundColor: COLORS.used }]} />
                  <Text style={styles.weightText}>{t('statistics.usedItems')}: 80%</Text>
                </View>
              </View>

              <View style={styles.formulaSection}>
                <Text style={styles.formulaTitle}>{t('statistics.calculationFormula')}</Text>
                <Text style={styles.formulaText}>
                  {t('statistics.freshnessFormula')}
                </Text>
              </View>

              <View style={styles.exampleSection}>
                <Text style={styles.exampleTitle}>{t('statistics.example')}</Text>
                <Text style={styles.exampleText}>
                  {t('statistics.freshnessExample')}
                </Text>
              </View>

              <View style={styles.defaultScoreSection}>
                <Text style={styles.defaultScoreTitle}>{t('statistics.defaultScoreRule')}</Text>
                <Text style={styles.defaultScoreText}>
                  {t('statistics.defaultScoreExplanation')}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
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
  seasonalFruitsSection: {
    marginBottom: 8,
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
  // 新鲜度评分说明模态框样式
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 22,
  },
  calculationSection: {
    marginBottom: 20,
  },
  calculationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  weightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weightIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.fresh,
    marginRight: 12,
  },
  weightText: {
    fontSize: 14,
    color: COLORS.text,
  },
  formulaSection: {
    marginBottom: 20,
  },
  formulaTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  formulaText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    backgroundColor: COLORS.borderLight,
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  exampleSection: {
    marginBottom: 10,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  defaultScoreSection: {
    marginBottom: 10,
  },
  defaultScoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  defaultScoreText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // 图表样式
  chartCard: {
    marginHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  chartCardContent: {
    padding: 12,
    paddingHorizontal: 12,
    position: 'relative',
  },
});
