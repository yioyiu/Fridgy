# 毛玻璃效果使用指南

## 概述
本应用已成功集成了毛玻璃效果（Glassmorphism），为导航栏提供了现代化的半透明毛玻璃外观。

## 已实现的功能

### 1. 底部导航栏毛玻璃效果
- 底部Tab Bar现在具有半透明的毛玻璃效果
- 支持背景模糊和半透明边框
- 保持了原有的圆角和阴影效果

### 2. GlassmorphismView 组件
创建了一个可复用的毛玻璃效果组件，支持以下属性：

```typescript
interface GlassmorphismViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'light' | 'dark' | 'xlight' | 'regular' | 'prominent';
  blurAmount?: number;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
}
```

## 使用方法

### 基本用法
```tsx
import { GlassmorphismView } from '@/components/ui/GlassmorphismView';

<GlassmorphismView
  style={styles.container}
  blurType="light"
  blurAmount={20}
  backgroundColor="rgba(255, 255, 255, 0.15)"
  borderColor="rgba(255, 255, 255, 0.3)"
>
  <Text>毛玻璃内容</Text>
</GlassmorphismView>
```

### 高级配置
```tsx
<GlassmorphismView
  blurType="dark"
  blurAmount={30}
  intensity={90}
  backgroundColor="rgba(0, 0, 0, 0.2)"
  borderColor="rgba(255, 255, 255, 0.1)"
  borderWidth={2}
>
  <YourContent />
</GlassmorphismView>
```

## 技术实现

### 依赖库
- `@react-native-community/blur`: 提供原生模糊效果支持

### 关键特性
1. **原生性能**: 使用原生模糊API，性能优异
2. **跨平台支持**: 支持iOS和Android
3. **可定制性**: 支持多种模糊类型和强度
4. **回退机制**: 在不支持模糊的设备上提供回退颜色

## 效果参数说明

### blurType 选项
- `light`: 浅色模糊（适合浅色背景）
- `dark`: 深色模糊（适合深色背景）
- `xlight`: 超浅色模糊
- `regular`: 常规模糊
- `prominent`: 突出模糊

### 推荐配置
- **浅色主题**: `blurType="light"`, `blurAmount={20}`
- **深色主题**: `blurType="dark"`, `blurAmount={25}`
- **高对比度**: `blurType="prominent"`, `blurAmount={30}`

## 注意事项

1. **性能考虑**: 毛玻璃效果会消耗一定的GPU资源，建议适度使用
2. **兼容性**: 确保在目标设备上测试效果
3. **可访问性**: 确保文字在毛玻璃背景上仍然清晰可读

## 未来扩展

可以考虑添加的功能：
- 动态模糊强度调整
- 主题切换时的毛玻璃效果适配
- 更多预设的毛玻璃样式
- 动画过渡效果
