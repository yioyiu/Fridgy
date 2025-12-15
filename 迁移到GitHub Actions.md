# 🔄 迁移到 GitHub Actions - 执行清单

按照以下步骤完成迁移，每个步骤都有详细说明。

---

## ✅ 步骤清单

### 📝 准备工作（5分钟）

- [ ] **步骤 1**：生成原生项目
  ```bash
  npm run prebuild:ios
  ```

- [ ] **步骤 2**：创建 App Store Connect API Key
  - 访问：https://appstoreconnect.apple.com
  - Users and Access → Keys → 创建新密钥
  - 下载 .p8 文件
  - 记录 Key ID 和 Issuer ID

- [ ] **步骤 3**：获取 Team ID
  - 访问：https://developer.apple.com/account
  - 右上角账号 → 查看 Team ID

- [ ] **步骤 4**：创建 ExportOptions.plist
  ```bash
  # Windows
  copy ios\ExportOptions.plist.example ios\ExportOptions.plist
  
  # Mac/Linux
  cp ios/ExportOptions.plist.example ios/ExportOptions.plist
  ```
  - 编辑文件，替换 `YOUR_TEAM_ID`

- [ ] **步骤 5**：生成 App 专用密码
  - 访问：https://appleid.apple.com
  - 安全 → App 专用密码 → 生成密码

### 🔐 配置 GitHub Secrets（10分钟）

访问：`https://github.com/你的用户名/Fridgy/settings/secrets/actions`

- [ ] **Secret 1**: `APPLE_ID` = 你的 Apple ID 邮箱
- [ ] **Secret 2**: `APPLE_APP_SPECIFIC_PASSWORD` = App 专用密码
- [ ] **Secret 3**: `APPSTORE_ISSUER_ID` = Issuer ID（从步骤 2）
- [ ] **Secret 4**: `APPSTORE_API_KEY_ID` = Key ID（从步骤 2）
- [ ] **Secret 5**: `APPSTORE_API_PRIVATE_KEY` = .p8 文件完整内容

### 🚀 测试构建（20-30分钟）

- [ ] **步骤 7**：提交配置文件
  ```bash
  git add ios/ExportOptions.plist
  git add .github/workflows/ios-build-native.yml
  git commit -m "feat: 配置 GitHub Actions 构建"
  git push origin master
  ```

- [ ] **步骤 8**：手动触发构建
  - 访问：GitHub Actions 页面
  - 选择 "iOS Build (Native Xcode)"
  - 点击 "Run workflow"

- [ ] **步骤 9**：等待构建完成（20-30分钟）
  - 查看构建日志
  - 确认没有错误

- [ ] **步骤 10**：验证成功
  - [ ] 构建成功
  - [ ] IPA 文件已生成
  - [ ] 已上传到 App Store Connect

---

## 📚 详细文档

- **快速设置**：查看 [SETUP_GITHUB_ACTIONS.md](./SETUP_GITHUB_ACTIONS.md)
- **详细步骤**：查看 [MIGRATION_STEPS.md](./MIGRATION_STEPS.md)
- **无 Mac 指南**：查看 [NO_MAC_GUIDE.md](./NO_MAC_GUIDE.md)

---

## 🆘 需要帮助？

1. 查看构建日志中的错误信息
2. 检查 GitHub Secrets 是否正确配置
3. 参考详细文档中的常见问题部分

---

**预计总时间：30-40 分钟**

