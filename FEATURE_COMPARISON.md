# 功能对比分析

## 📊 Flutter vs React Native 实现对比

### ✅ 已完成模块 (3/13)

| 模块 | Flutter | React Native | 状态 |
|------|---------|--------------|------|
| Device | ✅ DeviceInfoHandler.kt | ✅ DeviceInfoHandler.java | 完成 |
| Scanner | ✅ ScannerHandler.kt | ✅ ScannerHandler.java | 完成 |
| CashBox | ✅ CashBoxHandler.kt | ✅ CashBoxHandler.java | 完成 |

### ⏳ 待实现模块 (10/13)

| 模块 | Flutter 实现 | React Native | 优先级 | 预计时间 |
|------|-------------|--------------|--------|---------|
| **NFC** | ✅ NfcHandler.kt | ❌ 未实现 | 🔴 高 | 2天 |
| **MSR** | ✅ MsrHandler.kt | ❌ 未实现 | 🔴 高 | 1天 |
| **RFID** | ✅ RfidHandler.kt | ❌ 未实现 | 🟡 中 | 3天 |
| **Scale** | ✅ ScaleHandler.kt + ScaleNewHandler.kt | ❌ 未实现 | 🟡 中 | 3天 |
| **Display** | ✅ DisplayHandler.kt + DifferentDisplay.kt | ❌ 未实现 | 🟡 中 | 2天 |
| **Light** | ✅ LightHandler.kt | ❌ 未实现 | 🟢 低 | 1天 |
| **Serial** | ✅ SerialHandler.kt + UsbCommunication.kt | ❌ 未实现 | 🟢 低 | 2天 |
| **Segment** | ✅ SegmentHandler.kt | ❌ 未实现 | 🟢 低 | 1天 |
| **Camera** | ✅ CameraScanHandler.kt + FlutterCaptureActivity.kt | ❌ 未实现 | 🟢 低 | 2天 |
| **FloatingWindow** | ✅ FloatingWindowHandler.kt + FloatingWindowService.kt | ❌ 未实现 | 🟢 低 | 2天 |

## 📋 详细功能对比

### 1. Device（设备信息）✅

**Flutter 实现**:
```kotlin
// DeviceInfoHandler.kt
- getModel()
- getSerialNumber()
- getAndroidVersion()
- getSdkVersion()
```

**React Native 实现**: ✅ 完全一致
```java
// DeviceInfoHandler.java
- getModel()
- getSerialNumber()
- getAndroidVersion()
- getSdkVersion()
```

---

### 2. Scanner（扫描器）✅

**Flutter 实现**:
```kotlin
// ScannerHandler.kt
- startScan()
- stopScan()
- getScannerStatus()
- Event: onScanResult
```

**React Native 实现**: ✅ 完全一致
```java
// ScannerHandler.java
- startScan()
- stopScan()
- getScannerStatus()
- Event: onScanResult
```

---

### 3. CashBox（钱箱）✅

**Flutter 实现**:
```kotlin
// CashBoxHandler.kt
- openCashbox()
- getCashboxStatus()
- setCashboxVoltage()
```

**React Native 实现**: ✅ 完全一致
```java
// CashBoxHandler.java
- openCashbox()
- getCashboxStatus()
- setCashboxVoltage()
```

---

### 4. NFC（NFC 读卡器）❌

**Flutter 实现**:
```kotlin
// NfcHandler.kt
- startNfc()
- stopNfc()
- getNfcStatus()
- Event: onNfcCardDetected
```

**React Native 需要实现**:
- [ ] 创建 `nfc/NfcHandler.java`
- [ ] 实现 NFC 卡片检测
- [ ] 实现事件监听
- [ ] 创建 TypeScript API `src/modules/nfc.ts`
- [ ] 创建示例页面 `example/src/screens/NfcScreen.tsx`

---

### 5. MSR（磁条卡读卡器）❌

**Flutter 实现**:
```kotlin
// MsrHandler.kt
- startMsr()
- stopMsr()
- getMsrStatus()
- Event: onMsrCardRead
```

**React Native 需要实现**:
- [ ] 创建 `msr/MsrHandler.java`
- [ ] 实现磁条卡读取
- [ ] 实现事件监听
- [ ] 创建 TypeScript API `src/modules/msr.ts`
- [ ] 创建示例页面 `example/src/screens/MsrScreen.tsx`

---

### 6. RFID（RFID 读卡器）❌

**Flutter 实现**:
```kotlin
// RfidHandler.kt
- startRfid()
- stopRfid()
- getRfidStatus()
- Event: onRfidTagDetected
```

**React Native 需要实现**:
- [ ] 创建 `rfid/RfidHandler.java`
- [ ] 实现 RFID 标签检测
- [ ] 实现事件监听
- [ ] 创建 TypeScript API `src/modules/rfid.ts`
- [ ] 创建示例页面 `example/src/screens/RfidScreen.tsx`

---

### 7. Scale（电子秤）❌

**Flutter 实现**:
```kotlin
// ScaleHandler.kt + ScaleNewHandler.kt
- startScale()
- stopScale()
- getWeight()
- tare()
- Event: onWeightChanged
```

**React Native 需要实现**:
- [ ] 创建 `scale/ScaleHandler.java`
- [ ] 实现重量读取
- [ ] 实现去皮功能
- [ ] 实现事件监听
- [ ] 创建 TypeScript API `src/modules/scale.ts`
- [ ] 创建示例页面 `example/src/screens/ScaleScreen.tsx`

