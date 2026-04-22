# react-native-imin-hardware

React Native plugin for iMin POS device hardware features.

[中文文档](./README_CN.md)

## Supported Devices

Crane 1, Swan 1, Swan 2, Swan 2 Pro, Swift 1, Swift 2, Swift 2 Ultra, Lark 1, Falcon 1 Pro, Falcon 2, M2-Pro and other iMin Android POS devices.

## Features

| Module | Description |
|--------|-------------|
| Device | Device info (model, serial number, brand, etc.) |
| Scanner | Hardware barcode/QR code scanner |
| CameraScan | Camera-based barcode/QR code scanning (ZXing + ML Kit) |
| CashBox | Cash drawer control |
| NFC | NFC card reading |
| MSR | Magnetic stripe card reader |
| RFID | UHF RFID tag read/write |
| Scale | Electronic scale (serial) |
| ScaleNew | Electronic scale (Android 13+ iMinEscale SDK) |
| Serial | Serial port communication |
| Display | Secondary display control |
| Light | USB LED indicator light |
| Segment | Segment display (digital tube) |
| FloatingWindow | Floating window overlay |

## Quick Start

### 1. Install

```bash
npm install react-native-imin-hardware
# or
yarn add react-native-imin-hardware
```

### 2. Android Requirements

- **minSdkVersion**: 24
- **compileSdkVersion**: 34+
- **React Native**: 0.68+

No additional native setup required. The plugin auto-links.

### 3. Try it

```typescript
import { Device, CameraScan } from 'react-native-imin-hardware';

// Get device model
const model = await Device.getModel();
console.log('Device:', model);

// Quick scan a barcode
const code = await CameraScan.scanQuick();
console.log('Scanned:', code);
```

## API Reference

### Device

Get device hardware information.

```typescript
import { Device } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `getModel()` | `Promise<string>` | Device model name |
| `getSerialNumber()` | `Promise<string>` | Device serial number |
| `getBrand()` | `Promise<string>` | Device brand |
| `getDeviceName()` | `Promise<string>` | Device name |
| `getAndroidVersion()` | `Promise<string>` | Android SDK version number |
| `getAndroidVersionName()` | `Promise<string>` | Android version name (e.g. "13") |
| `getSdkVersion()` | `Promise<string>` | iMin SDK version |
| `getServiceVersion()` | `Promise<string>` | iMin service version |
| `getDeviceInfo()` | `Promise<DeviceInfo>` | All info in one call |

```typescript
// Get all device info at once
const info = await Device.getDeviceInfo();
// info = { model, serialNumber, androidVersion, sdkVersion, brand, deviceName, ... }
```

### Scanner (Hardware Scan Head)

Listen for barcode data from the built-in hardware scanner.

```typescript
import { Scanner } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `startListening()` | `Promise<boolean>` | Start receiving scan events |
| `stopListening()` | `Promise<boolean>` | Stop receiving scan events |
| `isConnected()` | `Promise<boolean>` | Check scanner connection |
| `configure(config)` | `Promise<void>` | Set custom broadcast action/data keys |
| `addListener(callback)` | `EmitterSubscription` | Listen for scan events |

```typescript
// Start listening
await Scanner.startListening();

// Listen for scan results
const subscription = Scanner.addListener((event) => {
  if (event.type === 'scanResult') {
    console.log('Code:', event.data.data);
    console.log('Type:', event.data.labelType);
  }
});

// Stop when done
await Scanner.stopListening();
subscription.remove();
```

**Custom config** (optional, for non-standard scanner broadcast):

```typescript
await Scanner.configure({
  action: 'com.example.SCAN_ACTION',
  dataKey: 'barcode_string',
  byteDataKey: 'barcode_bytes',
});
```

### CameraScan

Open the camera to scan barcodes and QR codes. Supports ZXing (default) and ML Kit engines.

```typescript
import { CameraScan, BarcodeFormat, DecodeEngine } from 'react-native-imin-hardware';
```

#### Basic Scan (ZXing)

