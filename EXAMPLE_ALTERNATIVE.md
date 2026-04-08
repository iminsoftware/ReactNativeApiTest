# Example 项目替代方案

## 问题说明

Example 项目的 Gradle 构建一直卡在 "Evaluating settings" 阶段，这是因为：

1. React Native 0.75.4 的 native_modules.gradle 脚本在扫描依赖时非常慢
2. 需要下载大量的 Maven 依赖
3. 即使配置了国内镜像，首次构建仍需要很长时间（可能 10-30 分钟）

## 解决方案

### 方案 1：耐心等待（推荐如果你有时间）

Gradle 正在后台下载依赖，这是正常的。建议：

1. 让 Gradle 命令继续运行，不要中断
2. 打开任务管理器，确认 java.exe 进程在运行且有网络活动
3. 等待 10-30 分钟，直到下载完成
4. 首次构建完成后，后续构建会快很多

```bash
cd example/android
# 让这个命令运行，不要中断，即使看起来卡住了
gradlew assembleDebug
```

### 方案 2：使用现有的 React Native 项目测试（最快）✅

不使用 example，直接在你现有的项目中测试：

```bash
# 在你的 React Native 项目目录
cd YourExistingReactNativeProject

# 安装插件
npm install ../react-native-imin-hardware

# 或使用绝对路径
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware
```

然后在你的代码中使用：

```typescript
import { Device, Scanner, Cashbox } from 'react-native-imin-hardware';

// 测试设备信息
async function testDevice() {
  try {
    const model = await Device.getModel();
    console.log('设备型号:', model);
    
    const info = await Device.getDeviceInfo();
    console.log('设备信息:', info);
  } catch (error) {
    console.error('错误:', error);
  }
}

// 测试扫描功能
async function testScanner() {
  try {
    await Scanner.startScan();
    
    Scanner.addListener('onScanResult', (data) => {
      console.log('扫描结果:', data);
      Scanner.stopScan();
    });
  } catch (error) {
    console.error('错误:', error);
  }
}

// 测试钱箱
async function testCashbox() {
  try {
    await Cashbox.openCashbox();
    console.log('钱箱已打开');
  } catch (error) {
    console.error('错误:', error);
  }
}
```

### 方案 3：创建最小化的测试项目

创建一个新的、干净的 React Native 项目：

```bash
# 创建新项目
npx react-native init TestIminHardware --version 0.71.0

cd TestIminHardware

# 安装插件
npm install ../react-native-imin-hardware

# 运行
npm run android
```

### 方案 4：手动构建 APK（跳过 Gradle 问题）

如果你只是想快速测试，可以：

1. 使用 Android Studio 打开 `example/android`
2. 让 Android Studio 自动处理依赖下载（它有更好的进度显示）
3. 点击 "Build" -> "Build Bundle(s) / APK(s)" -> "Build APK(s)"
4. 安装生成的 APK 到设备

### 方案 5：使用 Gradle 守护进程日志诊断

查看 Gradle 到底在做什么：

```bash
# 查看 Gradle 守护进程日志
type C:\Users\Administrator\.gradle\daemon\8.3\daemon-*.out.log

# 或实时监控
Get-Content C:\Users\Administrator\.gradle\daemon\8.3\daemon-*.out.log -Wait
```

## 推荐流程

**最快的验证方式：**

1. 使用你现有的 React Native 项目
2. 安装插件：`npm install ../react-native-imin-hardware`
3. 在项目中导入并测试功能
4. 在真实的 iMin 设备上运行

这样可以：
- ✅ 跳过 example 的构建问题
- ✅ 在真实环境中测试
- ✅ 节省大量时间
- ✅ 使用你熟悉的项目结构

## 主项目状态

主项目（react-native-imin-hardware）本身已经完全构建好：

```
✅ 依赖已安装
✅ TypeScript 已编译
✅ lib/commonjs 已生成
✅ lib/module 已生成
✅ lib/typescript 已生成
✅ JAR 文件已复制
✅ Android 模块配置正确
```

可以直接使用，不需要等待 example 构建完成。

## 如果必须运行 example

如果你坚持要运行 example 项目：

1. **确保网络畅通**（最好使用 VPN）
2. **增加 Gradle 内存**：编辑 `example/android/gradle.properties`
   ```properties
   org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=2048m
   ```
3. **使用 Gradle 守护进程**：
   ```bash
   cd example/android
   gradlew --daemon assembleDebug
   ```
4. **耐心等待 10-30 分钟**，不要中断
5. **查看进度**：打开任务管理器，确认 java.exe 有网络活动

## 常见问题

**Q: 为什么卡在 "Evaluating settings"？**
A: React Native 的 native_modules.gradle 正在扫描所有依赖，这个过程很慢。

**Q: 需要等多久？**
A: 首次构建可能需要 10-30 分钟，取决于网络速度。

**Q: 如何确认没有卡死？**
A: 打开任务管理器，查看 java.exe 进程是否有 CPU 和网络活动。

**Q: 可以跳过 example 吗？**
A: 可以！直接在现有项目中使用插件即可。
