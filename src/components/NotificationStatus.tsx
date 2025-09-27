import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/utils/constants';
import { EnvironmentHelper } from '@/utils/helpers/environment';

interface NotificationStatusProps {
  enabled: boolean;
  permissionsGranted: boolean;
}

export const NotificationStatus: React.FC<NotificationStatusProps> = ({
  enabled,
  permissionsGranted,
}) => {
  const isExpoGo = EnvironmentHelper.isExpoGo();
  const pushAvailable = EnvironmentHelper.isPushNotificationsAvailable();

  const getStatusInfo = () => {
    if (isExpoGo) {
      return {
        icon: 'information',
        color: COLORS.warning,
        title: 'Expo Go 环境',
        message: '本地通知可用，推送通知需要开发构建',
        showWarning: true,
      };
    }

    if (!permissionsGranted) {
      return {
        icon: 'alert-circle',
        color: COLORS.error,
        title: '权限未授予',
        message: '请在设置中允许通知权限',
        showWarning: true,
      };
    }

    if (!enabled) {
      return {
        icon: 'bell-off',
        color: COLORS.textSecondary,
        title: '通知已禁用',
        message: '启用通知以接收提醒',
        showWarning: false,
      };
    }

    return {
      icon: 'bell-check',
      color: COLORS.success,
      title: '通知已启用',
      message: pushAvailable 
        ? '本地和推送通知都已启用' 
        : '本地通知已启用',
      showWarning: false,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <MaterialCommunityIcons
          name={statusInfo.icon}
          size={20}
          color={statusInfo.color}
        />
        <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
          {statusInfo.title}
        </Text>
      </View>
      
      <Text style={styles.statusMessage}>
        {statusInfo.message}
      </Text>

      {statusInfo.showWarning && (
        <View style={styles.warningContainer}>
          <MaterialCommunityIcons
            name="information"
            size={16}
            color={COLORS.warning}
          />
          <Text style={styles.warningText}>
            {isExpoGo 
              ? '要使用完整通知功能，请使用开发构建版本'
              : '请检查通知权限设置'
            }
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.warningLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.warning,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});
