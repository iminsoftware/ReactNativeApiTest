@echo off
echo ========================================
echo React Native iMin Hardware Example
echo 运行脚本
echo ========================================
echo.
echo 此脚本将：
echo 1. 启动 Metro bundler
echo 2. 构建并安装 APK 到设备
echo.
echo 注意：
echo - 请确保设备已连接并开启 USB 调试
echo - 首次运行需要下载依赖（10-30 分钟）
echo.
pause

echo.
echo 检查设备连接...
adb devices
echo.

echo 启动 React Native...
npm run android

pause
