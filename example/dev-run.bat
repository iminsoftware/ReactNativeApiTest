@echo off
echo ========================================
echo React Native 开发模式快速启动脚本
echo ========================================
echo.

echo [1/4] 清理端口占用...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8081') do (
    taskkill /F /PID %%a 2>nul
)

echo [2/4] 重启 ADB 服务...
adb kill-server
timeout /t 2 /nobreak >nul
adb start-server
timeout /t 2 /nobreak >nul

echo [3/4] 设置端口转发 (8082 -> 8081)...
adb reverse --remove-all
adb reverse tcp:8082 tcp:8081

echo [4/4] 启动 Metro 服务器...
echo.
echo ========================================
echo Metro 服务器启动中...
echo 请在设备上配置: localhost:8082
echo 然后重新加载应用
echo ========================================
echo.

start "Metro Server" cmd /k "npm start"

echo.
echo 完成! Metro 服务器已在新窗口中启动
echo 按任意键退出...
pause >nul
