@echo off
echo ========================================
echo React Native Release APK 构建脚本
echo ========================================
echo.

echo [1/4] 生成 JS Bundle...
call npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

if errorlevel 1 (
    echo 错误: Bundle 生成失败
    pause
    exit /b 1
)

echo.
echo [2/4] 构建 Release APK...
cd android
call gradlew.bat assembleRelease

if errorlevel 1 (
    echo 错误: APK 构建失败
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo [3/4] 安装到设备...
adb install -r android\app\build\outputs\apk\release\app-release.apk

if errorlevel 1 (
    echo 错误: APK 安装失败
    pause
    exit /b 1
)

echo.
echo [4/4] 启动应用...
adb shell am start -n com.iminrn.iminhardware/.MainActivity

echo.
echo ========================================
echo 构建完成!
echo APK 位置: android\app\build\outputs\apk\release\app-release.apk
echo ========================================
pause