| Method | Return | Description |
|--------|--------|-------------|
| `scan(options?)` | `Promise<ScanResultData>` | Scan one code, returns `{ code, format }` |
| `scanQuick()` | `Promise<string>` | Scan and return code string only |
| `scanQRCode()` | `Promise<string>` | Scan QR codes only |
| `scanBarcode()` | `Promise<string>` | Scan 1D barcodes only |
| `scanAll()` | `Promise<ScanResultData>` | Scan with all formats enabled |

```typescript
// Simplest usage
const code = await CameraScan.scanQuick();

// With options
const result = await CameraScan.scan({
  formats: [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13],
  useFlash: false,
  beepEnabled: true,
  timeout: 30000, // 30s timeout, 0 = no timeout
});
console.log(result.code, result.format);
```

**CameraScanOptions:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `formats` | `BarcodeFormatType[]` | Default 4 formats | Barcode formats to recognize |
| `useFlash` | `boolean` | `false` | Turn on flashlight |
| `beepEnabled` | `boolean` | `true` | Play beep sound on scan |
| `timeout` | `number` | `0` | Timeout in ms, 0 = no timeout |

#### Multi Scan (ML Kit)

| Method | Return | Description |
|--------|--------|-------------|
| `scanMulti(options?)` | `Promise<ScanResultData[]>` | Scan multiple codes, returns array |
| `isMLKitAvailable()` | `Promise<boolean>` | Check if ML Kit is available |

```typescript
// Check ML Kit availability
const mlkit = await CameraScan.isMLKitAvailable();

// Multi-barcode scan (returns array)
const results = await CameraScan.scanMulti();
results.forEach(r => console.log(r.code, r.format));

// With full options
const results = await CameraScan.scanMulti({
  formats: [BarcodeFormat.QR_CODE, BarcodeFormat.CODE_128],
  supportMultiBarcode: true,
  supportMultiAngle: true,
  fullAreaScan: true,
  areaRectRatio: 0.9,
  decodeEngine: DecodeEngine.MLKIT,
  timeout: 30000,
});
```

**MultiScanOptions:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `formats` | `BarcodeFormatType[]` | All formats | Barcode formats to recognize |
| `useFlash` | `boolean` | `false` | Turn on flashlight |
| `beepEnabled` | `boolean` | `true` | Play beep sound |
| `timeout` | `number` | `0` | Timeout in ms |
| `supportMultiBarcode` | `boolean` | `true` | Recognize multiple codes at once |
| `supportMultiAngle` | `boolean` | `true` | Recognize codes at any angle |
| `decodeEngine` | `0 \| 1` | `1` (MLKit) | 0=ZXing, 1=ML Kit |
| `fullAreaScan` | `boolean` | `true` | Scan full camera area |
| `areaRectRatio` | `number` | `0.8` | Scan area ratio (0.5~1.0) |

**Supported barcode formats:**

`QR_CODE`, `EAN_13`, `EAN_8`, `UPC_A`, `UPC_E`, `CODE_128`, `CODE_39`, `CODE_93`, `CODABAR`, `ITF`, `RSS_14`, `RSS_EXPANDED`, `DATA_MATRIX`, `PDF_417`, `AZTEC`, `MAXICODE`

### CashBox

Control the cash drawer.

```typescript
import { CashBox, CashBoxVoltage } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `open()` | `Promise<void>` | Open the cash drawer |
| `getStatus()` | `Promise<boolean>` | `true` = open, `false` = closed |
| `setVoltage(voltage)` | `Promise<boolean>` | Set voltage: `CashBoxVoltage.V9` / `V12` / `V24` |

```typescript
await CashBox.open();
const isOpen = await CashBox.getStatus();
await CashBox.setVoltage(CashBoxVoltage.V12);
```

### NFC

Read NFC tags.

```typescript
import { Nfc } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `isAvailable()` | `Promise<boolean>` | Device supports NFC |
| `isEnabled()` | `Promise<boolean>` | NFC is turned on |
| `openSettings()` | `Promise<boolean>` | Open NFC system settings |
| `startListening()` | `Promise<boolean>` | Start listening for tags |
| `stopListening()` | `Promise<boolean>` | Stop listening |
| `addListener(callback)` | `EmitterSubscription` | Listen for tag events |

