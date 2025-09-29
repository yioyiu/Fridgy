import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '@/utils/constants';
import { notificationService } from '@/services/notifications';
import { SeasonalFruitsScheduler } from '@/services/notifications/seasonalFruitsScheduler';
import { EnvironmentHelper } from '@/utils/helpers/environment';

// 保持splash screen可见，直到我们准备隐藏它
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const onLayoutRootView = useCallback(async () => {
    try {
      // 打印环境信息
      EnvironmentHelper.logEnvironmentInfo();

      // 只在支持的环境中初始化通知服务
      if (EnvironmentHelper.isLocalNotificationsAvailable()) {
        await notificationService.initialize();
        // 初始化当季水果调度器
        await SeasonalFruitsScheduler.initialize();
      } else {
        console.log('Skipping notification service initialization in current environment');
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      // 隐藏splash screen
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>

        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
