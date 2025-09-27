import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, Alert } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';

interface VoiceInputButtonProps {
    onVoiceResult: (ingredient: string, location: string) => void;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
    onVoiceResult,
}) => {
    const { t } = useI18n();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const startRecording = () => {
        setIsRecording(true);
        setIsProcessing(false);

        // 开始脉冲动画
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // 模拟语音识别过程
        setTimeout(() => {
            stopRecording();
        }, 3000); // 3秒后自动停止
    };

    const stopRecording = () => {
        setIsRecording(false);
        setIsProcessing(true);

        // 停止动画
        pulseAnim.stopAnimation();
        pulseAnim.setValue(1);

        // 模拟语音识别和解析
        setTimeout(() => {
            // 模拟识别结果
            const mockResults = [
                { ingredient: '苹果', location: '冰箱' },
                { ingredient: '香蕉', location: '常温' },
                { ingredient: '牛奶', location: '冰箱' },
                { ingredient: '面包', location: '常温' },
            ];

            const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
            onVoiceResult(randomResult.ingredient, randomResult.location);

            setIsProcessing(false);
            Alert.alert(
                t('voice.recognitionSuccess'),
                `${t('voice.ingredient')}: ${randomResult.ingredient}\n${t('voice.location')}: ${randomResult.location}`,
                [{ text: t('common.ok') }]
            );
        }, 1500);
    };

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
        }).start();
        startRecording();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
        if (isRecording) {
            stopRecording();
        }
    };

    const getButtonColor = () => {
        if (isProcessing) return COLORS.warning;
        if (isRecording) return COLORS.error;
        return COLORS.primary;
    };

    const getButtonIcon = () => {
        if (isProcessing) return 'loading';
        if (isRecording) return 'microphone';
        return 'microphone-outline';
    };

    return (
        <View style={styles.container}>
            <Animated.View
                style={[
                    styles.pulseContainer,
                    {
                        transform: [{ scale: pulseAnim }],
                        opacity: isRecording ? 0.3 : 0,
                    },
                ]}
            >
                <View style={[styles.pulseRing, { backgroundColor: getButtonColor() }]} />
            </Animated.View>

            <TouchableOpacity
                style={[
                    styles.voiceButton,
                    { backgroundColor: getButtonColor() },
                ]}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={[
                        styles.buttonContent,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={getButtonIcon() as any}
                        size={24}
                        color="#FFFFFF"
                    />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        zIndex: 1000,
    },
    voiceButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonContent: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseContainer: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        position: 'absolute',
    },
});