```typescript
const available = await Nfc.isAvailable();
if (!available) return;

await Nfc.startListening();

const subscription = Nfc.addListener((tag) => {
  console.log('Tag ID:', tag.id);
  console.log('Content:', tag.content);
  console.log('Tech:', tag.technology);
});

// Cleanup
await Nfc.stopListening();
subscription.remove();
```

### RFID

Read and write UHF RFID tags.

```typescript
import { Rfid, RfidBank } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `connect()` | `Promise<boolean>` | Connect RFID device |
| `disconnect()` | `Promise<boolean>` | Disconnect |
| `isConnected()` | `Promise<boolean>` | Check connection |
| `startReading()` | `Promise<boolean>` | Start continuous tag reading |
| `stopReading()` | `Promise<boolean>` | Stop reading |
| `readTag(params?)` | `Promise<boolean>` | Read specific memory bank |
| `writeTag(params)` | `Promise<boolean>` | Write to memory bank |
| `writeEpc(params)` | `Promise<boolean>` | Write new EPC |
| `lockTag(params)` | `Promise<boolean>` | Lock tag memory |
| `killTag(password)` | `Promise<boolean>` | Permanently kill tag |
| `setPower(read, write)` | `Promise<boolean>` | Set RF power (dBm) |
| `setFilter(epc)` | `Promise<boolean>` | Filter by EPC |
| `clearFilter()` | `Promise<boolean>` | Clear filter |
| `getBatteryLevel()` | `Promise<number>` | RFID handle battery % |
| `isCharging()` | `Promise<boolean>` | Is handle charging |

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

### Scale (Serial)

Read weight data from serial-connected electronic scale.

```typescript
import { Scale } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `connect(path?)` | `Promise<boolean>` | Connect, default `/dev/ttyS4` |
| `disconnect()` | `Promise<boolean>` | Disconnect |
| `tare()` | `Promise<boolean>` | Tare (zero with load) |
| `zero()` | `Promise<boolean>` | Zero (reset to 0) |
| `addListener(callback)` | `EmitterSubscription` | Listen for weight data |

```typescript
await Scale.connect('/dev/ttyS4');

const subscription = Scale.addListener((data) => {
  console.log('Weight:', data.weight, 'Status:', data.status);
});

await Scale.tare();
await Scale.disconnect();
subscription.remove();
```

### ScaleNew (Android 13+)

Electronic scale using iMinEscale SDK (AIDL service).

```typescript
import { ScaleNew, ScaleUnit } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `connectService()` | `Promise<boolean>` | Connect to scale service |
| `getData()` | `Promise<boolean>` | Start receiving weight data |
| `cancelGetData()` | `Promise<boolean>` | Stop receiving data |
| `zero()` | `Promise<boolean>` | Zero |
| `tare()` | `Promise<boolean>` | Tare |
| `digitalTare(weight)` | `Promise<boolean>` | Digital tare (grams) |
| `setUnitPrice(price)` | `Promise<boolean>` | Set unit price |
| `getUnitPrice()` | `Promise<string>` | Get unit price |
| `setUnit(unit)` | `Promise<boolean>` | Set weight unit |
| `getUnit()` | `Promise<number>` | Get weight unit |
| `getServiceVersion()` | `Promise<string>` | Service version |
| `getFirmwareVersion()` | `Promise<string>` | Firmware version |
| `restart()` | `Promise<boolean>` | Restart scale |
| `addListener(callback)` | `EmitterSubscription` | Listen for events |

```typescript
await ScaleNew.connectService();
await ScaleNew.getData();

const subscription = ScaleNew.addListener((event) => {
  if (event.type === 'weight') {
    console.log('Net:', event.net, 'Tare:', event.tare, 'Stable:', event.isStable);
  }
  if (event.type === 'price') {
    console.log('Total:', event.totalPrice);
  }
});

