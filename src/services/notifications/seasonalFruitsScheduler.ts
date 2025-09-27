import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNotificationsModule } from './conditionalImport';
import { seasonalFruitsService } from '../ai/seasonalFruits';

const SEASONAL_FRUITS_STORAGE_KEY = 'seasonal_fruits_data';
const LAST_UPDATE_KEY = 'seasonal_fruits_last_update';

export interface SeasonalFruitsData {
    data: any;
    lastUpdated: string;
    nextUpdate: string;
}

export class SeasonalFruitsScheduler {
    /**
     * 安排每日当季水果更新任务
     */
    static async scheduleDailyUpdate(): Promise<void> {
        try {
            const Notifications = await getNotificationsModule();
            if (!Notifications) {
                console.log('Notifications module not available, skipping seasonal fruits scheduling');
                return;
            }

            // 取消现有的当季水果更新通知
            await this.cancelSeasonalFruitsNotifications();

            // 安排每天早上8点的更新任务
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🍎 当季水果更新',
                    body: '今日当季水果信息已更新，快来查看吧！',
                    data: {
                        type: 'seasonal_fruits_update',
                        timestamp: Date.now(),
                    },
                },
                trigger: {
                    hour: 8,
                    minute: 0,
                    repeats: true,
                } as any,
            });

            console.log('Seasonal fruits daily update scheduled for 8:00 AM');
        } catch (error) {
            console.error('Error scheduling seasonal fruits update:', error);
        }
    }

    /**
     * 取消当季水果相关通知
     */
    static async cancelSeasonalFruitsNotifications(): Promise<void> {
        try {
            const Notifications = await getNotificationsModule();
            if (!Notifications) {
                return;
            }

            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            const toCancel = scheduledNotifications
                .filter(notification => notification.content.data?.type === 'seasonal_fruits_update')
                .map(notification => notification.identifier);

            await Promise.all(
                toCancel.map(id => Notifications.cancelScheduledNotificationAsync(id))
            );

            console.log(`Cancelled ${toCancel.length} seasonal fruits notifications`);
        } catch (error) {
            console.error('Error cancelling seasonal fruits notifications:', error);
        }
    }

    /**
     * 执行当季水果数据更新
     */
    static async updateSeasonalFruitsData(): Promise<SeasonalFruitsData | null> {
        try {
            console.log('Updating seasonal fruits data...');

            const seasonalData = await seasonalFruitsService.getSeasonalFruits();
            if (!seasonalData) {
                console.error('Failed to get seasonal fruits data');
                return null;
            }

            const now = new Date();
            const nextUpdate = new Date(now);
            nextUpdate.setDate(nextUpdate.getDate() + 1);
            nextUpdate.setHours(8, 0, 0, 0);

            const data: SeasonalFruitsData = {
                data: seasonalData,
                lastUpdated: now.toISOString(),
                nextUpdate: nextUpdate.toISOString(),
            };

            // 保存到本地存储
            await AsyncStorage.setItem(SEASONAL_FRUITS_STORAGE_KEY, JSON.stringify(data));
            await AsyncStorage.setItem(LAST_UPDATE_KEY, now.toISOString());

            console.log('Seasonal fruits data updated successfully');
            return data;
        } catch (error) {
            console.error('Error updating seasonal fruits data:', error);
            return null;
        }
    }

    /**
     * 获取缓存的当季水果数据
     */
    static async getCachedSeasonalFruitsData(): Promise<SeasonalFruitsData | null> {
        try {
            const cachedData = await AsyncStorage.getItem(SEASONAL_FRUITS_STORAGE_KEY);
            if (cachedData) {
                return JSON.parse(cachedData);
            }
            return null;
        } catch (error) {
            console.error('Error getting cached seasonal fruits data:', error);
            return null;
        }
    }

    /**
     * 检查是否需要更新数据
     */
    static async shouldUpdateData(): Promise<boolean> {
        try {
            const lastUpdateStr = await AsyncStorage.getItem(LAST_UPDATE_KEY);
            if (!lastUpdateStr) {
                return true; // 如果没有记录，需要更新
            }

            const lastUpdate = new Date(lastUpdateStr);
            const now = new Date();

            // 如果距离上次更新超过24小时，或者当前时间是早上8点后且今天还没更新过
            const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
            const isAfter8AM = now.getHours() >= 8;
            const isSameDay = lastUpdate.toDateString() === now.toDateString();

            return hoursSinceUpdate >= 24 || (isAfter8AM && !isSameDay);
        } catch (error) {
            console.error('Error checking update status:', error);
            return true; // 出错时默认需要更新
        }
    }

    /**
     * 获取当季水果数据（优先使用缓存，必要时更新）
     */
    static async getSeasonalFruitsData(): Promise<SeasonalFruitsData | null> {
        try {
            // 先检查是否需要更新
            const shouldUpdate = await this.shouldUpdateData();

            if (shouldUpdate) {
                console.log('Data is stale, updating seasonal fruits...');
                return await this.updateSeasonalFruitsData();
            } else {
                // 使用缓存数据
                const cachedData = await this.getCachedSeasonalFruitsData();
                if (cachedData) {
                    console.log('Using cached seasonal fruits data');
                    return cachedData;
                } else {
                    // 如果没有缓存，立即更新
                    return await this.updateSeasonalFruitsData();
                }
            }
        } catch (error) {
            console.error('Error getting seasonal fruits data:', error);
            return null;
        }
    }

    /**
     * 手动触发更新
     */
    static async forceUpdate(): Promise<SeasonalFruitsData | null> {
        console.log('Force updating seasonal fruits data...');
        return await this.updateSeasonalFruitsData();
    }

    /**
     * 清除所有当季水果相关数据
     */
    static async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(SEASONAL_FRUITS_STORAGE_KEY);
            await AsyncStorage.removeItem(LAST_UPDATE_KEY);
            await this.cancelSeasonalFruitsNotifications();
            console.log('Seasonal fruits data cleared');
        } catch (error) {
            console.error('Error clearing seasonal fruits data:', error);
        }
    }

    /**
     * 初始化当季水果服务
     */
    static async initialize(): Promise<void> {
        try {
            // 安排每日更新任务
            await this.scheduleDailyUpdate();

            // 异步检查并更新数据，不阻塞app启动
            this.getSeasonalFruitsData().catch(error => {
                console.error('Error getting seasonal fruits data during initialization:', error);
            });

            console.log('Seasonal fruits scheduler initialized');
        } catch (error) {
            console.error('Error initializing seasonal fruits scheduler:', error);
        }
    }
}
