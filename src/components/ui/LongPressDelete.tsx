import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';

interface LongPressDeleteProps {
    children: React.ReactNode;
    onDelete: () => void;
    deleteText?: string;
    confirmText?: string;
    disabled?: boolean;
}

export const LongPressDelete: React.FC<LongPressDeleteProps> = ({
    children,
    onDelete,
    deleteText = '长按删除',
    confirmText = '确认删除',
    disabled = false,
}) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleLongPress = () => {
        if (disabled) return;

        Alert.alert(
            '确认删除',
            '此操作将删除所有数据，此操作不可撤销，确定要继续吗？',
            [
                {
                    text: '取消',
                    style: 'cancel',
                    onPress: () => setIsPressed(false),
                },
                {
                    text: '确定删除',
                    style: 'destructive',
                    onPress: () => {
                        setIsPressed(false);
                        onDelete();
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <TouchableOpacity
            onLongPress={handleLongPress}
            onPressIn={() => setIsPressed(true)}
            onPressOut={() => setIsPressed(false)}
            disabled={disabled}
            style={[
                styles.container,
                isPressed && styles.pressed,
            ]}
            activeOpacity={0.8}
        >
            {children}
            {isPressed && (
                <View style={styles.pressIndicator}>
                    <MaterialCommunityIcons
                        name="delete"
                        size={20}
                        color={COLORS.error}
                    />
                    <Text style={styles.pressText}>{deleteText}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
    },
    pressed: {
        backgroundColor: COLORS.warningLight,
    },
    pressIndicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 12,
    },
    pressText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.warning,
    },
});
