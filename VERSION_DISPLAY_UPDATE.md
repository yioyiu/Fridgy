# 版本显示更新说明

## 问题描述

之前设置页面的版本显示使用的是应用商店的版本号（通过 `Application.nativeApplicationVersion` 获取），而不是 `app.json` 中配置的版本号。

## 解决方案

更新了版本检查器 (`src/services/version/versionChecker.ts`)，现在优先从 `app.json` 获取版本信息。

### 更新内容

#### 1. 版本号获取逻辑

**之前**：
```typescript
getCurrentVersion(): string {
  return Application.nativeApplicationVersion || '1.0.0';
}
```

**现在**：
```typescript
getCurrentVersion(): string {
  // 优先从 Constants.expoConfig 获取版本号（来自 app.json）
  if (Constants.expoConfig?.version) {
    return Constants.expoConfig.version;
  }
  
  // 降级到从应用商店获取
  return Application.nativeApplicationVersion || '1.0.0';
}
```

#### 2. 构建号获取逻辑

**之前**：
```typescript
getCurrentBuildNumber(): string {
  return Application.nativeBuildVersion || '1';
}
```

**现在**：
```typescript
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
```

## 版本信息来源

### 1. 主要来源：app.json
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

### 2. 降级来源：应用商店
如果 `app.json` 中没有版本信息，则从应用商店获取。

## 显示效果

### iOS 设备
- 版本号：从 `app.json` 的 `version` 字段获取
- 构建号：从 `app.json` 的 `ios.buildNumber` 字段获取
- 显示格式：`1.0.1 (4)`

### Android 设备
- 版本号：从 `app.json` 的 `version` 字段获取
- 构建号：从 `app.json` 的 `android.versionCode` 字段获取
- 显示格式：`1.0.1 (1)`

## 优势

### 1. 一致性
- 版本显示与 `app.json` 配置保持一致
- 开发环境和生产环境版本显示一致

### 2. 可控性
- 开发者可以完全控制版本显示
- 不依赖应用商店的版本信息

### 3. 可靠性
- 有降级机制，确保版本信息始终可用
- 支持不同平台的构建号显示

## 测试方法

### 1. 检查版本显示
1. 打开应用设置页面
2. 查看"版本"项的副标题
3. 应该显示：`1.0.1 (4)` （iOS）或 `1.0.1 (1)` （Android）

### 2. 验证版本来源
```typescript
// 在开发环境中可以调用测试函数
import { testVersionInfo } from '@/services/version/versionTest';
testVersionInfo();
```

### 3. 更新版本测试
1. 修改 `app.json` 中的版本号
2. 重新启动应用
3. 检查设置页面的版本显示是否更新

## 注意事项

### 1. 版本同步
- 确保 `app.json` 中的版本号与发布版本一致
- 构建号在每次发布时应该递增

### 2. 平台差异
- iOS 使用 `buildNumber` 字段
- Android 使用 `versionCode` 字段
- 两个平台的构建号可以不同

### 3. 降级机制
- 如果 `app.json` 中没有版本信息，会自动使用应用商店的版本
- 这确保了版本信息的可靠性

## 未来改进

### 1. 版本比较
- 可以添加版本比较功能
- 显示当前版本与最新版本的差异

### 2. 版本历史
- 记录版本更新历史
- 显示版本更新日志

### 3. 自动版本检测
- 自动检测 `app.json` 中的版本变化
- 实时更新版本显示

这个更新确保了版本显示的一致性和可靠性，让用户能够看到准确的版本信息。
