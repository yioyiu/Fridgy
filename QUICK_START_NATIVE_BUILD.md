# 🚀 快速开始：迁移到 GitHub Actions 构建（无需 Mac）

本指南帮助你快速从 EAS Build 迁移到 GitHub Actions 构建，**完全不需要 Mac**！构建在 GitHub 的云端 Mac 服务器上运行。

---

## ✅ 重要说明：不需要 Mac！

- ✅ **GitHub Actions 提供 Mac runner** - 构建在云端执行
- ✅ **完全自动化** - 推送到 GitHub 自动构建
- ✅ **无构建次数限制** - 比 EAS Build 更灵活
- ✅ **成本更低** - 每月 2000 分钟免费（约 60-100 次构建）

---

## ⚡ 5 分钟快速设置

### 步骤 1：生成原生项目（首次运行，在 Windows 上即可）

```bash
# 生成 iOS 原生项目（在 Windows 上运行）
npm run prebuild:ios

# 这会创建 ios/ 目录和配置文件
# 注意：不需要安装 CocoaPods，GitHub Actions 会自动处理
```

### 步骤 2：创建 App Store Connect API Key

1. 访问 https://appstoreconnect.apple.com
2. 进入 **Users and Access** → **Keys**
3. 点击 **+** 创建新密钥
4. 选择 **App Manager** 权限
5. 下载 `.p8` 文件（只能下载一次！）
6. 记录：
   - **Key ID**（例如：ABC123DEFG）
   - **Issuer ID**（在 Keys 页面顶部）

### 步骤 3：配置 GitHub Secrets

在 GitHub 仓库：**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

添加以下 Secrets：

| Secret 名称 | 说明 | 如何获取 |
|------------|------|---------|
| `APPLE_ID` | Apple ID 邮箱 | 你的 Apple ID |
| `APPLE_APP_SPECIFIC_PASSWORD` | App 专用密码 | https://appleid.apple.com → 安全 → App 专用密码 |
| `APPSTORE_ISSUER_ID` | Issuer ID | App Store Connect → Keys 页面顶部 |
| `APPSTORE_API_KEY_ID` | Key ID | 创建 API Key 时显示 |
| `APPSTORE_API_PRIVATE_KEY` | .p8 文件内容 | 复制整个 .p8 文件内容 |

### 步骤 4：配置 ExportOptions.plist

```bash
# 复制示例文件
cp ios/ExportOptions.plist.example ios/ExportOptions.plist

# 编辑文件，替换 YOUR_TEAM_ID
# 在 https://developer.apple.com/account 查看你的 Team ID
```

### 步骤 5：测试构建

推送到 GitHub 或手动触发：

```bash
# 提交代码
git add .
git commit -m "feat: 迁移到本地构建"
git push origin master

# 或在 GitHub Actions 页面手动触发 "iOS Build (Native Xcode)"
```

---

## 📋 详细步骤

### 1. 生成原生项目

```bash
# 生成 iOS 项目
npm run prebuild:ios

# 这会创建 ios/ 目录
```

### 2. 获取 Apple Developer Team ID

1. 访问 https://developer.apple.com/account
2. 右上角点击你的账号
3. Team ID 显示在团队名称下方（格式：ABC123DEFG）

### 3. 配置 ExportOptions.plist

编辑 `ios/ExportOptions.plist`：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>你的TeamID</string>  <!-- 替换这里 -->
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

### 4. 生成 App 专用密码

1. 访问 https://appleid.apple.com
2. 登录 → **安全** → **App 专用密码**
3. 点击 **生成密码**
4. 输入标签（例如：GitHub Actions）
5. 复制密码（只显示一次）

### 5. 配置 GitHub Secrets

在 GitHub 仓库设置中添加：

- **APPLE_ID**: 你的 Apple ID 邮箱
- **APPLE_APP_SPECIFIC_PASSWORD**: 刚生成的 App 专用密码
- **APPSTORE_ISSUER_ID**: 从 App Store Connect Keys 页面获取
- **APPSTORE_API_KEY_ID**: API Key 的 Key ID
- **APPSTORE_API_PRIVATE_KEY**: .p8 文件的完整内容

### 6. 测试构建

```bash
# 提交代码触发构建
git add .
git commit -m "test: 测试本地构建"
git push origin master

# 或在 GitHub Actions 页面手动触发
```

---

## ✅ 验证清单

- [ ] 已生成 `ios/` 目录
- [ ] 已创建 `ios/ExportOptions.plist`（包含正确的 Team ID）
- [ ] 已创建 App Store Connect API Key
- [ ] 已配置所有 GitHub Secrets
- [ ] 已测试 GitHub Actions 构建

---

## 🎯 下一步

构建成功后：

1. **禁用旧的 EAS Build workflow**（可选）
   - 在 `.github/workflows/ios-build.yml` 中添加条件禁用

2. **更新文档**
   - 更新 `APP_STORE_RELEASE_GUIDE.md`
   - 通知团队成员

3. **监控构建**
   - 查看 GitHub Actions 构建日志
   - 确认上传到 App Store Connect 成功

---

## 🆘 常见问题

### Q: 构建失败，提示找不到 workspace？
A: 确保已运行 `npm run prebuild:ios` 生成原生项目。

### Q: 签名错误？
A: 检查 `ExportOptions.plist` 中的 Team ID 是否正确。

### Q: 上传失败？
A: 检查 GitHub Secrets 是否正确配置，特别是 `APPSTORE_API_PRIVATE_KEY`。

### Q: 如何查看构建日志？
A: 在 GitHub Actions 页面点击构建任务，查看详细日志。

---

## 📚 相关文档

- [无 Mac 用户专用指南](./NO_MAC_GUIDE.md) ⭐ **推荐无 Mac 用户查看**
- [完整迁移指南](./MIGRATE_FROM_EAS_BUILD.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

**需要帮助？** 查看详细文档或提交 Issue。

