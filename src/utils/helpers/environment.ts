import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * 环境检测工具
 */
export class EnvironmentHelper {
  /**
   * 检查是否在Expo Go环境中运行
   */
  static isExpoGo(): boolean {
    return Constants.appOwnership === 'expo';
  }

  /**
   * 检查是否在开发构建中运行
   */
  static isDevelopmentBuild(): boolean {
    return Constants.appOwnership === 'standalone' && __DEV__;
  }

  /**
   * 检查是否在生产构建中运行
   */
  static isProductionBuild(): boolean {
    return Constants.appOwnership === 'standalone' && !__DEV__;
  }

  /**
   * 检查推送通知是否可用
   */
  static isPushNotificationsAvailable(): boolean {
    // 在Expo Go中推送通知不可用
    if (this.isExpoGo()) {
      return false;
    }
    
    // 在开发构建和生产构建中可用
    return this.isDevelopmentBuild() || this.isProductionBuild();
  }

  /**
   * 检查本地通知是否可用
   */
  static isLocalNotificationsAvailable(): boolean {
    // 本地通知在所有环境中都可用
    return true;
  }

  /**
   * 获取环境信息
   */
  static getEnvironmentInfo(): {
    appOwnership: string;
    isExpoGo: boolean;
    isDevelopmentBuild: boolean;
    isProductionBuild: boolean;
    pushNotificationsAvailable: boolean;
    localNotificationsAvailable: boolean;
    platform: string;
  } {
    return {
      appOwnership: Constants.appOwnership,
      isExpoGo: this.isExpoGo(),
      isDevelopmentBuild: this.isDevelopmentBuild(),
      isProductionBuild: this.isProductionBuild(),
      pushNotificationsAvailable: this.isPushNotificationsAvailable(),
      localNotificationsAvailable: this.isLocalNotificationsAvailable(),
      platform: Platform.OS,
    };
  }

  /**
   * 打印环境信息（用于调试）
   */
  static logEnvironmentInfo(): void {
    const info = this.getEnvironmentInfo();
    console.log('Environment Info:', info);
  }
}
