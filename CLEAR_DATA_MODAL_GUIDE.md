# 清除数据模态框使用指南

## 功能概述

清除数据模态框是一个专门用于确认删除所有应用数据的交互组件。它通过长按确认机制来防止误操作，确保用户真正想要删除数据。

## 主要特性

### 1. 长按确认机制
- **长按时间**: 需要长按2秒才能确认删除
- **进度显示**: 实时显示长按进度条
- **视觉反馈**: 按钮颜色和动画效果变化
- **防误触**: 松开手指会重置进度

### 2. 用户界面设计
- **警告图标**: 使用删除警告图标提醒用户
- **清晰说明**: 详细说明删除操作的影响
- **进度指示**: 实时显示长按进度
- **取消选项**: 随时可以取消操作

### 3. 安全机制
- **双重确认**: 点击进入模态框 + 长按确认删除
- **不可撤销提醒**: 明确告知操作不可撤销
- **操作反馈**: 提供清晰的操作状态反馈

## 使用方法

### 1. 触发模态框
```typescript
// 在设置页面点击"清除所有数据"
<SettingItem
  title={t('settings.clearAllData')}
  subtitle={t('settings.clearAllDataSubtitle')}
  icon="delete"
  onPress={handleClearAllData} // 触发模态框
/>
```

### 2. 模态框交互
```typescript
// 长按删除按钮
<TouchableOpacity
  onPressIn={handlePressIn}    // 开始长按
  onPressOut={handlePressOut}  // 结束长按
>
  <Text>长按确认删除</Text>
</TouchableOpacity>
```

### 3. 确认删除
- 长按删除按钮2秒
- 观察进度条填满
- 自动执行删除操作

## 技术实现

### 1. 组件结构
```typescript
interface ClearDataModalProps {
  visible: boolean;           // 模态框显示状态
  onClose: () => void;       // 关闭回调
  onConfirm: () => void;     // 确认删除回调
  title?: string;            // 标题文本
  message?: string;          // 说明文本
  confirmText?: string;      // 确认按钮文本
  cancelText?: string;       // 取消按钮文本
}
```

### 2. 长按逻辑
```typescript
const handlePressIn = useCallback(() => {
  setIsPressed(true);
  setPressProgress(0);

  // 进度更新定时器
  const interval = setInterval(() => {
    setPressProgress(prev => {
      const newProgress = prev + (PROGRESS_UPDATE_INTERVAL / PRESS_DURATION) * 100;
      if (newProgress >= 100) {
        clearInterval(interval);
        handleConfirm();
        return 100;
      }
      return newProgress;
    });
  }, PROGRESS_UPDATE_INTERVAL);

  // 长按完成定时器
  const timer = setTimeout(() => {
    clearInterval(interval);
    handleConfirm();
  }, PRESS_DURATION);

  setPressTimer(timer);
}, []);
```

### 3. 动画效果
```typescript
// 按压动画
Animated.spring(scaleValue, {
  toValue: 0.95,
  useNativeDriver: true,
  tension: 100,
  friction: 8,
}).start();

// 进度条动画
<View style={styles.progressBar}>
  <View
    style={[
      styles.progressFill,
      { width: `${pressProgress}%` }
    ]}
  />
</View>
```

## 样式设计

### 1. 模态框布局
```typescript
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
});
```

### 2. 删除按钮样式
```typescript
deleteButton: {
  backgroundColor: COLORS.surface,
  borderWidth: 2,
  borderColor: COLORS.error,
  borderRadius: 16,
  padding: 20,
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 80,
},
deleteButtonPressed: {
  backgroundColor: COLORS.error,
  borderColor: COLORS.error,
},
```

### 3. 进度条样式
```typescript
progressBar: {
  width: '100%',
  height: 6,
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: 3,
  overflow: 'hidden',
  marginBottom: 8,
},
progressFill: {
  height: '100%',
  backgroundColor: '#fff',
  borderRadius: 3,
},
```

## 集成步骤

### 1. 导入组件
```typescript
import { ClearDataModal } from '@/components/ui';
```

### 2. 添加状态管理
```typescript
const [clearDataModalVisible, setClearDataModalVisible] = useState(false);
```

### 3. 实现处理函数
```typescript
const handleClearAllData = React.useCallback(() => {
  setClearDataModalVisible(true);
}, []);

const handleClearDataConfirm = React.useCallback(async () => {
  setClearDataModalVisible(false);
  // 执行删除操作
}, []);

const handleClearDataCancel = React.useCallback(() => {
  setClearDataModalVisible(false);
}, []);
```

### 4. 渲染模态框
```typescript
<ClearDataModal
  visible={clearDataModalVisible}
  onClose={handleClearDataCancel}
  onConfirm={handleClearDataConfirm}
  title={t('settings.dataClear.confirmTitle')}
  message={t('settings.dataClear.confirmMessage')}
  confirmText={t('settings.dataClear.confirmButton')}
  cancelText={t('common.cancel')}
/>
```

## 用户体验优化

### 1. 视觉反馈
- **按压效果**: 按钮按下时缩小动画
- **颜色变化**: 长按时按钮变红色
- **进度显示**: 实时进度条和百分比
- **图标变化**: 删除图标提醒操作性质

### 2. 交互反馈
- **触觉反馈**: 可以添加震动反馈
- **声音反馈**: 可以添加提示音
- **状态提示**: 清晰的操作状态说明

### 3. 安全提示
- **警告图标**: 醒目的删除警告图标
- **文字说明**: 详细的操作影响说明
- **不可撤销提醒**: 明确告知操作后果

## 自定义配置

### 1. 长按时间
```typescript
const PRESS_DURATION = 2000; // 2秒，可以调整
```

### 2. 进度更新频率
```typescript
const PROGRESS_UPDATE_INTERVAL = 50; // 50ms，可以调整
```

### 3. 文本内容
```typescript
<ClearDataModal
  title="自定义标题"
  message="自定义说明文本"
  confirmText="自定义确认文本"
  cancelText="自定义取消文本"
/>
```

## 注意事项

### 1. 性能考虑
- 使用useCallback优化函数性能
- 及时清理定时器避免内存泄漏
- 使用useNativeDriver提升动画性能

### 2. 错误处理
- 添加try-catch保护删除操作
- 提供错误提示和恢复机制
- 确保状态正确重置

### 3. 无障碍支持
- 添加accessibilityLabel
- 支持屏幕阅读器
- 提供键盘导航支持

这个清除数据模态框提供了安全、直观的数据删除确认机制，通过长按操作有效防止了误删除，同时提供了良好的用户体验。
