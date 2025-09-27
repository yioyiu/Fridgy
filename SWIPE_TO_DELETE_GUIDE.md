# 滑动删除功能使用指南

## 功能概述

现在设置页面的"清除所有数据"功能使用滑动删除的方式，用户需要从左往右滑动才能触发删除操作，这样可以有效避免误触。

## 新增功能

### 1. 滑动删除组件 (`src/components/ui/SwipeToDelete.tsx`)
- 基于React Native PanResponder实现
- 支持从左往右滑动触发删除
- 提供视觉反馈和确认机制
- 可配置的滑动阈值和删除阈值

### 2. 交互设计
- **滑动阈值**: 30%屏幕宽度（可配置）
- **删除阈值**: 60%屏幕宽度（可配置）
- **视觉反馈**: 滑动时背景颜色渐变
- **确认机制**: 滑动超过阈值后显示确认按钮

### 3. 安全特性
- 防止误触：需要滑动超过阈值才能触发
- 双重确认：滑动后还需要点击确认按钮
- 禁用状态：清除过程中禁用滑动操作

## 技术实现

### 1. 滑动删除组件

```typescript
interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  deleteText?: string;
  confirmText?: string;
  threshold?: number;
  disabled?: boolean;
}
```

### 2. PanResponder实现

```typescript
const panResponder = useRef(
  PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return !disabled && !isDeleting && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx > threshold) {
        setShowConfirm(true);
        // 显示确认状态
      } else {
        // 回弹到原位置
      }
    },
  })
).current;
```

### 3. 动画效果

```typescript
const progress = translateX.interpolate({
  inputRange: [0, DELETE_THRESHOLD],
  outputRange: [0, 1],
  extrapolate: 'clamp',
});

const backgroundColor = progress.interpolate({
  inputRange: [0, 0.5, 1],
  outputRange: [COLORS.surface, COLORS.warning, COLORS.error],
  extrapolate: 'clamp',
});
```

## 使用方法

### 用户操作流程

1. **找到清除数据项**
   - 打开应用设置页面
   - 滚动到"数据管理"部分
   - 找到"清除所有数据"项

2. **滑动触发删除**
   - 在"清除所有数据"项上从左往右滑动
   - 滑动距离需要超过30%屏幕宽度
   - 滑动过程中会看到背景颜色变化

3. **确认删除操作**
   - 滑动超过阈值后，会显示"确认删除"状态
   - 点击"删除"按钮确认操作
   - 或点击"取消"按钮取消操作

4. **等待清除完成**
   - 确认后开始清除数据
   - 显示加载状态
   - 清除完成后显示结果

### 滑动阈值说明

- **滑动阈值**: 30%屏幕宽度
  - 滑动距离小于此值时，会自动回弹
  - 滑动距离大于此值时，显示确认状态

- **删除阈值**: 60%屏幕宽度
  - 确认状态下的目标位置
  - 提供足够的视觉反馈

## 视觉反馈

### 1. 滑动过程
- **初始状态**: 正常背景色
- **滑动中**: 背景色逐渐变为警告色（黄色）
- **确认状态**: 背景色变为错误色（红色）

### 2. 图标和文字
- **滑动中**: 显示删除图标和"滑动删除"文字
- **确认状态**: 显示警告图标和"确认删除"文字
- **颜色变化**: 图标和文字颜色随背景色变化

### 3. 确认按钮
- **取消按钮**: 灰色背景，黑色文字
- **删除按钮**: 红色背景，白色文字
- **位置**: 右侧固定位置

## 安全机制

### 1. 防误触设计
- **滑动阈值**: 需要滑动足够距离才能触发
- **方向限制**: 只能从左往右滑动
- **禁用状态**: 清除过程中禁用滑动

### 2. 双重确认
- **滑动确认**: 滑动超过阈值
- **按钮确认**: 点击删除按钮
- **取消机制**: 可以随时取消操作

### 3. 状态管理
- **加载状态**: 清除过程中显示加载图标
- **错误处理**: 清除失败时的错误提示
- **状态重置**: 操作完成后自动重置状态

## 配置选项

### 1. 可配置参数
```typescript
interface SwipeToDeleteProps {
  deleteText?: string;        // 滑动时显示的文字
  confirmText?: string;       // 确认时显示的文字
  threshold?: number;         // 滑动阈值
  disabled?: boolean;         // 是否禁用
}
```

### 2. 默认值
- `deleteText`: "滑动删除" / "Swipe to delete"
- `confirmText`: "确认删除" / "Confirm delete"
- `threshold`: 30%屏幕宽度
- `disabled`: false

## 国际化支持

### 中文界面
- 滑动提示：滑动删除
- 确认提示：确认删除
- 按钮文字：取消 / 删除

### 英文界面
- 滑动提示：Swipe to delete
- 确认提示：Confirm delete
- 按钮文字：Cancel / Delete

## 测试方法

### 1. 功能测试
1. 在设置页面找到"清除所有数据"项
2. 尝试从左往右滑动
3. 验证滑动阈值是否正确
4. 测试确认和取消功能

### 2. 防误触测试
1. 尝试短距离滑动
2. 验证是否会自动回弹
3. 测试从右往左滑动
4. 验证是否不会触发删除

### 3. 状态测试
1. 测试禁用状态
2. 验证加载状态显示
3. 测试错误处理
4. 验证状态重置

## 注意事项

### 1. 滑动方向
- 只能从左往右滑动
- 从右往左滑动不会触发任何操作
- 垂直滑动不会影响功能

### 2. 滑动距离
- 需要滑动超过30%屏幕宽度
- 滑动距离不足会自动回弹
- 滑动距离过大不会影响功能

### 3. 状态管理
- 清除过程中禁用滑动操作
- 操作完成后自动重置状态
- 错误情况下需要手动重置

## 未来扩展

### 1. 自定义配置
- 支持自定义滑动阈值
- 支持自定义颜色主题
- 支持自定义动画效果

### 2. 更多手势
- 支持长按触发
- 支持双击确认
- 支持多点触控

### 3. 无障碍支持
- 支持屏幕阅读器
- 支持键盘导航
- 支持语音提示

这个滑动删除功能为用户提供了安全、直观的数据清除方式，有效防止了误触操作，提升了用户体验。
