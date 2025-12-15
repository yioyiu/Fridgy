# 🖥️ 无 Mac 用户指南：使用 GitHub Actions 构建 iOS 应用

**完全不需要 Mac！** 本指南专门为没有 Mac 的用户设计。

---

## ✅ 为什么选择 GitHub Actions？

| 特性 | EAS Build | GitHub Actions |
|------|-----------|----------------|
| **需要 Mac** | ❌ 不需要 | ❌ 不需要 |
| **构建次数限制** | ✅ 免费 30次/月 | ✅ 免费 2000分钟/月（约60-100次） |
| **自动化** | ✅ 是 | ✅ 是 |
| **成本** | 超出后按次计费 | 超出后 $0.008/分钟 |
| **网络问题** | ❌ 可能遇到 | ✅ 云端构建，稳定 |

---

## 🚀 快速开始（5 步）

### 步骤 1：在 Windows 上生成原生项目

在你的 Windows 电脑上运行：

```bash
# 安装依赖（如果还没安装）
npm install

# 生成 iOS 原生项目
npm run prebuild:ios
```

**说明：**
- 这会创建 `ios/` 目录和配置文件
- 你不需要安装 Xcode 或 CocoaPods
- GitHub Actions 会在云端 Mac 上完成实际构建

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

### 步骤 4：配置 ExportOptions.plist

在你的 Windows 电脑上：

```bash
# 复制示例文件
copy ios\ExportOptions.plist.example ios\ExportOptions.plist
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

### 步骤 5：配置 GitHub Secrets

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
- **Value**: App 专用密码（见下方如何生成）

**如何生成 App 专用密码：**
1. 访问 https://appleid.apple.com
2. 登录你的 Apple ID
3. 进入 **安全** 标签页
4. 找到 **App 专用密码** 部分
5. 点击 **生成密码**
6. 输入标签（例如：GitHub Actions）
7. 点击 **创建**
8. **复制密码**（只显示一次！）

#### Secret 3: APPSTORE_ISSUER_ID
- **Name**: `APPSTORE_ISSUER_ID`
- **Value**: 从步骤 2 获取的 Issuer ID（格式：12345678-1234-1234-1234-123456789012）

#### Secret 4: APPSTORE_API_KEY_ID
- **Name**: `APPSTORE_API_KEY_ID`
- **Value**: 从步骤 2 获取的 Key ID（格式：ABC123DEFG）

#### Secret 5: APPSTORE_API_PRIVATE_KEY
- **Name**: `APPSTORE_API_PRIVATE_KEY`
- **Value**: 从步骤 2 下载的 `.p8` 文件的完整内容

**如何获取 .p8 文件内容：**
1. 用文本编辑器（如 Notepad++）打开下载的 `.p8` 文件
2. 复制整个文件内容（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
3. 粘贴到 Secret 的 Value 中

### 步骤 6：提交代码并测试

```bash
# 添加所有更改
git add .

# 提交更改
git commit -m "feat: 配置 GitHub Actions 构建"

# 推送到 GitHub
git push origin master
```

推送后，GitHub Actions 会自动开始构建！

---

## 📊 查看构建状态

1. 访问你的 GitHub 仓库
2. 点击 **Actions** 标签页
3. 找到 **iOS Build (Native Xcode)** workflow
4. 点击查看构建进度和日志

---

## ✅ 验证清单

在开始构建前，确保：

- [ ] 已运行 `npm run prebuild:ios` 生成了 `ios/` 目录
- [ ] 已创建 `ios/ExportOptions.plist` 并替换了 Team ID
- [ ] 已创建 App Store Connect API Key
- [ ] 已配置所有 5 个 GitHub Secrets
- [ ] 已提交代码到 GitHub

---

## 💰 成本说明

### GitHub Actions 免费额度

- **每月 2000 分钟** Mac runner 免费额度
- 一次 iOS 构建约 **20-30 分钟**
- 每月可免费构建 **60-100 次**

### 超出免费额度后

- Mac runner: **$0.008/分钟**
- 一次构建约 **$0.16-0.24**
- 比 EAS Build 的按次计费更灵活

### 对比 EAS Build

| 服务 | 免费额度 | 超出后费用 |
|------|---------|-----------|
| EAS Build | 30次/月 | 按次计费 |
| GitHub Actions | 2000分钟/月 | $0.008/分钟 |

**结论：** GitHub Actions 更灵活，成本更低！

---

## 🆘 常见问题

### Q: 我没有 Mac，真的可以构建 iOS 应用吗？

A: **可以！** GitHub Actions 提供云端 Mac 服务器，你不需要本地 Mac。只需要：
- Windows/Linux 电脑（用于开发）
- GitHub 账号
- Apple Developer 账号

### Q: 构建在哪里执行？

A: 在 GitHub 的云端 Mac 服务器上执行。你只需要推送代码，GitHub 会自动：
1. 在云端 Mac 上拉取代码
2. 安装依赖
3. 运行构建
4. 上传到 App Store Connect

### Q: 需要安装 Xcode 吗？

A: **不需要！** GitHub Actions 会自动在云端 Mac 上安装 Xcode。

### Q: 构建需要多长时间？

A: 通常 **20-30 分钟**，包括：
- 安装依赖：2-3 分钟
- 构建应用：15-20 分钟
- 上传到 App Store Connect：2-5 分钟

### Q: 如何查看构建日志？

A: 
1. 访问 GitHub 仓库
2. 点击 **Actions** 标签页
3. 点击构建任务
4. 查看详细日志

### Q: 构建失败怎么办？

A: 
1. 查看构建日志中的错误信息
2. 检查 GitHub Secrets 是否正确配置
3. 检查 `ExportOptions.plist` 中的 Team ID
4. 查看 [完整迁移指南](./MIGRATE_FROM_EAS_BUILD.md) 的故障排除部分

### Q: 可以同时使用 EAS Build 和 GitHub Actions 吗？

A: **可以！** 你可以保留 EAS Build 作为备选方案。只需：
- 使用不同的 workflow 文件
- 根据需要选择使用哪个

### Q: 如何禁用旧的 EAS Build workflow？

A: 在 `.github/workflows/ios-build.yml` 文件开头添加：

```yaml
on:
  workflow_dispatch:  # 只允许手动触发
  # 移除 push 触发器
```

---

## 📚 相关文档

- [快速开始指南](./QUICK_START_NATIVE_BUILD.md)
- [完整迁移指南](./MIGRATE_FROM_EAS_BUILD.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

---

## 🎯 下一步

1. **完成上述 6 个步骤**
2. **测试第一次构建**
3. **查看构建结果**
4. **如果成功，可以禁用 EAS Build workflow**

---

**需要帮助？** 
- 查看构建日志中的错误信息
- 检查 GitHub Secrets 配置
- 参考 [完整迁移指南](./MIGRATE_FROM_EAS_BUILD.md)

---

**最后更新：** 2024年12月

