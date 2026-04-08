// Segment 模块 - 段码屏控制
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

export interface SegmentDeviceInfo {
  found: boolean;
  productId?: number;
  vendorId?: number;
  deviceName?: string;
}

export type SegmentAlign = 'left' | 'right';

/**
 * Segment 模块 - 控制 iMin 设备的段码屏（数码管）
 *
 * 使用流程：
 * 1. findDevice() 查找设备
 * 2. requestPermission() 请求 USB 权限
 * 3. connect() 连接设备
 * 4. sendData() 发送数据显示
 * 5. clear() / full() 清屏或全亮
 * 6. disconnect() 断开连接
 */
export class Segment {
  /** 查找段码屏 USB 设备 */
  static findDevice(): Promise<SegmentDeviceInfo> {
    return IminHardware.segmentFindDevice();
  }

  /** 请求 USB 权限 */
  static requestPermission(): Promise<boolean> {
    return IminHardware.segmentRequestPermission();
  }

  /** 连接设备 */
  static connect(): Promise<boolean> {
    return IminHardware.segmentConnect();
  }

  /**
   * 发送数据到段码屏
   * @param data 要显示的内容（最多9个字符）
   * @param align 对齐方式，默认右对齐
   */
  static sendData(data: string, align: SegmentAlign = 'right'): Promise<boolean> {
    return IminHardware.segmentSendData(data, align);
  }

  /** 清屏 */
  static clear(): Promise<boolean> {
    return IminHardware.segmentClear();
  }

  /** 全亮（测试用） */
  static full(): Promise<boolean> {
    return IminHardware.segmentFull();
  }

  /** 断开连接 */
  static disconnect(): Promise<boolean> {
    return IminHardware.segmentDisconnect();
  }
}
