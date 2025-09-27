import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    Animated,
    TouchableOpacity,
    Text,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import { SwipeHint } from './SwipeHint';

const { width: screenWidth } = Dimensions.get('window');

interface TabItem {
    key: string;
    title: string;
    icon: string;
    component: React.ComponentType<any>;
}

interface SwipeTabNavigatorProps {
    tabs: TabItem[];
    initialTab?: string;
    onTabChange?: (tabKey: string) => void;
}

export const SwipeTabNavigator: React.FC<SwipeTabNavigatorProps> = ({
    tabs,
    initialTab,
    onTabChange,
}) => {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = useState(initialTab || tabs[0]?.key);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const translateX = useRef(new Animated.Value(0)).current;
    const panGestureRef = useRef(null);

    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);

    useEffect(() => {
        // 当activeTab改变时，更新translateX
        Animated.spring(translateX, {
            toValue: -activeIndex * screenWidth,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    }, [activeIndex, translateX]);

    const handlePanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const handlePanStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;
            const threshold = screenWidth * 0.25; // 降低阈值，更容易触发切换
            const velocityThreshold = 300; // 降低速度阈值

            let newIndex = activeIndex;

            // 根据滑动距离和速度决定是否切换页面
            if (translationX > threshold || velocityX > velocityThreshold) {
                // 向右滑动，切换到上一个页面
                newIndex = Math.max(0, activeIndex - 1);
            } else if (translationX < -threshold || velocityX < -velocityThreshold) {
                // 向左滑动，切换到下一个页面
                newIndex = Math.min(tabs.length - 1, activeIndex + 1);
            }

            // 更新activeTab
            if (newIndex !== activeIndex) {
                const newTab = tabs[newIndex];
                setActiveTab(newTab.key);
                onTabChange?.(newTab.key);
            }

            // 使用更流畅的动画
            Animated.spring(translateX, {
                toValue: -newIndex * screenWidth,
                useNativeDriver: true,
                tension: 120,
                friction: 8,
                velocity: velocityX,
            }).start();
        } else if (event.nativeEvent.state === State.BEGAN) {
            // 开始滑动时，添加触觉反馈（如果支持）
            // HapticFeedback.impactAsync(HapticFeedback.ImpactFeedbackStyle.Light);
        }
    };

    const handleTabPress = (tabKey: string) => {
        const tabIndex = tabs.findIndex(tab => tab.key === tabKey);
        if (tabIndex !== -1) {
            setActiveTab(tabKey);
            onTabChange?.(tabKey);
        }
    };

    const renderTabBar = () => (
        <View style={styles.tabBar}>
            <View style={styles.tabItemsContainer}>
                {tabs.map((tab, index) => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[
                            styles.tabItem,
                            activeTab === tab.key && styles.activeTabItem,
                        ]}
                        onPress={() => handleTabPress(tab.key)}
                        activeOpacity={0.7}
                    >
                        <MaterialCommunityIcons
                            name={tab.icon as any}
                            size={24}
                            color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
                        />
                        <Text
                            style={[
                                styles.tabLabel,
                                activeTab === tab.key && styles.activeTabLabel,
                            ]}
                        >
                            {tab.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 滑动指示器 */}
            <View style={styles.indicatorContainer}>
                {tabs.map((_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.indicator,
                            activeIndex === index && styles.activeIndicator,
                        ]}
                    />
                ))}
            </View>
        </View>
    );

    const renderPages = () => (
        <Animated.View
            style={[
                styles.pagesContainer,
                {
                    transform: [{ translateX }],
                },
            ]}
        >
            {tabs.map((tab, index) => {
                const Component = tab.component;
                return (
                    <View key={tab.key} style={styles.page}>
                        <Component />
                    </View>
                );
            })}
        </Animated.View>
    );

    const handleSwipeHintComplete = () => {
        setShowSwipeHint(false);
    };

    return (
        <View style={styles.container}>
            {renderTabBar()}
            <PanGestureHandler
                ref={panGestureRef}
                onGestureEvent={handlePanGestureEvent}
                onHandlerStateChange={handlePanStateChange}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-5, 5]}
            >
                <Animated.View style={styles.content}>
                    {renderPages()}
                </Animated.View>
            </PanGestureHandler>

            <SwipeHint
                visible={showSwipeHint}
                onComplete={handleSwipeHintComplete}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    tabBar: {
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
    tabItemsContainer: {
        flexDirection: 'row',
        flex: 1,
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
    content: {
        flex: 1,
        marginBottom: 90, // 为底部tab bar留出空间
    },
    pagesContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    page: {
        width: screenWidth,
        flex: 1,
    },
    indicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        gap: 8,
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.border,
    },
    activeIndicator: {
        backgroundColor: COLORS.primary,
        width: 16,
    },
});
