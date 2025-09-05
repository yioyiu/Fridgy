import { NotificationPermissions, NotificationPermissionResult } from './permissions';
import { NotificationScheduler } from './scheduler';
import { Ingredient } from '@/utils/types/ingredient';

export interface NotificationSettings {
  enabled: boolean;
  dailyReminders: boolean;
  nearExpiryAlerts: boolean;
  expiredAlerts: boolean;
  nearExpiryDays: number;
}

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 初始化通知服务
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 配置通知处理器
      NotificationPermissions.configureNotifications();
      this.isInitialized = true;
      console.log('Notification service initialized');
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  /**
   * 启用通知功能
   */
  async enableNotifications(): Promise<NotificationPermissionResult> {
    await this.initialize();
    
    try {
      const permissionResult = await NotificationPermissions.requestPermissions();
      
      if (permissionResult.granted) {
        // 获取推送令牌
        const token = await NotificationPermissions.getExpoPushToken();
        if (token) {
          console.log('Push token obtained:', token);
          // 这里可以将token发送到服务器保存
        }

        // 发送测试通知确认功能正常
        await NotificationScheduler.sendTestNotification();
      }

      return permissionResult;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return {
        granted: false,
        canAskAgain: false,
        status: 'error',
      };
    }
  }

  /**
   * 禁用通知功能
   */
  async disableNotifications(): Promise<void> {
    try {
      // 取消所有已安排的通知
      await NotificationScheduler.cancelAllNotifications();
      console.log('Notifications disabled - all scheduled notifications cancelled');
    } catch (error) {
      console.error('Error disabling notifications:', error);
    }
  }

  /**
   * 更新通知设置
   */
  async updateSettings(
    settings: NotificationSettings, 
    ingredients: Ingredient[] = []
  ): Promise<void> {
    await this.initialize();

    try {
      if (!settings.enabled) {
        await this.disableNotifications();
        return;
      }

      // 检查权限
      const permissions = await NotificationPermissions.checkPermissions();
      if (!permissions.granted) {
        console.log('Notification permissions not granted, skipping update');
        return;
      }

      // 更新每日提醒
      await NotificationScheduler.scheduleDailyReminder(settings.dailyReminders);

      // 更新过期提醒
      await NotificationScheduler.scheduleExpiryAlerts(
        ingredients,
        settings.nearExpiryAlerts,
        settings.expiredAlerts,
        settings.nearExpiryDays
      );

      console.log('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  /**
   * 检查权限状态
   */
  async checkPermissions(): Promise<NotificationPermissionResult> {
    return await NotificationPermissions.checkPermissions();
  }

  /**
   * 手动同步食材过期提醒（当食材列表更新时调用）
   */
  async syncExpiryAlerts(
    ingredients: Ingredient[],
    settings: NotificationSettings
  ): Promise<void> {
    if (!settings.enabled) {
      return;
    }

    try {
      await NotificationScheduler.scheduleExpiryAlerts(
        ingredients,
        settings.nearExpiryAlerts,
        settings.expiredAlerts,
        settings.nearExpiryDays
      );
    } catch (error) {
      console.error('Error syncing expiry alerts:', error);
    }
  }

  /**
   * 获取调试信息
   */
  async getDebugInfo(): Promise<{
    permissions: NotificationPermissionResult;
    scheduledCount: number;
    scheduledNotifications: any[];
  }> {
    const permissions = await this.checkPermissions();
    const scheduled = await NotificationScheduler.getScheduledNotifications();
    
    return {
      permissions,
      scheduledCount: scheduled.length,
      scheduledNotifications: scheduled,
    };
  }
}

// 导出单例实例
export const notificationService = NotificationService.getInstance();