# react-native-imin-hardware

iMin POS 设备 React Native 硬件插件。

[English](./README.md)

## 支持设备

Crane 1、Swan 1、Swan 2、Swan 2 Pro、Swift 1、Swift 2、Swift 2 Ultra、Lark 1、Falcon 1 Pro、Falcon 2、M2-Pro 等 及其他 iMin Android POS 设备。

## 功能模块

| 模块           | 说明                                 |
| -------------- | ------------------------------------ |
| Device         | 设备信息（型号、序列号、品牌等）     |
| Scanner        | 硬件条码/二维码扫描头                |
| CameraScan     | 摄像头扫码（ZXing + ML Kit）         |
| CashBox        | 钱箱控制                             |
| NFC            | NFC 读卡器                           |
| MSR            | 磁条卡读卡器                         |
| RFID           | UHF RFID 标签读写                    |
| Scale          | 电子秤（串口通信）                   |
| ScaleNew       | 电子秤（Android 13+ iMinEscale SDK） |
| Serial         | 串口通信                             |
| Display        | 副屏控制                             |
| Light          | USB LED 指示灯                       |
| Segment        | 段码屏（数码管）                     |
| FloatingWindow | 悬浮窗                               |

## 快速上手

### 1. 安装

```bash
npm install react-native-imin-hardware
# 或
yarn add react-native-imin-hardware
```

### 2. Android 要求

- **minSdkVersion**: 24
- **compileSdkVersion**: 34+
- **React Native**: 0.68+

无需额外原生配置，插件自动链接。

### 3. 试一试

```typescript
import { Device, CameraScan } from 'react-native-imin-hardware';

// 获取设备型号
const model = await Device.getModel();
console.log('设备:', model);

// 快速扫码
const code = await CameraScan.scanQuick();
console.log('扫码结果:', code);
```

## API 文档

### Device（设备信息）

```typescript
import { Device } from 'react-native-imin-hardware';
```

| 方法                        | 返回值                  | 说明                      |
| --------------------------- | ----------------------- | ------------------------- |
| `getModel()`              | `Promise<string>`     | 设备型号                  |
| `getSerialNumber()`       | `Promise<string>`     | 序列号                    |
| `getBrand()`              | `Promise<string>`     | 品牌                      |
| `getDeviceName()`         | `Promise<string>`     | 设备名称                  |
| `getAndroidVersion()`     | `Promise<string>`     | Android SDK 版本号        |
| `getAndroidVersionName()` | `Promise<string>`     | Android 版本名（如 "13"） |
| `getSdkVersion()`         | `Promise<string>`     | iMin SDK 版本             |
| `getServiceVersion()`     | `Promise<string>`     | iMin 服务版本             |
| `getDeviceInfo()`         | `Promise<DeviceInfo>` | 一次获取全部信息          |

```typescript
const info = await Device.getDeviceInfo();
// info = { model, serialNumber, androidVersion, sdkVersion, brand, deviceName, ... }
```

### Scanner（硬件扫码头）

监听内置硬件扫码头的条码数据。

```typescript
import { Scanner } from 'react-native-imin-hardware';
```

| 方法                      | 返回值                  | 说明                  |
| ------------------------- | ----------------------- | --------------------- |
| `startListening()`      | `Promise<boolean>`    | 开始接收扫码事件      |
| `stopListening()`       | `Promise<boolean>`    | 停止接收              |
| `isConnected()`         | `Promise<boolean>`    | 检查扫码头连接状态    |
| `configure(config)`     | `Promise<void>`       | 自定义广播动作/数据键 |
| `addListener(callback)` | `EmitterSubscription` | 监听扫码事件          |

```typescript
await Scanner.startListening();

const subscription = Scanner.addListener((event) => {
  if (event.type === 'scanResult') {
    console.log('条码:', event.data.data);
    console.log('类型:', event.data.labelType);
  }
});

await Scanner.stopListening();
subscription.remove();
```

**自定义配置**（可选，用于非标准扫码头广播）：

