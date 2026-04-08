# react-native-imin-hardware

React Native plugin for iMin POS hardware devices.

## 📦 当前进度

✅ **已完成模块**（5/13）:
- Device（设备信息）
- Scanner（条码扫描器）
- CashBox（钱箱控制）
- NFC（NFC 读卡器）
- MSR（磁条卡读卡器）✨ 新增

✅ **示例应用**: 已创建，可测试所有已完成模块

## Features

- 📷 Scanner - Barcode/QR code scanning
- 💳 NFC - NFC card reading
- 💰 CashBox - Cash drawer control
- 📡 RFID - RFID tag reading (Coming soon)
- ⚖️ Scale - Electronic scale (Coming soon)
- 💳 MSR - Magnetic stripe reader
- 📺 Display - Secondary display (Coming soon)
- 💡 Light - LED light control (Coming soon)
- 🔌 Serial - Serial port communication (Coming soon)
- 🔢 Segment - Segment display (Coming soon)
- 📸 Camera - Camera scanning (Coming soon)
- 🪟 FloatingWindow - Floating window (Coming soon)
- 📱 Device - Device information

## Installation

```sh
npm install react-native-imin-hardware
```

## Quick Start

### 1. 构建主项目

```bash
cd react-native-imin-hardware
npm install
npm run prepare
```

### 2. 复制 SDK 文件

将 `IminLibs1.0.25.jar` 复制到 `android/libs/` 目录

### 3. 运行示例应用

```bash
cd example
yarn install
yarn android
```

详细步骤请查看 [QUICK_START.md](./QUICK_START.md)

## Documentation

详细文档请查看：
- `DEVELOPMENT_LOG.md` - 开发日志和进度
- `example/README.md` - 示例应用说明
- `../RN_HARDWARE_PLUGIN_REQUIREMENTS.md` - 完整需求文档

## License

MIT
