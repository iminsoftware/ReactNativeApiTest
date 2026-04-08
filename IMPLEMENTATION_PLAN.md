# React Native iMin Hardware - 实现计划

## 📊 当前状态

**已完成**: 3/13 模块 (23%)
- ✅ Device
- ✅ Scanner  
- ✅ CashBox

**待实现**: 10/13 模块 (77%)

---

## 🎯 实现顺序（按优先级）

### 第一阶段：高优先级模块（本周）

#### 1. NFC 模块 ⏳ 开始实现
**预计时间**: 2天  
**复杂度**: ⭐⭐⭐  
**依赖**: Android NFC API

**实现步骤**:
- [ ] 创建 `android/src/main/java/com/imin/hardware/nfc/NfcHandler.java`
- [ ] 实现 NFC 前台调度（Foreground Dispatch）
- [ ] 实现 NFC 标签读取
- [ ] 实现事件监听系统
- [ ] 创建 `src/modules/nfc.ts`
- [ ] 创建 `example/src/screens/NfcScreen.tsx`
- [ ] 更新 README 和文档

**关键功能**:
```typescript
- isAvailable(): Promise<boolean>
- isEnabled(): Promise<boolean>
- openSettings(): Promise<void>
- addListener(callback): Subscription
```

---

#### 2. MSR 模块
**预计时间**: 1天  
**复杂度**: ⭐  
**依赖**: 无（键盘输入模式）

**实现步骤**:
- [ ] 创建 `android/src/main/java/com/imin/hardware/msr/MsrHandler.java`
- [ ] 实现可用性检查
- [ ] 创建 `src/modules/msr.ts`
- [ ] 创建 `example/src/screens/MsrScreen.tsx`

**关键功能**:
```typescript
- isAvailable(): Promise<boolean>
```

**注意**: MSR 设备作为键盘输入工作，数据通过 TextInput 接收

---

### 第二阶段：中优先级模块（下周）

#### 3. Light 模块
**预计时间**: 1天  
**复杂度**: ⭐⭐  
**依赖**: IminSDKManager, USB 权限

**实现步骤**:
- [ ] 创建 `android/src/main/java/com/imin/hardware/light/LightHandler.java`
- [ ] 实现 USB 设备连接
- [ ] 实现灯光控制（红/绿/关闭）
- [ ] 创建 `src/modules/light.ts`
- [ ] 创建 `example/src/screens/LightScreen.tsx`

**关键功能**:
```typescript
- connect(): Promise<boolean>
- turnOnGreen(): Promise<void>
- turnOnRed(): Promise<void>
- turnOff(): Promise<void>
- disconnect(): Promise<void>
```

---

#### 4. Segment 模块
**预计时间**: 1天  
**复杂度**: ⭐⭐  
**依赖**: USB 通信, UsbCommunication 类

**实现步骤**:
- [ ] 创建 `android/src/main/java/com/imin/hardware/segment/SegmentHandler.java`
- [ ] 创建 `android/src/main/java/com/imin/hardware/segment/UsbCommunication.java`
- [ ] 实现 USB 设备查找和连接
- [ ] 实现数据发送（左对齐/右对齐）
- [ ] 创建 `src/modules/segment.ts`
- [ ] 创建 `example/src/screens/SegmentScreen.tsx`

**关键功能**:
```typescript
- findDevice(): Promise<DeviceInfo>
- requestPermission(): Promise<boolean>
- connect(): Promise<boolean>
- sendData(data: string, align: 'left' | 'right'): Promise<void>
- clear(): Promise<void>
- full(): Promise<void>
- disconnect(): Promise<void>
```

---

#### 5. RFID 模块
**预计时间**: 3天  
**复杂度**: ⭐⭐⭐⭐  
**依赖**: IminRfidSdk1.0.5.jar

**实现步骤**:
- [ ] 复制 `IminRfidSdk1.0.5.jar` 到 `android/libs/`
- [ ] 创建 `android/src/main/java/com/imin/hardware/rfid/RfidHandler.java`
- [ ] 实现 RFID 初始化和连接
- [ ] 实现标签读取和写入
- [ ] 实现事件监听
- [ ] 创建 `src/modules/rfid.ts`
- [ ] 创建 `example/src/screens/RfidScreen.tsx`

**关键功能**:
```typescript
- connect(): Promise<boolean>
- startReading(): Promise<void>
- stopReading(): Promise<void>
- readTag(): Promise<TagData>
- writeTag(data: string): Promise<boolean>
- addListener(callback): Subscription
```

---

#### 6. Scale 模块
**预计时间**: 3天  
**复杂度**: ⭐⭐⭐⭐  
**依赖**: iMinEscale_SDK.jar, NeoStraElectronicSDK.jar

**实现步骤**:
- [ ] 复制 SDK JAR 文件到 `android/libs/`
- [ ] 创建 `android/src/main/java/com/imin/hardware/scale/ScaleHandler.java`
- [ ] 实现电子秤连接
- [ ] 实现重量读取
- [ ] 实现去皮功能
- [ ] 实现事件监听
- [ ] 创建 `src/modules/scale.ts`
- [ ] 创建 `example/src/screens/ScaleScreen.tsx`

**关键功能**:
```typescript
- connect(): Promise<boolean>
- startReading(): Promise<void>
- stopReading(): Promise<void>
- getWeight(): Promise<number>
- tare(): Promise<void>
- addListener(callback): Subscription
```

