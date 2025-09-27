/**
 * 版本检查配置
 */
export const VERSION_CHECK_CONFIG = {
    // 检查间隔时间（毫秒）
    CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24小时

    // 应用启动后延迟检查时间（毫秒）
    STARTUP_DELAY: 2000, // 2秒

    // 从后台返回时重新检查的间隔时间（毫秒）
    BACKGROUND_CHECK_INTERVAL: 60 * 60 * 1000, // 1小时

    // 是否启用版本检查
    ENABLED: true,

    // 是否在开发环境中启用版本检查
    ENABLE_IN_DEVELOPMENT: true,

    // 应用商店链接
    STORE_LINKS: {
        ios: 'https://apps.apple.com/app/6752112552', // 替换为你的实际App Store ID
        android: 'https://play.google.com/store/apps/details?id=com.fridgy.app', // 替换为你的实际包名
    },

    // 版本检查API端点（可选，如果使用自己的API）
    API_ENDPOINT: 'https://your-api.com/version-check', // 替换为你的实际API端点

    // 默认的发布说明
    DEFAULT_RELEASE_NOTES: `
新版本更新内容：
• 修复了已知问题
• 优化了用户体验
• 提升了应用性能
• 增加了新功能
  `.trim(),
};

/**
 * 获取当前环境是否应该启用版本检查
 */
export const shouldEnableVersionCheck = (): boolean => {
    if (!VERSION_CHECK_CONFIG.ENABLED) {
        return false;
    }

    // 在开发环境中，根据配置决定是否启用
    if (__DEV__ && !VERSION_CHECK_CONFIG.ENABLE_IN_DEVELOPMENT) {
        return false;
    }

    return true;
};
