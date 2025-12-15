# Fastlane Match 设置指南

本指南帮助你设置 fastlane match 来自动管理 iOS 证书和 provisioning profiles。

## 📋 前置要求

1. ✅ Apple Developer 账户
2. ✅ GitHub 账户
3. ✅ 已配置的 GitHub Secrets（APPLE_ID, APPLE_APP_SPECIFIC_PASSWORD）

## 🚀 快速设置步骤

### 步骤 1：创建证书存储仓库

#### 方法 1：在 GitHub 网页上创建（推荐）

1. **登录 GitHub**
   - 访问：https://github.com
   - 登录你的账户

2. **创建新仓库**
   - 点击右上角的 **+** 号
   - 选择 **New repository**

3. **配置仓库信息**
   - **Repository name**: `certificates`（或任何你喜欢的名字，例如：`fridgy-certificates`）
   - **Description**: `iOS certificates and provisioning profiles storage`（可选）
   - **Visibility**: 选择 **Private**（必须是私有仓库！）
   - **不要**勾选以下选项：
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - 点击 **Create repository**

4. **记录仓库 URL**
   - 创建成功后，你会看到仓库页面
   - 复制仓库 URL，格式：`https://github.com/你的用户名/certificates.git`
   - 例如：`https://github.com/yioyiu/certificates.git`



#### ⚠️ 重要提示

- ✅ **必须是私有仓库** - 证书包含敏感信息，绝对不能公开
- ✅ **仓库可以是空的** - fastlane match 会自动创建必要的文件结构
- ✅ **仓库名可以自定义** - 不一定要叫 `certificates`，可以是任何名字
- ✅ **一个仓库可以存储多个 App 的证书** - fastlane match 会自动组织文件结构

#### 📝 仓库结构说明

fastlane match 会自动在仓库中创建以下结构：

```
certificates/
├── certs/
│   └── distribution/
│       └── [加密的证书文件]
├── profiles/
│   └── appstore/
│       └── [加密的 profile 文件]
└── README.md (fastlane match 自动生成)
```

你不需要手动创建这些文件，fastlane match 会自动处理。

#### 🎯 证书存储仓库的作用

**简单来说：证书存储仓库就是一个"保险箱"，用来安全地存储你的 iOS 证书和 profiles。**

##### 主要作用：

1. **存储加密的证书和 profiles**
   - fastlane match 会将证书和 profiles 加密后存储在这个仓库中
   - 使用 `MATCH_PASSWORD` 加密，只有知道密码的人才能解密

2. **版本控制**
   - 使用 Git 来管理证书的版本
   - 可以追踪证书的历史变更
   - 如果证书丢失，可以从仓库恢复

3. **团队协作**
   - 团队成员可以共享同一个证书仓库
   - 所有人都使用相同的证书和 profiles
   - 避免证书冲突问题

4. **自动化管理**
   - fastlane match 会自动从仓库下载证书
   - 自动安装到构建环境中
   - 自动检测和更新过期证书

##### 工作流程：

```
1. 首次运行 GitHub Actions
   ↓
2. fastlane match 创建证书和 profiles
   ↓
3. 使用 MATCH_PASSWORD 加密
   ↓
4. 存储到证书仓库（certificates）
   ↓
5. 后续构建时，从仓库下载证书
   ↓
6. 使用 MATCH_PASSWORD 解密
   ↓
7. 安装到构建环境
   ↓
8. 使用证书进行代码签名
```

##### 为什么需要单独的仓库？

- ✅ **安全性** - 证书是敏感信息，需要单独保护
- ✅ **可重用** - 多个项目可以使用同一个证书仓库
- ✅ **版本控制** - 可以追踪证书的变更历史
- ✅ **团队共享** - 团队成员可以共享证书
- ✅ **备份** - Git 仓库本身就是备份

##### 类比说明：

想象一下：
- **Fridgy 项目** = 你的房子（主项目）
- **证书存储仓库** = 银行的保险箱（存储证书）
- **MATCH_PASSWORD** = 保险箱的密码（解密证书）
- **GitHub Secrets** = 你家里的钥匙（访问权限）

你需要在房子里（Fridgy 项目）配置钥匙（GitHub Secrets），才能去银行（证书仓库）打开保险箱（获取证书）。

##### 重要提示：

- ✅ **证书仓库可以是空的** - fastlane match 会自动创建文件
- ✅ **不需要在证书仓库中配置 secrets** - 所有配置都在 Fridgy 项目中
- ✅ **证书仓库必须是私有的** - 保护敏感信息
- ✅ **一个仓库可以存储多个 App 的证书** - fastlane match 会自动组织

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

#### 📍 重要：在哪里配置 Secrets？

**所有 Secrets 都配置在 `Fridgy` 项目的 Actions secrets 中，不是在证书存储仓库中！**

**原因：**
- ✅ GitHub Actions workflow 在 `Fridgy` 项目中运行
- ✅ fastlane match 需要这些 secrets 来访问证书仓库和创建证书
- ✅ 证书存储仓库只是一个存储位置，不需要配置 secrets

#### 🔗 访问 Secrets 页面

访问：`https://github.com/yioyiu/Fridgy/settings/secrets/actions`

