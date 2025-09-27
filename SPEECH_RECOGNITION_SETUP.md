# 语音识别服务配置指南

## 🎯 概述

本项目集成了真实的语音识别功能：
- **Web端**: 使用Web Speech API，支持真实语音识别
- **移动端**: 使用模拟模式（需要开发构建版本才能使用真实语音识别）

## 📋 前置要求

1. React Native 开发环境
2. iOS/Android 设备或模拟器
3. 麦克风权限
4. **Web端**: 支持Web Speech API的浏览器（Chrome、Safari、Edge）

## 🔧 配置步骤

### 1. Web端语音识别

**Web端支持真实语音识别**：
- 使用Web Speech API
- 支持Chrome、Safari、Edge浏览器
- 无需额外配置
- 支持多语言识别

### 2. 移动端语音识别

**移动端限制**：
- Expo Go不支持原生语音识别
- 需要开发构建版本才能使用真实功能
- 当前使用模拟模式

**创建开发构建版本**：
```bash
# 安装 EAS CLI
npm install -g @expo/eas-cli

# 创建开发构建
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 3. 权限配置

#### Android 权限配置

在 `app.json` 中添加：

```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.RECORD_AUDIO",
        "android.permission.INTERNET"
      ]
    }
  }
}
```

#### iOS 权限配置

在 `app.json` 中添加：

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSMicrophoneUsageDescription": "此应用需要访问麦克风以进行语音识别",
        "NSSpeechRecognitionUsageDescription": "此应用需要语音识别权限以转换语音为文字"
      }
    }
  }
}
```

## 🌍 支持的语言

### Web端（真实语音识别）
支持Web Speech API的所有语言：
- 中文 (zh-CN, zh-TW)
- 英文 (en-US, en-GB, en-AU)
- 西班牙语 (es-ES, es-MX)
- 法语 (fr-FR, fr-CA)
- 德语 (de-DE)
- 日语 (ja-JP)
- 韩语 (ko-KR)
- 意大利语 (it-IT)
- 葡萄牙语 (pt-BR, pt-PT)
- 俄语 (ru-RU)
- 阿拉伯语 (ar-SA)
- 印地语 (hi-IN)

### 移动端（模拟模式）
- 中文 (zh) - 苹果、香蕉、橙子、葡萄、草莓
- 英文 (en) - apple, banana, orange, grape, strawberry
- 西班牙语 (es) - manzana, plátano, naranja, uva, fresa
- 法语 (fr) - pomme, banane, orange, raisin, fraise

## 💰 费用说明

### Web端
- ✅ **完全免费** - Web Speech API
- ✅ 无需网络连接
- ✅ 无需API密钥
- ✅ 真实语音识别

### 移动端（Expo Go）
- ✅ **完全免费** - 模拟模式
- ✅ 无需网络连接
- ✅ 无需API密钥
- ⚠️ 仅演示功能

### 移动端（开发构建版本）
- ✅ **完全免费** - 设备原生功能
- ✅ 无需网络连接
- ✅ 无需API密钥
- ✅ 真实语音识别

## 🔒 隐私优势

1. **数据不离开设备**：语音识别在设备本地进行
2. **无需网络连接**：离线工作
3. **无需API密钥**：不涉及第三方服务
4. **完全免费**：无使用限制

## 🧪 测试

### Web端测试
1. 在Chrome、Safari或Edge浏览器中打开应用
2. 点击语音按钮
3. 允许麦克风权限
4. 说话测试语音识别
5. 验证多语言支持

### 移动端测试（Expo Go）
1. 点击语音按钮
2. 选择"模拟识别"
3. 等待2秒查看模拟结果
4. 验证多语言支持

### 移动端测试（开发构建版本）
1. 确保麦克风权限已授予
2. 测试真实语音识别功能
3. 验证多语言支持
4. 测试离线功能

## 🚨 故障排除

### Web端问题

1. **"语音识别不支持"错误**
   - 使用Chrome、Safari或Edge浏览器
   - 检查浏览器是否支持Web Speech API
   - 确保使用HTTPS协议

2. **麦克风权限被拒绝**
   - 在浏览器设置中允许麦克风访问
   - 刷新页面重新请求权限
   - 检查系统麦克风权限

3. **识别准确度低**
   - 确保环境安静
   - 说话清晰
   - 检查语言设置是否正确

### 移动端问题（Expo Go）

1. **"原生模块不存在"错误**
   - 这是正常现象，Expo Go不支持原生语音识别
   - 使用模拟模式进行演示
   - 需要开发构建版本才能使用真实功能

2. **模拟识别不工作**
   - 检查网络连接
   - 重启应用
   - 检查控制台错误信息

### 移动端问题（开发构建版本）

1. **权限被拒绝**
   - 检查麦克风权限设置
   - 确认设备支持语音识别
   - 重启应用重新请求权限

2. **识别准确度低**
   - 确保环境安静
   - 说话清晰
   - 检查语言设置是否正确

3. **语音识别不工作**
   - 检查设备是否支持语音识别
   - 确认网络连接（某些设备需要）
   - 重启应用

## 📚 相关文档

- [Web Speech API 文档](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition)
- [Expo 开发构建文档](https://docs.expo.dev/development/introduction/)
- [EAS Build 文档](https://docs.expo.dev/build/introduction/)
- [React Native 权限文档](https://reactnative.dev/docs/permissionsandroid)
- [Chrome 语音识别文档](https://developers.google.com/web/updates/2013/01/Voice-Driven-Web-Apps-Introduction-to-the-Web-Speech-API)
