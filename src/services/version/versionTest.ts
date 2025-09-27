import { versionChecker } from './versionChecker';

/**
 * 测试版本信息获取
 * 这个文件用于验证版本显示是否正确
 */
export const testVersionInfo = () => {
    console.log('=== 版本信息测试 ===');
    console.log('当前版本:', versionChecker.getCurrentVersion());
    console.log('当前构建号:', versionChecker.getCurrentBuildNumber());
    console.log('版本显示格式:', `${versionChecker.getCurrentVersion()} (${versionChecker.getCurrentBuildNumber()})`);
    console.log('==================');
};

// 如果直接运行此文件，执行测试
if (__DEV__) {
    testVersionInfo();
}
