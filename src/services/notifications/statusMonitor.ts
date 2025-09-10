import { Ingredient } from '@/utils/types/ingredient';
import { NotificationScheduler } from './scheduler';
import { useSettingsStore } from '@/store/settings/slice';

// Helper function to calculate ingredient status
const calculateStatus = (expirationDate: string): 'fresh' | 'near_expiry' | 'expired' | 'used' => {
  if (!expirationDate) return 'fresh';
  
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'expired';
  if (diffDays <= 3) return 'near_expiry';
  return 'fresh';
};

export interface StatusChangeEvent {
  ingredient: Ingredient;
  oldStatus: 'fresh' | 'near_expiry' | 'expired' | 'used';
  newStatus: 'fresh' | 'near_expiry' | 'expired' | 'used';
  changeType: 'fresh_to_near_expiry' | 'near_expiry_to_expired' | 'expired_to_fresh' | 'other';
}

export class StatusMonitor {
  private static instance: StatusMonitor;
  private lastCheckedIngredients: Map<string, 'fresh' | 'near_expiry' | 'expired' | 'used'> = new Map();
  private isMonitoring = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private cachedSettings: any = null;
  private settingsCacheTime = 0;
  private readonly CACHE_DURATION = 5000; // 5秒缓存

  static getInstance(): StatusMonitor {
    if (!StatusMonitor.instance) {
      StatusMonitor.instance = new StatusMonitor();
    }
    return StatusMonitor.instance;
  }

  /**
   * 开始监控状态变化
   */
  startMonitoring(ingredients: Ingredient[]): void {
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    // 初始化当前状态
    this.lastCheckedIngredients.clear();
    ingredients.forEach(ingredient => {
      if (ingredient.status !== 'used') {
        const calculatedStatus = calculateStatus(ingredient.expiration_date);
        this.lastCheckedIngredients.set(ingredient.id, calculatedStatus);
      }
    });

    this.isMonitoring = true;
    
    // 每5分钟检查一次状态变化
    this.checkInterval = setInterval(() => {
      this.checkStatusChanges(ingredients);
    }, 5 * 60 * 1000); // 5分钟

    console.log('Status monitoring started');
  }

  /**
   * 停止监控
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('Status monitoring stopped');
  }

  /**
   * 检查状态变化
   */
  private async checkStatusChanges(ingredients: Ingredient[]): Promise<void> {
    try {
      const statusChanges: StatusChangeEvent[] = [];

      for (const ingredient of ingredients) {
        if (ingredient.status === 'used') continue;

        const oldStatus = this.lastCheckedIngredients.get(ingredient.id);
        const newStatus = calculateStatus(ingredient.expiration_date);

        if (oldStatus && oldStatus !== newStatus) {
          const changeType = this.getChangeType(oldStatus, newStatus);
          
          statusChanges.push({
            ingredient,
            oldStatus,
            newStatus,
            changeType
          });

          // 更新记录的状态
          this.lastCheckedIngredients.set(ingredient.id, newStatus);
        } else if (!oldStatus) {
          // 新添加的食材
          this.lastCheckedIngredients.set(ingredient.id, newStatus);
        }
      }

      // 处理状态变化
      if (statusChanges.length > 0) {
        await this.handleStatusChanges(statusChanges);
      }

    } catch (error) {
      console.error('Error checking status changes:', error);
    }
  }

  /**
   * 获取变化类型
   */
  private getChangeType(
    oldStatus: 'fresh' | 'near_expiry' | 'expired' | 'used',
    newStatus: 'fresh' | 'near_expiry' | 'expired' | 'used'
  ): StatusChangeEvent['changeType'] {
    if (oldStatus === 'fresh' && newStatus === 'near_expiry') {
      return 'fresh_to_near_expiry';
    } else if (oldStatus === 'near_expiry' && newStatus === 'expired') {
      return 'near_expiry_to_expired';
    } else if (oldStatus === 'expired' && newStatus === 'fresh') {
      return 'expired_to_fresh';
    }
    return 'other';
  }

