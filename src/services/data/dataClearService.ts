import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import { useIngredientsStore } from '@/store/ingredients/slice';
import { useSettingsStore } from '@/store/settings/slice';

export interface ClearDataResult {
    success: boolean;
    clearedItems: string[];
    errors: string[];
}

export interface ClearDataOptions {
    clearIngredients: boolean;
    clearSettings: boolean;
    clearNotifications: boolean;
    clearFiles: boolean;
    resetToDefaults: boolean;
}

class DataClearService {
    private static instance: DataClearService;

    static getInstance(): DataClearService {
        if (!DataClearService.instance) {
            DataClearService.instance = new DataClearService();
        }
        return DataClearService.instance;
    }

    /**
     * 获取所有需要清除的数据项
     */
    private async getAllStorageKeys(): Promise<string[]> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys || [];
        } catch (error) {
            console.error('Failed to get storage keys:', error);
            return [];
        }
    }

    /**
     * 清除食材数据
     */
    private async clearIngredientsData(): Promise<{ success: boolean; error?: string }> {
        try {
            const store = useIngredientsStore.getState();

            // 清除所有食材
            store.clearAllIngredients();

            // 清除相关的存储键
            const keys = await this.getAllStorageKeys();
            const ingredientKeys = keys.filter(key =>
                key.includes('ingredients') ||
                key.includes('fridgy-ingredients')
            );

            if (ingredientKeys.length > 0) {
                await AsyncStorage.multiRemove(ingredientKeys);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to clear ingredients data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '清除食材数据失败'
            };
        }
    }

    /**
     * 清除设置数据
     */
    private async clearSettingsData(): Promise<{ success: boolean; error?: string }> {
        try {
            const store = useSettingsStore.getState();

            // 重置设置到默认值
            store.setHasSeenOnboarding(false);
            store.setNotificationsEnabled(true);
            store.setDailyReminders(true);
            store.setNearExpiryAlerts(true);
            store.setExpiredAlerts(false);
            store.setAutoSuggestExpiry(true);
            store.setDefaultNearExpiryDays(3);
            store.setDailyReminderTime({ hour: 9, minute: 0 });

            // 清除自定义位置，保留默认位置
            const defaultLocations = [
                { id: '1', name: '冰箱' },
                { id: '2', name: '冷冻室' },
                { id: '3', name: '储物柜' },
                { id: '4', name: '台面' }
            ];

            // 这里需要重新设置位置，但zustand的persist会自动处理

            // 清除相关的存储键
            const keys = await this.getAllStorageKeys();
            const settingsKeys = keys.filter(key =>
                key.includes('settings') ||
                key.includes('fridgy-settings')
            );

            if (settingsKeys.length > 0) {
                await AsyncStorage.multiRemove(settingsKeys);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to clear settings data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '清除设置数据失败'
            };
        }
    }

    /**
     * 清除通知数据
     */
    private async clearNotificationsData(): Promise<{ success: boolean; error?: string }> {
        try {
            // 尝试取消所有通知
            try {
                // 使用条件导入来避免模块加载问题
                const { NotificationScheduler } = await import('@/services/notifications/scheduler');
                await NotificationScheduler.cancelAllNotifications();
            } catch (notificationError) {
                console.warn('Failed to cancel notifications, continuing with storage cleanup:', notificationError);
                // 即使取消通知失败，也继续清除存储数据
            }

            // 清除通知相关的存储键
            const keys = await this.getAllStorageKeys();
            const notificationKeys = keys.filter(key =>
                key.includes('notification') ||
                key.includes('fridgy-notification')
            );

            if (notificationKeys.length > 0) {
                await AsyncStorage.multiRemove(notificationKeys);
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to clear notifications data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '清除通知数据失败'
            };
        }
    }

    /**
     * 清除文件数据
     */
    private async clearFilesData(): Promise<{ success: boolean; error?: string }> {
        try {
            const documentDir = FileSystem.documentDirectory;
            if (!documentDir) {
                return { success: true }; // 没有文档目录，无需清除
            }

            // 获取所有文件
            const files = await FileSystem.readDirectoryAsync(documentDir);

            // 清除应用相关的文件
            const appFiles = files.filter(file =>
                file.includes('fridgy') ||
                file.includes('pantry') ||
                file.endsWith('.csv') ||
                file.endsWith('.json')
            );

            // 删除文件
            for (const file of appFiles) {
                try {
                    await FileSystem.deleteAsync(`${documentDir}${file}`, { idempotent: true });
                } catch (fileError) {
                    console.warn(`Failed to delete file ${file}:`, fileError);
                }
            }

            return { success: true };
        } catch (error) {
            console.error('Failed to clear files data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '清除文件数据失败'
            };
        }
    }

    /**
     * 清除所有数据
     */
    async clearAllData(options: ClearDataOptions = {
        clearIngredients: true,
        clearSettings: true,
        clearNotifications: true,
        clearFiles: true,
        resetToDefaults: true
    }): Promise<ClearDataResult> {
        const clearedItems: string[] = [];
        const errors: string[] = [];

        console.log('Starting data clear process with options:', options);

        // 清除食材数据
        if (options.clearIngredients) {
            const result = await this.clearIngredientsData();
            if (result.success) {
                clearedItems.push('食材数据');
            } else {
                errors.push(`食材数据: ${result.error}`);
            }
        }

        // 清除设置数据
        if (options.clearSettings) {
            const result = await this.clearSettingsData();
            if (result.success) {
                clearedItems.push('设置数据');
            } else {
                errors.push(`设置数据: ${result.error}`);
            }
        }

        // 清除通知数据
        if (options.clearNotifications) {
            const result = await this.clearNotificationsData();
            if (result.success) {
                clearedItems.push('通知数据');
            } else {
                errors.push(`通知数据: ${result.error}`);
            }
        }

        // 清除文件数据
        if (options.clearFiles) {
            const result = await this.clearFilesData();
            if (result.success) {
                clearedItems.push('文件数据');
            } else {
                errors.push(`文件数据: ${result.error}`);
            }
        }

        const success = errors.length === 0;

        console.log('Data clear process completed:', {
            success,
            clearedItems,
            errors
        });

        return {
            success,
            clearedItems,
            errors
        };
    }

    /**
     * 显示清除数据确认对话框
     */
    showClearDataDialog(
        onConfirm: () => void,
        onCancel: () => void,
        t?: (key: string) => string
    ): void {
        const title = t ? t('settings.dataClear.confirmTitle') : '清除所有数据';
        const message = t ? t('settings.dataClear.confirmMessage') : '此操作将删除所有食材数据、设置和文件。此操作不可撤销，确定要继续吗？';
        const cancelText = t ? t('common.cancel') : '取消';
        const confirmText = t ? t('settings.dataClear.confirmButton') : '确定清除';

        Alert.alert(
            title,
            message,
            [
                {
                    text: cancelText,
                    style: 'cancel',
                    onPress: onCancel,
                },
                {
                    text: confirmText,
                    style: 'destructive',
                    onPress: onConfirm,
                },
            ],
            { cancelable: true }
        );
    }

    /**
     * 显示清除结果对话框
     */
    showClearResultDialog(
        result: ClearDataResult,
        t?: (key: string) => string
    ): void {
        if (result.success) {
            const title = t ? t('settings.dataClear.successTitle') : '清除成功';
            const message = t ? t('settings.dataClear.successMessage') : `已成功清除以下数据：\n\n${result.clearedItems.join('\n')}`;
            const buttonText = t ? t('common.ok') : '确定';

            Alert.alert(title, message, [{ text: buttonText }]);
        } else {
            const title = t ? t('settings.dataClear.errorTitle') : '清除失败';
            const message = t ? t('settings.dataClear.errorMessage') : `清除过程中遇到以下问题：\n\n${result.errors.join('\n')}\n\n已清除的数据：\n${result.clearedItems.join('\n')}`;
            const buttonText = t ? t('common.ok') : '确定';

            Alert.alert(title, message, [{ text: buttonText }]);
        }
    }
}

export const dataClearService = DataClearService.getInstance();
