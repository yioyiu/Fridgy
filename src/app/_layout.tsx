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
import { VersionUpdateModal } from '@/components/version';
import { useVersionCheck } from '@/hooks/useVersionCheck';

// 保持splash screen可见，直到我们准备隐藏它
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // 版本检查Hook
  const {
    versionInfo,
    showUpdateModal,
    dismissUpdateModal,
    handleUpdate,
  } = useVersionCheck();

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

          {/* 版本更新提示模态框 */}
          {versionInfo && (
            <VersionUpdateModal
              visible={showUpdateModal}
              versionInfo={versionInfo}
              onDismiss={dismissUpdateModal}
              onUpdate={handleUpdate}
            />
          )}
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
