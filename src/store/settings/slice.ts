import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_LOCATIONS } from '@/utils/constants/locations';
import type { Location } from '@/utils/types/ingredient';
import { notificationService } from '@/services/notifications';
import { EnvironmentHelper } from '@/utils/helpers/environment';

interface SettingsState {
  locations: Location[];
  // Onboarding settings
  hasSeenOnboarding: boolean;
  // Notification settings
  notificationsEnabled: boolean;
  dailyReminders: boolean;
  nearExpiryAlerts: boolean;
  expiredAlerts: boolean;
  autoSuggestExpiry: boolean;
  // Default near expiry days
  defaultNearExpiryDays: number;
  // Daily reminder time
  dailyReminderTime: { hour: number; minute: number };
  // Actions
  addLocation: (name: string) => void;
  removeLocation: (id: string) => void;
  // Onboarding actions
  setHasSeenOnboarding: (seen: boolean) => void;
  // Setting actions
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setDailyReminders: (enabled: boolean) => Promise<void>;
  setNearExpiryAlerts: (enabled: boolean) => Promise<void>;
  setExpiredAlerts: (enabled: boolean) => Promise<void>;
  setAutoSuggestExpiry: (enabled: boolean) => void;
  setDefaultNearExpiryDays: (days: number) => Promise<void>;
  setDailyReminderTime: (time: { hour: number; minute: number }) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      locations: DEFAULT_LOCATIONS,
      // Onboarding settings
      hasSeenOnboarding: false,
      // Default notification settings
      notificationsEnabled: true,
      dailyReminders: false,
      nearExpiryAlerts: true,
      expiredAlerts: true,
      autoSuggestExpiry: true,
      defaultNearExpiryDays: 3,
      dailyReminderTime: { hour: 8, minute: 0 },
      addLocation: (name: string) => set((state) => ({
        locations: [
          ...state.locations,
          {
            id: Date.now().toString(),
            name: name.trim(),
            icon: 'map-marker',
            color: '#87CEEB',
            sort_order: state.locations.length + 1,
          },
        ],
      })),
      removeLocation: (id: string) => set((state) => ({
        locations: state.locations.filter(l => l.id !== id),
      })),
      // Onboarding actions
      setHasSeenOnboarding: (seen: boolean) => {
        console.log('Store: Setting hasSeenOnboarding to:', seen);
        set({ hasSeenOnboarding: seen });
      },
      // Setting actions - 集成真实通知功能
      setNotificationsEnabled: async (enabled: boolean) => {
        console.log('Store: Setting notificationsEnabled to:', enabled);

        try {
          // 检查是否支持通知功能
          if (!EnvironmentHelper.isLocalNotificationsAvailable()) {
            console.log('Notifications not available in current environment');
            set({ notificationsEnabled: false });
            return;
          }

          if (enabled) {
            // 启用通知并请求权限
            const permissionResult = await notificationService.enableNotifications();

            if (!permissionResult.granted) {
              console.log('Notification permissions denied');
              // 如果权限被拒绝，不更新状态
              return;
            }
          } else {
            // 禁用通知
            await notificationService.disableNotifications();
          }

          // 更新状态并同步通知设置，避免多次状态读取
          set((state) => {
            // 异步更新通知服务，不阻塞状态更新
            notificationService.updateSettings({
              enabled,
              dailyReminders: state.dailyReminders,
              nearExpiryAlerts: state.nearExpiryAlerts,
              expiredAlerts: state.expiredAlerts,
              nearExpiryDays: state.defaultNearExpiryDays,
              dailyReminderTime: state.dailyReminderTime,
            }).catch(error => {
              console.error('Error updating notification settings:', error);
            });

            return { notificationsEnabled: enabled };
          });

        } catch (error) {
          console.error('Error setting notifications:', error);
        }
      },
      setDailyReminders: async (enabled: boolean) => {
        console.log('Store: Setting dailyReminders to:', enabled);

        set((state) => {
          // 异步更新通知服务，不阻塞状态更新
          if (state.notificationsEnabled && EnvironmentHelper.isLocalNotificationsAvailable()) {
            notificationService.updateSettings({
              enabled: state.notificationsEnabled,
              dailyReminders: enabled,
              nearExpiryAlerts: state.nearExpiryAlerts,
              expiredAlerts: state.expiredAlerts,
              nearExpiryDays: state.defaultNearExpiryDays,
              dailyReminderTime: state.dailyReminderTime,
            }).catch(error => {
              console.error('Error updating notification settings:', error);
            });
          }

          return { dailyReminders: enabled };
        });
      },
      setNearExpiryAlerts: async (enabled: boolean) => {
        console.log('Store: Setting nearExpiryAlerts to:', enabled);

        set((state) => {
          // 异步更新通知服务，不阻塞状态更新
          if (state.notificationsEnabled && EnvironmentHelper.isLocalNotificationsAvailable()) {
            notificationService.updateSettings({
              enabled: state.notificationsEnabled,
              dailyReminders: state.dailyReminders,
              nearExpiryAlerts: enabled,
              expiredAlerts: state.expiredAlerts,
              nearExpiryDays: state.defaultNearExpiryDays,
              dailyReminderTime: state.dailyReminderTime,
            }).catch(error => {
              console.error('Error updating notification settings:', error);
            });
          }

          return { nearExpiryAlerts: enabled };
        });
      },
      setExpiredAlerts: async (enabled: boolean) => {
        console.log('Store: Setting expiredAlerts to:', enabled);

        set((state) => {
          // 异步更新通知服务，不阻塞状态更新
          if (state.notificationsEnabled && EnvironmentHelper.isLocalNotificationsAvailable()) {
            notificationService.updateSettings({
              enabled: state.notificationsEnabled,
              dailyReminders: state.dailyReminders,
              nearExpiryAlerts: state.nearExpiryAlerts,
              expiredAlerts: enabled,
              nearExpiryDays: state.defaultNearExpiryDays,
              dailyReminderTime: state.dailyReminderTime,
            }).catch(error => {
              console.error('Error updating notification settings:', error);
            });
          }

          return { expiredAlerts: enabled };
        });
      },
      setAutoSuggestExpiry: (enabled: boolean) => {
        console.log('Store: Setting autoSuggestExpiry to:', enabled);
        set({ autoSuggestExpiry: enabled });
      },
      setDefaultNearExpiryDays: async (days: number) => {
        console.log('Store: Setting defaultNearExpiryDays to:', days);
        set({ defaultNearExpiryDays: days });

        // 同步通知设置
        const state = get();
        if (state.notificationsEnabled && EnvironmentHelper.isLocalNotificationsAvailable()) {
          await notificationService.updateSettings({
            enabled: state.notificationsEnabled,
            dailyReminders: state.dailyReminders,
            nearExpiryAlerts: state.nearExpiryAlerts,
            expiredAlerts: state.expiredAlerts,
            nearExpiryDays: days,
            dailyReminderTime: state.dailyReminderTime,
          });
        }
      },
      setDailyReminderTime: async (time: { hour: number; minute: number }) => {
        console.log('Store: Setting dailyReminderTime to:', time);
        set({ dailyReminderTime: time });

        // 同步通知设置
        const state = get();
        if (state.notificationsEnabled && EnvironmentHelper.isLocalNotificationsAvailable()) {
          await notificationService.updateSettings({
            enabled: state.notificationsEnabled,
            dailyReminders: state.dailyReminders,
            nearExpiryAlerts: state.nearExpiryAlerts,
            expiredAlerts: state.expiredAlerts,
            nearExpiryDays: state.defaultNearExpiryDays,
            dailyReminderTime: time,
          });
        }
      },
    }),
    {
      name: 'pantry-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        locations: s.locations,
        hasSeenOnboarding: s.hasSeenOnboarding,
        notificationsEnabled: s.notificationsEnabled,
        dailyReminders: s.dailyReminders,
        nearExpiryAlerts: s.nearExpiryAlerts,
        expiredAlerts: s.expiredAlerts,
        autoSuggestExpiry: s.autoSuggestExpiry,
        defaultNearExpiryDays: s.defaultNearExpiryDays,
        dailyReminderTime: s.dailyReminderTime
      }),
    }
  )
);


