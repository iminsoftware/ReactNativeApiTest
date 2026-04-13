import { NativeModules, Platform } from 'react-native';
import { useState, useCallback } from 'react';

// 获取系统语言
function getSystemLanguage(): string {
  try {
    // 方式1: 使用自定义 Native Module 获取真实系统语言（最可靠）
    const localeHelper = NativeModules.LocaleHelper;
    if (localeHelper && localeHelper.language) {
      const lang = localeHelper.language.toLowerCase();
      return lang === 'zh' ? 'zh' : 'en';
    }

    // 方式2: Intl API 兜底
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      if (locale) {
        const lang = locale.split('-')[0].toLowerCase();
        return lang === 'zh' ? 'zh' : 'en';
      }
    }

    // 方式3: NativeModules.I18nManager 兜底
    if (Platform.OS === 'android') {
      const locale = NativeModules.I18nManager?.localeIdentifier || '';
      if (locale) {
        const lang = locale.split('_')[0].toLowerCase();
        return lang === 'zh' ? 'zh' : 'en';
      }
    }
  } catch (e) {
    console.warn('Failed to detect system language:', e);
  }
  return 'en';
}

export type Lang = 'zh' | 'en';
let currentLang: Lang = getSystemLanguage() as Lang;

// 语言变更监听器
const listeners: Set<() => void> = new Set();

export function setLang(lang: Lang) {
  currentLang = lang;
  listeners.forEach(fn => fn());
}

export function getLang(): Lang {
  return currentLang;
}

export function toggleLang(): Lang {
  const newLang = currentLang === 'zh' ? 'en' : 'zh';
  setLang(newLang);
  return newLang;
}

// Hook: 组件内使用，语言切换时自动刷新
export function useI18n() {
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick(t => t + 1), []);

  useState(() => {
    listeners.add(forceUpdate);
    return () => { listeners.delete(forceUpdate); };
  });

  return { t, lang: currentLang, setLang, toggleLang };
}

