# 🔄 迁移步骤：从 EAS Build 到 GitHub Actions

本指南将帮助你完成从 EAS Build 到 GitHub Actions 的迁移。

---

## 📋 迁移前准备清单

在开始之前，请确保你有：

- [ ] GitHub 账号（已有）
- [ ] Apple Developer 账号（$99/年，已有）
- [ ] 访问 App Store Connect 的权限
- [ ] Windows/Linux/Mac 电脑（用于开发）

---

## 🚀 迁移步骤（按顺序执行）

### 步骤 1：生成原生 iOS 项目（如果还没有）

```bash
# 在项目根目录运行
npm run prebuild:ios
```

**说明：**
- 这会创建 `ios/` 目录和原生项目文件
- 如果 `ios/` 目录已存在，可以跳过此步骤
- 在 Windows 上也可以运行，不需要 Mac

### 步骤 2：创建 App Store Connect API Key

1. 访问 https://appstoreconnect.apple.com
2. 登录你的 Apple Developer 账号
3. 进入 **Users and Access** → **Keys** 标签页
4. 点击 **+** 按钮创建新密钥
5. 输入密钥名称（例如：GitHub Actions）
6. 选择 **App Manager** 权限
7. 点击 **Generate**
8. **重要：** 下载 `.p8` 文件（只能下载一次！）
9. 记录以下信息：
   - **Key ID**（例如：ABC123DEFG）- 显示在密钥列表中
   - **Issuer ID**（在 Keys 页面顶部，格式：12345678-1234-1234-1234-123456789012）

### 步骤 3：获取 Apple Developer Team ID

1. 访问 https://developer.apple.com/account
2. 登录你的 Apple Developer 账号
3. 点击右上角的账号名称
4. 在弹出窗口中，找到 **Team ID**（格式：ABC123DEFG）
5. 复制这个 Team ID

### 步骤 4：创建 ExportOptions.plist

```bash
# Windows PowerShell
copy ios\ExportOptions.plist.example ios\ExportOptions.plist

# Mac/Linux
cp ios/ExportOptions.plist.example ios/ExportOptions.plist
```

然后用文本编辑器打开 `ios/ExportOptions.plist`，将 `YOUR_TEAM_ID` 替换为步骤 3 中获取的 Team ID：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>你的TeamID</string>  <!-- 替换这里，例如：ABC123DEFG -->
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

### 步骤 5：生成 App 专用密码

1. 访问 https://appleid.apple.com
2. 登录你的 Apple ID
3. 进入 **安全** 标签页
4. 找到 **App 专用密码** 部分
5. 点击 **生成密码**
6. 输入标签（例如：GitHub Actions）
7. 点击 **创建**
8. **复制密码**（只显示一次！）

### 步骤 6：配置 GitHub Secrets

1. 访问你的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret** 按钮
5. 依次添加以下 5 个 Secrets：

#### Secret 1: APPLE_ID
- **Name**: `APPLE_ID`
- **Value**: 你的 Apple ID 邮箱（例如：yourname@example.com）

#### Secret 2: APPLE_APP_SPECIFIC_PASSWORD
- **Name**: `APPLE_APP_SPECIFIC_PASSWORD`
- **Value**: 步骤 5 中生成的 App 专用密码

#### Secret 3: APPSTORE_ISSUER_ID
- **Name**: `APPSTORE_ISSUER_ID`
- **Value**: 步骤 2 中获取的 Issuer ID（格式：12345678-1234-1234-1234-123456789012）

#### Secret 4: APPSTORE_API_KEY_ID
- **Name**: `APPSTORE_API_KEY_ID`
- **Value**: 步骤 2 中获取的 Key ID（格式：ABC123DEFG）

#### Secret 5: APPSTORE_API_PRIVATE_KEY
- **Name**: `APPSTORE_API_PRIVATE_KEY`
- **Value**: 步骤 2 中下载的 `.p8` 文件的完整内容

**如何获取 .p8 文件内容：**
1. 用文本编辑器（如 Notepad++、VS Code）打开下载的 `.p8` 文件
2. 复制整个文件内容（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
3. 粘贴到 Secret 的 Value 中

### 步骤 7：提交配置文件

```bash
# 添加新文件
git add ios/ExportOptions.plist
git add .github/workflows/ios-build-native.yml

# 提交更改
git commit -m "feat: 迁移到 GitHub Actions 构建"

# 推送到 GitHub
git push origin master
```

### 步骤 8：测试新构建

有两种方式测试：

#### 方式 1：手动触发（推荐首次测试）