  /**
   * 获取缓存的设置，避免频繁调用 getState()
   */
  private getCachedSettings() {
    const now = Date.now();
    if (!this.cachedSettings || (now - this.settingsCacheTime) > this.CACHE_DURATION) {
      this.cachedSettings = useSettingsStore.getState();
      this.settingsCacheTime = now;
    }
    return this.cachedSettings;
  }

  /**
   * 清除设置缓存，当设置更新时调用
   */
  public clearSettingsCache() {
    this.cachedSettings = null;
    this.settingsCacheTime = 0;
  }

  /**
   * 处理状态变化
   */
  private async handleStatusChanges(changes: StatusChangeEvent[]): Promise<void> {
    try {
      const settings = this.getCachedSettings();
      
      if (!settings.notificationsEnabled) {
        return;
      }

      for (const change of changes) {
        switch (change.changeType) {
          case 'fresh_to_near_expiry':
            if (settings.nearExpiryAlerts) {
              await this.sendNearExpiryNotification(change.ingredient);
            }
            break;
          case 'near_expiry_to_expired':
            if (settings.expiredAlerts) {
              await this.sendExpiredNotification(change.ingredient);
            }
            break;
        }
      }

      console.log(`Processed ${changes.length} status changes`);
    } catch (error) {
      console.error('Error handling status changes:', error);
    }
  }

  /**
   * 发送即将过期通知
   */
  private async sendNearExpiryNotification(ingredient: Ingredient): Promise<void> {
    try {
      await NotificationScheduler.sendImmediateNotification({
        title: '⚠️ 食材即将过期',
        body: `${ingredient.name} 即将过期，请尽快使用！`,
        data: {
          type: 'near_expiry_alert',
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          timestamp: Date.now(),
        },
      });
      console.log(`Sent near expiry notification for ${ingredient.name}`);
    } catch (error) {
      console.error('Error sending near expiry notification:', error);
    }
  }

  /**
   * 发送过期通知
   */
  private async sendExpiredNotification(ingredient: Ingredient): Promise<void> {
    try {
      await NotificationScheduler.sendImmediateNotification({
        title: '🚨 食材已过期',
        body: `${ingredient.name} 已经过期，请检查并处理！`,
        data: {
          type: 'expired_alert',
          ingredientId: ingredient.id,
          ingredientName: ingredient.name,
          timestamp: Date.now(),
        },
      });
      console.log(`Sent expired notification for ${ingredient.name}`);
    } catch (error) {
      console.error('Error sending expired notification:', error);
    }
  }

  /**
   * 手动检查状态变化（用于应用启动时）
   */
  async checkStatusChangesNow(ingredients: Ingredient[]): Promise<void> {
    await this.checkStatusChanges(ingredients);
  }

  /**
   * 更新食材列表（当食材列表发生变化时调用）
   */
  updateIngredients(ingredients: Ingredient[]): void {
    if (this.isMonitoring) {
      // 检查新添加的食材
      ingredients.forEach(ingredient => {
        if (!this.lastCheckedIngredients.has(ingredient.id) && ingredient.status !== 'used') {
          const calculatedStatus = calculateStatus(ingredient.expiration_date);
          this.lastCheckedIngredients.set(ingredient.id, calculatedStatus);
        }
      });

      // 移除已删除的食材
      const currentIds = new Set(ingredients.map(i => i.id));
      for (const [id] of this.lastCheckedIngredients) {
        if (!currentIds.has(id)) {
          this.lastCheckedIngredients.delete(id);
        }
      }
    }
  }

  /**
   * 获取监控状态
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * 获取当前监控的食材数量
   */
  getMonitoredCount(): number {
    return this.lastCheckedIngredients.size;
  }
}

// 导出单例实例
export const statusMonitor = StatusMonitor.getInstance();
