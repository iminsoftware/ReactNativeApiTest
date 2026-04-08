# 开发指南

## 快速开始

### 方式 1：开发模式（推荐用于调试）

1. 双击运行 `dev-run.bat`
2. 在设备上打开应用
3. 摇晃设备打开开发菜单
4. 点击 Settings -> Debug server host & port for device
5. 输入：`localhost:8082`
6. 点击 Reload

### 方式 2：Release 打包（推荐用于测试）

1. 双击运行 `build-release.bat`
2. 等待构建完成，应用会自动安装并启动

## 常见问题

### Q: 为什么要用 8082 端口？
A: 因为 8081 端口的 adb reverse 被占用，所以使用 8082 端口转发到 8081。

### Q: 开发模式下应用显示红屏错误？
A: 确保：
1. Metro 服务器正在运行
2. 设备上配置了 `localhost:8082`
3. adb reverse 端口转发已设置

### Q: 如何查看 Metro 日志？
A: Metro 服务器会在单独的窗口中运行，可以直接查看日志。

### Q: 如何重新加载应用？
A: 在设备上摇晃手机，点击 "Reload" 或按两次 R 键。

## 手动命令

如果脚本不工作，可以手动执行：

### 开发模式
```bash
# 1. 清理端口
netstat -ano | findstr :8081
taskkill /F /PID <进程ID>

# 2. 设置端口转发
adb reverse tcp:8082 tcp:8081

# 3. 启动 Metro
npm start

# 4. 在设备上配置 localhost:8082
```

### Release 打包
```bash
# 1. 生成 bundle
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

# 2. 构建 APK
cd android
gradlew.bat assembleRelease

# 3. 安装
adb install -r app\build\outputs\apk\release\app-release.apk
```

## 项目结构

```
example/
├── dev-run.bat              # 开发模式启动脚本
├── build-release.bat        # Release 打包脚本
├── src/                     # 源代码
├── android/                 # Android 原生代码
└── node_modules/            # 依赖
```
