// Light 模块 - LED 灯控制
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

/**
 * Light 模块 - 控制 iMin 设备的 LED 灯
 * 
 * 注意：需要先连接 USB 设备并获取权限
 */
export class Light {
  /**
   * 连接灯光设备
   * 会自动请求 USB 权限
   */
  static connect(): Promise<boolean> {
    return IminHardware.lightConnect();
  }

  /**
   * 打开绿灯
   */
  static turnOnGreen(): Promise<boolean> {
    return IminHardware.lightTurnOnGreen();
  }

  /**
   * 打开红灯
   */
  static turnOnRed(): Promise<boolean> {
    return IminHardware.lightTurnOnRed();
  }

  /**
   * 关闭灯光
   */
  static turnOff(): Promise<boolean> {
    return IminHardware.lightTurnOff();
  }

  /**
   * 断开灯光设备连接
   */
  static disconnect(): Promise<boolean> {
    return IminHardware.lightDisconnect();
  }
}
