# 数据清除功能使用指南

## 功能概述

现在设置页面的"清除所有数据"功能已经完整实现，可以安全地清除应用中的所有数据，包括食材数据、设置、通知和文件。

## 新增功能

### 1. 数据清除服务 (`src/services/data/dataClearService.ts`)
- 完整的数据清除逻辑
- 支持选择性清除不同类型的数据
- 完整的错误处理和用户反馈
- 支持国际化界面

### 2. 清除数据类型
- **食材数据**: 清除所有食材记录
- **设置数据**: 重置所有设置到默认值
- **通知数据**: 取消所有通知并清除通知设置
- **文件数据**: 删除应用相关的文件（CSV导出文件等）

### 3. 用户体验
- 确认对话框防止误操作
- 清除过程中显示加载状态
- 清除完成后显示详细结果
- 支持多语言界面

## 技术实现

### 1. 数据清除服务

```typescript
class DataClearService {
  // 清除食材数据
  private async clearIngredientsData(): Promise<{ success: boolean; error?: string }>
  
  // 清除设置数据
  private async clearSettingsData(): Promise<{ success: boolean; error?: string }>
  
  // 清除通知数据
  private async clearNotificationsData(): Promise<{ success: boolean; error?: string }>
  
  // 清除文件数据
  private async clearFilesData(): Promise<{ success: boolean; error?: string }>
  
  // 清除所有数据
  async clearAllData(options: ClearDataOptions): Promise<ClearDataResult>
}
```

### 2. 食材存储更新

在 `src/store/ingredients/slice.ts` 中添加了：
```typescript
clearAllIngredients: () => {
  set({ ingredients: [] });
}
```

### 3. 设置页面集成

```typescript
const handleClearAllData = React.useCallback(() => {
  dataClearService.showClearDataDialog(
    async () => {
      setIsClearingData(true);
      try {
        const result = await dataClearService.clearAllData();
        dataClearService.showClearResultDialog(result, t);
      } catch (error) {
        // 错误处理
      } finally {
        setIsClearingData(false);
      }
    },
    () => {
      // 用户取消操作
    },
    t
  );
}, [t]);
```

## 使用方法

### 用户操作流程

1. **打开设置页面**
   - 进入应用设置页面
   - 滚动到"数据管理"部分

2. **点击清除数据**
   - 点击"清除所有数据"项
   - 显示确认对话框

3. **确认清除操作**
   - 阅读警告信息
   - 点击"确定清除"确认操作

4. **等待清除完成**
   - 显示加载状态
   - 等待清除过程完成

5. **查看清除结果**
   - 显示清除成功或失败信息
   - 列出已清除的数据类型

### 清除的数据类型

#### 1. 食材数据
- 所有食材记录
- 食材统计信息
- 食材过滤和搜索状态

#### 2. 设置数据
- 通知设置（重置为默认值）
- 提醒时间设置
- 自定义位置（保留默认位置）
- 语言设置（保留当前语言）

#### 3. 通知数据
- 所有已安排的通知
- 通知权限设置
- 通知历史记录

#### 4. 文件数据
- 导出的CSV文件
- 导入的模板文件
- 其他应用相关文件

## 安全特性

### 1. 确认机制
- 双重确认防止误操作
- 清晰的警告信息
- 不可撤销操作提示

### 2. 错误处理
- 部分清除失败时的处理
- 详细的错误信息显示
- 降级处理机制

### 3. 数据保护
- 只清除应用相关数据
- 不影响系统其他应用
- 保留必要的默认设置

## 国际化支持

### 中文界面
- 确认标题：清除所有数据
- 确认消息：此操作将删除所有食材数据、设置和文件。此操作不可撤销，确定要继续吗？
- 成功消息：数据清除成功
- 错误消息：清除数据失败

### 英文界面
- 确认标题：Clear All Data
- 确认消息：This will delete all ingredient data, settings, and files. This action cannot be undone. Are you sure you want to continue?
- 成功消息：Data Cleared Successfully
- 错误消息：Failed to Clear Data

## 测试方法

### 1. 功能测试
1. 添加一些测试食材数据
2. 修改一些设置
3. 点击"清除所有数据"
4. 确认清除操作
5. 验证数据是否被清除

### 2. 错误处理测试
1. 在清除过程中模拟网络错误
2. 验证错误处理是否正常
3. 检查部分清除失败的处理

### 3. 用户体验测试
1. 测试确认对话框
2. 验证加载状态显示
3. 检查结果反馈

## 注意事项

### 1. 数据备份
- 清除前建议导出重要数据
- 使用导出功能备份食材数据
- 记录重要的自定义设置

### 2. 操作不可撤销
- 清除操作无法撤销
- 需要重新添加所有数据
- 设置会重置为默认值

### 3. 网络连接
- 清除过程不需要网络连接
- 所有操作都在本地进行
- 不会影响云端数据

## 未来扩展

### 1. 选择性清除
- 允许用户选择清除的数据类型
- 提供更细粒度的控制
- 支持部分数据清除

### 2. 数据恢复
- 添加数据恢复功能
- 支持从备份恢复数据
- 提供数据迁移工具

### 3. 清除历史
- 记录清除操作历史
- 提供操作审计功能
- 支持清除日志查看

这个数据清除功能为用户提供了安全、完整的数据管理解决方案，确保用户能够完全控制自己的数据。