await ScaleNew.tare();
await ScaleNew.cancelGetData();
subscription.remove();
```

### Serial Port

Raw serial port communication.

```typescript
import { Serial } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `open(path, baudRate?)` | `Promise<boolean>` | Open serial port |
| `close()` | `Promise<boolean>` | Close serial port |
| `write(data)` | `Promise<boolean>` | Write bytes (comma-separated) |
| `writeString(text)` | `Promise<boolean>` | Write string |
| `isOpen()` | `Promise<boolean>` | Check if port is open |
| `addListener(callback)` | `EmitterSubscription` | Listen for received data |

```typescript
await Serial.open('/dev/ttyS4', 115200);

const subscription = Serial.addListener((event) => {
  console.log('Received:', event.data); // number[]
});

await Serial.writeString('Hello');
await Serial.write('72,101,108,108,111'); // byte values
await Serial.close();
subscription.remove();
```

### Display (Secondary Screen)

Control the customer-facing secondary display.

```typescript
import { Display } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `isAvailable()` | `Promise<boolean>` | Check if secondary display exists |
| `enable()` | `Promise<boolean>` | Enable display |
| `disable()` | `Promise<boolean>` | Disable display |
| `showText(text)` | `Promise<boolean>` | Show text |
| `showImage(path)` | `Promise<boolean>` | Show image (URL or local path) |
| `playVideo(path)` | `Promise<boolean>` | Play video (loops) |
| `clear()` | `Promise<boolean>` | Clear display content |

```typescript
const available = await Display.isAvailable();
if (!available) return;

await Display.enable();
await Display.showText('Total: $12.50');
await Display.showImage('https://example.com/promo.png');
await Display.playVideo('https://example.com/ad.mp4');
await Display.clear();
await Display.disable();
```

### Light (LED)

Control USB LED indicator light.

```typescript
import { Light } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `connect()` | `Promise<boolean>` | Connect LED device (requests USB permission) |
| `turnOnGreen()` | `Promise<boolean>` | Green light on |
| `turnOnRed()` | `Promise<boolean>` | Red light on |
| `turnOff()` | `Promise<boolean>` | Light off |
| `disconnect()` | `Promise<boolean>` | Disconnect |

```typescript
await Light.connect();
await Light.turnOnGreen();
// ... later
await Light.turnOff();
await Light.disconnect();
```

### Segment Display

Control the segment display (digital tube).

```typescript
import { Segment } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `findDevice()` | `Promise<SegmentDeviceInfo>` | Find USB segment device |
| `requestPermission()` | `Promise<boolean>` | Request USB permission |
| `connect()` | `Promise<boolean>` | Connect device |
| `sendData(data, align?)` | `Promise<boolean>` | Display data (max 9 chars), align: `'left'` or `'right'` |
| `clear()` | `Promise<boolean>` | Clear display |
| `full()` | `Promise<boolean>` | All segments on (test) |
| `disconnect()` | `Promise<boolean>` | Disconnect |

```typescript
await Segment.findDevice();
await Segment.requestPermission();
await Segment.connect();
await Segment.sendData('12345', 'right');
await Segment.clear();
await Segment.disconnect();
```

### Floating Window

Show a floating overlay window on screen.

```typescript
import { FloatingWindow } from 'react-native-imin-hardware';
```

| Method | Return | Description |
|--------|--------|-------------|
| `hasPermission()` | `Promise<boolean>` | Check overlay permission |
| `requestPermission()` | `Promise<boolean>` | Request permission (opens settings) |
| `show()` | `Promise<boolean>` | Show floating window |
| `hide()` | `Promise<boolean>` | Hide floating window |
| `isShowing()` | `Promise<boolean>` | Check if visible |
| `updateText(text)` | `Promise<boolean>` | Update displayed text |
| `setPosition(x, y)` | `Promise<boolean>` | Set window position (px) |

```typescript
if (!(await FloatingWindow.hasPermission())) {
  await FloatingWindow.requestPermission();
}
await FloatingWindow.show();
await FloatingWindow.updateText('Order #1234 - $25.00');
await FloatingWindow.setPosition(100, 200);
await FloatingWindow.hide();
```

### MSR (Magnetic Stripe Reader)

MSR works as a keyboard input device. When a card is swiped, data is automatically typed into the currently focused TextInput. No special API calls needed beyond checking availability.

```typescript
import { Msr } from 'react-native-imin-hardware';