或者：
1. 访问你的 Fridgy 仓库：`https://github.com/yioyiu/Fridgy`
2. 点击 **Settings**（设置）标签页
3. 左侧菜单选择 **Secrets and variables** → **Actions**
4. 点击 **New repository secret**（新建仓库密钥）

#### 📝 需要配置的 Secrets

添加以下 Secrets 到 **Fridgy 项目**：

| Secret 名称 | 值 | 说明 | 必需 |
|------------|-----|------|------|
| `MATCH_PASSWORD` | 步骤 2 生成的密码 | 用于加密证书 | ✅ 必需 |
| `MATCH_GIT_URL` | `https://github.com/yioyiu/certificates.git` | 证书存储仓库 URL | ⚠️ 可选（默认会自动生成） |
| `MATCH_GIT_BASIC_AUTHORIZATION` | `yioyiu:你的Git访问令牌` | 如果使用私有仓库，需要 Git 访问令牌 | ⚠️ 可选（私有仓库需要） |

#### ⚠️ 注意事项

- ❌ **不要**在证书存储仓库（certificates）中配置这些 secrets
- ✅ **只在** Fridgy 项目中配置这些 secrets
- ✅ 证书存储仓库可以是空的，fastlane match 会自动创建文件

**如何获取 Git 访问令牌（如果使用私有仓库）：**

#### 📝 详细步骤

##### 步骤 1：访问 GitHub 设置

1. **登录 GitHub**
   - 访问：https://github.com
   - 登录你的账户

2. **进入设置页面**
   - 点击右上角的头像
   - 选择 **Settings**（设置）

3. **进入开发者设置**
   - 在左侧菜单中，滚动到底部
   - 点击 **Developer settings**（开发者设置）

4. **进入 Personal access tokens**
   - 在左侧菜单中，点击 **Personal access tokens**
   - 选择 **Tokens (classic)**（经典令牌）

##### 步骤 2：生成新令牌

1. **创建新令牌**
   - 点击 **Generate new token**（生成新令牌）
   - 选择 **Generate new token (classic)**（生成经典令牌）

2. **配置令牌信息**
   - **Note**（备注）：输入一个描述性的名称，例如：`Fastlane Match Certificates`
   - **Expiration**（过期时间）：选择过期时间
     - 推荐：`90 days`（90天）或 `No expiration`（永不过期）
     - 注意：如果选择永不过期，请确保安全保存

3. **选择权限（Scopes）**
   - ✅ 勾选 **`repo`**（完整仓库访问权限）
     - 这会自动勾选所有子权限：
       - ✅ `repo:status`
       - ✅ `repo_deployment`
       - ✅ `public_repo`
       - ✅ `repo:invite`
       - ✅ `security_events`
   - 其他权限不需要勾选

4. **生成令牌**
   - 滚动到页面底部
   - 点击 **Generate token**（生成令牌）按钮

##### 步骤 3：复制令牌

1. **重要：立即复制令牌**
   - 令牌生成后，**只显示一次**
   - 立即复制令牌（点击复制按钮或手动选择复制）
   - 格式：一串长字符串，例如：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

2. **保存令牌**
   - 保存到安全的地方（密码管理器、加密文档等）
   - **不要分享给他人**
   - **不要提交到代码仓库**

##### 步骤 4：配置到 GitHub Secrets

1. **访问 Secrets 页面**
   - 访问：`https://github.com/yioyiu/Fridgy/settings/secrets/actions`
   - 或：仓库 → Settings → Secrets and variables → Actions

2. **添加 Secret**
   - 点击 **New repository secret**（新建仓库密钥）
   - **Name**（名称）：`MATCH_GIT_BASIC_AUTHORIZATION`
   - **Value**（值）：`你的GitHub用户名:令牌`
     - 格式：`yioyiu:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - 注意：用户名和令牌之间用冒号 `:` 分隔

3. **保存**
   - 点击 **Add secret**（添加密钥）

#### 🔍 示例格式

假设：
- GitHub 用户名：`yioyiu`
- 生成的令牌：`ghp_AbCdEf1234567890XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ`

那么 `MATCH_GIT_BASIC_AUTHORIZATION` 的值应该是：
```
yioyiu:ghp_AbCdEf1234567890XyZaBcDeFgHiJkLmNoPqRsTuVwXyZ
```

#### ⚠️ 重要提示

- ✅ **令牌只显示一次** - 生成后立即复制保存
- ✅ **使用私有仓库时需要** - 如果证书仓库是私有的，必须配置此令牌
- ✅ **使用公有仓库时不需要** - 如果证书仓库是公有的，可以不配置
- ✅ **安全保存** - 令牌等同于密码，请妥善保管
- ✅ **定期更新** - 建议定期更换令牌以提高安全性
- ❌ **不要分享** - 不要将令牌分享给他人
- ❌ **不要提交** - 不要将令牌提交到代码仓库

#### 🔗 快速链接

- **直接访问令牌页面**：https://github.com/settings/tokens
- **创建新令牌**：https://github.com/settings/tokens/new

#### 💡 提示

如果你使用的是**公有仓库**来存储证书（不推荐），则不需要配置 `MATCH_GIT_BASIC_AUTHORIZATION`。

但**强烈建议使用私有仓库**来存储证书，因为证书包含敏感信息。

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

