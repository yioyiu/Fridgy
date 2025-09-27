import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { seasonalFruitsService, SeasonalFruitsResult } from '@/services/ai/seasonalFruits';
import { SeasonalFruitsScheduler, SeasonalFruitsData } from '@/services/notifications/seasonalFruitsScheduler';

interface SeasonalFruitsCardProps {
    onRefresh?: () => void;
}

export const SeasonalFruitsCard: React.FC<SeasonalFruitsCardProps> = ({ onRefresh }) => {
    const { t } = useI18n();
    const [seasonalData, setSeasonalData] = useState<SeasonalFruitsResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSeasonalFruits();
    }, []);

    const loadSeasonalFruits = async () => {
        setLoading(true);
        setError(null);

        try {
            // 优先使用调度器获取数据（包含缓存逻辑）
            const schedulerData = await SeasonalFruitsScheduler.getSeasonalFruitsData();
            if (schedulerData && schedulerData.data) {
                setSeasonalData(schedulerData.data);
            } else {
                // 如果调度器没有数据，直接调用服务
                const data = await seasonalFruitsService.getSeasonalFruits();
                if (data) {
                    setSeasonalData(data);
                } else {
                    setError('无法获取当季水果信息');
                }
            }
        } catch (err) {
            console.error('Error loading seasonal fruits:', err);
            setError('加载当季水果信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        setError(null);

        try {
            // 强制更新数据
            const schedulerData = await SeasonalFruitsScheduler.forceUpdate();
            if (schedulerData && schedulerData.data) {
                setSeasonalData(schedulerData.data);
            } else {
                setError('更新当季水果信息失败');
            }
        } catch (err) {
            console.error('Error refreshing seasonal fruits:', err);
            setError('更新当季水果信息失败');
        } finally {
            setLoading(false);
        }

        onRefresh?.();
    };

    const getSeasonIcon = (season: string) => {
        if (season.includes('春') || season.includes('Spring')) {
            return 'flower';
        } else if (season.includes('夏') || season.includes('Summer')) {
            return 'weather-sunny';
        } else if (season.includes('秋') || season.includes('Autumn')) {
            return 'leaf';
        } else if (season.includes('冬') || season.includes('Winter')) {
            return 'snowflake';
        }
        return 'fruit-grapes';
    };

    const getSeasonColor = (season: string) => {
        if (season.includes('春') || season.includes('Spring')) {
            return '#4CAF50'; // 绿色
        } else if (season.includes('夏') || season.includes('Summer')) {
            return '#FF9800'; // 橙色
        } else if (season.includes('秋') || season.includes('Autumn')) {
            return '#FF5722'; // 深橙色
        } else if (season.includes('冬') || season.includes('Winter')) {
            return '#2196F3'; // 蓝色
        }
        return COLORS.primary;
    };

    const getFruitIcon = (fruitName: string) => {
        // 统一使用水果通用图标
        return 'food-grapes';
    };

    const getFruitWidth = (fruitName: string) => {
        // 根据水果名称字数计算需要的宽度（以4等份为基准）
        const nameLength = fruitName.length;

        // 根据字数确定需要占用的份数
        if (nameLength <= 2) {
            // 1-2个字：1份
            return 1;
        } else if (nameLength === 3) {
            // 3个字：1份
            return 1;
        } else if (nameLength === 4) {
            // 4个字：2份
            return 2;
        } else if (nameLength === 5) {
            // 5个字：2份
            return 2;
        } else if (nameLength === 6) {
            // 6个字：3份
            return 3;
        } else {
            // 7个字及以上：4份（占满整行）
            return 4;
        }
    };

    const calculateOptimalLayout = (fruits: any[]) => {
        // 将每行分成4等份，根据水果字数判断是否能放在当前行
        const layout: any[] = [];
        let currentRow: any[] = [];
        let currentRowUsedSlots = 0;
        const maxSlotsPerRow = 4; // 每行最多4份

        fruits.forEach((fruit, index) => {
            const requiredSlots = getFruitWidth(fruit.name);

            // 如果当前行加上这个水果会超过4份，则换行
            if (currentRowUsedSlots + requiredSlots > maxSlotsPerRow && currentRow.length > 0) {
                layout.push([...currentRow]);
                currentRow = [];
                currentRowUsedSlots = 0;
            }

            // 添加当前水果到当前行
            const widthPercentage = (requiredSlots / maxSlotsPerRow) * 100;
            const height = 45 + (requiredSlots - 1) * 8; // 根据份数调整高度

            currentRow.push({
                ...fruit,
                width: `${widthPercentage}%`,
                height: height,
                slots: requiredSlots,
                index
            });
            currentRowUsedSlots += requiredSlots;
        });

        // 添加最后一行
        if (currentRow.length > 0) {
            layout.push(currentRow);
        }

        return layout;
    };

    if (loading) {
        return (
            <Card style={styles.card}>
                <Card.Content style={styles.loadingContainer}>
                    <ActivityIndicator animating={true} color={COLORS.primary} />
                    <Text style={styles.loadingText}>{t('common.loading')}</Text>
                </Card.Content>
            </Card>
        );
    }

    if (error) {
        return (
            <Card style={styles.card}>
                <Card.Content style={styles.errorContainer}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={24} color={COLORS.error} />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                    </TouchableOpacity>
                </Card.Content>
            </Card>
        );
    }

    if (!seasonalData || seasonalData.fruits.length === 0) {
        return (
            <Card style={styles.card}>
                <Card.Content style={styles.noDataContainer}>
                    <MaterialCommunityIcons name="food-apple" size={24} color={COLORS.textSecondary} />
                    <Text style={styles.noDataText}>{t('statistics.noSeasonalFruits')}</Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                    </TouchableOpacity>
                </Card.Content>
            </Card>
        );
    }

    const seasonColor = getSeasonColor(seasonalData.season);

    return (
        <View style={styles.cardShadow}>
            <Card style={[styles.card, { borderColor: seasonColor + '50' }]}>
                <LinearGradient
                    colors={[seasonColor + '10', COLORS.surface]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientBackground}
                >
                    <Card.Content>
                        <View style={styles.headerContainer}>
                            <View style={styles.titleContainer}>
                                <MaterialCommunityIcons name={getSeasonIcon(seasonalData.season)} size={24} color={seasonColor} />
                                <Text style={[styles.title, { color: seasonColor }]}>
                                    {t('statistics.seasonalFruits')} ({seasonalData.season})
                                </Text>
                            </View>
                            <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
                                <MaterialCommunityIcons name="refresh" size={20} color={COLORS.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        {/* 更新时间 */}
                        <View style={styles.sourceContainer}>
                            <Text style={styles.updateText}>
                                更新于：{new Date(seasonalData.lastUpdated).toLocaleString()}
                            </Text>
                        </View>

                        {/* 水果列表 */}
                        <View style={styles.fruitsContainer}>
                            {calculateOptimalLayout(seasonalData.fruits).map((row, rowIndex) => (
                                <View key={rowIndex} style={styles.fruitRow}>
                                    {row.map((fruit: any) => (
                                        <View
                                            key={fruit.index}
                                            style={[
                                                styles.fruitItem,
                                                {
                                                    borderColor: seasonColor + '30',
                                                    width: fruit.width as any,
                                                    height: fruit.height,
                                                }
                                            ]}
                                        >
                                            <Text style={[styles.fruitName, { color: seasonColor }]}>
                                                {fruit.name}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>

                        {/* 底部提示 */}
                        <View style={styles.footer}>
                            <MaterialCommunityIcons name="information" size={16} color={COLORS.textSecondary} />
                            <Text style={styles.footerText}>
                                {t('statistics.seasonalFruitsDisclaimer')}
                            </Text>
                        </View>
                    </Card.Content>
                </LinearGradient>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    cardShadow: {
        marginHorizontal: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    card: {
        borderRadius: 12,
        borderWidth: 1,
        backgroundColor: COLORS.surface,
    },
    gradientBackground: {
        padding: 0,
        borderRadius: 12,
        overflow: 'hidden',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        marginLeft: 8,
    },
    refreshButton: {
        padding: 4,
    },
    sourceContainer: {
        marginBottom: 8,
    },
    updateText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    fruitsContainer: {
        marginBottom: 4,
    },
    fruitRow: {
        flexDirection: 'row',
        marginBottom: 6,
        justifyContent: 'space-between',
    },
    fruitItem: {
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        padding: 8,
        borderWidth: 1,
        elevation: 1,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fruitName: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 4,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        marginTop: 2,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 8,
        flex: 1,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.textSecondary,
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    errorText: {
        color: COLORS.error,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 5,
        marginTop: 10,
    },
    retryButtonText: {
        color: COLORS.surface,
        fontWeight: 'bold',
    },
    noDataContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noDataText: {
        color: COLORS.textSecondary,
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center',
    },
});