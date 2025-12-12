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

#### 方法 2：使用 GitHub CLI（可选）

如果你安装了 GitHub CLI，可以使用命令行创建：

```bash
# 安装 GitHub CLI（如果还没有）
# Windows: https://cli.github.com/
# Mac: brew install gh
# Linux: 查看 https://cli.github.com/

# 登录 GitHub
gh auth login

# 创建私有仓库
gh repo create certificates --private --description "iOS certificates storage"

# 记录仓库 URL
# 格式：https://github.com/你的用户名/certificates.git
```

#### 方法 3：使用现有仓库（不推荐）

如果你已经有一个私有仓库，也可以使用它，但建议使用专门的仓库来存储证书。

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

### 步骤 2：生成 MATCH_PASSWORD

`MATCH_PASSWORD` 用于加密存储在 Git 仓库中的证书。这个密码非常重要，**丢失后无法恢复证书**！

#### 🔑 密码要求

- ✅ **至少 16 个字符**（推荐 20-32 个字符）
- ✅ **包含大写字母**（A-Z）
- ✅ **包含小写字母**（a-z）
- ✅ **包含数字**（0-9）
- ✅ **包含特殊字符**（!@#$%^&*等）
- ✅ **不要使用常见密码**（如 password123）
- ✅ **不要包含个人信息**（如姓名、生日）

#### 📝 生成方法

##### 方法 1：使用在线密码生成器（推荐）

1. **访问密码生成器网站：**
   - https://www.lastpass.com/features/password-generator
   - https://passwordsgenerator.net/
   - https://1password.com/password-generator/

2. **设置参数：**
   - 长度：20-32 个字符
   - 包含：大写字母、小写字母、数字、特殊字符
   - 排除相似字符：可选

3. **生成密码：**
   - 点击"生成"按钮
   - 复制生成的密码
   - **立即保存到安全的地方**（密码管理器、文档等）

##### 方法 2：使用命令行生成（Windows PowerShell）

打开 PowerShell，运行以下命令：

```powershell
# 生成一个 24 位随机密码
-join ((65..90) + (97..122) + (48..57) + (33..47) | Get-Random -Count 24 | ForEach-Object {[char]$_})
```

或者使用更简单的方法：

```powershell
# 生成一个 32 位随机密码
$password = -join ((48..57) + (65..90) + (97..122) + (33..47) | Get-Random -Count 32 | ForEach-Object {[char]$_})
Write-Host $password
```

##### 方法 3：使用命令行生成（Git Bash / Linux / Mac）

如果你使用 Git Bash 或 Linux/Mac 终端：

```bash
# 生成一个 32 位随机密码
openssl rand -base64 24 | tr -d "=+/" | cut -c1-32
```

或者：

```bash
# 使用 /dev/urandom 生成
cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#$%^&*' | fold -w 32 | head -n 1
```

##### 方法 4：使用密码管理器

如果你使用密码管理器（如 1Password、LastPass、Bitwarden 等）：

1. 打开密码管理器
2. 使用内置的密码生成器
3. 设置长度：20-32 个字符
4. 包含所有字符类型
5. 生成并保存

##### 方法 5：手动创建（不推荐）

如果你选择手动创建密码，可以使用以下格式：

```
[大写字母][小写字母][数字][特殊字符][重复]
```

示例：
```
FridgyCert2024!@#MatchSecure
```

**注意：** 手动创建的密码可能不够随机，安全性较低。

#### 💾 保存密码

生成密码后，**立即保存到以下位置**：

1. ✅ **密码管理器**（推荐）
   - 1Password
   - LastPass
   - Bitwarden
   - 其他密码管理器

2. ✅ **加密文档**
   - 保存在加密的文档中
   - 使用密码保护

3. ✅ **安全笔记**
   - 保存在安全的地方
   - 不要保存在普通文本文件中

4. ✅ **团队共享**（如果多人使用）
   - 使用团队密码管理器
   - 或安全的共享方式

#### ⚠️ 重要提示

- ❌ **不要丢失密码** - 丢失后无法恢复证书，需要重新创建
- ❌ **不要分享密码** - 除非是团队成员需要访问
- ❌ **不要使用弱密码** - 容易被破解
- ❌ **不要重复使用密码** - 使用唯一的密码
- ✅ **定期备份** - 确保密码安全保存
- ✅ **团队共享** - 如果多人使用，确保团队成员都知道密码

#### 📋 密码示例格式

以下是几个符合要求的密码示例（**不要直接使用这些密码**）：

```
示例 1: FridgyMatch2024!@#SecureCert
示例 2: K9mP@2xQ#vL7nR$wT5yU8zA!bC3dE
示例 3: MyAppStoreCert!2024@Match#Secure
```

**记住：** 这些只是示例，请生成你自己的唯一密码！

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

