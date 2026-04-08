# React Native iMin Hardware - 集成指南

## 安装

```bash
npm install react-native-imin-hardware
# 或
yarn add react-native-imin-hardware
```

## Android 配置

### 1. 确保 React Native 版本

本库支持 React Native >= 0.68.0

### 2. 权限配置

在 `android/app/src/main/AndroidManifest.xml` 中添加必要的权限:

```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.NFC" />
```

### 3. 自动链接

React Native 0.60+ 会自动链接原生模块,无需手动配置。

## 基本使用

```typescript
import IminHardware from 'react-native-imin-hardware';

// 打印机功能
await IminHardware.initPrinter();
await IminHardware.printText('Hello World');
await IminHardware.printAndFeedPaper(100);

// 扫码功能
const result = await IminHardware.startScan();
console.log('扫码结果:', result);

// NFC 功能
await IminHardware.initNFC();
const nfcData = await IminHardware.readNFC();
```

## 故障排除

### 构建错误

如果遇到依赖冲突,请确保:

1. 清理缓存:
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
```

2. 确保 `android/build.gradle` 中的 React Native 版本一致

### 在 iMin 设备上测试

本库专为 iMin POS 设备设计,需要在实际的 iMin 硬件上测试完整功能。

## API 文档

详细 API 文档请参考 [README.md](./README.md)
