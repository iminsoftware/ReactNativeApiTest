# Changelog / 更新日志

## 0.2.0 - 2026-04-16

### Fixed / 修复

- 🐛 Fix Scanner broadcast events not reaching JS layer
  修复 Scanner 扫码器广播事件无法传递到 JS 层的问题
- 🐛 Fix NFC tag data not displaying (missing techLists in foreground dispatch)
  修复 NFC 标签数据无法显示的问题（foreground dispatch 缺少 techLists）
- 🐛 Fix RFID connection status false positive (use system property `persist.sys.rfid.connect.status`)
  修复 RFID 连接状态误判（使用系统属性检测硬件）
- 🐛 Fix RFID tag data incomplete (use `getByteArray` for EPC/PC/TID/CRC)
  修复 RFID 标签数据不完整（改用 getByteArray 获取 EPC/PC/TID/CRC）
- 🐛 Fix RFID UI freeze caused by high-frequency tag data (add 300ms batch throttle)
  修复 RFID 大量标签数据导致 UI 卡死（加入 300ms 批量更新节流）
- 🐛 Fix Segment PendingIntent FLAG_MUTABLE crash on Android 14
  修复 Segment 段码屏 PendingIntent FLAG_MUTABLE 在 Android 14 崩溃
- 🐛 Fix Scale weight data callback not reaching JS layer
  修复 Scale 电子秤数据回调无法到达 JS 层的问题
- 🐛 Fix Display crash when playing non-video URL (add VideoView onErrorListener)
  修复 Display 副屏播放非视频 URL 崩溃（加 onErrorListener 保护）
- 🐛 Fix app crash when switching system language (add locale to configChanges)
  修复切换系统语言后应用崩溃（AndroidManifest 加 locale 到 configChanges）
- 🐛 Fix all modules dropping events due to `hasActiveReactInstance()` check
  修复所有模块 hasActiveReactInstance() 检查导致事件丢失

### Added / 新增

- 🌐 NFC tag type display (ISO 14443-3A, MIFARE Classic, etc.)
  NFC 标签类型显示（ISO 14443-3A、MIFARE Classic 等）
- 🌐 RFID battery level via system property `persist.sys.rfid.battery`
  RFID 电池电量通过系统属性读取
- 🌐 RFID connect/disconnect broadcast listener
  RFID 连接/断开广播监听
- 🌐 Scanner custom config section (broadcast action, data keys configurable)
  Scanner 自定义配置区域（广播动作、数据键可配置）
- 🌐 Display support HTTP cleartext video streaming
  Display 副屏支持 HTTP 明文视频流量
- 🌐 Display video loading indicator and error message
  Display 副屏视频加载提示和错误提示
- 🌐 MSR native EditText component to reduce data loss
  MSR 原生 EditText 组件替代 RN TextInput，减少数据丢失
- 🌐 Camera scan flashlight button support
  Camera 扫码闪光灯按钮支持
- 🌐 Segment one-click connect flow (auto findDevice + requestPermission + connect)
  Segment 一键连接流程（自动查找设备+请求权限+连接）
- 🌐 USB device_filter.xml for auto-granting segment device permission
  USB device_filter.xml 自动授权段码屏设备
- 🌐 Real-time language switch when system locale changes
  系统语言切换实时更新应用语言
- 🌐 Blue splash background instead of white screen on startup
  启动蓝色背景替代白屏

### Changed / 变更

- 🔧 Scanner page redesign following Flutter layout
  Scanner 页面重构，参考 Flutter 版本布局
- 🔧 RFID page redesign (status card + stats + tag list)
  RFID 页面重构（状态卡片+统计+标签列表）
- 🔧 NFC page redesign with current tag highlight card
  NFC 页面重构，加入当前标签蓝色高亮卡片
- 🔧 Scale page optimization (auto connect + auto start, separate Start/Stop buttons)
  Scale 电子秤页面优化（自动连接+自动 start，Start/Stop 分开按钮）
- 🔧 All event listeners use DeviceEventEmitter directly
  所有事件监听改用 DeviceEventEmitter 直接注册
- 🔧 Complete i18n coverage, remove hardcoded Chinese strings
  中英文适配完善，消除硬编码中文字符串
- 🔧 .gitignore improvements, filter build artifacts and large files
  .gitignore 完善，过滤 build 产物和大文件

### Known Issues / 已知问题

- MSR magnetic card reader may occasionally lose characters due to RN JS bridge speed limitation
  MSR 磁条卡刷卡偶尔丢字符，属于 RN JS bridge 传输速度限制

---

## 0.1.1 - 2026-03-15

### Added / 新增

- Initial release with 14 hardware modules
  初始版本，支持 14 个硬件模块
