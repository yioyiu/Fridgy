import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { useI18n } from '@/utils/i18n';
import React from 'react';

export default function TabLayout() {
  const { t, currentLanguage } = useI18n();
  
  // 使用currentLanguage作为依赖确保语言变化时组件重新渲染
  const navigationOptions = React.useMemo(() => ({
    overview: {
      title: t('navigation.overview'),
      tabBarLabel: t('navigation.overview'),
    },
    ingredients: {
      title: t('navigation.ingredients'),
      tabBarLabel: t('navigation.ingredients'),
    },
    statistics: {
      title: t('navigation.statistics'),
      tabBarLabel: t('navigation.statistics'),
    },
    settings: {
      title: t('navigation.settings'),
      tabBarLabel: t('navigation.settings'),
    },
  }), [t, currentLanguage]);
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 0,
          paddingBottom: 12,
          paddingTop: 12,
          height: 90,
          shadowColor: COLORS.shadowMedium,
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 20,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          borderBottomColor: COLORS.border,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tabs.Screen
        name="overview/index"
        options={{
          title: navigationOptions.overview.title,
          tabBarLabel: navigationOptions.overview.tabBarLabel,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "view-dashboard-variant" : "view-dashboard-variant-outline"} 
              size={focused ? 26 : 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: navigationOptions.ingredients.title,
          tabBarLabel: navigationOptions.ingredients.tabBarLabel,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "food-apple" : "food-apple-outline"} 
              size={focused ? 26 : 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="statistics/index"
        options={{
          title: navigationOptions.statistics.title,
          tabBarLabel: navigationOptions.statistics.tabBarLabel,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "chart-line" : "chart-line"} 
              size={focused ? 26 : 24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: navigationOptions.settings.title,
          tabBarLabel: navigationOptions.settings.tabBarLabel,
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons 
              name={focused ? "cog" : "cog-outline"} 
              size={focused ? 26 : 24} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}
