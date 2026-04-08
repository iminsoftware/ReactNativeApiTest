# 故障排除指南

## 当前问题：Android 构建一直加载

### 问题描述
运行 `npm run android` 或 `gradlew clean` 时，Gradle 一直卡在 "INITIALIZING" 或 "Evaluating settings" 阶段，无法继续。

### 可能的原因

1. **网络问题**
   - Gradle 正在下载依赖，但网络速度慢或被墙
   - Maven 仓库连接超时

2. **Gradle 配置问题**
   - Gradle 版本不兼容
   - 缓存损坏

3. **React Native 版本问题**
   - example 使用 React Native 0.75.4
   - 主项目构建配置使用 Gradle 8.3.0
   - 可能存在版本不匹配

### 解决方案

#### 方案 1：配置国内镜像（推荐）

编辑 `example/android/build.gradle`，添加阿里云镜像：

```groovy
allprojects {
    repositories {
        maven { url 'https://maven.aliyun.com/repository/public/' }
        maven { url 'https://maven.aliyun.com/repository/google/' }
        maven { url 'https://maven.aliyun.com/repository/gradle-plugin/' }
        maven {
            url("$rootDir/../node_modules/react-native/android")
        }
        maven {
            url("$rootDir/../node_modules/jsc-android/dist")
        }
        google()
        mavenCentral()
    }
}
```

#### 方案 2：使用现有项目测试

不使用 example，直接在你现有的 React Native 项目中测试：

```bash
# 在你的项目目录
cd YourReactNativeProject

# 安装插件
npm install D:/old_D/20210719/projects/AProject/ReactNativeApiTest/react-native-imin-hardware

# 使用
import { Device, Scanner, Cashbox } from 'react-native-imin-hardware';

const deviceInfo = await Device.getDeviceInfo();
```

#### 方案 3：清理 Gradle 缓存

```bash
# 删除 Gradle 缓存
rmdir /s /q %USERPROFILE%\.gradle\caches

# 重新构建
cd example/android
gradlew clean
gradlew assembleDebug
```

#### 方案 4：降低 Gradle 版本

编辑 `example/android/gradle/wrapper/gradle-wrapper.properties`：

```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.0-all.zip
```

#### 方案 5：使用 Gradle 离线模式

如果已经下载过依赖：

```bash
cd example/android
gradlew --offline assembleDebug
```

### 验证主项目构建

主项目（react-native-imin-hardware）本身已经构建成功：

```bash
cd react-native-imin-hardware

# 验证构建
npm run typescript  # ✅ 通过
npm run prepare     # ✅ 通过

# 检查输出
dir lib
# 应该看到：
# - lib/commonjs/    ✅
# - lib/module/      ✅
# - lib/typescript/  ✅
```

### 推荐的测试流程

1. **跳过 example**，直接在生产项目中测试
2. 主项目已经构建完成，可以直接使用
3. 将 JAR 文件已复制到正确位置：`android/libs/IminLibs1.0.25.jar`

### 下一步

如果需要运行 example：
1. 先配置国内镜像
2. 确保网络畅通
3. 或者使用 VPN/代理

如果只是想测试功能：
1. 直接在现有项目中安装
2. 导入模块并使用
3. 在真实设备上测试

## 已完成的配置

✅ 主项目依赖已安装
✅ TypeScript 已编译
✅ lib 目录已生成
✅ JAR 文件已复制
✅ Android 模块配置正确

## 待解决

⏳ example 项目的 Gradle 构建（可选，不影响主项目使用）
