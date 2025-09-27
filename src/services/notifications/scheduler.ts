import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { Ingredient } from '@/utils/types/ingredient';
import { getNotificationsModule } from './conditionalImport';

export interface NotificationContent {
  title: string;
  body: string;
  data?: any;
}

export interface ScheduledNotification {
  identifier: string;
  content: NotificationContent;
  trigger: Date;
}

export class NotificationScheduler {
  /**
   * 取消所有已安排的通知
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        console.log('Notifications module not available, skipping cancellation');
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  /**
   * 取消特定类型的通知
   */
  static async cancelNotificationsByType(type: string): Promise<void> {
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        console.log('Notifications module not available, skipping cancellation');
        return;
      }

      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduledNotifications
        .filter(notification => notification.content.data?.type === type)
        .map(notification => notification.identifier);

      await Promise.all(
        toCancel.map(id => Notifications.cancelScheduledNotificationAsync(id))
      );

      console.log(`Cancelled ${toCancel.length} notifications of type: ${type}`);
    } catch (error) {
      console.error(`Error cancelling ${type} notifications:`, error);
    }
  }

  /**
   * 安排每日提醒通知
   */
  static async scheduleDailyReminder(
    enabled: boolean,
    reminderTime: { hour: number; minute: number } = { hour: 8, minute: 0 }
  ): Promise<void> {
    // 先取消现有的每日提醒
    await this.cancelNotificationsByType('daily_reminder');

    if (!enabled) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Pantry 早安提醒',
          body: '查看您的食材库存，优先使用即将过期的物品！',
          data: {
            type: 'daily_reminder',
            timestamp: Date.now(),
          },
        },
        trigger: {
          hour: reminderTime.hour,
          minute: reminderTime.minute,
          repeats: true,
        } as any, // 传统日历触发器
      });

      console.log(`Daily reminder scheduled for ${reminderTime.hour}:${reminderTime.minute.toString().padStart(2, '0')}`);
    } catch (error) {
      console.error('Error scheduling daily reminder:', error);
    }
  }

  /**
   * 安排即将过期物品的提醒
   */
  static async scheduleExpiryAlerts(
    ingredients: Ingredient[],
    nearExpiryEnabled: boolean,
    expiredEnabled: boolean,
    nearExpiryDays: number = 3
  ): Promise<void> {
    // 取消现有的过期提醒
    await this.cancelNotificationsByType('near_expiry');
    await this.cancelNotificationsByType('expired');

    if (!nearExpiryEnabled && !expiredEnabled) {
      return;
    }

    try {
      const now = new Date();
      const notifications: ScheduledNotification[] = [];

      for (const ingredient of ingredients) {
        if (ingredient.status === 'used') continue;

        const expiryDate = new Date(ingredient.expiration_date);
        const nearExpiryDate = addDays(expiryDate, -nearExpiryDays);

        // 即将过期提醒 (提前N天)
        if (nearExpiryEnabled &&
          isBefore(now, nearExpiryDate) &&
          ingredient.status !== 'expired') {

          notifications.push({
            identifier: `near_expiry_${ingredient.id}`,
            content: {
              title: '⚠️ 食材即将过期',
              body: `${ingredient.name} 将在 ${nearExpiryDays} 天后过期，请尽快使用！`,
              data: {
                type: 'near_expiry',
                ingredientId: ingredient.id,
                ingredientName: ingredient.name,
              },
            },
            trigger: nearExpiryDate,
          });
        }

        // 过期当天提醒
        if (expiredEnabled &&
          isBefore(now, expiryDate) &&
          ingredient.status !== 'expired') {

          notifications.push({
            identifier: `expired_${ingredient.id}`,
            content: {
              title: '🚨 食材已过期',
              body: `${ingredient.name} 今天过期了，请检查并处理！`,
              data: {
                type: 'expired',
                ingredientId: ingredient.id,
                ingredientName: ingredient.name,
              },
            },
            trigger: startOfDay(expiryDate),
          });
        }
      }

      // 批量安排通知
      await Promise.all(
        notifications.map(async (notification) => {
          try {
            await Notifications.scheduleNotificationAsync({
              content: notification.content,
              trigger: notification.trigger as any, // 日期触发器
            });
          } catch (error) {
            console.error(`Error scheduling notification ${notification.identifier}:`, error);
          }
        })
      );

      console.log(`Scheduled ${notifications.length} expiry notifications`);
    } catch (error) {
      console.error('Error scheduling expiry alerts:', error);
    }
  }

  /**
   * 发送即时通知
   */
  static async sendImmediateNotification(content: NotificationContent): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: null, // 立即发送
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  /**
   * 获取所有已安排的通知
   */
  static async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * 创建测试通知
   */
  static async sendTestNotification(): Promise<void> {
    try {
      await this.sendImmediateNotification({
        title: '🧪 Pantry 测试通知',
        body: '通知功能正常工作！您已成功启用推送通知。',
        data: {
          type: 'test',
          timestamp: Date.now(),
        },
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}