import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface SwipeHintProps {
    visible: boolean;
    onComplete: () => void;
}

export const SwipeHint: React.FC<SwipeHintProps> = ({ visible, onComplete }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        if (visible) {
            // 显示动画
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 100,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start();

            // 3秒后自动隐藏
            const timer = setTimeout(() => {
                hideHint();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideHint = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 50,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onComplete();
        });
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <View style={styles.hintBox}>
                <MaterialCommunityIcons
                    name="gesture-swipe-horizontal"
                    size={24}
                    color={COLORS.primary}
                />
                <Text style={styles.hintText}>左右滑动切换页面</Text>
                <MaterialCommunityIcons
                    name="gesture-swipe-horizontal"
                    size={24}
                    color={COLORS.primary}
                />
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 100,
        left: 0,
        right: 0,
        zIndex: 1000,
        alignItems: 'center',
    },
    hintBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    hintText: {
        marginHorizontal: 12,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.text,
    },
});
