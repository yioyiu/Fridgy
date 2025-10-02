import { Platform, Alert, Linking } from 'react-native';
import * as Network from 'expo-network';
import { Audio } from 'expo-av';

export interface PermissionResult {
    granted: boolean;
    canAskAgain: boolean;
    status: string;
}

export class PermissionManager {
    /**
     * 请求网络权限（应用启动时调用）
     */
    static async requestNetworkPermission(): Promise<PermissionResult> {
        try {
            // 检查网络状态
            const networkState = await Network.getNetworkStateAsync();

            if (!networkState.isConnected) {
                return {
                    granted: false,
                    canAskAgain: true,
                    status: 'no_network',
                };
            }

            // 网络权限通常不需要显式请求，但我们可以检查网络连接
            return {
                granted: true,
                canAskAgain: false,
                status: 'granted',
            };
        } catch (error) {
            console.error('Error checking network permission:', error);
            return {
                granted: false,
                canAskAgain: true,
                status: 'error',
            };
        }
    }

    /**
     * 请求语音识别权限（用户首次点击语音按钮时调用）
     */
    static async requestSpeechPermission(): Promise<PermissionResult> {
        try {
            if (Platform.OS === 'web') {
                // Web端不需要显式权限请求，浏览器会自动处理
                return {
                    granted: true,
                    canAskAgain: false,
                    status: 'granted',
                };
            }

            // 移动端请求音频录制权限
            const { status } = await Audio.requestPermissionsAsync();

            if (status === 'granted') {
                return {
                    granted: true,
                    canAskAgain: false,
                    status: 'granted',
                };
            } else if (status === 'undetermined') {
                return {
                    granted: false,
                    canAskAgain: true,
                    status: 'undetermined',
                };
            } else {
                return {
                    granted: false,
                    canAskAgain: false,
                    status: 'denied',
                };
            }
        } catch (error) {
            console.error('Error requesting speech permission:', error);
            return {
                granted: false,
                canAskAgain: true,
                status: 'error',
            };
        }
    }

    /**
     * 检查语音权限状态
     */
    static async checkSpeechPermission(): Promise<PermissionResult> {
        try {
            if (Platform.OS === 'web') {
                return {
                    granted: true,
                    canAskAgain: false,
                    status: 'granted',
                };
            }

            const { status } = await Audio.getPermissionsAsync();

            return {
                granted: status === 'granted',
                canAskAgain: status === 'undetermined',
                status: status,
            };
        } catch (error) {
            console.error('Error checking speech permission:', error);
            return {
                granted: false,
                canAskAgain: true,
                status: 'error',
            };
        }
    }

    /**
     * 显示权限说明对话框
     */
    static showPermissionExplanation(
        type: 'network' | 'speech',
        onGrant: () => void,
        onDeny: () => void
    ) {
        const title = type === 'network'
            ? '网络权限请求'
            : '语音识别权限请求';

        const message = type === 'network'
            ? 'Fridgy需要网络连接来同步您的食材数据、获取AI建议和接收通知。\n\n请允许网络访问以享受完整功能。'
            : 'Fridgy需要访问您的麦克风来进行语音识别，帮助您快速添加食材。\n\n您的语音数据仅在设备本地处理，不会上传到服务器。';

        Alert.alert(
            title,
            message,
            [
                {
                    text: '拒绝',
                    style: 'cancel',
                    onPress: onDeny,
                },
                {
                    text: '允许',
                    onPress: onGrant,
                },
            ]
        );
    }

    /**
     * 显示权限设置引导
     */
    static showPermissionSettingsGuide(type: 'network' | 'speech') {
        const title = type === 'network'
            ? '网络权限被拒绝'
            : '语音权限被拒绝';

        const message = type === 'network'
            ? '网络权限被拒绝，部分功能可能无法正常使用。\n\n您可以在系统设置中手动开启网络权限。'
            : '语音权限被拒绝，无法使用语音识别功能。\n\n您可以在系统设置中手动开启麦克风权限。';

        Alert.alert(
            title,
            message,
            [
                {
                    text: '取消',
                    style: 'cancel',
                },
                {
                    text: '去设置',
                    onPress: () => {
                        if (Platform.OS === 'ios') {
                            Linking.openURL('app-settings:');
                        } else {
                            Linking.openSettings();
                        }
                    },
                },
            ]
        );
    }
}
