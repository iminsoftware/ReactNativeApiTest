# Example 应用设置指南

## ⚠️ 当前问题

example 应用缺少完整的 Gradle Wrapper 文件。

## 🔧 解决方案

### 方案 1：复制 Gradle Wrapper（推荐）

从其他 React Native 项目复制 Gradle Wrapper 文件：

```bash
# 从 IMinApiTest 或其他项目复制
copy D:\old_D\20210719\projects\AProject\IMinApiTest\gradlew.bat example\android\
copy D:\old_D\20210719\projects\AProject\IMinApiTest\gradle\wrapper\* example\android\gradle\wrapper\
```

### 方案 2：使用 React Native CLI 创建新项目

```bash
# 1. 创建新的 RN 项目
npx react-native init TestIminHardware

# 2. 安装插件
cd TestIminHardware
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware

# 3. 复制示例代码
# 将 example/src/ 的代码复制到 TestIminHardware/src/

# 4. 运行
npm run android
```

### 方案 3：在现有项目中测试（最简单）✅

如果你已经有 React Native 项目，直接在那里测试：

```bash
# 在你的项目目录
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware

# 复制 SDK
# 将 IminLibs1.0.25.jar 复制到你项目的 android/app/libs/

# 在代码中使用
import { Device, Scanner, CashBox } from 'react-native-imin-hardware';

// 测试 Device
const model = await Device.getModel();
console.log('Device Model:', model);

// 测试 Scanner
await Scanner.startListening();
Scanner.addListener((event) => {
  if (event.type === 'scanResult') {
    console.log('Scan Result:', event.data.data);
  }
});

// 测试 CashBox
await CashBox.open();
```

## 📝 推荐流程

1. **如果你有现有的 RN 项目** → 使用方案 3
2. **如果想要完整的示例应用** → 使用方案 2
3. **如果想修复当前 example** → 使用方案 1

## ✅ 验证插件功能

无论使用哪种方案，都可以用这段代码测试：

```typescript
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { Device, Scanner, CashBox } from 'react-native-imin-hardware';

export default function TestScreen() {
  useEffect(() => {
    testDevice();
  }, []);

  const testDevice = async () => {
    try {
      const model = await Device.getModel();
      console.log('✅ Device works:', model);
    } catch (error) {
      console.error('❌ Device error:', error);
    }
  };

  const testScanner = async () => {
    try {
      await Scanner.startListening();
      Scanner.addListener((event) => {
        console.log('✅ Scanner event:', event);
      });
    } catch (error) {
      console.error('❌ Scanner error:', error);
    }
  };

  const testCashBox = async () => {
    try {
      await CashBox.open();
      console.log('✅ CashBox opened');
    } catch (error) {
      console.error('❌ CashBox error:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>iMin Hardware Test</Text>
      <Button title="Test Scanner" onPress={testScanner} />
      <Button title="Test CashBox" onPress={testCashBox} />
    </View>
  );
}
```
