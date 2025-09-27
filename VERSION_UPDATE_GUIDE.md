# 版本更新提示功能使用指南

## 功能概述

本应用已集成版本更新提示功能，当有新版本发布时，旧版本用户会在打开应用时收到更新提示。

## 功能特性

- ✅ 自动版本检查
- ✅ 优雅的更新提示界面
- ✅ 支持强制更新和可选更新
- ✅ 显示更新内容和版本信息
- ✅ 自动跳转到应用商店
- ✅ 智能检查频率控制
- ✅ 开发环境配置

## 文件结构

```
src/
├── services/version/
│   ├── versionChecker.ts    # 版本检查核心服务
│   └── config.ts           # 版本检查配置
├── components/version/
│   ├── VersionUpdateModal.tsx  # 更新提示模态框
│   └── index.ts
└── hooks/
    └── useVersionCheck.ts  # 版本检查Hook
```

## 配置说明

### 1. 基本配置 (`src/services/version/config.ts`)

```typescript
export const VERSION_CHECK_CONFIG = {
  // 检查间隔时间（24小时）
  CHECK_INTERVAL: 24 * 60 * 60 * 1000,
  
  // 应用启动后延迟检查时间（2秒）
  STARTUP_DELAY: 2000,
  
  // 从后台返回时重新检查的间隔时间（1小时）
  BACKGROUND_CHECK_INTERVAL: 60 * 60 * 1000,
  
  // 是否启用版本检查
  ENABLED: true,
  
  // 是否在开发环境中启用版本检查
  ENABLE_IN_DEVELOPMENT: false,
  
  // 应用商店链接
  STORE_LINKS: {
    ios: 'https://apps.apple.com/app/id6752112552',
    android: 'https://play.google.com/store/apps/details?id=com.fridgy.app',
  },
};
```

### 2. 应用配置更新

确保在 `app.json` 中正确设置版本号：

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": {
      "buildNumber": "4"
    },
    "android": {
      "versionCode": 1
    }
  }
}
```

## 使用方法

### 1. 发布新版本时的步骤

1. **更新版本号**：
   - 修改 `app.json` 中的 `version` 字段
   - 增加 `ios.buildNumber` 和 `android.versionCode`

2. **构建并发布**：
   ```bash
   # 构建生产版本
   eas build --platform all --profile production
   
   # 提交到应用商店
   eas submit --platform all --profile production
   ```

3. **更新版本检查服务**：
   - 修改 `src/services/version/versionChecker.ts` 中的 `fetchLatestVersionFromServer` 方法
   - 或者配置你的后端API来返回最新版本信息

### 2. 自定义版本检查逻辑

#### 方法一：使用模拟数据（当前实现）

在 `versionChecker.ts` 中修改 `fetchLatestVersionFromServer` 方法：

```typescript
private async fetchLatestVersionFromServer(): Promise<{
  version: string;
  updateUrl: string;
  releaseNotes: string;
  isForceUpdate: boolean;
} | null> {
  // 修改这里的版本号来测试更新提示
  const mockLatestVersion = '1.0.2'; // 比当前版本更新的版本
  
  return {
    version: mockLatestVersion,
    updateUrl: this.getUpdateUrl(),
    releaseNotes: '你的更新内容...',
    isForceUpdate: false, // 设置为true可以强制更新
  };
}
```

#### 方法二：使用后端API

```typescript
private async fetchLatestVersionFromServer(): Promise<{
  version: string;
  updateUrl: string;
  releaseNotes: string;
  isForceUpdate: boolean;
} | null> {
  try {
    const response = await fetch(VERSION_CHECK_CONFIG.API_ENDPOINT);
    const data = await response.json();
    
    return {
      version: data.latestVersion,
      updateUrl: data.updateUrl,
      releaseNotes: data.releaseNotes,
      isForceUpdate: data.isForceUpdate || false,
    };
  } catch (error) {
    console.error('Failed to fetch version info:', error);
    return null;
  }
}
```

### 3. 测试版本更新功能

1. **在开发环境中启用版本检查**：
   ```typescript
   // 在 config.ts 中设置
   ENABLE_IN_DEVELOPMENT: true,
   ```

2. **修改模拟版本号**：
   ```typescript
   // 在 versionChecker.ts 中设置一个比当前版本更高的版本号
   const mockLatestVersion = '1.0.2';
   ```

3. **重新启动应用**：
   - 应用启动2秒后会检查版本
   - 如果检测到新版本，会显示更新提示

## 功能说明

### 版本检查时机

- **应用启动时**：延迟2秒后检查
- **从后台返回时**：如果距离上次检查超过1小时，则重新检查
- **手动检查**：可以通过Hook提供的方法手动触发检查

### 更新提示类型

1. **可选更新**：用户可以选择"稍后更新"或"立即更新"
2. **强制更新**：用户必须更新才能继续使用应用

### 用户体验

- 显示当前版本和最新版本号
- 展示更新内容和发布说明
- 一键跳转到应用商店
- 优雅的模态框界面

## 注意事项

1. **版本号格式**：使用语义化版本号（如 1.0.1, 1.0.2）
2. **应用商店链接**：确保链接正确指向你的应用
3. **网络环境**：版本检查需要网络连接
4. **权限设置**：确保应用有网络访问权限
5. **测试环境**：在发布前充分测试更新流程

## 故障排除

### 常见问题

1. **版本检查不工作**：
   - 检查 `ENABLED` 配置是否为 `true`
   - 检查网络连接
   - 查看控制台日志

2. **更新提示不显示**：
   - 确认版本号设置正确
   - 检查 `shouldEnableVersionCheck()` 返回值
   - 确认应用已完全加载

3. **应用商店链接无效**：
   - 验证iOS App Store ID
   - 验证Android包名
   - 测试链接在浏览器中是否可访问

### 调试技巧

1. **启用详细日志**：
   ```typescript
   console.log('Version check result:', result);
   ```

2. **手动触发检查**：
   ```typescript
   const { checkForUpdates } = useVersionCheck();
   // 在某个按钮点击时调用
   checkForUpdates();
   ```

3. **检查配置**：
   ```typescript
   console.log('Version check enabled:', shouldEnableVersionCheck());
   ```

## 扩展功能

### 可以添加的功能

1. **版本历史记录**：记录用户跳过的版本
2. **自定义更新策略**：根据用户行为调整检查频率
3. **A/B测试**：测试不同的更新提示界面
4. **离线缓存**：缓存版本信息，离线时也能显示
5. **多语言支持**：支持不同语言的更新提示

这个版本更新系统为你的应用提供了完整的版本管理解决方案，确保用户能够及时获得最新版本的功能和修复。
