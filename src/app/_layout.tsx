import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '@/utils/constants';
import { notificationService } from '@/services/notifications';
import { useAuthStore } from '@/store/auth/slice';

export default function RootLayout() {
  const { initializeAuth } = useAuthStore();
  
  useEffect(() => {
    // 初始化通知服务
    notificationService.initialize().catch((error) => {
      console.error('Failed to initialize notification service:', error);
    });
    
    // 初始化认证系统
    initializeAuth().catch((error) => {
      console.error('Failed to initialize auth system:', error);
    });
  }, []);

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
