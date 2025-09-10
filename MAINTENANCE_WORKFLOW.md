# Fridgy 应用维护运营完整流程

## 📋 目录
- [开发阶段](#开发阶段)
- [版本控制](#版本控制)
- [自动化构建](#自动化构建)
- [测试与分发](#测试与分发)
- [发布流程](#发布流程)
- [故障排除](#故障排除)
- [常用命令](#常用命令)

---

## 🛠️ 开发阶段

### 1. 本地开发环境设置
```bash
# 安装依赖
npm install

# 启动开发服务器
npx expo start

# 在设备上测试
# - 扫描二维码 (Expo Go)
# - 或使用模拟器
```

### 2. 代码修改与测试
- 修改源代码文件
- 本地测试功能
- 检查控制台错误
- 验证UI/UX

---

## 📝 版本控制

### 1. 检查更改状态
```bash
# 查看修改的文件
git status

# 查看具体更改
git diff
```

### 2. 提交更改
```bash
# 添加所有更改
git add .

# 提交更改（使用描述性信息）
git commit -m "feat: 添加新功能描述"
# 或
git commit -m "fix: 修复bug描述"
# 或
git commit -m "docs: 更新文档"
```

### 3. 推送到GitHub
```bash
# 推送到主分支
git push origin master
```

---

## 🤖 自动化构建

### 1. GitHub Actions 自动触发
当代码推送到GitHub后，以下工作流会自动运行：

- **Android构建**: `.github/workflows/build-android.yml`
- **iOS构建**: `.github/workflows/build-ios.yml`

### 2. 构建环境配置
项目支持4种构建环境：

#### Development (开发环境)
```bash
eas build --platform android --profile development
```
- 🔧 包含开发工具
- 🔄 支持热重载
- 📱 内部测试用

#### Preview (预览环境)
```bash
eas build --platform android --profile preview
```
- 🧪 功能测试版本
- 📱 接近生产版本
- 🎯 内部测试用

#### Production (生产环境) ⭐
```bash
eas build --platform android --profile production
```
- 🚀 正式发布版本
- 📦 优化体积
- 🏪 应用商店用

#### Production-retry (重试环境)
```bash
eas build --platform android --profile production-retry
```
- 🔄 构建失败时重试
- 📱 与production相同
- 🎯 应用商店用

### 3. 监控构建状态
1. 访问 [GitHub Actions](https://github.com/yioyiu/Fridgy/actions)
2. 查看构建进度
3. 检查构建日志
4. 下载构建产物

---

## 🧪 测试与分发

### 1. 内部测试
```bash
# 下载构建的APK/IPA文件
# 安装到测试设备
# 进行功能测试
```

### 2. 测试分发方式

#### Android
- **直接安装**: 下载APK文件安装
- **Google Play Console**: 上传到内部测试轨道

#### iOS
- **TestFlight**: 上传到Apple TestFlight
- **Ad Hoc**: 直接安装到注册设备

---

## 🚀 发布流程

### 1. 提交到应用商店

#### Android (Google Play)
```bash
# 提交到Google Play
eas submit --platform android --profile production
```

#### iOS (App Store)
```bash
# 提交到App Store
eas submit --platform ios --profile production
```

### 2. 应用商店审核
- **Google Play**: 通常1-3天
- **App Store**: 通常1-7天

### 3. 发布管理
- 监控审核状态
- 处理审核反馈
- 发布到生产环境
- 监控用户反馈

---

## 🔧 故障排除

### 1. 构建失败
```bash
# 检查构建日志
# 查看GitHub Actions错误信息

# 常见问题：
# - Node.js版本不兼容
# - 依赖包冲突
# - 代码语法错误
# - 网络连接问题
```

### 2. 本地开发问题
```bash
# 清理缓存
npx expo start --clear

# 重新安装依赖
rm -rf node_modules
npm install

# 重置Metro缓存
npx expo start --reset-cache
```

### 3. Git问题
```bash
# 查看提交历史
git log --oneline

# 撤销最后一次提交
git reset --soft HEAD~1

# 强制推送（谨慎使用）
git push --force origin master
```

---

## 📚 常用命令

### 开发命令
```bash
# 启动开发服务器
npx expo start

# 启动Android模拟器
npx expo start --android

# 启动iOS模拟器
npx expo start --ios

# 清除缓存启动
npx expo start --clear
```

### 构建命令
```bash
# 构建Android
eas build --platform android --profile production

# 构建iOS
eas build --platform ios --profile production

# 构建所有平台
eas build --platform all --profile production

# 本地构建（需要macOS/Linux）
eas build --platform android --profile production --local
```

### 提交命令
```bash
# 提交到Google Play
eas submit --platform android

# 提交到App Store
eas submit --platform ios

# 查看提交状态
eas submit:list
```

### Git命令
```bash
# 查看状态
git status

# 添加文件
git add .

# 提交更改
git commit -m "描述信息"

# 推送更改
git push origin master

# 拉取最新代码
git pull origin master
```

---

## 🎯 最佳实践

### 1. 提交信息规范
```bash
# 功能添加
git commit -m "feat: 添加用户登录功能"

# 错误修复
git commit -m "fix: 修复登录页面崩溃问题"

# 文档更新
git commit -m "docs: 更新API文档"

# 样式调整
git commit -m "style: 调整按钮颜色"

# 重构代码
git commit -m "refactor: 重构用户管理模块"
```

### 2. 版本管理
- 使用语义化版本号 (Semantic Versioning)
- 主版本号.次版本号.修订号 (如: 1.2.3)
- 重大更新: 主版本号+1
- 新功能: 次版本号+1
- 错误修复: 修订号+1

### 3. 测试策略
- 开发阶段: 本地测试
- 预览阶段: 内部测试
- 生产阶段: 用户测试
- 发布前: 全面测试

---

## 📞 支持与帮助

### 相关链接
- [Expo文档](https://docs.expo.dev/)
- [EAS Build文档](https://docs.expo.dev/build/introduction/)
- [GitHub Actions文档](https://docs.github.com/en/actions)
- [项目仓库](https://github.com/yioyiu/Fridgy)

### 联系信息
- 项目维护者: zashglash
- 仓库地址: https://github.com/yioyiu/Fridgy
- 问题反馈: GitHub Issues

---

## 📝 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2025-01-10 | 1.0.0 | 初始版本，建立完整维护流程 |

---

*最后更新: 2025年1月10日*
