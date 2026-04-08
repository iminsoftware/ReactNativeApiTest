# 快速启动指南

## ✅ 项目已重新配置完成（2026-03-12）

项目配置文件已经清理并重新安装，所有依赖和构建文件都已就绪。

### 当前状态
- ✅ node_modules 已重新安装
- ✅ lib/commonjs 已构建
- ✅ lib/module 已构建  
- ✅ lib/typescript 已构建（类型定义）
- ✅ TypeScript 配置已优化
- ✅ IminLibs1.0.25.jar 已复制到 android/libs/
- ✅ Gradle 镜像已配置（阿里云加速）

### ⚠️ 已知问题

**Example 项目 Gradle 构建非常缓慢**
- Gradle 在初始化时需要下载大量依赖（React Native 0.75.4）
- 会卡在 "Evaluating settings" 阶段 10-30 分钟
- 这是正常现象，需要耐心等待首次构建完成
- **建议：跳过 example，直接在现有项目中测试**（见下方推荐方式）

详细的替代方案请查看：[EXAMPLE_ALTERNATIVE.md](./EXAMPLE_ALTERNATIVE.md)

## 🚀 推荐使用方式

### 方式 1：在现有项目中使用（推荐）✅

```bash
# 在你的 React Native 项目目录
cd YourReactNativeProject

# 安装插件（使用本地路径）
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware

# 或发布到 npm 后
npm install react-native-imin-hardware
```

使用示例：

```typescript
import { Device, Scanner, Cashbox } from 'react-native-imin-hardware';

// 获取设备信息
const deviceInfo = await Device.getDeviceInfo();
console.log('设备型号:', deviceInfo.model);

// 扫描功能
await Scanner.startScan();
Scanner.addListener('onScanResult', (data) => {
  console.log('扫描结果:', data);
});

// 钱箱控制
await Cashbox.openCashbox();
```

### 方式 2：运行 Example 项目（可选）

如果需要运行 example 进行测试：

### 步骤 3：安装并运行 Example

#### 方法 A：使用 Yarn（推荐）

```bash
# 安装 Yarn（如果没有）
npm install -g yarn

# 进入 example 目录
cd example

# 安装依赖
yarn install

# 运行应用
yarn android
```

#### 方法 B：使用 npm

```bash
cd example

# 清理（如果之前安装失败）
rmdir /s /q node_modules
del package-lock.json

# 安装依赖
npm install --legacy-peer-deps

# 运行应用
npm run android
```

## 🐛 常见问题

### 1. "gradlew.bat" 找不到

**原因**：example 缺少完整的 Gradle Wrapper

**解决方案**：

#### 方案 A：在现有项目中测试（推荐）✅

```bash
# 在你的 React Native 项目中
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware

# 使用
import { Device, Scanner, CashBox } from 'react-native-imin-hardware';
```

#### 方案 B：复制 Gradle Wrapper

```bash
# 从 IMinApiTest 复制
copy D:\old_D\20210719\projects\AProject\IMinApiTest\gradlew.bat example\android\
copy D:\old_D\20210719\projects\AProject\IMinApiTest\gradle\wrapper\* example\android\gradle\wrapper\
```

#### 方案 C：创建新的测试项目

```bash
npx react-native init TestIminHardware
cd TestIminHardware
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware
```

### 2. "bob build" 失败

**原因**：主项目依赖未安装

**解决**：
```bash
cd react-native-imin-hardware
npm install
npm run prepare
```

### 2. "EPERM" 权限错误

**原因**：Windows 文件锁定

**解决**：
- 使用 Yarn 代替 npm
- 或以管理员权限运行 PowerShell
- 或关闭杀毒软件

### 3. "Cannot find module"

**原因**：lib 目录未生成

**解决**：
```bash
cd react-native-imin-hardware
npm run prepare
```

## ✅ 验证安装

安装成功后，你应该看到：

```
react-native-imin-hardware/
├── lib/                    # ✅ 构建输出
│   ├── commonjs/
│   ├── module/
│   └── typescript/
├── node_modules/           # ✅ 依赖
└── example/
    └── node_modules/       # ✅ Example 依赖
```

## 🎯 快速测试

运行 example 应用后，你应该看到：
1. 首页显示设备信息
2. 3个可用模块（Device、Scanner、CashBox）
3. 点击进入详情页测试功能

## 📱 在自己的项目中使用

如果 example 有问题，可以直接在你的 React Native 项目中测试：

```bash
# 在你的项目目录
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware

# 使用
import { Device, Scanner, CashBox } from 'react-native-imin-hardware';

const model = await Device.getModel();
```
