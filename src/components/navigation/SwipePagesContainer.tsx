import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { COLORS } from '@/utils/constants';

const { width: screenWidth } = Dimensions.get('window');

interface SwipePagesContainerProps {
    children: React.ReactNode[];
    initialIndex?: number;
    onPageChange?: (index: number) => void;
}

export const SwipePagesContainer: React.FC<SwipePagesContainerProps> = ({
    children,
    initialIndex = 0,
    onPageChange,
}) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const translateX = useRef(new Animated.Value(-initialIndex * screenWidth)).current;
    const panGestureRef = useRef(null);
    const gestureStartX = useRef(0);

    // 当initialIndex改变时，更新currentIndex
    useEffect(() => {
        setCurrentIndex(initialIndex);
        translateX.setValue(-initialIndex * screenWidth);
    }, [initialIndex, translateX]);

    const handlePanGestureEvent = (event: any) => {
        const { translationX } = event.nativeEvent;
        const baseOffset = -currentIndex * screenWidth;
        const newValue = baseOffset + translationX;
        translateX.setValue(newValue);
    };

    const handlePanStateChange = (event: any) => {
        const { state, translationX, velocityX } = event.nativeEvent;

        if (state === State.BEGAN) {
            gestureStartX.current = translateX._value;
        } else if (state === State.END) {
            const threshold = screenWidth * 0.25;
            const velocityThreshold = 500;

            let newIndex = currentIndex;

            // 根据滑动距离和速度决定是否切换页面
            if (translationX > threshold || velocityX > velocityThreshold) {
                // 向右滑动，切换到上一个页面
                newIndex = Math.max(0, currentIndex - 1);
            } else if (translationX < -threshold || velocityX < -velocityThreshold) {
                // 向左滑动，切换到下一个页面
                newIndex = Math.min(children.length - 1, currentIndex + 1);
            }

            // 更新currentIndex
            if (newIndex !== currentIndex) {
                setCurrentIndex(newIndex);
                onPageChange?.(newIndex);
            }

            // 重置translateX到正确位置
            Animated.timing(translateX, {
                toValue: -newIndex * screenWidth,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    };

    return (
        <View style={styles.container}>
            <PanGestureHandler
                ref={panGestureRef}
                onGestureEvent={handlePanGestureEvent}
                onHandlerStateChange={handlePanStateChange}
                activeOffsetX={[-10, 10]}
                failOffsetY={[-5, 5]}
            >
                <Animated.View
                    style={[
                        styles.pagesContainer,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    {children.map((child, index) => (
                        <View key={index} style={styles.page}>
                            {child}
                        </View>
                    ))}
                </Animated.View>
            </PanGestureHandler>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        overflow: 'hidden',
    },
    pagesContainer: {
        flexDirection: 'row',
        height: '100%',
        width: screenWidth * 4, // 固定4个页面的宽度
    },
    page: {
        width: screenWidth,
        height: '100%',
        flexShrink: 0,
    },
});