import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as Application from 'expo-application';

export interface VersionInfo {
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
    updateUrl: string;
    releaseNotes: string;
    isForceUpdate: boolean;
}

export interface VersionCheckResult {
    hasUpdate: boolean;
    versionInfo?: VersionInfo;
    error?: string;
}

class VersionChecker {
    private static instance: VersionChecker;

    static getInstance(): VersionChecker {
        if (!VersionChecker.instance) {
            VersionChecker.instance = new VersionChecker();
        }
        return VersionChecker.instance;
    }

    /**
     * 获取当前应用版本号
     */
    getCurrentVersion(): string {
        // 优先从 Constants.expoConfig 获取版本号（来自 app.json）
        if (Constants.expoConfig?.version) {
            return Constants.expoConfig.version;
        }

        // 降级到从应用商店获取
        return Application.nativeApplicationVersion || '1.1.0';
    }

    /**
     * 获取当前构建号
     */
    getCurrentBuildNumber(): string {
        if (Platform.OS === 'ios') {
            return Application.nativeBuildVersion || '7';
        } else {
            return Application.nativeBuildVersion || '6';
        }
    }

    /**
     * 获取完整的版本信息（版本号 + 构建号）
     */
    getFullVersionInfo(): string {
        const version = this.getCurrentVersion();
        const buildNumber = this.getCurrentBuildNumber();
        return `${version} (${buildNumber})`;
    }

    /**
     * 检查是否有新版本
     * 这里使用模拟数据，实际项目中应该调用你的API或应用商店API
     */
    async checkForUpdates(): Promise<VersionCheckResult> {
        try {
            const currentVersion = this.getCurrentVersion();
            const currentBuild = this.getCurrentBuildNumber();

            console.log(`Checking for updates. Current version: ${currentVersion}, build: ${currentBuild}`);

            // 模拟从服务器获取最新版本信息
            // 在实际项目中，这里应该调用你的后端API
            const latestVersionInfo = await this.fetchLatestVersionFromServer();

            if (!latestVersionInfo) {
                return { hasUpdate: false, error: '无法获取版本信息' };
            }

            const hasUpdate = this.compareVersions(currentVersion, latestVersionInfo.version);

            if (hasUpdate) {
                return {
                    hasUpdate: true,
                    versionInfo: {
                        currentVersion,
                        latestVersion: latestVersionInfo.version,
                        hasUpdate: true,
                        updateUrl: latestVersionInfo.updateUrl,
                        releaseNotes: latestVersionInfo.releaseNotes,
                        isForceUpdate: latestVersionInfo.isForceUpdate || false,
                    }
                };
            }

            return { hasUpdate: false };
        } catch (error) {
            console.error('Version check failed:', error);
            return {
                hasUpdate: false,
                error: error instanceof Error ? error.message : '版本检查失败'
            };
        }
    }

    /**
     * 从服务器获取最新版本信息（模拟实现）
     * 在实际项目中，这里应该调用你的后端API
     */
    private async fetchLatestVersionFromServer(): Promise<{
        version: string;
        updateUrl: string;
        releaseNotes: string;
        isForceUpdate: boolean;
    } | null> {
        try {
            // 模拟API调用延迟
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 模拟服务器返回的最新版本信息
            // 在实际项目中，这里应该是真实的API调用
            const mockLatestVersion = '1.0.2'; // 比当前版本 1.0.1 更新的版本
            const currentVersion = this.getCurrentVersion();

            // 如果当前版本已经是最新的，返回null
            if (!this.compareVersions(currentVersion, mockLatestVersion)) {
                return null;
            }

            return {
                version: mockLatestVersion,
                updateUrl: this.getUpdateUrl(),
                releaseNotes: `
新版本更新内容：
• 修复了食材过期提醒的bug
• 优化了AI分析功能
• 改进了用户界面体验
• 增加了新的食材分类
• 提升了应用性能
        `.trim(),
                isForceUpdate: false, // 设置为true可以强制更新
            };
        } catch (error) {
            console.error('Failed to fetch latest version:', error);
            return null;
        }
    }

    /**
     * 获取应用商店更新链接
     */
    private getUpdateUrl(): string {
        if (Platform.OS === 'ios') {
            return 'https://apps.apple.com/app/6752112552';
        } else {
            return 'https://play.google.com/store/apps/details?id=com.fridgy.app';
        }
    }

    /**
     * 比较版本号
     * @param current 当前版本
     * @param latest 最新版本
     * @returns true表示有新版本
     */
    private compareVersions(current: string, latest: string): boolean {
        const currentParts = current.split('.').map(Number);
        const latestParts = latest.split('.').map(Number);

        // 确保两个版本号都有相同的部分数
        const maxLength = Math.max(currentParts.length, latestParts.length);

        for (let i = 0; i < maxLength; i++) {
            const currentPart = currentParts[i] || 0;
            const latestPart = latestParts[i] || 0;

            if (latestPart > currentPart) {
                return true;
            } else if (latestPart < currentPart) {
                return false;
            }
        }

        return false;
    }
}

export const versionChecker = VersionChecker.getInstance();