const translations: Record<string, Record<Lang, string>> = {
  // ===== HomeScreen =====
  'home.deviceInfo': { zh: '📱 设备信息', en: '📱 Device Info' },
  'home.model': { zh: '型号:', en: 'Model:' },
  'home.android': { zh: 'Android:', en: 'Android:' },
  'home.loading': { zh: '加载中...', en: 'Loading...' },
  'home.unknown': { zh: '未知', en: 'Unknown' },
  'home.search': { zh: '🔍 搜索功能...', en: '🔍 Search...' },
  'home.comingSoon': { zh: '即将推出', en: 'Coming Soon' },
  // HomeScreen module descriptions
  'mod.device': { zh: '设备信息', en: 'Device Info' },
  'mod.scanner': { zh: '条码扫描器', en: 'Barcode Scanner' },
  'mod.cashbox': { zh: '钱箱控制', en: 'Cash Box' },
  'mod.nfc': { zh: 'NFC 读卡器', en: 'NFC Reader' },
  'mod.msr': { zh: '磁条卡', en: 'Magnetic Card' },
  'mod.light': { zh: 'LED 灯控制', en: 'LED Light' },
  'mod.display': { zh: '副屏控制', en: 'Sub Display' },
  'mod.segment': { zh: '段码屏', en: 'Segment Display' },
  'mod.serial': { zh: '串口通信', en: 'Serial Port' },
  'mod.scale': { zh: '电子秤', en: 'Scale' },
  'mod.cameraScan': { zh: '相机扫码', en: 'Camera Scan' },
  'mod.floatingWindow': { zh: '悬浮窗', en: 'Floating Window' },
  'mod.rfid': { zh: 'RFID 读写', en: 'RFID R/W' },

  // ===== DeviceScreen =====
  'device.loading': { zh: '加载中...', en: 'Loading...' },
  'device.title': { zh: '设备信息', en: 'Device Info' },
  'device.brand': { zh: '品牌', en: 'Brand' },
  'device.deviceName': { zh: '设备名称', en: 'Device Name' },
  'device.model': { zh: '设备型号', en: 'Model' },
  'device.serialNumber': { zh: '序列号', en: 'Serial Number' },
  'device.androidVersion': { zh: 'Android 版本', en: 'Android Version' },
  'device.androidSdk': { zh: 'Android SDK', en: 'Android SDK' },
  'device.sdkVersion': { zh: 'SDK 版本', en: 'SDK Version' },

  // ===== CameraScanScreen =====
  'camera.result': { zh: '扫码结果', en: 'Scan Result' },
  'camera.format': { zh: '格式:', en: 'Format:' },
  'camera.content': { zh: '内容:', en: 'Content:' },
  'camera.noResult': { zh: '暂无扫码结果', en: 'No scan result yet' },
  'camera.scanFailed': { zh: '扫码失败', en: 'Scan Failed' },
  'camera.scanning': { zh: '扫码中...', en: 'Scanning...' },
  'camera.startScan': { zh: '开始扫码', en: 'Start Scan' },

  // ===== CashBoxScreen =====
  'cashbox.status': { zh: '钱箱状态', en: 'Cash Box Status' },
  'cashbox.currentStatus': { zh: '当前状态:', en: 'Current Status:' },
  'cashbox.unknown': { zh: '未知', en: 'Unknown' },
  'cashbox.open': { zh: '打开', en: 'Open' },
  'cashbox.closed': { zh: '关闭', en: 'Closed' },
  'cashbox.refreshStatus': { zh: '刷新状态', en: 'Refresh Status' },
  'cashbox.operation': { zh: '操作', en: 'Operation' },
  'cashbox.openBox': { zh: '打开钱箱', en: 'Open Cash Box' },
  'cashbox.voltage': { zh: '电压设置', en: 'Voltage Setting' },
  'cashbox.success': { zh: '成功', en: 'Success' },
  'cashbox.error': { zh: '错误', en: 'Error' },
  'cashbox.opened': { zh: '钱箱已打开', en: 'Cash box opened' },
  'cashbox.voltageOk': { zh: '电压设置成功', en: 'Voltage set successfully' },
  'cashbox.voltageFail': { zh: '电压设置失败', en: 'Voltage set failed' },

  // ===== ScaleScreen =====
  'scale.connectionStatus': { zh: '连接状态', en: 'Connection Status' },
  'scale.connected': { zh: '✅ 已连接', en: '✅ Connected' },
  'scale.disconnected': { zh: '⬜ 未连接', en: '⬜ Disconnected' },
  'scale.serviceVersion': { zh: '服务版本', en: 'Service Version' },
  'scale.firmwareVersion': { zh: '固件版本', en: 'Firmware Version' },
  'scale.connectService': { zh: '连接服务', en: 'Connect' },
  'scale.startReading': { zh: '开始读取', en: 'Start' },
  'scale.stopReading': { zh: '停止读取', en: 'Stop' },
  'scale.realtimeData': { zh: '实时称重数据', en: 'Realtime Weight Data' },
  'scale.netWeight': { zh: '净重', en: 'Net Weight' },
  'scale.tareWeight': { zh: '皮重', en: 'Tare Weight' },
  'scale.status': { zh: '状态', en: 'Status' },
  'scale.stable': { zh: '✓ 稳定', en: '✓ Stable' },
  'scale.unstable': { zh: '~ 浮动', en: '~ Unstable' },
  'scale.lightWeight': { zh: '⚠️ 过轻', en: '⚠️ Underweight' },
  'scale.overload': { zh: '⚠️ 过载', en: '⚠️ Overload' },
  'scale.zeroErr': { zh: '❌ 清零错误', en: '❌ Zero Error' },
  'scale.calErr': { zh: '❌ 标定错误', en: '❌ Calibration Error' },
  'scale.errorCode': { zh: '错误码', en: 'Error Code' },
  'scale.weighOps': { zh: '称重操作', en: 'Weigh Operations' },
  'scale.zero': { zh: '清零', en: 'Zero' },
  'scale.tare': { zh: '去皮', en: 'Tare' },
  'scale.digitalTare': { zh: '数字去皮 (克)', en: 'Digital Tare (g)' },
  'scale.set': { zh: '设置', en: 'Set' },
  'scale.priceCalc': { zh: '价格计算', en: 'Price Calculation' },
  'scale.unitPrice': { zh: '单价', en: 'Unit Price' },
  'scale.totalPrice': { zh: '总价', en: 'Total Price' },
  'scale.unitPricePlaceholder': { zh: '单价 (元)', en: 'Unit Price' },
  'scale.weightUnit': { zh: '重量单位:', en: 'Weight Unit:' },
  'scale.deviceInfo': { zh: '设备信息', en: 'Device Info' },
  'scale.restart': { zh: '重启', en: 'Restart' },
  'scale.restartTitle': { zh: '重启电子秤', en: 'Restart Scale' },
  'scale.restartConfirm': { zh: '确定要重启吗？', en: 'Are you sure to restart?' },
  'scale.cancel': { zh: '取消', en: 'Cancel' },
  'scale.confirm': { zh: '确定', en: 'Confirm' },
  'scale.log': { zh: '操作日志', en: 'Operation Log' },
  'scale.noLog': { zh: '暂无日志', en: 'No logs yet' },
  'scale.logConnecting': { zh: '连接服务中...', en: 'Connecting...' },
  'scale.logConnected': { zh: '服务已连接', en: 'Service connected' },
  'scale.logDisconnected': { zh: '服务已断开', en: 'Service disconnected' },
  'scale.logConnectFail': { zh: '连接失败', en: 'Connection failed' },
  'scale.logStartRead': { zh: '开始读取数据', en: 'Start reading data' },
  'scale.logReadFail': { zh: '读取失败', en: 'Read failed' },
  'scale.logStopRead': { zh: '停止读取', en: 'Stop reading' },
  'scale.logStopFail': { zh: '停止失败', en: 'Stop failed' },

  // ===== ScannerScreen =====
  'scanner.connectionStatus': { zh: '连接状态:', en: 'Connection:' },
  'scanner.connected': { zh: '✅ 已连接', en: '✅ Connected' },
  'scanner.notConnected': { zh: '❌ 未连接', en: '❌ Disconnected' },
  'scanner.listenStatus': { zh: '监听状态:', en: 'Listening:' },
  'scanner.listening': { zh: '🎧 监听中', en: '🎧 Listening' },
  'scanner.notListening': { zh: '⏸️ 未监听', en: '⏸️ Not Listening' },
  'scanner.startListen': { zh: '开始监听', en: 'Start Listening' },
  'scanner.stopListen': { zh: '停止监听', en: 'Stop Listening' },
  'scanner.clearHistory': { zh: '清空历史', en: 'Clear History' },
  'scanner.scanHistory': { zh: '扫描历史', en: 'Scan History' },
  'scanner.noRecord': { zh: '暂无扫描记录', en: 'No scan records' },
  'scanner.type': { zh: '类型', en: 'Type' },

  // ===== DisplayScreen =====
  'display.status': { zh: '副屏状态', en: 'Display Status' },
  'display.available': { zh: '副屏可用:', en: 'Available:' },
  'display.checking': { zh: '检测中...', en: 'Checking...' },
  'display.yes': { zh: '✅ 是', en: '✅ Yes' },
  'display.no': { zh: '❌ 否', en: '❌ No' },
  'display.displayStatus': { zh: '副屏状态:', en: 'Display Status:' },
  'display.enabled': { zh: '✅ 已启用', en: '✅ Enabled' },
  'display.notEnabled': { zh: '⬜ 未启用', en: '⬜ Disabled' },
  'display.control': { zh: '副屏控制', en: 'Display Control' },
  'display.enable': { zh: '启用副屏', en: 'Enable Display' },
  'display.disable': { zh: '关闭副屏', en: 'Disable Display' },
  'display.showText': { zh: '显示文本', en: 'Show Text' },
  'display.inputPlaceholder': { zh: '输入要显示的文本', en: 'Enter text to display' },
  'display.sendToDisplay': { zh: '发送到副屏', en: 'Send to Display' },
  'display.showImage': { zh: '显示图片', en: 'Show Image' },
  'display.showLocalImage': { zh: '显示本地图片 (imin_product.png)', en: 'Show Local Image (imin_product.png)' },
  'display.imageUrlPlaceholder': { zh: '输入网络图片URL (http/https)', en: 'Enter image URL (http/https)' },
  'display.showNetworkImage': { zh: '显示网络图片', en: 'Show Network Image' },
  'display.playVideo': { zh: '播放视频', en: 'Play Video' },
  'display.playLocalVideo': { zh: '播放本地视频 (imin_video_3.mp4)', en: 'Play Local Video (imin_video_3.mp4)' },
  'display.videoUrlPlaceholder': { zh: '输入视频URL (http/https) 或本地路径', en: 'Enter video URL or local path' },
  'display.playNetworkVideo': { zh: '播放视频', en: 'Play Video' },
  'display.clearContent': { zh: '清除副屏内容', en: 'Clear Display' },
  'display.log': { zh: '操作日志', en: 'Operation Log' },
  'display.noLog': { zh: '暂无日志', en: 'No logs yet' },
  'display.error': { zh: '错误', en: 'Error' },
  'display.hint': { zh: '提示', en: 'Hint' },
  'display.enterImageUrl': { zh: '请输入图片URL', en: 'Please enter image URL' },
  'display.enterVideoUrl': { zh: '请输入视频URL', en: 'Please enter video URL' },

  // ===== LightScreen =====
  'light.status': { zh: '💡 灯光状态', en: '💡 Light Status' },
  'light.connectionStatus': { zh: '连接状态:', en: 'Connection:' },
  'light.connected': { zh: '● 已连接', en: '● Connected' },
  'light.notConnected': { zh: '○ 未连接', en: '○ Disconnected' },
  'light.currentColor': { zh: '当前颜色:', en: 'Current Color:' },
  'light.off': { zh: '关闭', en: 'Off' },
  'light.green': { zh: '绿色', en: 'Green' },
  'light.red': { zh: '红色', en: 'Red' },
  'light.control': { zh: '🎮 控制', en: '🎮 Control' },
  'light.connect': { zh: '🔌 连接设备', en: '🔌 Connect Device' },
  'light.turnOnGreen': { zh: '🟢 打开绿灯', en: '🟢 Turn On Green' },
  'light.turnOnRed': { zh: '🔴 打开红灯', en: '🔴 Turn On Red' },
  'light.turnOff': { zh: '⚫ 关闭灯光', en: '⚫ Turn Off' },
  'light.disconnect': { zh: '🔌 断开连接', en: '🔌 Disconnect' },
  'light.info': { zh: 'ℹ️ 使用说明', en: 'ℹ️ Instructions' },
  'light.infoText': {
    zh: '1. 确保 LED 灯设备已通过 USB 连接\n2. 点击"连接设备"按钮\n3. 授予 USB 权限（如果提示）\n4. 使用按钮控制灯光颜色',
    en: '1. Ensure LED device is connected via USB\n2. Click "Connect Device"\n3. Grant USB permission if prompted\n4. Use buttons to control light color',
  },
  'light.success': { zh: '成功', en: 'Success' },
  'light.error': { zh: '错误', en: 'Error' },
  'light.fail': { zh: '失败', en: 'Failed' },
  'light.deviceConnected': { zh: '灯光设备已连接', en: 'Light device connected' },
  'light.connectFailed': { zh: '连接失败或未找到设备', en: 'Connection failed or device not found' },
  'light.greenOn': { zh: '绿灯已打开', en: 'Green light on' },
  'light.redOn': { zh: '红灯已打开', en: 'Red light on' },
  'light.lightOff': { zh: '灯光已关闭', en: 'Light turned off' },
  'light.deviceDisconnected': { zh: '设备已断开', en: 'Device disconnected' },

  // ===== NfcScreen =====
  'nfc.status': { zh: '💳 NFC 状态', en: '💳 NFC Status' },
  'nfc.deviceSupport': { zh: '设备支持:', en: 'Device Support:' },
  'nfc.nfcEnabled': { zh: 'NFC 启用:', en: 'NFC Enabled:' },
  'nfc.enabled': { zh: '✓ 已启用', en: '✓ Enabled' },
  'nfc.notEnabled': { zh: '✗ 未启用', en: '✗ Disabled' },
  'nfc.listenStatus': { zh: '监听状态:', en: 'Listening:' },
  'nfc.listening': { zh: '● 监听中', en: '● Listening' },
  'nfc.notListening': { zh: '○ 未监听', en: '○ Not Listening' },
  'nfc.control': { zh: '🎮 控制', en: '🎮 Control' },
  'nfc.openSettings': { zh: '⚙️ 打开 NFC 设置', en: '⚙️ Open NFC Settings' },
  'nfc.startListen': { zh: '▶️ 开始监听', en: '▶️ Start Listening' },
  'nfc.stopListen': { zh: '⏹️ 停止监听', en: '⏹️ Stop Listening' },
  'nfc.refreshStatus': { zh: '🔄 刷新状态', en: '🔄 Refresh Status' },
  'nfc.tagHistory': { zh: '📋 标签历史', en: '📋 Tag History' },
  'nfc.clear': { zh: '清空', en: 'Clear' },
  'nfc.noRecord': { zh: '暂无标签记录', en: 'No tag records' },
  'nfc.content': { zh: '内容:', en: 'Content:' },
  'nfc.technology': { zh: '技术:', en: 'Technology:' },
  'nfc.info': { zh: 'ℹ️ 使用说明', en: 'ℹ️ Instructions' },
  'nfc.infoText': {
    zh: '1. 确保设备支持 NFC 功能\n2. 启用 NFC 功能\n3. 点击"开始监听"按钮\n4. 将 NFC 标签靠近设备背面\n5. 查看检测到的标签信息',
    en: '1. Ensure device supports NFC\n2. Enable NFC\n3. Click "Start Listening"\n4. Place NFC tag near device back\n5. View detected tag info',
  },
  'nfc.checkingStatus': { zh: '检查 NFC 状态...', en: 'Checking NFC status...' },
  'nfc.notSupported': { zh: '此设备不支持 NFC', en: 'NFC not supported on this device' },
  'nfc.error': { zh: '错误', en: 'Error' },
  'nfc.success': { zh: '成功', en: 'Success' },
  'nfc.tagDetected': { zh: 'NFC 标签检测', en: 'NFC Tag Detected' },
  'nfc.nfcNotEnabled': { zh: 'NFC 未启用', en: 'NFC Not Enabled' },
  'nfc.enableFirst': { zh: '请先启用 NFC 功能', en: 'Please enable NFC first' },
  'nfc.openSettingsBtn': { zh: '打开设置', en: 'Open Settings' },
  'nfc.startListenSuccess': { zh: '开始监听 NFC 标签', en: 'Started listening for NFC tags' },
  'nfc.stopListenSuccess': { zh: '停止监听 NFC 标签', en: 'Stopped listening for NFC tags' },
  'nfc.currentTag': { zh: '当前标签', en: 'Current Tag' },
  'nfc.tagType': { zh: '标签类型', en: 'Tag Type' },

  // ===== MsrScreen =====
  'msr.status': { zh: '💳 MSR 状态', en: '💳 MSR Status' },
  'msr.available': { zh: '设备可用:', en: 'Available:' },
  'msr.swipeInput': { zh: '📝 刷卡输入', en: '📝 Card Input' },
  'msr.instruction': { zh: '请将光标保持在下方输入框中，然后刷卡', en: 'Keep cursor in the input field below, then swipe card' },
  'msr.waiting': { zh: '等待刷卡...', en: 'Waiting for card...' },
  'msr.focusInput': { zh: '🎯 聚焦输入框', en: '🎯 Focus Input' },
  'msr.history': { zh: '📋 刷卡历史', en: '📋 Swipe History' },
  'msr.clear': { zh: '清空', en: 'Clear' },
  'msr.noRecord': { zh: '暂无刷卡记录', en: 'No swipe records' },
  'msr.dataLength': { zh: '数据长度:', en: 'Data Length:' },
  'msr.chars': { zh: '字符', en: 'chars' },
  'msr.rawData': { zh: '原始数据:', en: 'Raw Data:' },
  'msr.cardReadSuccess': { zh: '卡片读取成功', en: 'Card Read Success' },
  'msr.info': { zh: 'ℹ️ 使用说明', en: 'ℹ️ Instructions' },
  'msr.infoText': {
    zh: '1. MSR 设备作为键盘输入工作\n2. 确保输入框处于聚焦状态\n3. 刷卡时数据会自动输入\n4. 系统会自动检测并记录卡片数据\n5. 支持多轨道磁条卡读取',
    en: '1. MSR device works as keyboard input\n2. Ensure input field is focused\n3. Data auto-inputs on card swipe\n4. System auto-detects card data\n5. Supports multi-track reading',
  },
  'msr.warning': { zh: '⚠️ 注意：请勿在输入框中手动输入敏感卡片信息', en: '⚠️ Warning: Do not manually enter sensitive card info' },
  'msr.error': { zh: '错误', en: 'Error' },
  'msr.checkFailed': { zh: '检查 MSR 状态失败', en: 'Failed to check MSR status' },

  // ===== FloatingWindowScreen =====
  'float.status': { zh: '📌 悬浮窗状态', en: '📌 Floating Window Status' },
  'float.permission': { zh: '悬浮窗权限:', en: 'Permission:' },
  'float.authorized': { zh: '● 已授权', en: '● Authorized' },
  'float.notAuthorized': { zh: '○ 未授权', en: '○ Not Authorized' },
  'float.showStatus': { zh: '显示状态:', en: 'Show Status:' },
  'float.showing': { zh: '● 显示中', en: '● Showing' },
  'float.hidden': { zh: '○ 已隐藏', en: '○ Hidden' },
  'float.refreshStatus': { zh: '🔄 刷新状态', en: '🔄 Refresh Status' },
  'float.requestPermission': { zh: '🔐 权限申请', en: '🔐 Request Permission' },
  'float.permissionInfo': {
    zh: '悬浮窗功能需要 SYSTEM_ALERT_WINDOW 权限，点击下方按钮跳转到系统设置页进行授权。',
    en: 'Floating window requires SYSTEM_ALERT_WINDOW permission. Click below to open system settings.',
  },
  'float.requestBtn': { zh: '📋 申请悬浮窗权限', en: '📋 Request Permission' },
  'float.showControl': { zh: '🎮 显示控制', en: '🎮 Show Control' },
  'float.show': { zh: '📌 显示悬浮窗', en: '📌 Show Window' },
  'float.hide': { zh: '❌ 隐藏悬浮窗', en: '❌ Hide Window' },
  'float.updateText': { zh: '✏️ 更新文本', en: '✏️ Update Text' },
  'float.inputPlaceholder': { zh: '输入悬浮窗文本...', en: 'Enter floating window text...' },
  'float.updateBtn': { zh: '📝 更新文本', en: '📝 Update Text' },
  'float.setPosition': { zh: '📍 设置位置', en: '📍 Set Position' },
  'float.setPositionBtn': { zh: '📍 设置位置', en: '📍 Set Position' },
  'float.info': { zh: 'ℹ️ 使用说明', en: 'ℹ️ Instructions' },
  'float.infoText': {
    zh: '1. 首次使用需要申请悬浮窗权限\n2. 授权后点击"显示悬浮窗"按钮\n3. 悬浮窗支持拖拽移动\n4. 可以动态更新文本和位置\n5. 使用完毕后点击"隐藏悬浮窗"',
    en: '1. Request permission on first use\n2. Click "Show Window" after authorization\n3. Window supports drag to move\n4. Dynamically update text and position\n5. Click "Hide Window" when done',
  },
  'float.hint': { zh: '提示', en: 'Hint' },
  'float.error': { zh: '错误', en: 'Error' },
  'float.success': { zh: '成功', en: 'Success' },
  'float.hasPermission': { zh: '已拥有悬浮窗权限', en: 'Already has permission' },
  'float.goToSettings': { zh: '已跳转到系统设置页，请手动开启悬浮窗权限后返回', en: 'Redirected to settings. Please enable permission and return.' },
  'float.permissionDenied': { zh: '权限不足', en: 'Permission Denied' },
  'float.grantFirst': { zh: '请先授予悬浮窗权限', en: 'Please grant floating window permission first' },
  'float.enterText': { zh: '请输入文本内容', en: 'Please enter text' },
  'float.textUpdated': { zh: '文本已更新', en: 'Text updated' },
  'float.invalidCoords': { zh: '请输入有效的坐标值', en: 'Please enter valid coordinates' },
  'float.positionSet': { zh: '位置已设置为', en: 'Position set to' },

  // ===== SegmentScreen =====
  'segment.deviceConnection': { zh: '设备连接', en: 'Device Connection' },
  'segment.status': { zh: '状态:', en: 'Status:' },
  'segment.connected': { zh: '✅ 已连接', en: '✅ Connected' },
  'segment.disconnected': { zh: '⬜ 未连接', en: '⬜ Disconnected' },
  'segment.findAndConnect': { zh: '查找并连接', en: 'Find & Connect' },
  'segment.disconnect': { zh: '断开连接', en: 'Disconnect' },
  'segment.displayData': { zh: '显示数据', en: 'Display Data' },
  'segment.inputPlaceholder': { zh: '输入数字（最多9位）', en: 'Enter number (max 9 digits)' },
  'segment.leftAlign': { zh: '左对齐', en: 'Left Align' },
  'segment.rightAlign': { zh: '右对齐', en: 'Right Align' },
  'segment.sendToSegment': { zh: '发送到段码屏', en: 'Send to Segment' },
  'segment.control': { zh: '控制', en: 'Control' },
  'segment.clear': { zh: '清屏', en: 'Clear' },
  'segment.fullTest': { zh: '全亮测试', en: 'Full Test' },
  'segment.log': { zh: '操作日志', en: 'Operation Log' },
  'segment.noLog': { zh: '暂无日志', en: 'No logs yet' },

  // ===== SerialScreen =====
  'serial.config': { zh: '串口配置', en: 'Serial Config' },
  'serial.status': { zh: '状态:', en: 'Status:' },
  'serial.opened': { zh: '✅ 已打开', en: '✅ Opened' },
  'serial.closed': { zh: '⬜ 未打开', en: '⬜ Closed' },
  'serial.portPath': { zh: '串口路径', en: 'Port Path' },
  'serial.baudRate': { zh: '波特率', en: 'Baud Rate' },
  'serial.openPort': { zh: '打开串口', en: 'Open Port' },
  'serial.closePort': { zh: '关闭串口', en: 'Close Port' },
  'serial.sendData': { zh: '发送数据', en: 'Send Data' },
  'serial.inputPlaceholder': { zh: '输入要发送的文本', en: 'Enter text to send' },
  'serial.send': { zh: '发送', en: 'Send' },
  'serial.log': { zh: '通信日志', en: 'Communication Log' },
  'serial.noLog': { zh: '暂无日志', en: 'No logs yet' },

  // ===== RfidScreen =====
  'rfid.status': { zh: 'RFID 状态', en: 'RFID Status' },
  'rfid.connectionStatus': { zh: '连接状态:', en: 'Connection:' },
  'rfid.connected': { zh: '● 已连接', en: '● Connected' },
  'rfid.notConnected': { zh: '○ 未连接', en: '○ Disconnected' },
  'rfid.readStatus': { zh: '读取状态:', en: 'Read Status:' },
  'rfid.reading': { zh: '● 读取中', en: '● Reading' },
  'rfid.stopped': { zh: '○ 已停止', en: '○ Stopped' },
  'rfid.battery': { zh: '电池电量:', en: 'Battery:' },
  'rfid.stubNote': { zh: '注意：当前为 stub 模式，需要在真机上使用 IminRfidSdk 完善实际逻辑。', en: 'Note: Currently in stub mode. Use IminRfidSdk on real device.' },
  'rfid.connectionControl': { zh: '连接控制', en: 'Connection Control' },
  'rfid.connect': { zh: '连接 RFID 设备', en: 'Connect RFID Device' },
  'rfid.disconnect': { zh: '断开连接', en: 'Disconnect' },
  'rfid.checkBattery': { zh: '查询电池电量', en: 'Check Battery' },
  'rfid.tagRead': { zh: '标签读取', en: 'Tag Reading' },
  'rfid.startReading': { zh: '开始连续读取', en: 'Start Reading' },
  'rfid.stopReading': { zh: '停止读取', en: 'Stop Reading' },
  'rfid.clearTags': { zh: '清空标签列表', en: 'Clear Tag List' },
  'rfid.tagList': { zh: '标签列表', en: 'Tag List' },
  'rfid.noTags': { zh: '暂无标签数据', en: 'No tag data' },
  'rfid.info': { zh: '使用说明', en: 'Instructions' },
  'rfid.infoText': {
    zh: '1. 连接 RFID 设备\n2. 点击"开始连续读取"扫描标签\n3. 标签数据会实时显示在列表中\n4. 支持标签写入、锁定、销毁等高级操作\n5. 支持功率、过滤器、会话等配置',
    en: '1. Connect RFID device\n2. Click "Start Reading" to scan tags\n3. Tag data displays in real-time\n4. Supports write, lock, destroy operations\n5. Supports power, filter, session config',
  },
  'rfid.hint': { zh: '提示', en: 'Hint' },
  'rfid.error': { zh: '错误', en: 'Error' },
  'rfid.deviceConnected': { zh: 'RFID 设备已连接', en: 'RFID device connected' },
  'rfid.connectFailed': { zh: 'RFID 设备连接失败（stub 模式）', en: 'RFID connection failed (stub mode)' },
  'rfid.batteryLevel': { zh: '电池电量', en: 'Battery Level' },

  // ===== RfidScreen extras =====
  'rfid.charging': { zh: '充电中', en: 'Charging' },
  'rfid.tagCount': { zh: '标签数', en: 'Tags' },
  'rfid.totalRead': { zh: '总读取', en: 'Total' },
  'rfid.speed': { zh: '速度', en: 'Speed' },
  'rfid.emptyConnected': { zh: '点击"开始读取"扫描标签', en: 'Click "Start Reading" to scan tags' },
  'rfid.emptyDisconnected': { zh: '请先连接 RFID 设备', en: 'Please connect RFID device first' },
  'rfid.connectBtn': { zh: '连接 RFID 设备', en: 'Connect RFID Device' },
  'rfid.disconnectBtn': { zh: '断开连接', en: 'Disconnect' },

  // ===== ScannerScreen extras =====
  'scanner.customConfig': { zh: '自定义配置（可选）', en: 'Custom Config (Optional)' },
  'scanner.broadcastAction': { zh: '广播动作', en: 'Broadcast Action' },
  'scanner.stringDataKey': { zh: '字符串数据键', en: 'String Data Key' },
  'scanner.byteDataKey': { zh: '字节数据键', en: 'Byte Data Key' },
  'scanner.applyConfig': { zh: '应用配置', en: 'Apply Config' },
  'scanner.refreshStatus': { zh: '状态', en: 'Status' },
  'scanner.scanCount': { zh: '扫码次数', en: 'Scan Count' },
  'scanner.emptyHint': { zh: '· 连接硬件扫码头\n· 点击"开始监听"按钮\n· 扫描条码或二维码\n· 自动接收扫码数据', en: '· Connect hardware scanner\n· Click "Start Listening"\n· Scan barcode or QR code\n· Auto-receive scan data' },

  // ===== Common =====
  'common.cancel': { zh: '取消', en: 'Cancel' },
  'common.confirm': { zh: '确定', en: 'Confirm' },
  'common.yes': { zh: '✓ 是', en: '✓ Yes' },
  'common.no': { zh: '✗ 否', en: '✗ No' },
};

export function t(key: string): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[currentLang] || entry.en || key;
}

export default t;