```typescript
await Scanner.configure({
  action: 'com.example.SCAN_ACTION',
  dataKey: 'barcode_string',
  byteDataKey: 'barcode_bytes',
});
```

### CameraScan（摄像头扫码）

打开摄像头扫描条码和二维码。支持 ZXing（默认）和 ML Kit 引擎。

```typescript
import { CameraScan, BarcodeFormat, DecodeEngine } from 'react-native-imin-hardware';
```

#### 基础扫码（ZXing）

| 方法               | 返回值                      | 说明                                |
| ------------------ | --------------------------- | ----------------------------------- |
| `scan(options?)` | `Promise<ScanResultData>` | 扫一个码，返回 `{ code, format }` |
| `scanQuick()`    | `Promise<string>`         | 扫码只返回内容字符串                |
| `scanQRCode()`   | `Promise<string>`         | 仅扫二维码                          |
| `scanBarcode()`  | `Promise<string>`         | 仅扫一维条码                        |
| `scanAll()`      | `Promise<ScanResultData>` | 启用全部格式扫码                    |

```typescript
// 最简用法
const code = await CameraScan.scanQuick();

// 带配置
const result = await CameraScan.scan({
  formats: [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13],
  useFlash: false,
  beepEnabled: true,
  timeout: 30000, // 30秒超时，0 = 不超时
});
console.log(result.code, result.format);
```

**CameraScanOptions 参数：**

| 字段            | 类型                    | 默认值      | 说明                       |
| --------------- | ----------------------- | ----------- | -------------------------- |
| `formats`     | `BarcodeFormatType[]` | 默认4种格式 | 要识别的条码格式           |
| `useFlash`    | `boolean`             | `false`   | 开启闪光灯                 |
| `beepEnabled` | `boolean`             | `true`    | 扫码成功播放提示音         |
| `timeout`     | `number`              | `0`       | 超时时间（毫秒），0=不超时 |

#### 多码扫描（ML Kit）

| 方法                    | 返回值                        | 说明                 |
| ----------------------- | ----------------------------- | -------------------- |
| `scanMulti(options?)` | `Promise<ScanResultData[]>` | 多码扫描，返回数组   |
| `isMLKitAvailable()`  | `Promise<boolean>`          | 检测 ML Kit 是否可用 |

```typescript
// 检测 ML Kit
const mlkit = await CameraScan.isMLKitAvailable();

// 多码扫描（返回数组）
const results = await CameraScan.scanMulti();
results.forEach(r => console.log(r.code, r.format));

// 完整配置
const results = await CameraScan.scanMulti({
  formats: [BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128],
  supportMultiBarcode: true,  // 同时识别多个码
  supportMultiAngle: true,    // 支持任意角度
  fullAreaScan: true,         // 全区域扫码
  areaRectRatio: 0.9,         // 识别区域比例
  decodeEngine: DecodeEngine.MLKIT,
  timeout: 30000,
});
```

**MultiScanOptions 参数：**

| 字段                    | 类型                    | 默认值         | 说明                    |
| ----------------------- | ----------------------- | -------------- | ----------------------- |
| `formats`             | `BarcodeFormatType[]` | 全部格式       | 要识别的条码格式        |
| `useFlash`            | `boolean`             | `false`      | 开启闪光灯              |
| `beepEnabled`         | `boolean`             | `true`       | 播放提示音              |
| `timeout`             | `number`              | `0`          | 超时时间（毫秒）        |
| `supportMultiBarcode` | `boolean`             | `true`       | 同时识别多个码          |
| `supportMultiAngle`   | `boolean`             | `true`       | 支持任意角度识别        |
| `decodeEngine`        | `0 \| 1`               | `1`（MLKit） | 0=ZXing, 1=ML Kit       |
| `fullAreaScan`        | `boolean`             | `true`       | 全区域扫码              |
| `areaRectRatio`       | `number`              | `0.8`        | 识别区域比例（0.5~1.0） |

**支持的条码格式：**

