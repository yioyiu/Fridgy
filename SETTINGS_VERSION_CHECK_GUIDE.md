# 设置页面版本检查功能使用指南

## 功能概述

现在设置页面的版本信息项支持点击检查更新功能。用户可以手动检查是否有新版本可用。

## 新增功能

### 1. 版本信息显示
- 显示当前应用版本号（如：1.0.1）
- 显示构建号（如：4）
- 格式：`1.0.1 (4)`

### 2. 点击检查更新
- 点击版本信息项会触发版本检查
- 检查过程中显示加载图标
- 检查完成后显示相应提示

### 3. 更新提示
- 如果有新版本：显示版本更新模态框
- 如果已是最新版本：显示"您正在使用最新版本！"提示
- 如果检查失败：显示错误提示

## 使用方法

### 用户操作
1. 打开应用设置页面
2. 滚动到"关于"部分
3. 点击"版本"项
4. 等待检查完成
5. 根据结果选择相应操作

### 开发者配置

#### 1. 测试版本检查功能
```typescript
// 在 src/services/version/versionChecker.ts 中修改
const mockLatestVersion = '1.0.2'; // 设置比当前版本更高的版本号
```

#### 2. 启用开发环境版本检查
```typescript
// 在 src/services/version/config.ts 中设置
ENABLE_IN_DEVELOPMENT: true,
```

#### 3. 自定义检查间隔
```typescript
// 在 src/services/version/config.ts 中设置
CHECK_INTERVAL: 24 * 60 * 60 * 1000, // 24小时
```

## 界面变化

### 版本信息项
- **之前**：静态显示版本号，不可点击
- **现在**：显示版本号和构建号，可点击检查更新

### 交互反馈
- 点击时显示加载图标
- 检查完成后显示相应提示
- 有新版本时显示更新模态框

## 技术实现

### 1. 状态管理
```typescript
const [versionUpdateModalVisible, setVersionUpdateModalVisible] = useState(false);
const [versionInfo, setVersionInfo] = useState<any>(null);
const [isCheckingVersion, setIsCheckingVersion] = useState(false);
```

### 2. 版本检查逻辑
```typescript
const handleVersionCheck = React.useCallback(async () => {
  setIsCheckingVersion(true);
  try {
    const result = await versionChecker.checkForUpdates();
    if (result.hasUpdate && result.versionInfo) {
      setVersionInfo(result.versionInfo);
      setVersionUpdateModalVisible(true);
    } else {
      Alert.alert(t('settings.versionCheck'), t('settings.versionUpToDate'));
    }
  } catch (error) {
    Alert.alert(t('common.error'), t('settings.versionCheckError'));
  } finally {
    setIsCheckingVersion(false);
  }
}, [t]);
```

### 3. UI组件更新
```typescript
<SettingItem
  title={t('settings.version')}
  subtitle={`${versionChecker.getCurrentVersion()} (${versionChecker.getCurrentBuildNumber()})`}
  icon="information"
  onPress={handleVersionCheck}
  right={(props) => (
    <View style={styles.versionRightContainer}>
      {isCheckingVersion && (
        <MaterialCommunityIcons name="loading" size={16} color={COLORS.primary} />
      )}
      <MaterialCommunityIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
    </View>
  )}
/>
```

## 国际化支持

### 新增翻译文本
- `settings.versionCheck`: "版本检查" / "Version Check"
- `settings.versionUpToDate`: "您正在使用最新版本！" / "You are using the latest version!"
- `settings.versionCheckError`: "检查更新失败，请稍后重试。" / "Failed to check for updates. Please try again later."

## 测试方法

### 1. 测试最新版本提示
```typescript
// 在 versionChecker.ts 中设置
const mockLatestVersion = '1.0.0'; // 与当前版本相同
```

### 2. 测试有新版本提示
```typescript
// 在 versionChecker.ts 中设置
const mockLatestVersion = '1.0.2'; // 比当前版本更高
```

### 3. 测试错误处理
```typescript
// 在 versionChecker.ts 中抛出错误
throw new Error('Network error');
```

## 注意事项

1. **网络连接**：版本检查需要网络连接
2. **检查频率**：避免频繁检查，有内置的检查间隔控制
3. **用户体验**：提供清晰的加载状态和结果反馈
4. **错误处理**：妥善处理网络错误和其他异常情况

## 未来扩展

### 可能的改进
1. **检查历史**：记录用户跳过的版本
2. **自动检查**：在特定条件下自动检查
3. **版本比较**：显示更详细的版本差异
4. **更新策略**：根据版本重要性调整提示方式

这个功能为用户提供了便捷的手动版本检查方式，确保他们能够及时了解和应用更新。
