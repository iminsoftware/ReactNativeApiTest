@echo off
echo ========================================
echo React Native iMin Hardware Example
echo 自动运行脚本（已修复版本冲突）
echo ========================================
echo.

echo [1/3] 检查设备连接...
adb devices
echo.

echo [2/3] 清理并重新安装依赖...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install --legacy-peer-deps
echo.

echo [3/3] 运行应用到设备...
npm run android

pause