`QR_CODE`、`EAN_13`、`EAN_8`、`UPC_A`、`UPC_E`、`CODE_128`、`CODE_39`、`CODE_93`、`CODABAR`、`ITF`、`RSS_14`、`RSS_EXPANDED`、`DATA_MATRIX`、`PDF_417`、`AZTEC`、`MAXICODE`

### CashBox（钱箱）

```typescript
import { CashBox, CashBoxVoltage } from 'react-native-imin-hardware';
```

| 方法                    | 返回值               | 说明                                                |
| ----------------------- | -------------------- | --------------------------------------------------- |
| `open()`              | `Promise<void>`    | 打开钱箱                                            |
| `getStatus()`         | `Promise<boolean>` | `true`=打开, `false`=关闭                       |
| `setVoltage(voltage)` | `Promise<boolean>` | 设置电压：`CashBoxVoltage.V9` / `V12` / `V24` |

```typescript
await CashBox.open();
const isOpen = await CashBox.getStatus();
await CashBox.setVoltage(CashBoxVoltage.V12);
```

### NFC（读卡器）

```typescript
import { Nfc } from 'react-native-imin-hardware';
```

| 方法                      | 返回值                  | 说明              |
| ------------------------- | ----------------------- | ----------------- |
| `isAvailable()`         | `Promise<boolean>`    | 设备是否支持 NFC  |
| `isEnabled()`           | `Promise<boolean>`    | NFC 是否已开启    |
| `openSettings()`        | `Promise<boolean>`    | 打开 NFC 系统设置 |
| `startListening()`      | `Promise<boolean>`    | 开始监听标签      |
| `stopListening()`       | `Promise<boolean>`    | 停止监听          |
| `addListener(callback)` | `EmitterSubscription` | 监听标签事件      |

```typescript
await Nfc.startListening();

const subscription = Nfc.addListener((tag) => {
  console.log('标签ID:', tag.id);
  console.log('内容:', tag.content);
  console.log('技术:', tag.technology);
});

await Nfc.stopListening();
subscription.remove();
```

### RFID（标签读写）

```typescript
import { Rfid, RfidBank } from 'react-native-imin-hardware';
```

| 方法                      | 返回值               | 说明                |
| ------------------------- | -------------------- | ------------------- |
| `connect()`             | `Promise<boolean>` | 连接 RFID 设备      |
| `disconnect()`          | `Promise<boolean>` | 断开连接            |
| `isConnected()`         | `Promise<boolean>` | 检查连接状态        |
| `startReading()`        | `Promise<boolean>` | 开始连续读取标签    |
| `stopReading()`         | `Promise<boolean>` | 停止读取            |
| `readTag(params?)`      | `Promise<boolean>` | 读取指定存储区      |
| `writeTag(params)`      | `Promise<boolean>` | 写入存储区          |
| `writeEpc(params)`      | `Promise<boolean>` | 写入新 EPC          |
| `lockTag(params)`       | `Promise<boolean>` | 锁定标签            |
| `killTag(password)`     | `Promise<boolean>` | 永久销毁标签        |
| `setPower(read, write)` | `Promise<boolean>` | 设置射频功率（dBm） |
| `setFilter(epc)`        | `Promise<boolean>` | 按 EPC 过滤         |
| `clearFilter()`         | `Promise<boolean>` | 清除过滤            |
| `getBatteryLevel()`     | `Promise<number>`  | RFID 手柄电量 %     |
| `isCharging()`          | `Promise<boolean>` | 手柄是否充电中      |

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

### Scale（电子秤 - 串口）

```typescript
import { Scale } from 'react-native-imin-hardware';
```

| 方法                      | 返回值                  | 说明                      |
| ------------------------- | ----------------------- | ------------------------- |
| `connect(path?)`        | `Promise<boolean>`    | 连接，默认 `/dev/ttyS4` |
| `disconnect()`          | `Promise<boolean>`    | 断开                      |
| `tare()`                | `Promise<boolean>`    | 去皮                      |
| `zero()`                | `Promise<boolean>`    | 归零                      |
| `addListener(callback)` | `EmitterSubscription` | 监听重量数据              |

