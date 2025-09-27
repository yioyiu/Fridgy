# 🍎 Fridgy - 智能食材管理应用

一个基于AI的智能食材管理应用，帮助用户管理家庭食材、避免浪费、减少食物过期。

## 📱 应用信息

- **应用名称**: Fridgy
- **当前版本**: 1.1.0
- **平台**: iOS & Android
- **开发框架**: React Native + Expo

## ✨ 核心功能

### 🤖 AI智能分析
- **AI食材分析**: 基于智谱AI和DeepSeek AI的智能食材建议
- **当季水果推荐**: 智能推荐当前季节的最佳水果
- **营养建议**: AI驱动的营养搭配建议
- **保存技巧**: 智能食材保存方法推荐

### 🎤 语音识别
- **语音输入**: 支持语音添加食材
- **多语言支持**: 中文语音识别
- **实时转录**: 语音转文字功能
- **Web端支持**: 浏览器端真实语音识别

### 📊 智能统计
- **食材状态追踪**: 新鲜、即将过期、已过期、已使用
- **数据分析**: 详细的食材使用统计
- **趋势分析**: 食材消耗趋势图表
- **当季水果卡片**: AI驱动的季节性水果信息

### 🗂 食材管理
- **快速添加**: 一键添加常用食材
- **批量操作**: 支持批量编辑和删除
- **滑动删除**: 直观的滑动删除操作
- **长按编辑**: 长按快速编辑食材信息

### 🔔 智能通知
- **过期提醒**: 智能食材过期提醒
- **季节性通知**: 当季水果推荐通知
- **自定义提醒**: 个性化提醒设置

### 🎨 用户体验
- **现代化UI**: 简洁美观的界面设计
- **滑动导航**: 流畅的页面切换体验
- **主题适配**: 自动适配系统主题
- **响应式设计**: 适配不同屏幕尺寸

## 🛠 技术栈

### 前端技术
- **React Native**: 跨平台移动应用开发
- **Expo**: 开发工具链和部署平台
- **TypeScript**: 类型安全的JavaScript
- **Expo Router**: 文件系统路由

### 状态管理
- **Zustand**: 轻量级状态管理
- **React Query**: 数据获取和缓存

### AI服务
- **智谱AI**: 主要AI服务提供商
- **DeepSeek AI**: 备用AI服务
- **本地数据**: 离线数据支持

### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **GitHub Actions**: CI/CD自动化

## 📁 项目结构

```
src/
├── app/                    # Expo Router应用目录
│   ├── (tabs)/           # 主标签导航
│   │   ├── index.tsx      # 主页面
│   │   ├── overview/      # 概览页面
│   │   ├── statistics/    # 统计页面
│   │   ├── settings/      # 设置页面
│   │   └── SwipeLayout.tsx # 滑动布局
│   └── _layout.tsx        # 根布局
├── components/            # 可复用组件
│   ├── ai/               # AI相关组件
│   │   ├── AIAnalysisModal.tsx
│   │   ├── CookingAdviceModal.tsx
│   │   └── SeasonalFruitsCard.tsx
│   ├── ingredients/      # 食材相关组件
│   │   ├── IngredientCard.tsx
│   │   ├── QuickAddModal.tsx
│   │   ├── EditIngredientModal.tsx
│   │   └── VoiceInputButton.tsx
│   ├── navigation/       # 导航组件
│   ├── onboarding/      # 引导页面
│   └── ui/              # 基础UI组件
├── services/            # 服务层
│   ├── ai/              # AI服务
│   │   ├── aiManager.ts
│   │   ├── zhipu.ts
│   │   ├── deepseek.ts
│   │   └── seasonalFruits.ts
│   ├── notifications/   # 通知服务
│   ├── data/            # 数据服务
│   └── version/         # 版本管理
├── store/               # 状态管理
│   ├── ingredients/     # 食材状态
│   └── settings/       # 设置状态
├── hooks/               # 自定义Hooks
│   ├── useSpeechRecognition.ts
│   └── useVersionCheck.ts
└── utils/               # 工具函数
    ├── constants/       # 常量定义
    ├── helpers/         # 辅助函数
    └── types/           # 类型定义
```

## 🚀 快速开始

### 环境要求
- Node.js (v18或更高版本)
- npm 或 yarn
- Expo CLI
- iOS Simulator 或 Android Emulator

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/yioyiu/Fridgy.git
   cd Fridgy
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   ```

4. **运行应用**
   - 按 `i` 启动iOS模拟器
   - 按 `a` 启动Android模拟器
   - 用手机扫描二维码使用Expo Go应用

## 🔧 配置说明

### AI服务配置
1. **智谱AI**: 在环境变量中设置 `ZHIPU_API_KEY`
2. **DeepSeek AI**: 在环境变量中设置 `DEEPSEEK_API_KEY`

### 语音识别配置
- **Web端**: 自动支持Web Speech API
- **移动端**: 需要开发构建版本才能使用真实语音识别

### 通知配置
- 确保应用有通知权限
- 配置推送通知服务

## 📱 功能演示

### 主要界面
- **主页面**: 食材列表和快速添加
- **统计页面**: 数据分析和当季水果推荐
- **设置页面**: 应用配置和版本管理
- **概览页面**: 食材状态总览

### 交互功能
- **语音输入**: 点击麦克风图标进行语音输入
- **滑动删除**: 向左滑动删除食材
- **长按编辑**: 长按食材卡片进行编辑
- **AI分析**: 点击AI图标获取智能建议

## 🔄 版本历史

### v1.1.0 (当前版本)
- ✨ 新增语音识别功能
- ✨ 新增AI智能分析
- ✨ 新增当季水果推荐
- ✨ 新增滑动删除功能
- ✨ 新增季节性通知
- 🎨 优化UI/UX设计
- 🔧 改进数据管理

### v1.0.2
- 基础食材管理功能
- 状态追踪和提醒
- 基础UI组件

## 🚀 部署

### 开发构建
```bash
# Android
eas build --platform android --profile development

# iOS
eas build --platform ios --profile development
```

### 生产构建
```bash
# Android
eas build --platform android --profile production

# iOS
eas build --platform ios --profile production
```

### 自动部署
- 使用GitHub Actions进行自动构建
- 支持Android和iOS平台
- 自动版本号递增

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请在GitHub仓库中创建Issue。

## 🙏 致谢

感谢所有贡献者和开源社区的支持！

---

**Fridgy** - 让食材管理更智能，让生活更美好！ 🍎✨