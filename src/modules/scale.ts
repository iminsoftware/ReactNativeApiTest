// Scale 模块 - 电子秤
import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';

const { IminHardware } = NativeModules;

export interface ScaleDataEvent {
  weight: string;
  status: 'stable' | 'unstable' | 'overweight' | 'unknown';
  timestamp: number;
}

/**
 * Scale 模块 - 电子秤控制
 *
 * 使用流程：
 * 1. connect() 连接电子秤
 * 2. addListener() 监听重量数据
 * 3. tare() 去皮 / zero() 归零
 * 4. disconnect() 断开连接
 */
export class Scale {
  /**
   * 连接电子秤
   * @param devicePath 串口路径，默认 "/dev/ttyS4"
   */
  static connect(devicePath: string = '/dev/ttyS4'): Promise<boolean> {
    return IminHardware.scaleConnect(devicePath);
  }

  /** 断开连接 */
  static disconnect(): Promise<boolean> {
    return IminHardware.scaleDisconnect();
  }

  /** 去皮 */
  static tare(): Promise<boolean> {
    return IminHardware.scaleTare();
  }

  /** 归零 */
  static zero(): Promise<boolean> {
    return IminHardware.scaleZero();
  }

  /** 监听电子秤数据 */
  static addListener(callback: (event: ScaleDataEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('scale_data', callback);
  }
}
