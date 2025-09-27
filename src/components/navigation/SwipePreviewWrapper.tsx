import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { COLORS } from '@/utils/constants';

const { width: screenWidth } = Dimensions.get('window');

interface SwipePreviewWrapperProps {
    children: React.ReactNode;
    currentRoute: string;
}

export const SwipePreviewWrapper: React.FC<SwipePreviewWrapperProps> = ({
    children,
    currentRoute,
}) => {
    const router = useRouter();
    const panGestureRef = useRef(null);
    const translateX = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [gestureActive, setGestureActive] = useState(false);
    const [previewDirection, setPreviewDirection] = useState<'left' | 'right' | null>(null);

    // 获取相邻页面的路由
    const getAdjacentRoutes = () => {
        switch (currentRoute) {
            case 'overview/index':
                return { prev: null, next: 'index' };
            case 'index':
                return { prev: 'overview/index', next: 'statistics/index' };
            case 'statistics/index':
                return { prev: 'index', next: 'settings/index' };
            case 'settings/index':
                return { prev: 'statistics/index', next: null };
            default:
                return { prev: null, next: null };
        }
    };

    const handlePanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        {
            useNativeDriver: true,
            listener: (event) => {
                const translationX = event.nativeEvent.translationX;
                if (Math.abs(translationX) > 10) {
                    setGestureActive(true);

                    // 设置预览方向
                    if (translationX < -50) {
                        setPreviewDirection('left');
                    } else if (translationX > 50) {
                        setPreviewDirection('right');
                    }
                } else {
                    setPreviewDirection(null);
                }
            }
        }
    );

    const handlePanStateChange = (event: any) => {
        const { state, translationX, velocityX } = event.nativeEvent;

        if (state === State.BEGAN) {
            setGestureActive(true);
        } else if (state === State.END) {
            setGestureActive(false);
            setPreviewDirection(null);

            const threshold = screenWidth * 0.25;
            const velocityThreshold = 500;
            const { prev, next } = getAdjacentRoutes();

            let shouldNavigate = false;
            let targetRoute = '';
            let direction = 0;

            // 向右滑动，切换到上一个页面
            if ((translationX > threshold || velocityX > velocityThreshold) && prev) {
                targetRoute = `/${prev.split('/')[0]}`;
                shouldNavigate = true;
                direction = 1;
            }
            // 向左滑动，切换到下一个页面
            else if ((translationX < -threshold || velocityX < -velocityThreshold) && next) {
                targetRoute = `/${next.split('/')[0]}`;
                shouldNavigate = true;
                direction = -1;
            }

            if (shouldNavigate) {
                // 执行滑动动画
                setIsAnimating(true);

                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: direction * screenWidth,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    // 动画完成后导航
                    router.push(targetRoute);
                    // 重置动画状态
                    setTimeout(() => {
                        translateX.setValue(0);
                        setIsAnimating(false);
                    }, 50);
                });
            } else {
                // 回弹动画
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start();
            }
        }
    };

    // 添加页面边缘的视觉提示
    const getEdgeIndicator = () => {
        if (!gestureActive) return null;

        const { prev, next } = getAdjacentRoutes();

        // 左边缘提示（下一个页面）
        if (previewDirection === 'left' && next) {
            return (
                <View style={[styles.edgeIndicator, styles.leftIndicator]}>
                    <View style={styles.edgeArrow}>
                        <View style={[styles.arrow, { transform: [{ rotate: '45deg' }] }]} />
                        <View style={[styles.arrow, { transform: [{ rotate: '-45deg' }] }]} />
                    </View>
                </View>
            );
        }

        // 右边缘提示（上一个页面）
        if (previewDirection === 'right' && prev) {
            return (
                <View style={[styles.edgeIndicator, styles.rightIndicator]}>
                    <View style={styles.edgeArrow}>
                        <View style={[styles.arrow, { transform: [{ rotate: '-45deg' }] }]} />
                        <View style={[styles.arrow, { transform: [{ rotate: '45deg' }] }]} />
                    </View>
                </View>
            );
        }

        return null;
    };

    // 添加页面预览效果
    const getPagePreview = () => {
        if (!gestureActive || !previewDirection) return null;

        const { prev, next } = getAdjacentRoutes();
        const translationX = translateX._value;

        // 显示下一个页面的预览
        if (previewDirection === 'left' && next && translationX < -20) {
            return (
                <Animated.View
                    style={[
                        styles.pagePreview,
                        styles.leftPreview,
                        {
                            transform: [{
                                translateX: Animated.add(translateX, screenWidth)
                            }]
                        }
                    ]}
                >
                    <View style={styles.previewContent}>
                        <View style={styles.previewHeader}>
                            <View style={styles.previewIcon}>
                                <View style={styles.previewIconPlaceholder} />
                            </View>
                            <View style={styles.previewTitle}>
                                <View style={styles.previewTitleLine} />
                                <View style={[styles.previewTitleLine, { width: '60%' }]} />
                            </View>
                        </View>
                        <View style={styles.previewBody}>
                            <View style={styles.previewLine} />
                            <View style={styles.previewLine} />
                            <View style={[styles.previewLine, { width: '80%' }]} />
                        </View>
                    </View>
                </Animated.View>
            );
        }

        // 显示上一个页面的预览
        if (previewDirection === 'right' && prev && translationX > 20) {
            return (
                <Animated.View
                    style={[
                        styles.pagePreview,
                        styles.rightPreview,
                        {
                            transform: [{
                                translateX: Animated.add(translateX, -screenWidth)
                            }]
                        }
                    ]}
                >
                    <View style={styles.previewContent}>
                        <View style={styles.previewHeader}>
                            <View style={styles.previewIcon}>
                                <View style={styles.previewIconPlaceholder} />
                            </View>
                            <View style={styles.previewTitle}>
                                <View style={styles.previewTitleLine} />
                                <View style={[styles.previewTitleLine, { width: '60%' }]} />
                            </View>
                        </View>
                        <View style={styles.previewBody}>
                            <View style={styles.previewLine} />
                            <View style={styles.previewLine} />
                            <View style={[styles.previewLine, { width: '80%' }]} />
                        </View>
                    </View>
                </Animated.View>
            );
        }

        return null;
    };

    return (
        <View style={styles.wrapper}>
            <PanGestureHandler
                ref={panGestureRef}
                onGestureEvent={handlePanGestureEvent}
                onHandlerStateChange={handlePanStateChange}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-5, 5]}
            >
                <Animated.View
                    style={[
                        styles.container,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    {children}
                </Animated.View>
            </PanGestureHandler>

            {/* 页面预览效果 */}
            {getPagePreview()}

            {/* 边缘指示器 */}
            {getEdgeIndicator()}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    pagePreview: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.surface,
        zIndex: 999,
    },
    leftPreview: {
        left: 0,
    },
    rightPreview: {
        right: 0,
    },
    previewContent: {
        flex: 1,
        padding: 20,
        paddingTop: 60,
    },
    previewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    previewIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary + '20',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewIconPlaceholder: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary + '40',
    },
    previewTitle: {
        flex: 1,
    },
    previewTitleLine: {
        height: 16,
        backgroundColor: COLORS.border,
        borderRadius: 8,
        marginBottom: 8,
    },
    previewBody: {
        flex: 1,
    },
    previewLine: {
        height: 12,
        backgroundColor: COLORS.border,
        borderRadius: 6,
        marginBottom: 12,
    },
    edgeIndicator: {
        position: 'absolute',
        top: '50%',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary + '20',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    leftIndicator: {
        right: 20,
        transform: [{ translateY: -30 }],
    },
    rightIndicator: {
        left: 20,
        transform: [{ translateY: -30 }],
    },
    edgeArrow: {
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    arrow: {
        position: 'absolute',
        width: 8,
        height: 2,
        backgroundColor: COLORS.primary,
        borderRadius: 1,
    },
});
