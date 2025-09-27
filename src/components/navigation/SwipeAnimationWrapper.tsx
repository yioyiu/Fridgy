import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { COLORS } from '@/utils/constants';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeAnimationWrapperProps {
    children: React.ReactNode;
    currentRoute: string;
}

export const SwipeAnimationWrapper: React.FC<SwipeAnimationWrapperProps> = ({
    children,
    currentRoute,
}) => {
    const router = useRouter();
    const panGestureRef = useRef(null);
    const translateX = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);
    const [gestureActive, setGestureActive] = useState(false);

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
                // 实时更新手势状态
                const translationX = event.nativeEvent.translationX;
                if (Math.abs(translationX) > 10) {
                    setGestureActive(true);
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
                        duration: 250,
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

        const translationX = translateX._value;
        const { prev, next } = getAdjacentRoutes();

        // 左边缘提示（下一个页面）
        if (translationX < -50 && next) {
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
        if (translationX > 50 && prev) {
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
