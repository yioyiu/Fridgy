import { Platform } from 'react-native';
import { EnvironmentHelper } from '@/utils/helpers/environment';
import { getNotificationsModule } from './conditionalImport';

export interface NotificationPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export class NotificationPermissions {
  /**
   * 请求通知权限
   */
  static async requestPermissions(): Promise<NotificationPermissionResult> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        return {
          granted: false,
          canAskAgain: false,
          status: 'unavailable',
        };
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      // 如果权限未授予，请求权限
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      return {
        granted: finalStatus === 'granted',
        canAskAgain: existingStatus === 'undetermined',
        status: finalStatus,
      };
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  /**
   * 检查当前权限状态
   */
  static async checkPermissions(): Promise<NotificationPermissionResult> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        return {
          granted: false,
          canAskAgain: false,
          status: 'unavailable',
        };
      }

      const { status } = await Notifications.getPermissionsAsync();

      return {
        granted: status === 'granted',
        canAskAgain: status === 'undetermined',
        status,
      };
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  /**
   * 获取推送通知令牌（仅在开发构建中可用）
   */
  static async getExpoPushToken(): Promise<string | null> {
    try {
      // 检查推送通知是否在当前环境中可用
      if (!EnvironmentHelper.isPushNotificationsAvailable()) {
        console.log('Push notifications not available in current environment');
        return null;
      }

      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        return null;
      }

      if (!await this.checkPermissions().then(result => result.granted)) {
        console.log('Notification permissions not granted');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '3ae93e28-1b5a-4890-80b2-66aa8186006d', // 从app.json中获取的项目ID
      });

      console.log('Expo push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * 配置通知处理
   */
  static async configureNotifications() {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        console.log('Notifications module not available, skipping configuration');
        return;
      }

      // 配置通知在前台时的行为
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Android 通知渠道配置
      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'Pantry Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
          description: 'Food expiry and reminder notifications',
        });

        // 创建过期提醒渠道
        Notifications.setNotificationChannelAsync('expiry_alerts', {
          name: 'Expiry Alerts',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF9800',
          sound: 'default',
          description: 'Notifications for items that are expiring soon',
        });

        // 创建每日提醒渠道
        Notifications.setNotificationChannelAsync('daily_reminders', {
          name: 'Daily Reminders',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250],
          lightColor: '#4CAF50',
          sound: 'default',
          description: 'Daily summary reminders',
        });
      }
    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  }
}