```typescript
await Scale.connect('/dev/ttyS4');

const subscription = Scale.addListener((data) => {
  console.log('重量:', data.weight, '状态:', data.status);
});

await Scale.tare();
await Scale.disconnect();
subscription.remove();
```

### ScaleNew（电子秤 - Android 13+）

使用 iMinEscale SDK（AIDL 服务）。

```typescript
import { ScaleNew, ScaleUnit } from 'react-native-imin-hardware';
```

| 方法                      | 返回值                  | 说明             |
| ------------------------- | ----------------------- | ---------------- |
| `connectService()`      | `Promise<boolean>`    | 连接秤服务       |
| `getData()`             | `Promise<boolean>`    | 开始接收重量数据 |
| `cancelGetData()`       | `Promise<boolean>`    | 停止接收         |
| `zero()`                | `Promise<boolean>`    | 归零             |
| `tare()`                | `Promise<boolean>`    | 去皮             |
| `digitalTare(weight)`   | `Promise<boolean>`    | 数字去皮（克）   |
| `setUnitPrice(price)`   | `Promise<boolean>`    | 设置单价         |
| `getUnitPrice()`        | `Promise<string>`     | 获取单价         |
| `setUnit(unit)`         | `Promise<boolean>`    | 设置重量单位     |
| `getUnit()`             | `Promise<number>`     | 获取重量单位     |
| `getServiceVersion()`   | `Promise<string>`     | 服务版本         |
| `getFirmwareVersion()`  | `Promise<string>`     | 固件版本         |
| `restart()`             | `Promise<boolean>`    | 重启电子秤       |
| `addListener(callback)` | `EmitterSubscription` | 监听事件         |

```typescript
await ScaleNew.connectService();
await ScaleNew.getData();

const subscription = ScaleNew.addListener((event) => {
  if (event.type === 'weight') {
    console.log('净重:', event.net, '皮重:', event.tare, '稳定:', event.isStable);
  }
  if (event.type === 'price') {
    console.log('总价:', event.totalPrice);
  }
});

await ScaleNew.tare();
await ScaleNew.cancelGetData();
subscription.remove();
```

### Serial（串口通信）

```typescript
import { Serial } from 'react-native-imin-hardware';
```

| 方法                      | 返回值                  | 说明                 |
| ------------------------- | ----------------------- | -------------------- |
| `open(path, baudRate?)` | `Promise<boolean>`    | 打开串口             |
| `close()`               | `Promise<boolean>`    | 关闭串口             |
| `write(data)`           | `Promise<boolean>`    | 写入字节（逗号分隔） |
| `writeString(text)`     | `Promise<boolean>`    | 写入字符串           |
| `isOpen()`              | `Promise<boolean>`    | 检查串口是否打开     |
| `addListener(callback)` | `EmitterSubscription` | 监听接收数据         |

```typescript
await Serial.open('/dev/ttyS4', 115200);

const subscription = Serial.addListener((event) => {
  console.log('接收:', event.data); // number[]
});

await Serial.writeString('Hello');
await Serial.write('72,101,108,108,111'); // 字节值
await Serial.close();
subscription.remove();
```

### Display（副屏）

```typescript
import { Display } from 'react-native-imin-hardware';
```

| 方法                | 返回值               | 说明                       |
| ------------------- | -------------------- | -------------------------- |
| `isAvailable()`   | `Promise<boolean>` | 检查副屏是否存在           |
| `enable()`        | `Promise<boolean>` | 启用副屏                   |
| `disable()`       | `Promise<boolean>` | 关闭副屏                   |
| `showText(text)`  | `Promise<boolean>` | 显示文本                   |
| `showImage(path)` | `Promise<boolean>` | 显示图片（URL 或本地路径） |
| `playVideo(path)` | `Promise<boolean>` | 播放视频（循环）           |
| `clear()`         | `Promise<boolean>` | 清除内容                   |

```typescript
await Display.enable();
await Display.showText('合计: ¥12.50');
await Display.showImage('https://example.com/promo.png');
await Display.playVideo('https://example.com/ad.mp4');
await Display.clear();
await Display.disable();
```

