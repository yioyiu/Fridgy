# App Store Connect API Key 配置指南

使用 **App Store Connect API Key** 是推荐的方式，因为它：
- ✅ **无需 2FA**（不需要输入验证码）
- ✅ **无需 Mac**（可以在任何平台配置）
- ✅ **更安全**（不需要存储 Apple ID 密码）
- ✅ **更稳定**（不会因为 2FA session 过期而失败）

## 步骤 1：在 App Store Connect 中创建 API Key

1. **登录 App Store Connect**
   - 访问：https://appstoreconnect.apple.com
   - 使用你的 Apple ID 登录

2. **进入 API Keys 页面**
   - 点击右上角的用户图标（你的名字）
   - 选择 **"Users and Access"**（用户和访问）
   - 在左侧菜单中点击 **"Keys"**（密钥）
   - 点击 **"+"** 按钮创建新密钥

3. **创建 API Key**
   - **Name**（名称）：输入一个描述性的名称，例如 `Fridgy CI/CD` 或 `GitHub Actions`
   - **Access**（访问权限）：选择 **"App Manager"**（应用管理员）或 **"Admin"**（管理员）
     - ⚠️ **注意**：需要至少 **"App Manager"** 权限才能创建和管理证书、provisioning profiles
   - 点击 **"Generate"**（生成）

4. **下载并保存 API Key**
   - ⚠️ **重要**：API Key 只能下载一次！请妥善保存
   - 点击 **"Download API Key"**（下载 API Key）
   - 会下载一个 `.p8` 文件，文件名格式：`AuthKey_XXXXXXXXXX.p8`
   - 同时记录下：
     - **Key ID**（密钥 ID）：例如 `ABC123DEFG`
     - **Issuer ID**（颁发者 ID）：在页面顶部显示，例如 `12345678-1234-1234-1234-123456789012`

## 步骤 2：配置 GitHub Secrets

在 GitHub 仓库中配置以下 Secrets：

### 必需的 Secrets：

1. **`APPSTORE_API_KEY_ID`**
   - 值：从步骤 1 中记录的 **Key ID**（例如：`ABC123DEFG`）
   - 类型：文本

2. **`APPSTORE_ISSUER_ID`**
   - 值：从步骤 1 中记录的 **Issuer ID**（例如：`12345678-1234-1234-1234-123456789012`）
   - 类型：文本

3. **`APPSTORE_API_PRIVATE_KEY`**
   - 值：打开下载的 `.p8` 文件，复制**全部内容**（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
   - 类型：文本（多行）
   - ⚠️ **注意**：必须包含完整的文件内容，包括头尾的标记

### 如何配置 GitHub Secrets：

1. 进入你的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 在左侧菜单中点击 **Secrets and variables** → **Actions**
4. 点击 **"New repository secret"**（新建仓库密钥）
5. 依次添加上述三个 Secrets

### 示例：`.p8` 文件内容格式

```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
（这里是很长的 base64 编码的密钥内容）
...更多内容...
-----END PRIVATE KEY-----
```

## 步骤 3：验证配置

配置完成后，运行 GitHub Actions workflow。如果配置正确，你会看到：

```
✅ 使用 App Store Connect API Key 认证（无需 2FA）
API Key ID: ABC123DEFG
Issuer ID: 12345678-1234-1234-1234-123456789012
✅ API Key 文件已创建
```

## 常见问题

### Q: 我已经配置了 `APPSTORE_API_KEY_ID`、`APPSTORE_ISSUER_ID` 和 `APPSTORE_API_PRIVATE_KEY`，但 workflow 仍然使用 Apple ID 认证？

A: 检查以下几点：
1. Secret 名称是否正确（区分大小写）
2. `.p8` 文件内容是否完整（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）
3. 确保没有多余的空格或换行符

### Q: API Key 权限不足怎么办？

A: 需要至少 **"App Manager"** 权限才能创建和管理证书、provisioning profiles。如果权限不足：
1. 删除现有的 API Key
2. 创建一个新的 API Key，选择 **"App Manager"** 或 **"Admin"** 权限
3. 更新 GitHub Secrets 中的 `APPSTORE_API_KEY_ID` 和 `APPSTORE_API_PRIVATE_KEY`

### Q: 我丢失了 `.p8` 文件怎么办？

A: API Key 只能下载一次。如果丢失了：
1. 在 App Store Connect 中删除旧的 API Key
2. 创建一个新的 API Key
3. 下载并保存新的 `.p8` 文件
4. 更新 GitHub Secrets 中的 `APPSTORE_API_KEY_ID` 和 `APPSTORE_API_PRIVATE_KEY`

### Q: 我可以同时使用 API Key 和 Apple ID 认证吗？

A: 可以。Workflow 会优先使用 API Key（如果已配置），如果没有配置 API Key，则回退到 Apple ID + 密码方式。

## 参考链接

- [App Store Connect API 文档](https://developer.apple.com/documentation/appstoreconnectapi)
- [fastlane 使用 API Key 的文档](https://docs.fastlane.tools/app-store-connect-api/)

