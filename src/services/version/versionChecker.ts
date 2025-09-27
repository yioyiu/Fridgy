import { Platform } from 'react-native';
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { VERSION_CHECK_CONFIG, shouldEnableVersionCheck } from './config';

export interface VersionInfo {
    currentVersion: string;
    latestVersion: string;
    hasUpdate: boolean;
    updateUrl?: string;
    releaseNotes?: string;
    isForceUpdate?: boolean;
}

export interface VersionCheckResult {
    hasUpdate: boolean;
    versionInfo?: VersionInfo;
    error?: string;
}

class VersionChecker {
    private static instance: VersionChecker;
    private lastCheckTime: number = 0;
    private readonly CHECK_INTERVAL = VERSION_CHECK_CONFIG.CHECK_INTERVAL;

    static getInstance(): VersionChecker {
        if (!VersionChecker.instance) {
            VersionChecker.instance = new VersionChecker();
        }
        return VersionChecker.instance;
    }

    /**
     * 获取当前应用版本信息
     * 优先从 app.json 获取，如果没有则从应用商店获取
     */
    getCurrentVersion(): string {
        // 优先从 Constants.expoConfig 获取版本号（来自 app.json）
        if (Constants.expoConfig?.version) {
            return Constants.expoConfig.version;
        }

        // 降级到从应用商店获取
        return Application.nativeApplicationVersion || '1.0.0';
    }

    /**
     * 获取当前构建号
     * 优先从 app.json 获取，如果没有则从应用商店获取
     */
    getCurrentBuildNumber(): string {
        // 优先从 Constants.expoConfig 获取构建号（来自 app.json）
        if (Platform.OS === 'ios' && Constants.expoConfig?.ios?.buildNumber) {
            return Constants.expoConfig.ios.buildNumber;
        } else if (Platform.OS === 'android' && Constants.expoConfig?.android?.versionCode) {
            return Constants.expoConfig.android.versionCode.toString();
        }

        // 降级到从应用商店获取
        return Application.nativeBuildVersion || '1';
    }

    /**
     * 检查是否有新版本
     * 这里使用模拟数据，实际项目中应该调用你的API或应用商店API
     */
    async checkForUpdates(): Promise<VersionCheckResult> {
        // 检查是否应该启用版本检查
        if (!shouldEnableVersionCheck()) {
            return { hasUpdate: false };
        }

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
            return VERSION_CHECK_CONFIG.STORE_LINKS.ios;
        } else {
            return VERSION_CHECK_CONFIG.STORE_LINKS.android;
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

    /**
     * 检查是否应该进行版本检查
     * 避免频繁检查，只在间隔时间后检查
     */
    shouldCheckForUpdates(): boolean {
        const now = Date.now();
        return now - this.lastCheckTime > this.CHECK_INTERVAL;
    }

    /**
     * 更新最后检查时间
     */
    updateLastCheckTime(): void {
        this.lastCheckTime = Date.now();
    }

    /**
     * 打开应用商店进行更新
     */
    async openAppStore(updateUrl?: string): Promise<void> {
        try {
            const url = updateUrl || this.getUpdateUrl();
            const Linking = (await import('expo-linking')).default;
            await Linking.openURL(url);
        } catch (error) {
            console.error('Failed to open app store:', error);
            throw new Error('无法打开应用商店');
        }
    }
}

export const versionChecker = VersionChecker.getInstance();
