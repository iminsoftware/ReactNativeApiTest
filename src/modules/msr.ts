// MSR 模块 - 磁条卡读卡器
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

/**
 * MSR (Magnetic Stripe Reader) 模块
 * 
 * 注意：MSR 设备通常作为键盘输入设备工作。
 * 刷卡时会自动输入卡片数据到当前焦点的 TextInput。
 * 
 * 使用方法：
 * 1. 在页面上放置一个 TextInput
 * 2. 让 TextInput 获得焦点
 * 3. 刷卡，数据会自动输入到 TextInput
 */
export class Msr {
  /**
   * 检查 MSR 设备是否可用
   * 
   * 注意：此方法默认返回 true，因为 MSR 设备作为键盘输入工作。
   * 实际可用性取决于硬件连接状态。
   */
  static isAvailable(): Promise<boolean> {
    return IminHardware.msrIsAvailable();
  }
}
