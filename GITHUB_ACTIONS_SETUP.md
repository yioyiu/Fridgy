# 🚀 GitHub Actions 构建配置完整指南

本指南将帮助你完成从 EAS Build 到 GitHub Actions 的完整迁移，包括构建和上传到 App Store。

---

## ⚡ 快速开始（5个步骤）

### 步骤 1：获取 Apple Developer Team ID

1. 访问 https://developer.apple.com/account
2. 登录你的 Apple Developer 账号
3. 点击右上角的账号名称
4. 在弹出窗口中，找到 **Team ID**（格式：`ABC123DEFG`）
5. **复制这个 Team ID**

### 步骤 2：配置 ExportOptions.plist

打开 `ios/ExportOptions.plist` 文件，将 `YOUR_TEAM_ID` 替换为步骤 1 中获取的 Team ID：

```xml
<key>teamID</key>
<string>你的TeamID</string>  <!-- 替换这里 -->
```

### 步骤 3：创建 App Store Connect API Key

1. 访问 https://appstoreconnect.apple.com
2. 登录 → **Users and Access** → **Keys** 标签页
3. 点击 **+** 按钮创建新密钥
4. 输入密钥名称：`GitHub Actions`
5. 选择权限：**App Manager**
6. 点击 **Generate**
7. **重要：** 下载 `.p8` 文件（只能下载一次！）
8. 记录以下信息：
   - **Key ID**（例如：`ABC123DEFG`）
   - **Issuer ID**（在 Keys 页面顶部，例如：`12345678-1234-1234-1234-123456789012`）

### 步骤 4：生成 App 专用密码

1. 访问 https://appleid.apple.com
2. 登录 → **安全** → **App 专用密码**
3. 点击 **生成密码**
4. 输入标签：`GitHub Actions`
5. 点击 **创建**
6. **复制密码**（只显示一次！）

### 步骤 5：配置 GitHub Secrets

访问你的 GitHub 仓库：`https://github.com/yioyiu/Fridgy/settings/secrets/actions`

点击 **New repository secret**，依次添加以下 5 个 Secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `APPLE_ID` | 你的 Apple ID 邮箱 | 例如：yourname@example.com |
| `APPLE_APP_SPECIFIC_PASSWORD` | App 专用密码 | 步骤 4 生成的密码 |
| `APPSTORE_ISSUER_ID` | Issuer ID | 步骤 3 获取，格式：12345678-1234-1234-1234-123456789012 |
| `APPSTORE_API_KEY_ID` | Key ID | 步骤 3 获取，格式：ABC123DEFG |
| `APPSTORE_API_PRIVATE_KEY` | .p8 文件内容 | 步骤 3 下载的文件，复制全部内容（包括 BEGIN 和 END 行） |

**如何获取 .p8 文件内容：**
1. 用文本编辑器（VS Code、Notepad++）打开下载的 `.p8` 文件
2. 复制整个文件内容，包括：
   ```
   -----BEGIN PRIVATE KEY-----
   ...内容...
   -----END PRIVATE KEY-----
   ```
3. 粘贴到 Secret 的 Value 中

---

## 🎯 测试构建

### 方式 1：手动触发（推荐首次测试）

1. 访问你的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 左侧选择 **iOS Build (Native Xcode)**
4. 点击 **Run workflow** 按钮
5. 选择分支：`master`
6. 选择构建类型：`production`
7. 点击 **Run workflow**

### 方式 2：推送代码触发

```bash
git add ios/ExportOptions.plist
git commit -m "feat: 配置 GitHub Actions 构建"
git push origin master
```

---

## ✅ 验证构建成功

构建完成后（通常 20-30 分钟），检查：

1. **GitHub Actions 页面**
   - 构建状态显示 ✅ Success
   - 查看构建日志，确认没有错误

2. **App Store Connect**
   - 访问 https://appstoreconnect.apple.com
   - 进入你的应用 → **TestFlight** 标签页
   - 应该能看到新的构建版本

3. **构建产物**
   - 在 GitHub Actions 页面可以下载 IPA 文件

---

## 🔄 工作流程说明

GitHub Actions 会自动执行以下步骤：

1. ✅ 拉取代码
2. ✅ 安装依赖
3. ✅ 生成原生 iOS 项目（`npx expo prebuild`）
4. ✅ 安装 CocoaPods 依赖
5. ✅ 自动递增构建号
6. ✅ 使用 Xcode 构建 Archive
7. ✅ 导出 IPA 文件
8. ✅ 上传到 App Store Connect
9. ✅ 保存构建产物

**完全自动化，无需手动操作！**

---

## 📊 构建时间

- **总时间**：约 20-30 分钟
- **安装依赖**：2-3 分钟
- **构建应用**：15-20 分钟
- **上传到 App Store Connect**：2-5 分钟

---

## 🆘 常见问题

### Q: 构建失败，提示找不到 workspace？

A: GitHub Actions 会自动生成原生项目，如果失败，检查：
- 确保 `app.json` 配置正确
- 检查构建日志中的错误信息

### Q: 签名错误？

A: 检查：
1. `ios/ExportOptions.plist` 中的 Team ID 是否正确
2. GitHub Secrets 是否正确配置
3. App Store Connect API Key 是否有正确权限

### Q: 上传到 App Store Connect 失败？

A: 检查：
1. GitHub Secrets 中的 `APPSTORE_API_PRIVATE_KEY` 是否包含完整的 .p8 文件内容
2. API Key 是否已激活（创建后可能需要几分钟）
3. 检查构建日志中的具体错误信息

### Q: 如何查看构建日志？

A: 
1. 访问 GitHub Actions 页面
2. 点击构建任务
3. 查看详细日志

---

## 🎉 完成！

配置完成后，每次推送代码到 `master` 分支，GitHub Actions 会自动：
1. 构建 iOS 应用
2. 自动递增构建号
3. 上传到 App Store Connect
4. 你可以在 App Store Connect 中提交审核

---

## 📚 相关文档

- [迁移步骤](./MIGRATION_STEPS.md)
- [无 Mac 用户指南](./NO_MAC_GUIDE.md)
- [快速开始](./QUICK_START_NATIVE_BUILD.md)

---

**需要帮助？** 查看构建日志或提交 Issue。

