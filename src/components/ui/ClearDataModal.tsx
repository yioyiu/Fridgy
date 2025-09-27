import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
    Animated,
    Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface ClearDataModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

const { width: screenWidth } = Dimensions.get('window');

export const ClearDataModal: React.FC<ClearDataModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title = '清除所有数据',
    message = '此操作将删除所有食材数据、设置和文件。此操作不可撤销，确定要继续吗？',
    confirmText = '长按确认删除',
    cancelText = '取消',
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const [pressProgress, setPressProgress] = useState(0);
    const [pressTimer, setPressTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [scaleValue] = useState(new Animated.Value(1));

    const PRESS_DURATION = 2000; // 需要长按2秒
    const PROGRESS_UPDATE_INTERVAL = 50; // 每50ms更新一次进度

    const handlePressIn = useCallback(() => {
        setIsPressed(true);
        setPressProgress(0);

        // 开始进度更新
        const interval = setInterval(() => {
            setPressProgress(prev => {
                const newProgress = prev + (PROGRESS_UPDATE_INTERVAL / PRESS_DURATION) * 100;
                if (newProgress >= 100) {
                    clearInterval(interval);
                    handleConfirm();
                    return 100;
                }
                return newProgress;
            });
        }, PROGRESS_UPDATE_INTERVAL);

        // 设置定时器，如果长按时间足够就执行删除
        const timer = setTimeout(() => {
            clearInterval(interval);
            handleConfirm();
        }, PRESS_DURATION);

        setPressTimer(timer);

        // 添加按压动画效果
        Animated.spring(scaleValue, {
            toValue: 0.95,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    }, []);

    const handlePressOut = useCallback(() => {
        setIsPressed(false);
        setPressProgress(0);

        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }

        // 恢复动画效果
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();
    }, [pressTimer]);

    const handleConfirm = useCallback(() => {
        setIsPressed(false);
        setPressProgress(0);

        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }

        // 恢复动画效果
        Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
        }).start();

        // 执行删除操作
        onConfirm();
    }, [pressTimer, onConfirm]);

    const handleClose = useCallback(() => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            setPressTimer(null);
        }
        setIsPressed(false);
        setPressProgress(0);
        onClose();
    }, [pressTimer, onClose]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.header}>
                        <MaterialCommunityIcons
                            name="delete-alert"
                            size={48}
                            color={COLORS.error}
                            style={styles.headerIcon}
                        />
                        <Text style={styles.title}>{title}</Text>
                        <Text style={styles.message}>{message}</Text>
                    </View>

                    <View style={styles.content}>
                        <Text style={styles.instruction}>
                            长按下方按钮 {PRESS_DURATION / 1000} 秒来确认删除
                        </Text>

                        <Animated.View
                            style={[
                                styles.deleteButtonContainer,
                                { transform: [{ scale: scaleValue }] }
                            ]}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.deleteButton,
                                    isPressed && styles.deleteButtonPressed,
                                ]}
                                onPressIn={handlePressIn}
                                onPressOut={handlePressOut}
                                activeOpacity={0.8}
                            >
                                <View style={styles.buttonContent}>
                                    <MaterialCommunityIcons
                                        name="delete"
                                        size={32}
                                        color={isPressed ? '#fff' : COLORS.error}
                                    />
                                    <Text style={[
                                        styles.buttonText,
                                        isPressed && styles.buttonTextPressed
                                    ]}>
                                        {confirmText}
                                    </Text>
                                </View>

                                {/* 进度条 */}
                                {isPressed && (
                                    <View style={styles.progressContainer}>
                                        <View style={styles.progressBar}>
                                            <View
                                                style={[
                                                    styles.progressFill,
                                                    { width: `${pressProgress}%` }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.progressText}>
                                            {Math.round(pressProgress)}%
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={styles.warningContainer}>
                            <MaterialCommunityIcons
                                name="alert-circle"
                                size={20}
                                color={COLORS.warning}
                            />
                            <Text style={styles.warningText}>
                                此操作不可撤销，请谨慎操作
                            </Text>
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelButtonText}>{cancelText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: COLORS.surface,
        borderRadius: 20,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
        overflow: 'hidden',
    },
    header: {
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerIcon: {
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    instruction: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 32,
        fontWeight: '500',
    },
    deleteButtonContainer: {
        width: '100%',
        marginBottom: 24,
    },
    deleteButton: {
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.error,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
    },
    deleteButtonPressed: {
        backgroundColor: COLORS.error,
        borderColor: COLORS.error,
    },
    buttonContent: {
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.error,
        marginTop: 8,
    },
    buttonTextPressed: {
        color: '#fff',
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    progressText: {
        fontSize: 14,
        color: '#fff',
        fontWeight: '600',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.warningLight,
        padding: 12,
        borderRadius: 8,
        width: '100%',
    },
    warningText: {
        fontSize: 14,
        color: COLORS.warningDark,
        marginLeft: 8,
        flex: 1,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    cancelButton: {
        backgroundColor: COLORS.border,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
});