---

### 8. Display（副屏显示）❌

**Flutter 实现**:
```kotlin
// DisplayHandler.kt + DifferentDisplay.kt
- showText()
- showImage()
- clear()
- setBrightness()
```

**React Native 需要实现**:
- [ ] 创建 `display/DisplayHandler.java`
- [ ] 实现文本显示
- [ ] 实现图片显示
- [ ] 实现亮度控制
- [ ] 创建 TypeScript API `src/modules/display.ts`
- [ ] 创建示例页面 `example/src/screens/DisplayScreen.tsx`

---

### 9. Light（LED 灯控制）❌

**Flutter 实现**:
```kotlin
// LightHandler.kt
- turnOn()
- turnOff()
- setColor()
- setBrightness()
```

**React Native 需要实现**:
- [ ] 创建 `light/LightHandler.java`
- [ ] 实现灯光控制
- [ ] 实现颜色设置
- [ ] 创建 TypeScript API `src/modules/light.ts`
- [ ] 创建示例页面 `example/src/screens/LightScreen.tsx`

---

### 10. Serial（串口通信）❌

**Flutter 实现**:
```kotlin
// SerialHandler.kt + UsbCommunication.kt
- openPort()
- closePort()
- sendData()
- Event: onDataReceived
```

**React Native 需要实现**:
- [ ] 创建 `serial/SerialHandler.java`
- [ ] 实现串口通信
- [ ] 实现数据收发
- [ ] 创建 TypeScript API `src/modules/serial.ts`
- [ ] 创建示例页面 `example/src/screens/SerialScreen.tsx`

---

### 11. Segment（段码屏）❌

**Flutter 实现**:
```kotlin
// SegmentHandler.kt
- showNumber()
- clear()
- setBrightness()
```

**React Native 需要实现**:
- [ ] 创建 `segment/SegmentHandler.java`
- [ ] 实现数字显示
- [ ] 实现亮度控制
- [ ] 创建 TypeScript API `src/modules/segment.ts`
- [ ] 创建示例页面 `example/src/screens/SegmentScreen.tsx`

---

### 12. Camera（相机扫描）❌

**Flutter 实现**:
```kotlin
// CameraScanHandler.kt + FlutterCaptureActivity.kt
- startCamera()
- stopCamera()
- Event: onCameraScanResult
```

**React Native 需要实现**:
- [ ] 创建 `camera/CameraScanHandler.java`
- [ ] 创建相机 Activity
- [ ] 实现扫描功能
- [ ] 创建 TypeScript API `src/modules/camera.ts`
- [ ] 创建示例页面 `example/src/screens/CameraScreen.tsx`

---

### 13. FloatingWindow（悬浮窗）❌

**Flutter 实现**:
```kotlin
// FloatingWindowHandler.kt + FloatingWindowService.kt
- show()
- hide()
- updateContent()
```

**React Native 需要实现**:
- [ ] 创建 `floatingwindow/FloatingWindowHandler.java`
- [ ] 创建悬浮窗 Service
- [ ] 实现显示/隐藏
- [ ] 创建 TypeScript API `src/modules/floatingwindow.ts`
- [ ] 创建示例页面 `example/src/screens/FloatingWindowScreen.tsx`

---

## 🎯 开发优先级建议

### 第一阶段（本周）- 高优先级
1. **NFC** (2天) - 常用支付场景
2. **MSR** (1天) - 银行卡读取

### 第二阶段（下周）- 中优先级
3. **RFID** (3天) - 库存管理
4. **Scale** (3天) - 称重场景
5. **Display** (2天) - 客显屏

### 第三阶段（后续）- 低优先级
6. **Light** (1天)
7. **Serial** (2天)
8. **Segment** (1天)
9. **Camera** (2天)
10. **FloatingWindow** (2天)

---

## 📦 所需依赖文件

从 Flutter 项目复制到 React Native 项目：

```bash
# SDK 文件
FlutterApiTest/android/libs/IminLibs1.0.25.jar          ✅ 已复制
FlutterApiTest/android/libs/IminRfidSdk1.0.5.jar        ❌ 需要（RFID）
FlutterApiTest/android/libs/iMinEscale_SDK.jar          ❌ 需要（Scale）
FlutterApiTest/android/libs/NeoStraElectronicSDK-*.jar  ❌ 需要（Scale）
```

---

## 🔄 实现模式

每个模块遵循相同的模式：

### Android 端
1. 创建 Handler 类（如 `NfcHandler.java`）
2. 实现 iMin SDK 调用
3. 实现事件监听（如需要）
4. 在 `IminHardwareModule.java` 中注册方法

### TypeScript 端
1. 创建模块文件（如 `src/modules/nfc.ts`）
2. 定义类型接口
3. 封装 Native 方法
4. 导出 API

### Example 端
1. 创建测试页面（如 `NfcScreen.tsx`）
2. 实现 UI 和交互
3. 添加到导航路由
4. 在首页添加入口

---

## 📝 参考资料

- Flutter 实现：`FlutterApiTest/android/src/main/kotlin/com/imin/hardware/`
- React Native 已实现：`react-native-imin-hardware/android/src/main/java/com/imin/hardware/`
- 开发指南：`SESSION_GUIDE.md`
- 需求文档：`RN_HARDWARE_PLUGIN_REQUIREMENTS.md`
