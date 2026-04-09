# react-native-imin-hardware

iMin POS 设备 React Native 硬件插件。

[English](./README.md)

## 支持设备

Crane 1、Swan 1、Swan 2、Swift 1、Swift 2、Swift 2 Ultra、Lark 1、Falcon 2、M2-Pro 及其他 iMin Android POS 设备。

## 功能模块

| 模块 | 说明 |
|------|------|
| Device | 设备信息（型号、序列号、品牌等） |
| Scanner | 硬件条码/二维码扫描头 |
| CameraScan | 摄像头扫码（基于 ZXing） |
| CashBox | 钱箱控制 |
| NFC | NFC 读卡器 |
| MSR | 磁条卡读卡器 |
| RFID | UHF RFID 标签读写 |
| Scale | 电子秤（串口通信） |
| ScaleNew | 电子秤（Android 13+ iMinEscale SDK） |
| Serial | 串口通信 |
| Display | 副屏控制 |
| Light | USB LED 指示灯 |
| Segment | 段码屏（数码管） |
| FloatingWindow | 悬浮窗 |

## 安装

```bash
npm install react-native-imin-hardware
```

### Android 配置

**minSdkVersion**: 24
**compileSdkVersion**: 34+

React Native 0.68+ 自动链接，无需额外原生配置。

## 使用方法

```typescript
import {
  Device, Scanner, CameraScan, CashBox, Nfc, Msr,
  Rfid, Scale, ScaleNew, Serial, Display, Light,
  Segment, FloatingWindow,
} from 'react-native-imin-hardware';
```

### 设备信息

```typescript
const model = await Device.getModel();
const sn = await Device.getSerialNumber();
const info = await Device.getDeviceInfo();
```

### 扫码头（硬件扫描器）

```typescript
await Scanner.startListening();

const subscription = Scanner.addListener((event) => {
  if (event.type === 'scanResult') {
    console.log('扫码结果:', event.data.data);
  }
});

await Scanner.stopListening();
subscription.remove();
```

### 摄像头扫码

```typescript
const code = await CameraScan.scanQuick();

const result = await CameraScan.scan({
  formats: ['QR_CODE', 'EAN_13'],
  useFlash: false,
  beepEnabled: true,
});
```

### 钱箱

```typescript
await CashBox.open();
const isOpen = await CashBox.getStatus();
```

### NFC

```typescript
const available = await Nfc.isAvailable();
await Nfc.startListening();

const subscription = Nfc.addListener((tag) => {
  console.log('NFC ID:', tag.id);
  console.log('内容:', tag.content);
});

await Nfc.stopListening();
subscription.remove();
```

### RFID

```typescript
await Rfid.connect();
await Rfid.startReading();

const subscription = Rfid.addTagListener((event) => {
  if (event.type === 'tag') {
    console.log('EPC:', event.epc, 'RSSI:', event.rssi);
  }
});

await Rfid.stopReading();
await Rfid.disconnect();
subscription.remove();
```

### 电子秤（串口）

```typescript
await Scale.connect('/dev/ttyS4');

const subscription = Scale.addListener((data) => {
  console.log('重量:', data.weight, '状态:', data.status);
});

await Scale.tare(); // 去皮
await Scale.zero(); // 归零
await Scale.disconnect();
subscription.remove();
```

### 电子秤（Android 13+ 新版）

```typescript
await ScaleNew.connectService();
await ScaleNew.getData();

const subscription = ScaleNew.addListener((event) => {
  if (event.type === 'weight') {
    console.log('净重:', event.net, '稳定:', event.isStable);
  }
});

await ScaleNew.tare(); // 去皮
await ScaleNew.zero(); // 归零
await ScaleNew.cancelGetData();
subscription.remove();
```

### 串口通信

```typescript
await Serial.open('/dev/ttyS4', 115200);

const subscription = Serial.addListener((event) => {
  console.log('接收数据:', event.data);
});

await Serial.write('72,101,108,108,111');
await Serial.writeString('Hello');
await Serial.close();
subscription.remove();
```

### 副屏

```typescript
const available = await Display.isAvailable();
await Display.enable();
await Display.showText('Hello');
await Display.showImage('https://example.com/image.png');
await Display.playVideo('https://example.com/video.mp4');
await Display.clear();
await Display.disable();
```

### LED 灯

```typescript
await Light.connect();
await Light.turnOnGreen(); // 绿灯
await Light.turnOnRed();   // 红灯
await Light.turnOff();     // 关灯
await Light.disconnect();
```

### 段码屏

```typescript
const device = await Segment.findDevice();
await Segment.requestPermission();
await Segment.connect();
await Segment.sendData('12345', 'right');
await Segment.clear();
await Segment.disconnect();
```

### 悬浮窗

```typescript
const hasPermission = await FloatingWindow.hasPermission();
if (!hasPermission) {
  await FloatingWindow.requestPermission();
}
await FloatingWindow.show();
await FloatingWindow.updateText('订单 #1234');
await FloatingWindow.setPosition(100, 200);
await FloatingWindow.hide();
```

### 磁条卡读卡器（MSR）

MSR 作为键盘输入设备工作，刷卡时数据会自动输入到当前获得焦点的 TextInput。

```typescript
const available = await Msr.isAvailable();
```

## 仓库地址

https://github.com/iminsoftware/ReactNativeApiTest

## License

MIT
