// NFC 模块 - NFC 读卡器
import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { IminHardware } = NativeModules;
const eventEmitter = new NativeEventEmitter(IminHardware);

export interface NfcTagData {
  id: string;
  content: string;
  technology: string;
  timestamp: number;
}

export type NfcEvent = 
  | { type: 'tagDetected'; data: NfcTagData }
  | { type: 'error'; error: string };

export class Nfc {
  /**
   * 检查设备是否支持 NFC
   */
  static isAvailable(): Promise<boolean> {
    return IminHardware.nfcIsAvailable();
  }

  /**
   * 检查 NFC 是否已启用
   */
  static isEnabled(): Promise<boolean> {
    return IminHardware.nfcIsEnabled();
  }

  /**
   * 打开 NFC 设置页面
   */
  static openSettings(): Promise<boolean> {
    return IminHardware.nfcOpenSettings();
  }

  /**
   * 开始监听 NFC 标签
   */
  static startListening(): Promise<boolean> {
    return IminHardware.nfcStartListening();
  }

  /**
   * 停止监听 NFC 标签
   */
  static stopListening(): Promise<boolean> {
    return IminHardware.nfcStopListening();
  }

  /**
   * 添加 NFC 事件监听器
   */
  static addListener(
    callback: (data: NfcTagData) => void
  ): EmitterSubscription {
    return eventEmitter.addListener('nfc_tag_detected', callback);
  }
}