const available = await Msr.isAvailable();
```

## Error Handling

All async methods may throw errors. Common error codes:

| Code | Description |
|------|-------------|
| `CANCELED` | User canceled the operation |
| `NO_ACTIVITY` | No active Android activity |
| `ALREADY_ACTIVE` | A scan is already in progress |
| `NO_DATA` | No result returned |
| `ERROR` | General error (check message) |

```typescript
try {
  const result = await CameraScan.scan();
} catch (e) {
  if (e.code === 'CANCELED') {
    // User pressed back
  } else {
    console.error('Scan error:', e.message);
  }
}
```

## TypeScript Types

All types are exported and available for import:

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

## scan() vs scanMulti()

| | `scan()` | `scanMulti()` |
|---|---|---|
| Engine | ZXing | ML Kit (with ZXing fallback) |
| Returns | Single `ScanResultData` | Array `ScanResultData[]` |
| Multi-barcode | No | Yes |
| Multi-angle | No | Yes (any rotation) |
| Use case | Simple one-code scan | Multiple codes, rotated codes |
| Dependency | Built-in | Requires Google Play Services |

Use `scan()` for simple scenarios. Use `scanMulti()` when you need multi-angle or multi-barcode support.

## Device Compatibility

| Module | Requirement | Notes |
|--------|-------------|-------|
| Device | All devices | Always available |
| Scanner | Hardware scan head | Not all models have built-in scanner |
| CameraScan | Camera | Requires camera permission |
| CashBox | Cash drawer port | Check device specs |
| NFC | NFC hardware | Use `Nfc.isAvailable()` to check |
| MSR | MSR hardware | Keyboard input mode |
| RFID | RFID handle | External UHF RFID accessory |
| Scale | Serial port | Requires external scale hardware |
| ScaleNew | Android 13+ | iMinEscale SDK, newer devices only |
| Serial | Serial port | Device-specific port path |
| Display | Secondary screen | Dual-screen devices only |
| Light | USB LED | External USB LED accessory |
| Segment | USB segment display | External USB accessory |
| FloatingWindow | Android 6.0+ | Requires SYSTEM_ALERT_WINDOW permission |

## Event Listeners

Modules that emit events (Scanner, NFC, RFID, Scale, ScaleNew, Serial) return an `EmitterSubscription`. Always clean up in `useEffect`:

```typescript
useEffect(() => {
  const subscription = Scanner.addListener((event) => {
    // handle event
  });
  return () => subscription.remove();
}, []);
```

## FAQ

**Q: `scan()` opens camera but nothing happens?**
A: Make sure camera permission is granted. Check `AndroidManifest.xml` has `<uses-permission android:name="android.permission.CAMERA" />` (the plugin adds this automatically).

**Q: Which should I use, `scan()` or `scanMulti()`?**
A: Use `scan()` for simple one-code scanning. Use `scanMulti()` if you need to scan codes at odd angles or multiple codes at once. `scan()` is lighter and doesn't require Google Play Services.

**Q: Scanner events not received?**
A: Make sure you call `Scanner.startListening()` first. Some devices use custom broadcast actions — use `Scanner.configure()` to set the correct action and data keys for your device.

**Q: ScaleNew methods fail?**
A: ScaleNew requires Android 13+ and the iMinEscale service. Use `Scale` (serial) module for older devices.

**Q: ML Kit not available?**
A: ML Kit requires Google Play Services. Call `CameraScan.isMLKitAvailable()` to check. If unavailable, `scanMulti()` falls back to ZXing automatically.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## Repository

https://github.com/iminsoftware/ReactNativeApiTest

## License

MIT
