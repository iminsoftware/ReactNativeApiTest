// Scanner 模块 - 条码扫描器
import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { IminHardware } = NativeModules;
const eventEmitter = new NativeEventEmitter(IminHardware);

export interface ScannerConfig {
  action?: string;
  dataKey?: string;
  byteDataKey?: string;
}

export interface ScanResult {
  data: string;
  labelType: string;
  rawData?: number[];
  timestamp: number;
}

export type ScannerEvent = 
  | { type: 'scanResult'; data: ScanResult }
  | { type: 'connected'; timestamp: number }
  | { type: 'disconnected'; timestamp: number };

export class Scanner {
  /**
   * 配置扫描器参数
   */
  static configure(config: ScannerConfig): Promise<void> {
    return IminHardware.scannerConfigure(config);
  }

  /**
   * 开始监听扫描事件
   */
  static startListening(): Promise<boolean> {
    return IminHardware.scannerStartListening();
  }

  /**
   * 停止监听扫描事件
   */
  
  static stopListening(): Promise<boolean> {
    return IminHardware.scannerStopListening();
  }

  /**
   * 检查扫描器连接状态
   */
  static isConnected(): Promise<boolean> {
    return IminHardware.scannerIsConnected();
  }

  /**
   * 添加扫描事件监听器
   */
  static addListener(
    callback: (event: ScannerEvent) => void
  ): EmitterSubscription {
    return eventEmitter.addListener('scanner', callback);
  }
}
