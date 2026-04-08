# Example App - 示例应用

# Example App - 示例应用

## 🚀 快速开始

### 方法 1：使用 Yarn（推荐）

```bash
# 1. 安装 Yarn
npm install -g yarn

# 2. 复制 SDK 文件
# 将 IminLibs1.0.25.jar 从 FlutterApiTest/android/libs/ 
# 复制到 ../android/libs/

# 3. 安装依赖
cd example
yarn install

# 4. 运行
yarn android
```

### 方法 2：使用 npm（需要管理员权限）

```bash
# 1. 复制 SDK 文件
# 将 IminLibs1.0.25.jar 从 FlutterApiTest/android/libs/ 
# 复制到 ../android/libs/

# 2. 清理并安装（以管理员权限运行）
cd example
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# 3. 运行
npm run android
```

### 方法 3：在自己的项目中测试

如果 example 安装有问题，可以在你自己的 React Native 项目中测试：

```bash
# 在你的项目目录
npm install ../react-native-imin-hardware

# 然后在代码中使用
import { Device, Scanner, CashBox } from 'react-native-imin-hardware';
```

## 📱 功能说明

### 首页（HomeScreen）
- 显示设备信息（型号、Android 版本）
- 模块列表（网格布局）
- 搜索功能

### Device 页面
- 显示完整设备信息
- 型号、序列号、Android 版本、SDK 版本

### Scanner 页面
- 连接状态显示
- 开始/停止监听
- 扫描历史记录
- 清空历史

### CashBox 页面
- 钱箱状态查询
- 打开钱箱
- 电压设置（9V/12V/24V）

## 🐛 常见问题

### 1. npm install 权限错误（EPERM）

**Windows 上的解决方案**：
```bash
# 方案 A: 使用 Yarn
npm install -g yarn
yarn install

# 方案 B: 清理后重装（管理员权限）
rmdir /s /q node_modules
del package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# 方案 C: 关闭杀毒软件和文件监控
# 有时杀毒软件会锁定 node_modules 文件
```

### 2. Metro bundler 错误

```bash
# 清理 Metro 缓存
npx react-native start --reset-cache
```

### 3. Android 构建错误

```bash
# 清理 Android 构建
cd android
./gradlew clean
cd ..
```

## 📝 注意事项

1. 需要在真实的 iMin 设备上测试
2. 确保 SDK JAR 文件已正确放置
3. 扫描器需要硬件支持
