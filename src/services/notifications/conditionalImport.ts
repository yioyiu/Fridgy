import { EnvironmentHelper } from '@/utils/helpers/environment';

/**
 * 条件导入expo-notifications，避免在Expo Go中触发警告
 */
export const getNotificationsModule = async () => {
    // 在Expo Go中返回null，避免导入expo-notifications
    if (EnvironmentHelper.isExpoGo()) {
        console.log('Skipping expo-notifications import in Expo Go to avoid warnings');
        return null;
    }

    try {
        const Notifications = await import('expo-notifications');
        return Notifications;
    } catch (error) {
        console.error('Failed to import expo-notifications:', error);
        return null;
    }
};

/**
 * 检查通知功能是否可用
 */
export const isNotificationsAvailable = (): boolean => {
    return EnvironmentHelper.isLocalNotificationsAvailable();
};

/**
 * 检查推送通知是否可用
 */
export const isPushNotificationsAvailable = (): boolean => {
    return EnvironmentHelper.isPushNotificationsAvailable();
};