### Light（LED 灯）

```typescript
import { Light } from 'react-native-imin-hardware';
```

| 方法              | 返回值               | 说明                               |
| ----------------- | -------------------- | ---------------------------------- |
| `connect()`     | `Promise<boolean>` | 连接 LED 设备（自动请求 USB 权限） |
| `turnOnGreen()` | `Promise<boolean>` | 开绿灯                             |
| `turnOnRed()`   | `Promise<boolean>` | 开红灯                             |
| `turnOff()`     | `Promise<boolean>` | 关灯                               |
| `disconnect()`  | `Promise<boolean>` | 断开连接                           |

```typescript
await Light.connect();
await Light.turnOnGreen();
await Light.turnOff();
await Light.disconnect();
```

### Segment（段码屏）

```typescript
import { Segment } from 'react-native-imin-hardware';
```

| 方法                       | 返回值                         | 说明                                                 |
| -------------------------- | ------------------------------ | ---------------------------------------------------- |
| `findDevice()`           | `Promise<SegmentDeviceInfo>` | 查找 USB 段码屏设备                                  |
| `requestPermission()`    | `Promise<boolean>`           | 请求 USB 权限                                        |
| `connect()`              | `Promise<boolean>`           | 连接设备                                             |
| `sendData(data, align?)` | `Promise<boolean>`           | 显示数据（最多9位），对齐：`'left'` 或 `'right'` |
| `clear()`                | `Promise<boolean>`           | 清屏                                                 |
| `full()`                 | `Promise<boolean>`           | 全亮（测试用）                                       |
| `disconnect()`           | `Promise<boolean>`           | 断开连接                                             |

```typescript
await Segment.findDevice();
await Segment.requestPermission();
await Segment.connect();
await Segment.sendData('12345', 'right');
await Segment.clear();
await Segment.disconnect();
```

### FloatingWindow（悬浮窗）

```typescript
import { FloatingWindow } from 'react-native-imin-hardware';
```

| 方法                    | 返回值               | 说明                     |
| ----------------------- | -------------------- | ------------------------ |
| `hasPermission()`     | `Promise<boolean>` | 检查悬浮窗权限           |
| `requestPermission()` | `Promise<boolean>` | 请求权限（跳转系统设置） |
| `show()`              | `Promise<boolean>` | 显示悬浮窗               |
| `hide()`              | `Promise<boolean>` | 隐藏悬浮窗               |
| `isShowing()`         | `Promise<boolean>` | 是否正在显示             |
| `updateText(text)`    | `Promise<boolean>` | 更新显示文本             |
| `setPosition(x, y)`   | `Promise<boolean>` | 设置位置（像素）         |

```typescript
if (!(await FloatingWindow.hasPermission())) {
  await FloatingWindow.requestPermission();
}
await FloatingWindow.show();
await FloatingWindow.updateText('订单 #1234 - ¥25.00');
await FloatingWindow.setPosition(100, 200);
await FloatingWindow.hide();
```

### MSR（磁条卡读卡器）

MSR 作为键盘输入设备工作。刷卡时数据会自动输入到当前获得焦点的 TextInput，无需特殊 API 调用。

```typescript
import { Msr } from 'react-native-imin-hardware';

const available = await Msr.isAvailable();
```

## 错误处理

所有异步方法都可能抛出错误。常见错误码：

| 错误码 | 说明 |
|--------|------|
| `CANCELED` | 用户取消了操作 |
| `NO_ACTIVITY` | 没有活跃的 Android Activity |
| `ALREADY_ACTIVE` | 扫码正在进行中 |
| `NO_DATA` | 没有返回结果 |
| `ERROR` | 通用错误（查看 message） |

```typescript
try {
  const result = await CameraScan.scan();
} catch (e) {
  if (e.code === 'CANCELED') {
    // 用户按了返回键
  } else {
    console.error('扫码错误:', e.message);
  }
}
```

## TypeScript 类型

所有类型均已导出，可直接引入：

