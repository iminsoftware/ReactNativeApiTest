@echo off
echo ========================================
echo React Native iMin Hardware Example
echo 构建脚本
echo ========================================
echo.
echo 警告：首次构建可能需要 10-30 分钟
echo Gradle 需要下载大量依赖
echo 请耐心等待，不要中断！
echo.
echo 你可以：
echo 1. 继续等待（按任意键继续）
echo 2. 使用现有项目测试（Ctrl+C 退出）
echo.
pause

echo.
echo 开始构建...
echo 如果看起来卡住了，请不要担心，Gradle 正在后台工作
echo.

cd android
gradlew.bat assembleDebug --info

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo 构建成功！
    echo APK 位置: android\app\build\outputs\apk\debug\app-debug.apk
    echo ========================================
    echo.
    echo 现在可以运行：
    echo npm run android
    echo.
) else (
    echo.
    echo ========================================
    echo 构建失败！错误代码: %ERRORLEVEL%
    echo ========================================
    echo.
    echo 请查看上面的错误信息
    echo 或查看 EXAMPLE_ALTERNATIVE.md 了解替代方案
    echo.
)

pause
