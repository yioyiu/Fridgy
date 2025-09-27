import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { SwipePagesContainer } from '@/components/navigation/SwipePagesContainer';
import OverviewScreen from './overview/index';
import DashboardScreen from './index';
import StatisticsScreen from './statistics/index';
import SettingsScreen from './settings/index';

export default function SwipeLayout() {
    const { t, currentLanguage } = useI18n();
    const [currentPage, setCurrentPage] = useState(0);

    // 使用currentLanguage作为依赖确保语言变化时组件重新渲染
    const navigationOptions = React.useMemo(() => ({
        overview: {
            title: t('navigation.overview'),
            tabBarLabel: t('navigation.overview'),
        },
        ingredients: {
            title: t('navigation.ingredients'),
            tabBarLabel: t('navigation.ingredients'),
        },
        statistics: {
            title: t('navigation.statistics'),
            tabBarLabel: t('navigation.statistics'),
        },
        settings: {
            title: t('navigation.settings'),
            tabBarLabel: t('navigation.settings'),
        },
    }), [t, currentLanguage]);

    const tabs = [
        {
            key: 'overview',
            title: navigationOptions.overview.tabBarLabel,
            icon: 'view-dashboard-variant',
            component: OverviewScreen,
        },
        {
            key: 'ingredients',
            title: navigationOptions.ingredients.tabBarLabel,
            icon: 'food-apple',
            component: DashboardScreen,
        },
        {
            key: 'statistics',
            title: navigationOptions.statistics.tabBarLabel,
            icon: 'chart-line',
            component: StatisticsScreen,
        },
        {
            key: 'settings',
            title: navigationOptions.settings.tabBarLabel,
            icon: 'cog',
            component: SettingsScreen,
        },
    ];

    const handlePageChange = (index: number) => {
        setCurrentPage(index);
    };

    const handleTabPress = (index: number) => {
        setCurrentPage(index);
    };

    const renderTabBar = () => (
        <View style={styles.tabBar}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.tabItem,
                        currentPage === index && styles.activeTabItem,
                    ]}
                    onPress={() => handleTabPress(index)}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons
                        name={tab.icon as any}
                        size={24}
                        color={currentPage === index ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text
                        style={[
                            styles.tabLabel,
                            currentPage === index && styles.activeTabLabel,
                        ]}
                    >
                        {tab.title}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderPages = () => {
        return tabs.map((tab, index) => {
            const Component = tab.component;
            return <Component key={tab.key} />;
        });
    };

    return (
        <View style={styles.container}>
            <SwipePagesContainer
                initialIndex={currentPage}
                onPageChange={handlePageChange}
            >
                {renderPages()}
            </SwipePagesContainer>

            {renderTabBar()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderTopWidth: 0,
        paddingBottom: 12,
        paddingTop: 12,
        height: 90,
        shadowColor: COLORS.shadowMedium,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    activeTabItem: {
        backgroundColor: COLORS.primary + '15',
        borderRadius: 12,
        marginHorizontal: 4,
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
        letterSpacing: 0.5,
        color: COLORS.textSecondary,
        textAlign: 'center',
    },
    activeTabLabel: {
        color: COLORS.primary,
        fontWeight: '700',
    },
});
