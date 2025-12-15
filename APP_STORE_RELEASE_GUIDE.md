# 📱 App Store 发布完整流程指南

## 🎯 完整流程概览

```
更新代码 → 提交到GitHub → 构建应用 → 提交到App Store → 等待审核 → 发布
```

---

## 📝 第一步：更新代码并提交

### 1.1 修改代码
```bash
# 在本地修改代码文件
# 测试功能确保正常
```

### 1.2 检查更改
```bash
git status                    # 查看修改的文件
git diff                      # 查看具体更改内容
```

### 1.3 提交更改
```bash
git add .                     # 添加所有更改
git commit -m "feat: 更新功能描述"  # 提交更改
git push origin master        # 推送到GitHub
```

**注意：**
- `.env` 文件不要提交（包含敏感信息）
- 确保代码已测试通过
- 使用清晰的提交信息

---

## 🏗️ 第二步：构建应用

### 方式一：使用 GitHub Actions（推荐）⭐

#### 2.1 自动触发构建
当代码推送到 `master` 分支时，GitHub Actions 会自动触发构建：
- **iOS构建**: `.github/workflows/ios-build.yml`
- **Android构建**: `.github/workflows/android-build.yml`

#### 2.2 手动触发构建
1. 访问 [GitHub Actions](https://github.com/yioyiu/Fridgy/actions)
2. 选择 "iOS Build" 或 "Android Build"
3. 点击 "Run workflow"
4. 选择构建类型：
   - `production` - 生产版本（用于App Store）
   - `preview` - 预览版本（测试用）
   - `development` - 开发版本
5. 点击 "Run workflow" 开始构建

#### 2.3 监控构建状态
1. 在 GitHub Actions 页面查看构建进度
2. 等待构建完成（通常需要 15-30 分钟）
3. 构建完成后，可以下载构建产物（.ipa 或 .apk）

### 方式二：本地构建（需要网络稳定）

#### iOS 构建
```bash
eas build --platform ios --profile production
```

#### Android 构建
```bash
eas build --platform android --profile production
```

**构建过程：**
- 自动递增版本号（iOS buildNumber / Android versionCode）
- 上传项目文件到 EAS Build 服务器
- 在云端构建应用
- 生成可安装的应用文件

---

## 📤 第三步：提交到 App Store

### 方式一：使用 EAS Submit（推荐）⭐

#### 3.1 提交 iOS 到 App Store
```bash
eas submit --platform ios --profile production
```

**提交过程：**
- 自动查找最新的 production 构建
- 上传到 App Store Connect
- 自动处理证书和配置

#### 3.2 提交 Android 到 Google Play
```bash
eas submit --platform android --profile production
```

### 方式二：手动提交

#### iOS 手动提交
1. 访问 [App Store Connect](https://appstoreconnect.apple.com/)
2. 选择您的应用
3. 创建新版本
4. 上传 .ipa 文件（从构建产物下载）
5. 填写版本信息、截图、描述等
6. 提交审核

#### Android 手动提交
1. 访问 [Google Play Console](https://play.google.com/console/)
2. 选择您的应用
3. 创建新版本
4. 上传 .aab 或 .apk 文件
5. 填写版本信息
6. 提交审核

---

## ⏳ 第四步：等待审核

### iOS App Store 审核
- **审核时间**: 通常 1-7 天
- **状态查看**: App Store Connect
- **常见状态**:
  - `等待审核` → `审核中` → `待发布` → `已发布`

### Google Play 审核
- **审核时间**: 通常 1-3 天
- **状态查看**: Google Play Console
- **常见状态**:
  - `待审核` → `审核中` → `已发布`

---

## ✅ 第五步：发布应用

### 审核通过后
1. **iOS**: 在 App Store Connect 中点击"发布此版本"
2. **Android**: 在 Google Play Console 中点击"发布"

### 发布后
- 应用会在几小时内出现在应用商店
- 用户可以下载和更新应用
- 监控用户反馈和崩溃报告

---

## 🔄 快速发布流程（总结）

### 最简单的方式：

```bash
# 1. 更新代码并推送
git add .
git commit -m "更新内容"
git push origin master

# 2. 等待 GitHub Actions 自动构建完成
# （访问 https://github.com/yioyiu/Fridgy/actions 查看）

# 3. 构建完成后，提交到 App Store
eas submit --platform ios --profile production
eas submit --platform android --profile production

# 4. 等待审核通过，然后发布
```

---

## 📋 发布前检查清单

### 代码检查
- [ ] 所有功能已测试通过
- [ ] 没有控制台错误
- [ ] 版本号已更新（app.json）
- [ ] 代码已提交到 GitHub

### 配置检查
- [ ] `app.json` 中的版本信息正确
- [ ] iOS bundle identifier 正确
- [ ] Android package name 正确
- [ ] 应用图标和启动画面已更新

### 构建检查
- [ ] 构建成功完成
- [ ] 构建产物已下载（可选）
- [ ] 构建版本号已自动递增

### 提交检查
- [ ] 已提交到 App Store Connect / Google Play Console
- [ ] 版本信息已填写
- [ ] 截图和描述已更新
- [ ] 隐私政策链接已添加（如需要）

---

## 🛠️ 常用命令速查

### Git 命令
```bash
git status              # 查看状态
git add .                # 添加所有更改
git commit -m "消息"     # 提交更改
git push origin master   # 推送到GitHub
```

### 构建命令
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# 查看构建列表
eas build:list
```

### 提交命令
```bash
# iOS
eas submit --platform ios --profile production

# Android
eas submit --platform android --profile production

# 查看提交状态
eas submit:list
```

### 查看构建/提交状态
```bash
# 查看构建详情
eas build:view [BUILD_ID]

# 查看提交详情
eas submit:view [SUBMIT_ID]
```

---

## 🚨 常见问题

### 1. 构建失败
- **检查**: GitHub Actions 日志
- **常见原因**: 
  - 代码语法错误
  - 依赖包冲突
  - 网络连接问题
- **解决**: 修复错误后重新构建

### 2. 提交失败
- **检查**: EAS 提交日志
- **常见原因**:
  - 证书问题
  - App Store Connect 配置问题
- **解决**: 检查证书和配置

### 3. 审核被拒
- **查看**: App Store Connect / Google Play Console 的审核反馈
- **解决**: 根据反馈修改后重新提交

---

## 📞 获取帮助

- **EAS 文档**: https://docs.expo.dev/build/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Google Play Console**: https://play.google.com/console/
- **GitHub Actions**: https://github.com/yioyiu/Fridgy/actions

---

*最后更新: 2025年1月10日*

