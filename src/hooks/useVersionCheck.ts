import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { VersionInfo, VersionCheckResult, versionChecker } from '@/services/version/versionChecker';
import { VERSION_CHECK_CONFIG, shouldEnableVersionCheck } from '@/services/version/config';

interface UseVersionCheckReturn {
    versionInfo: VersionInfo | null;
    isChecking: boolean;
    error: string | null;
    showUpdateModal: boolean;
    checkForUpdates: () => Promise<void>;
    dismissUpdateModal: () => void;
    handleUpdate: () => void;
}

export const useVersionCheck = (): UseVersionCheckReturn => {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const checkForUpdates = useCallback(async () => {
        // 检查是否应该启用版本检查
        if (!shouldEnableVersionCheck()) {
            return;
        }

        // 避免频繁检查
        if (!versionChecker.shouldCheckForUpdates()) {
            return;
        }

        setIsChecking(true);
        setError(null);

        try {
            const result: VersionCheckResult = await versionChecker.checkForUpdates();

            if (result.error) {
                setError(result.error);
                return;
            }

            if (result.hasUpdate && result.versionInfo) {
                setVersionInfo(result.versionInfo);
                setShowUpdateModal(true);
                versionChecker.updateLastCheckTime();
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '版本检查失败';
            setError(errorMessage);
            console.error('Version check error:', err);
        } finally {
            setIsChecking(false);
        }
    }, []);

    const dismissUpdateModal = useCallback(() => {
        setShowUpdateModal(false);
    }, []);

    const handleUpdate = useCallback(() => {
        setShowUpdateModal(false);
        // 更新逻辑在VersionUpdateModal中处理
    }, []);

    // 应用启动时检查版本
    useEffect(() => {
        const timer = setTimeout(() => {
            checkForUpdates();
        }, VERSION_CHECK_CONFIG.STARTUP_DELAY);

        return () => clearTimeout(timer);
    }, [checkForUpdates]);

    // 应用从后台返回时检查版本
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                // 应用从后台返回时，如果距离上次检查超过配置的时间，则重新检查
                const now = Date.now();
                if (now - versionChecker['lastCheckTime'] > VERSION_CHECK_CONFIG.BACKGROUND_CHECK_INTERVAL) {
                    checkForUpdates();
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription?.remove();
    }, [checkForUpdates]);

    return {
        versionInfo,
        isChecking,
        error,
        showUpdateModal,
        checkForUpdates,
        dismissUpdateModal,
        handleUpdate,
    };
};
