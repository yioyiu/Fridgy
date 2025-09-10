import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
   * 获取推送通知令牌
   */
  static async getExpoPushToken(): Promise<string | null> {
    try {
      if (!await this.checkPermissions().then(result => result.granted)) {
        console.log('Notification permissions not granted');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: '您的Expo项目ID', // 需要替换为实际的项目ID
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
  static configureNotifications() {
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
  }
}