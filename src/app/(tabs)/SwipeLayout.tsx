import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
        <LinearGradient
            colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tabBar}
        >
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
                        color={currentPage === index ? '#10B981' : '#6B7280'}
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
        </LinearGradient>
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
        paddingBottom: 12,
        paddingTop: 12,
        paddingHorizontal: 20,
        height: 70,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 12,
        borderRadius: 25,
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        zIndex: 1000,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        position: 'relative',
    },
    activeTabItem: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 20,
        marginHorizontal: 2,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '500',
        marginTop: 4,
        letterSpacing: 0.2,
        color: '#6B7280',
        textAlign: 'center',
    },
    activeTabLabel: {
        color: '#10B981',
        fontWeight: '600',
    },
});
