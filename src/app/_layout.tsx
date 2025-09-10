import React, { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from '@/utils/constants';
import { notificationService } from '@/services/notifications';

// 保持splash screen可见，直到我们准备隐藏它
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const onLayoutRootView = useCallback(async () => {
    try {
      // 初始化通知服务
      await notificationService.initialize();
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
  );
}