---

#### 7. Display 模块
**预计时间**: 2天  
**复杂度**: ⭐⭐⭐  
**依赖**: IminSDKManager

**实现步骤**:
- [ ] 创建 `android/src/main/java/com/imin/hardware/display/DisplayHandler.java`
- [ ] 实现副屏文本显示
- [ ] 实现副屏图片显示
- [ ] 实现清屏和亮度控制
- [ ] 创建 `src/modules/display.ts`
- [ ] 创建 `example/src/screens/DisplayScreen.tsx`

**关键功能**:
```typescript
- showText(text: string, size: number): Promise<void>
- showImage(uri: string): Promise<void>
- clear(): Promise<void>
- setBrightness(level: number): Promise<void>
```

---

### 第三阶段：低优先级模块（后续）

#### 8. Serial 模块
**预计时间**: 2天  
**复杂度**: ⭐⭐⭐  

#### 9. Camera 模块
**预计时间**: 2天  
**复杂度**: ⭐⭐⭐  

#### 10. FloatingWindow 模块
**预计时间**: 2天  
**复杂度**: ⭐⭐⭐  

---

## 📦 所需文件清单

### SDK JAR 文件

| 文件 | 用途 | 状态 |
|------|------|------|
| IminLibs1.0.25.jar | 基础 SDK | ✅ 已复制 |
| IminRfidSdk1.0.5.jar | RFID 功能 | ❌ 待复制 |
| iMinEscale_SDK.jar | 电子秤功能 | ❌ 待复制 |
| NeoStraElectronicSDK-*.jar | 电子秤功能 | ❌ 待复制 |

### 复制命令
```bash
# 从 Flutter 项目复制到 React Native 项目
copy FlutterApiTest\android\libs\IminRfidSdk1.0.5.jar react-native-imin-hardware\android\libs\
copy FlutterApiTest\android\libs\iMinEscale_SDK.jar react-native-imin-hardware\android\libs\
copy FlutterApiTest\android\libs\NeoStraElectronicSDK-*.jar react-native-imin-hardware\android\libs\
```

---

## 🔄 开发流程（每个模块）

### 1. Android 原生实现
```
1. 创建 Handler 类
2. 参考 Flutter 实现
3. 实现 iMin SDK 调用
4. 实现事件监听（如需要）
5. 在 IminHardwareModule.java 中注册方法
```

### 2. TypeScript API
```
1. 创建模块文件 (src/modules/xxx.ts)
2. 定义类型接口
3. 封装 Native 方法
4. 实现事件监听（如需要）
5. 导出 API
```

### 3. Example 应用
```
1. 创建测试页面 (example/src/screens/XxxScreen.tsx)
2. 实现 UI 和交互
3. 添加到导航路由 (App.tsx)
4. 在首页添加入口 (HomeScreen.tsx)
```

### 4. 文档更新
```
1. 更新 README.md
2. 更新 DEVELOPMENT_LOG.md
3. 添加使用示例
```

---

## 📝 代码模板

### Android Handler 模板
```java
package com.imin.hardware.xxx;

import android.content.Context;
import android.util.Log;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class XxxHandler {
    private static final String TAG = "XxxHandler";
    private final ReactApplicationContext reactContext;

    public XxxHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    @ReactMethod
    public void someMethod(Promise promise) {
        try {
            // Implementation
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error", e);
            promise.reject("ERROR_CODE", e.getMessage());
        }
    }

    private void sendEvent(String eventName, Object data) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, data);
    }

    public void cleanup() {
        // Cleanup resources
    }
}
```

### TypeScript API 模板
```typescript
import { NativeModules, NativeEventEmitter } from 'react-native';

const { IminHardware } = NativeModules;
const eventEmitter = new NativeEventEmitter(IminHardware);

export interface XxxEvent {
  type: string;
  data: any;
}

export const Xxx = {
  async someMethod(): Promise<boolean> {
    return await IminHardware.xxx_someMethod();
  },

  addListener(callback: (event: XxxEvent) => void) {
    return eventEmitter.addListener('xxx_event', callback);
  },
};
```

---

## ✅ 完成标准

每个模块完成需要满足：

1. ✅ Android Handler 实现完成
2. ✅ TypeScript API 实现完成
3. ✅ Example 测试页面完成
4. ✅ 在真实设备上测试通过
5. ✅ 文档更新完成
6. ✅ 代码审查通过

---

## 📅 时间估算

| 阶段 | 模块数 | 预计时间 | 完成日期 |
|------|--------|---------|---------|
| 第一阶段 | 2 | 3天 | 本周 |
| 第二阶段 | 5 | 10天 | 下周 |
| 第三阶段 | 3 | 6天 | 后续 |
| **总计** | **10** | **19天** | **3周** |

---

## 🎯 下一步行动

**立即开始**: NFC 模块实现

1. 创建 NfcHandler.java
2. 实现 NFC 功能
3. 创建 TypeScript API
4. 创建测试页面
5. 测试验证

---

**参考文档**:
- Flutter 实现：`FlutterApiTest/android/src/main/kotlin/com/imin/hardware/`
- 功能对比：`FEATURE_COMPARISON.md`
- 开发日志：`DEVELOPMENT_LOG.md`
