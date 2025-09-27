import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { COLORS } from '@/utils/constants';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeNavigationWrapperProps {
    children: React.ReactNode;
    currentRoute: string;
}

export const SwipeNavigationWrapper: React.FC<SwipeNavigationWrapperProps> = ({
    children,
    currentRoute,
}) => {
    const router = useRouter();
    const panGestureRef = useRef(null);
    const translateX = useRef(new Animated.Value(0)).current;
    const [isAnimating, setIsAnimating] = useState(false);

    const handlePanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    const handlePanStateChange = (event: any) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;
            const threshold = screenWidth * 0.25; // 滑动距离阈值
            const velocityThreshold = 500; // 滑动速度阈值

            let shouldNavigate = false;
            let targetRoute = '';

            // 向右滑动，切换到上一个页面
            if (translationX > threshold || velocityX > velocityThreshold) {
                switch (currentRoute) {
                    case 'overview/index':
                        // 概览页面没有上一个页面
                        break;
                    case 'index':
                        targetRoute = '/overview';
                        shouldNavigate = true;
                        break;
                    case 'statistics/index':
                        targetRoute = '/';
                        shouldNavigate = true;
                        break;
                    case 'settings/index':
                        targetRoute = '/statistics';
                        shouldNavigate = true;
                        break;
                }
            }
            // 向左滑动，切换到下一个页面
            else if (translationX < -threshold || velocityX < -velocityThreshold) {
                switch (currentRoute) {
                    case 'overview/index':
                        targetRoute = '/';
                        shouldNavigate = true;
                        break;
                    case 'index':
                        targetRoute = '/statistics';
                        shouldNavigate = true;
                        break;
                    case 'statistics/index':
                        targetRoute = '/settings';
                        shouldNavigate = true;
                        break;
                    case 'settings/index':
                        // 设置页面没有下一个页面
                        break;
                }
            }

            if (shouldNavigate) {
                // 执行滑动动画
                setIsAnimating(true);
                const direction = translationX > 0 ? 1 : -1;

                Animated.parallel([
                    Animated.timing(translateX, {
                        toValue: direction * screenWidth,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start(() => {
                    // 动画完成后导航到目标页面
                    router.push(targetRoute);
                    // 重置动画状态
                    translateX.setValue(0);
                    setIsAnimating(false);
                });
            } else {
                // 如果没有导航，回弹到原位置
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }).start();
            }
        }
    };

    return (
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
});
