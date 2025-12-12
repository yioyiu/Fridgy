# Fastlane Match 设置指南

本指南帮助你设置 fastlane match 来自动管理 iOS 证书和 provisioning profiles。

## 📋 前置要求

1. ✅ Apple Developer 账户
2. ✅ GitHub 账户
3. ✅ 已配置的 GitHub Secrets（APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD）

## 🚀 快速设置步骤

### 步骤 1：创建证书存储仓库

1. 在 GitHub 上创建一个**私有仓库**用于存储证书
   - 仓库名：`certificates`（或任何你喜欢的名字）
   - 必须是私有仓库！
   - 仓库地址：`https://github.com/你的用户名/certificates.git`

2. 记录仓库 URL，稍后需要配置到 GitHub Secrets

### 步骤 2：生成 MATCH_PASSWORD

`MATCH_PASSWORD` 用于加密存储在 Git 仓库中的证书。

**生成一个强密码：**
- 可以使用密码生成器
- 至少 16 个字符
- 包含字母、数字和特殊字符
- **重要：保存好这个密码，丢失后无法恢复证书！**

示例：
```
MySecureMatchPassword123!@#
```

### 步骤 3：配置 GitHub Secrets

访问：`https://github.com/你的用户名/Fridgy/settings/secrets/actions`

添加以下 Secrets：

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `MATCH_PASSWORD` | 步骤 2 生成的密码 | 用于加密证书 |
| `MATCH_GIT_URL` | `https://github.com/你的用户名/certificates.git` | 证书存储仓库 URL（可选，默认会自动生成） |
| `MATCH_GIT_BASIC_AUTHORIZATION` | `用户名:个人访问令牌` | 如果使用私有仓库，需要 Git 访问令牌（可选） |

**如何获取 Git 访问令牌（如果使用私有仓库）：**
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token"
3. 选择权限：`repo`（完整仓库访问权限）
4. 生成并复制令牌
5. 格式：`你的GitHub用户名:令牌`

### 步骤 4：首次运行（自动创建证书）

当你第一次运行 GitHub Actions workflow 时，fastlane match 会：
1. ✅ 自动创建 App Store 分发证书
2. ✅ 自动创建 provisioning profile
3. ✅ 将证书和 profiles 加密后存储到 Git 仓库
4. ✅ 在本地安装证书和 profiles

**完全自动化，无需 Mac！**

### 步骤 5：后续构建

之后的构建会自动：
1. ✅ 从 Git 仓库下载证书和 profiles
2. ✅ 安装到构建环境中
3. ✅ 使用它们进行代码签名

## 🔒 安全说明

- ✅ 证书和 profiles 使用 `MATCH_PASSWORD` 加密存储
- ✅ 存储在私有 Git 仓库中
- ✅ 只有拥有密码的人才能解密
- ✅ 团队成员可以共享同一个证书仓库

## 📝 Matchfile 配置

`fastlane/Matchfile` 文件包含 match 的配置。主要配置项：

- `git_url`: 证书存储仓库 URL
- `storage_mode`: 存储模式（git）
- `type`: 证书类型（appstore/development/ad-hoc/enterprise）
- `app_identifier`: App Bundle ID
- `username`: Apple ID（在 workflow 中动态设置）
- `team_id`: Team ID（在 workflow 中动态设置）

## 🐛 常见问题

### Q: 如果 MATCH_PASSWORD 丢失了怎么办？
A: 无法恢复。需要重新创建证书和 profiles。

### Q: 可以使用现有的证书吗？
A: 可以，但建议使用 match 统一管理，避免冲突。

### Q: 团队成员如何共享证书？
A: 共享同一个 Git 仓库和 MATCH_PASSWORD。

### Q: 证书过期了怎么办？
A: fastlane match 会自动检测并更新过期证书。

## 📚 更多信息

- [fastlane match 官方文档](https://docs.fastlane.tools/actions/match/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

