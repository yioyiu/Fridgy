# 🚀 从 EAS Build 迁移到本地构建指南

由于 EAS Build 有构建次数限制，本指南将帮助你迁移到本地构建方案，完全摆脱 EAS Build 的限制。

---

## 📋 目录

1. [方案对比](#方案对比)
2. [方案一：GitHub Actions + Xcode（推荐）](#方案一github-actions--xcode推荐)
3. [方案二：Fastlane（如果有 Mac）](#方案二fastlane如果有-mac)
4. [方案三：纯本地 Xcode 构建](#方案三纯本地-xcode-构建)
5. [迁移步骤](#迁移步骤)
6. [常见问题](#常见问题)

---

## 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **GitHub Actions + Xcode** | ✅ 无构建次数限制<br>✅ 完全自动化<br>✅ 避免本地网络问题 | ❌ Mac runner 需要付费（但比 EAS 便宜） | ⭐⭐⭐⭐⭐ |
| **Fastlane** | ✅ 高度自动化<br>✅ 功能强大<br>✅ 无构建限制 | ❌ 需要 Mac<br>❌ 配置复杂 | ⭐⭐⭐⭐ |
| **本地 Xcode** | ✅ 完全免费<br>✅ 无限制<br>✅ 完全控制 | ❌ 需要 Mac<br>❌ 手动操作 | ⭐⭐⭐ |

---

## 方案一：GitHub Actions + Xcode（推荐）

### 为什么推荐这个方案？

1. **无构建次数限制** - GitHub Actions 按分钟计费，比 EAS Build 的按次计费更灵活
2. **完全自动化** - 推送到 GitHub 自动构建
3. **避免网络问题** - 在云端构建，不受本地网络影响
4. **成本可控** - GitHub 提供免费额度，超出后按分钟计费

### 前置要求

1. **GitHub 账号**（已有）
2. **Apple Developer 账号**（$99/年，已有）
3. **App Store Connect API Key**（用于自动上传）

### 步骤 1：生成原生 iOS 项目

```bash
# 安装依赖
npm install

# 生成原生 iOS 项目（首次运行）
npx expo prebuild --platform ios

# 这会创建 ios/ 目录和原生项目文件
```

### 步骤 2：创建 App Store Connect API Key

1. 访问 https://appstoreconnect.apple.com
2. 进入 **Users and Access** → **Keys**
3. 点击 **+** 创建新密钥
4. 选择 **App Manager** 权限
5. 下载 `.p8` 密钥文件（只能下载一次！）
6. 记录以下信息：
   - **Key ID**（例如：ABC123DEFG）
   - **Issuer ID**（在 Keys 页面顶部，例如：12345678-1234-1234-1234-123456789012）

### 步骤 3：配置 GitHub Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. **APPLE_ID** - 你的 Apple ID 邮箱
2. **APPLE_APP_SPECIFIC_PASSWORD** - App 专用密码（在 appleid.apple.com 生成）
3. **APPSTORE_ISSUER_ID** - 从步骤 2 获取
4. **APPSTORE_API_KEY_ID** - Key ID（从步骤 2 获取）
5. **APPSTORE_API_PRIVATE_KEY** - `.p8` 文件内容（复制整个文件内容）
6. **EXPO_TOKEN** - （可选，如果还需要 EAS Updates）

### 步骤 4：创建新的 GitHub Actions Workflow

创建 `.github/workflows/ios-build-native.yml`：

```yaml
name: iOS Build (Native Xcode)

on:
  push:
    branches: [master, main]
    paths:
      - 'app.json'
      - 'package.json'
      - 'ios/**'
      - '.github/workflows/ios-build-native.yml'
  workflow_dispatch:
    inputs:
      build_type:
        description: 'Build type (development/preview/production)'
        required: false
        default: 'production'
        type: choice
        options:
          - development
          - preview
          - production

permissions:
  contents: read

jobs:
  build:
    name: Build iOS App with Xcode
    runs-on: macos-latest
    timeout-minutes: 60

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci --silent

      - name: Setup Expo CLI
        run: npm install -g @expo/cli@latest

      - name: Prebuild iOS project
        run: npx expo prebuild --platform ios --clean

      - name: Install CocoaPods dependencies
        run: |
          cd ios
          pod install
          cd ..

      - name: Bump iOS build number
        run: |
          if ! npm run bump:ios-build; then
            echo "::warning::Failed to bump iOS build number, continuing with existing build number"
          fi

      - name: Setup Xcode
        uses: maxim-lobanov/setup-xcode@v1
        with:
          xcode-version: latest-stable

      - name: Build Archive
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_APP_SPECIFIC_PASSWORD: ${{ secrets.APPLE_APP_SPECIFIC_PASSWORD }}
        run: |
          xcodebuild -workspace ios/Fridgy.xcworkspace \
            -scheme Fridgy \
            -configuration Release \
            -archivePath build/Fridgy.xcarchive \
            -allowProvisioningUpdates \
            archive

      - name: Export IPA
        run: |
          xcodebuild -exportArchive \
            -archivePath build/Fridgy.xcarchive \
            -exportPath build \
            -exportOptionsPlist ios/ExportOptions.plist \
            -allowProvisioningUpdates

      - name: Upload to App Store Connect
        uses: apple-actions/upload-testflight-build@v1
        with:
          app-path: build/Fridgy.ipa
          issuer-id: ${{ secrets.APPSTORE_ISSUER_ID }}
          api-key-id: ${{ secrets.APPSTORE_API_KEY_ID }}
          api-private-key: ${{ secrets.APPSTORE_API_PRIVATE_KEY }}

      - name: Upload IPA artifact
        uses: actions/upload-artifact@v4
        with:
          name: ios-build
          path: build/Fridgy.ipa
          retention-days: 30
```

### 步骤 5：创建 ExportOptions.plist

创建 `ios/ExportOptions.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>compileBitcode</key>
    <false/>
    <key>signingStyle</key>
    <string>automatic</string>
</dict>
</plist>
```

**注意：** 将 `YOUR_TEAM_ID` 替换为你的 Apple Developer Team ID（在 Apple Developer 账号中查看）

### 步骤 6：更新 .gitignore

确保 `.gitignore` 包含：

```
# iOS
ios/Pods/
ios/build/
ios/*.xcworkspace/xcuserdata/
ios/*.xcodeproj/xcuserdata/
ios/*.xcarchive
build/
*.ipa
*.dSYM.zip
```

---

## 方案二：Fastlane（如果有 Mac）

### 安装 Fastlane

```bash
# 使用 Homebrew 安装（推荐）
brew install fastlane

# 或使用 RubyGems
sudo gem install fastlane
```

### 初始化 Fastlane

```bash
# 确保已生成原生项目
npx expo prebuild --platform ios

# 进入 iOS 目录
cd ios

# 初始化 Fastlane
fastlane init
```

### 配置 Fastfile

编辑 `ios/fastlane/Fastfile`：

```ruby
default_platform(:ios)

platform :ios do
  desc "构建并上传到 App Store"
  lane :release do
    # 增加构建号
    increment_build_number(
      xcodeproj: "Fridgy.xcodeproj"
    )
    
    # 构建应用
    build_app(
      workspace: "Fridgy.xcworkspace",
      scheme: "Fridgy",
      export_method: "app-store",
      export_options: {
        method: "app-store",
        uploadBitcode: false,
        uploadSymbols: true,
        compileBitcode: false
      }
    )
    
    # 上传到 App Store Connect
    upload_to_app_store(
      skip_metadata: true,
      skip_screenshots: true,
      force: true
    )
  end
  
  desc "仅构建（不上传）"
  lane :build_only do
    build_app(
      workspace: "Fridgy.xcworkspace",
      scheme: "Fridgy",
      export_method: "app-store"
    )
  end
  
  desc "构建并上传到 TestFlight"
  lane :testflight do
    release
  end
end
```

### 配置 Appfile

编辑 `ios/fastlane/Appfile`：

```ruby
app_identifier("com.fridgy.app")
apple_id("your-apple-id@example.com")
team_id("YOUR_TEAM_ID")
```

### 使用 Fastlane

```bash
# 构建并上传到 App Store
fastlane ios release

# 仅构建
fastlane ios build_only
```

### 添加到 package.json

```json
{
  "scripts": {
    "ios:build": "cd ios && fastlane ios build_only",
    "ios:release": "cd ios && fastlane ios release"
  }
}
```

---

## 方案三：纯本地 Xcode 构建

### 步骤

1. **生成原生项目**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **在 Xcode 中打开**
   ```bash
   open ios/Fridgy.xcworkspace
   ```

3. **配置签名**
   - 选择项目 → Target → Signing & Capabilities
   - 选择你的 Team
   - Xcode 会自动管理证书

4. **构建 Archive**
   - Product → Scheme → Fridgy
   - 选择 "Any iOS Device"
   - Product → Archive

5. **上传到 App Store Connect**
   - Archive 完成后，Organizer 窗口打开
   - 选择 Archive → Distribute App
   - 选择 App Store Connect → Upload

---

## 迁移步骤

### 阶段 1：准备原生项目

```bash
# 1. 生成原生 iOS 项目
npx expo prebuild --platform ios

# 2. 测试本地构建（如果有 Mac）
cd ios
pod install
cd ..
npx expo run:ios
```

### 阶段 2：配置 GitHub Actions（推荐）

1. 按照"方案一"的步骤配置 GitHub Actions
2. 测试构建流程
3. 禁用或删除旧的 EAS Build workflow

### 阶段 3：更新文档

更新 `APP_STORE_RELEASE_GUIDE.md`，移除 EAS Build 相关说明。

### 阶段 4：清理 EAS 配置（可选）

如果完全不再使用 EAS Build：

```bash
# 删除 eas.json（可选，如果还需要 EAS Updates 则保留）
# rm eas.json

# 从 package.json 移除 EAS CLI（如果不再需要）
# npm uninstall -g eas-cli
```

---

## 成本对比

### EAS Build
- **免费计划**：每月 30 次构建
- **付费计划**：$29/月起，按构建次数计费
- **问题**：容易超出限制

### GitHub Actions
- **免费额度**：每月 2000 分钟（Mac runner）
- **超出后**：$0.008/分钟（Mac runner）
- **优势**：按分钟计费，更灵活

**示例计算**：
- 一次 iOS 构建约 20-30 分钟
- 每月 30 次构建 = 600-900 分钟
- 免费额度内完全免费！
- 超出后约 $4.8-7.2/月（比 EAS 便宜）

---

## 常见问题

### Q: 我没有 Mac，可以使用 GitHub Actions 吗？
A: 可以！GitHub Actions 提供 Mac runner，你不需要本地 Mac。

### Q: 如何获取 Team ID？
A: 
1. 访问 https://developer.apple.com/account
2. 右上角点击你的账号
3. Team ID 显示在团队名称下方

### Q: 如何生成 App 专用密码？
A:
1. 访问 https://appleid.apple.com
2. 登录 → 安全 → App 专用密码
3. 生成新密码并保存

### Q: 可以同时使用 EAS Build 和本地构建吗？
A: 可以！你可以保留 EAS Build 作为备选方案，主要使用本地构建。

### Q: 本地构建会影响 Expo Updates 吗？
A: 不会。Expo Updates 是独立的服务，与构建方式无关。

### Q: 如何回退到 EAS Build？
A: 只需使用旧的 GitHub Actions workflow 或直接运行 `eas build`。

---

## 推荐迁移路径

### 立即执行（今天）

1. ✅ 生成原生 iOS 项目
2. ✅ 创建 App Store Connect API Key
3. ✅ 配置 GitHub Secrets
4. ✅ 创建新的 GitHub Actions workflow

### 测试阶段（本周）

1. ✅ 测试 GitHub Actions 构建
2. ✅ 验证上传到 App Store Connect
3. ✅ 确认构建产物正确

### 正式切换（下周）

1. ✅ 禁用旧的 EAS Build workflow
2. ✅ 更新团队文档
3. ✅ 通知团队成员

---

## 下一步

1. **立即开始**：按照"方案一"配置 GitHub Actions
2. **测试构建**：推送到 GitHub 测试新流程
3. **逐步迁移**：先并行运行，确认稳定后切换

---

**需要帮助？** 如果遇到问题，请查看：
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Expo Prebuild 文档](https://docs.expo.dev/workflow/prebuild/)
- [Xcode 构建文档](https://developer.apple.com/documentation/xcode)

---

**最后更新：** 2024年12月