```typescript
import type {
  // Device
  DeviceInfo,
  // Scanner
  ScannerConfig, ScanResult, ScannerEvent,
  // CameraScan
  ScanResultData, CameraScanOptions, MultiScanOptions,
  BarcodeFormatType, DecodeEngineType,
  // CashBox
  CashBoxVoltage,
  // NFC
  NfcTagData, NfcEvent,
  // RFID
  RfidTagData, RfidEvent, ReadTagParams, WriteTagParams, LockTagParams,
  // Scale
  ScaleDataEvent,
  // ScaleNew
  ScaleNewEvent, ScaleNewWeightEvent, ScaleNewPriceEvent,
  // Serial
  SerialDataEvent,
  // Segment
  SegmentDeviceInfo, SegmentAlign,
} from 'react-native-imin-hardware';
```

## scan() 和 scanMulti() 的区别

| | `scan()` | `scanMulti()` |
|---|---|---|
| 引擎 | ZXing | ML Kit（自动降级 ZXing） |
| 返回值 | 单个 `ScanResultData` | 数组 `ScanResultData[]` |
| 多码识别 | 不支持 | 支持 |
| 多角度 | 不支持 | 支持（任意旋转角度） |
| 适用场景 | 简单单码扫描 | 多码、旋转码 |
| 依赖 | 内置 | 需要 Google Play Services |

简单场景用 `scan()`，需要多角度或多码识别时用 `scanMulti()`。

## 设备兼容性

| 模块 | 要求 | 备注 |
|------|------|------|
| Device | 所有设备 | 始终可用 |
| Scanner | 内置扫码头 | 并非所有型号都有 |
| CameraScan | 摄像头 | 需要相机权限 |
| CashBox | 钱箱接口 | 查看设备规格 |
| NFC | NFC 硬件 | 用 `Nfc.isAvailable()` 检测 |
| MSR | MSR 硬件 | 键盘输入模式 |
| RFID | RFID 手柄 | 外接 UHF RFID 配件 |
| Scale | 串口 | 需要外接电子秤硬件 |
| ScaleNew | Android 13+ | iMinEscale SDK，仅新设备 |
| Serial | 串口 | 设备特定的端口路径 |
| Display | 副屏 | 仅双屏设备 |
| Light | USB LED | 外接 USB LED 配件 |
| Segment | USB 段码屏 | 外接 USB 配件 |
| FloatingWindow | Android 6.0+ | 需要 SYSTEM_ALERT_WINDOW 权限 |

## 事件监听

带事件的模块（Scanner、NFC、RFID、Scale、ScaleNew、Serial）返回 `EmitterSubscription`。务必在 `useEffect` 中清理：

```typescript
useEffect(() => {
  const subscription = Scanner.addListener((event) => {
    // 处理事件
  });
  return () => subscription.remove();
}, []);
```

## 常见问题

**Q: `scan()` 打开了相机但没反应？**
A: 确认相机权限已授予。插件会自动在 `AndroidManifest.xml` 中声明 `CAMERA` 权限，但运行时仍需用户授权。

**Q: 该用 `scan()` 还是 `scanMulti()`？**
A: 简单单码扫描用 `scan()`。需要扫描倾斜/旋转的码或同时识别多个码时用 `scanMulti()`。`scan()` 更轻量，不依赖 Google Play Services。

**Q: Scanner 收不到扫码事件？**
A: 确认已调用 `Scanner.startListening()`。部分设备使用自定义广播动作，需要用 `Scanner.configure()` 设置正确的 action 和 data key。

**Q: ScaleNew 方法调用失败？**
A: ScaleNew 需要 Android 13+ 和 iMinEscale 服务。旧设备请使用 `Scale`（串口）模块。

**Q: ML Kit 不可用？**
A: ML Kit 需要 Google Play Services。调用 `CameraScan.isMLKitAvailable()` 检测。不可用时 `scanMulti()` 会自动降级为 ZXing。

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本历史。

## 仓库地址

https://github.com/iminsoftware/ReactNativeApiTest

## License

MIT
