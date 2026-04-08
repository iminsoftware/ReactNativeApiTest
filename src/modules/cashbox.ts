// CashBox 模块 - 钱箱控制
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

export enum CashBoxVoltage {
  V9 = '1',
  V12 = '2',
  V24 = '3',
}

export class CashBox {
  /**
   * 打开钱箱
   */
  static open(): Promise<void> {
    return IminHardware.cashboxOpen();
  }

  /**
   * 获取钱箱状态
   */
  static getStatus(): Promise<boolean> {
    return IminHardware.cashboxGetStatus();
  }

  /**
   * 设置钱箱电压
   */
  static setVoltage(voltage: CashBoxVoltage): Promise<boolean> {
    return IminHardware.cashboxSetVoltage(voltage);
  }
}