1. 访问你的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 左侧选择 **iOS Build (Native Xcode)**
4. 点击 **Run workflow** 按钮
5. 选择分支（master/main）
6. 选择构建类型（production）
7. 点击 **Run workflow**

#### 方式 2：推送代码触发

```bash
# 修改任意文件（例如更新版本号）
# 然后提交推送
git add .
git commit -m "test: 测试 GitHub Actions 构建"
git push origin master
```

### 步骤 9：验证构建成功

1. 在 GitHub Actions 页面查看构建进度
2. 等待构建完成（通常 20-30 分钟）
3. 检查构建日志，确保没有错误
4. 验证 IPA 文件已上传到 App Store Connect

### 步骤 10：禁用旧的 EAS Build Workflow（可选）

如果新构建成功，可以禁用旧的 EAS Build workflow：

编辑 `.github/workflows/ios-build.yml`，在文件开头添加：

```yaml
# 已迁移到 GitHub Actions 本地构建
# 此 workflow 已禁用，如需使用请手动触发
```

或者重命名文件：

```bash
# Windows PowerShell
Rename-Item .github\workflows\ios-build.yml .github\workflows\ios-build.yml.disabled

# Mac/Linux
mv .github/workflows/ios-build.yml .github/workflows/ios-build.yml.disabled
```

---

## ✅ 迁移完成检查清单

- [ ] 已生成 `ios/` 目录
- [ ] 已创建 `ios/ExportOptions.plist`（包含正确的 Team ID）
- [ ] 已创建 App Store Connect API Key
- [ ] 已配置所有 5 个 GitHub Secrets
- [ ] 已提交配置文件到 GitHub
- [ ] 已测试 GitHub Actions 构建
- [ ] 构建成功完成
- [ ] IPA 已上传到 App Store Connect
- [ ] （可选）已禁用旧的 EAS Build workflow

---

## 🆘 常见问题

### Q: 构建失败，提示找不到 workspace？

A: 确保已运行 `npm run prebuild:ios` 生成原生项目。如果 `ios/` 目录存在但缺少文件，可以删除后重新生成：

```bash
# Windows PowerShell
Remove-Item -Recurse -Force ios
npm run prebuild:ios

# Mac/Linux
rm -rf ios
npm run prebuild:ios
```

### Q: 签名错误？

A: 检查以下几点：
1. `ExportOptions.plist` 中的 Team ID 是否正确
2. GitHub Secrets 中的 `APPSTORE_API_KEY_ID` 和 `APPSTORE_API_PRIVATE_KEY` 是否正确
3. App Store Connect API Key 是否有正确的权限

### Q: 上传到 App Store Connect 失败？

A: 检查：
1. GitHub Secrets 是否正确配置
2. `.p8` 文件内容是否完整（包括 BEGIN 和 END 行）
3. API Key 是否已激活（创建后可能需要几分钟）

### Q: 如何查看构建日志？

A: 
1. 访问 GitHub 仓库
2. 点击 **Actions** 标签页
3. 点击构建任务
4. 查看详细日志

### Q: 可以同时使用 EAS Build 和 GitHub Actions 吗？

A: **可以！** 你可以保留 EAS Build 作为备选方案。只需：
- 使用不同的 workflow 文件
- 根据需要选择使用哪个

### Q: 构建时间太长？

A: GitHub Actions 构建通常需要 20-30 分钟，包括：
- 安装依赖：2-3 分钟
- 构建应用：15-20 分钟
- 上传到 App Store Connect：2-5 分钟

这是正常的，比 EAS Build 稍慢，但没有构建次数限制。

---

## 📊 对比：迁移前后

| 特性 | EAS Build | GitHub Actions |
|------|-----------|----------------|
| **构建次数限制** | 30次/月（免费） | 2000分钟/月（免费，约60-100次） |
| **需要 Mac** | ❌ | ❌ |
| **自动化** | ✅ | ✅ |
| **成本** | 超出后按次计费 | $0.008/分钟 |
| **网络问题** | 可能遇到 | 云端构建，稳定 |

---

## 🎯 下一步

迁移完成后：

1. **监控构建** - 查看前几次构建是否稳定
2. **更新文档** - 更新团队文档，说明新的构建流程
3. **通知团队** - 告知团队成员新的构建方式
4. **清理旧配置** - （可选）删除不再需要的 EAS Build 配置

---

## 📚 相关文档

- [无 Mac 用户指南](./NO_MAC_GUIDE.md)
- [快速开始指南](./QUICK_START_NATIVE_BUILD.md)
- [完整迁移指南](./MIGRATE_FROM_EAS_BUILD.md)

---

**需要帮助？** 如果遇到问题，请查看构建日志或提交 Issue。

---

**最后更新：** 2024年12月

