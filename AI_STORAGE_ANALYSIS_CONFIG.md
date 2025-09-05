# AI 储藏分析功能配置说明

## 功能介绍
新增了AI分析功能，用户可以在overview页面点击物品卡片，系统会调用DeepSeek API分析该物品的最佳储藏时间。

## 配置步骤

### 1. 获取 DeepSeek API 密钥
1. 访问 [DeepSeek 官网](https://platform.deepseek.com/)
2. 注册账号并登录
3. 进入 API 管理页面
4. 创建新的API密钥
5. 复制生成的API密钥

### 2. 配置环境变量
在项目根目录的 `.env` 文件中添加您的 DeepSeek API 密钥：

```env
# 在 .env 文件中添加这一行：
EXPO_PUBLIC_DEEPSEEK_API_KEY=sk-your-deepseek-api-key-here
```

**注意：** 
- 请将 `sk-your-deepseek-api-key-here` 替换为您实际的API密钥
- API密钥通常以 `sk-` 开头
- 不要在代码中直接写入API密钥，务必使用环境变量

### 3. 功能使用
1. 启动应用后，进入 Overview 页面
2. 点击任意物品卡片
3. 系统会自动弹出AI分析窗口
4. 等待AI分析完成，查看最佳储藏时间建议

## 技术实现

### 核心文件
- `src/services/ai/deepseek.ts` - DeepSeek API 服务
- `src/components/ai/AIAnalysisModal.tsx` - AI分析模态框组件
- `src/app/(tabs)/overview/index.tsx` - 更新的Overview页面

### API调用流程
1. 用户点击物品卡片
2. 调用 `deepSeekService.analyzeStorageTime(itemName)`
3. 发送格式化的中文提示词到 DeepSeek API
4. 解析并展示分析结果

### 提示词格式
```
请问 "${物品名}" 最佳储藏时间为多少？以 "${物品名}" "${时长}"回答我即可
```

## 故障排除

### 常见问题
1. **API密钥无效**
   - 检查 `.env` 文件中的密钥是否正确
   - 确认密钥在DeepSeek平台上是否有效

2. **网络连接问题**
   - 检查设备网络连接
   - 确认防火墙没有阻止API调用

3. **分析失败**
   - 模态框会显示错误信息
   - 可以点击"重试"按钮重新分析

### 调试信息
开发模式下，控制台会输出详细的API调用日志，包括：
- API请求状态
- 响应内容
- 解析结果

## 安全提示
- 请勿将API密钥提交到代码仓库
- 定期轮换API密钥
- 监控API使用量，避免超出配额