// Serial 模块 - 串口通信
import { NativeModules, NativeEventEmitter, EmitterSubscription } from 'react-native';

const { IminHardware } = NativeModules;
const eventEmitter = new NativeEventEmitter(IminHardware);

export interface SerialDataEvent {
  event: 'data';
  data: number[];
  timestamp: number;
}

/**
 * Serial 模块 - 串口通信
 *
 * 使用流程：
 * 1. open() 打开串口
 * 2. addListener() 监听接收数据
 * 3. write() / writeString() 发送数据
 * 4. close() 关闭串口
 */
export class Serial {
  /**
   * 打开串口
   * @param path 串口路径，如 "/dev/ttyS4"
   * @param baudRate 波特率，默认 115200
   */
  static open(path: string, baudRate: number = 115200): Promise<boolean> {
    return IminHardware.serialOpen(path, baudRate);
  }

  /** 关闭串口 */
  static close(): Promise<boolean> {
    return IminHardware.serialClose();
  }

  /**
   * 写入字节数据
   * @param data 逗号分隔的字节值，如 "72,101,108,108,111"
   */
  static write(data: string): Promise<boolean> {
    return IminHardware.serialWrite(data);
  }

  /** 写入字符串 */
  static writeString(text: string): Promise<boolean> {
    return IminHardware.serialWriteString(text);
  }

  /** 检查串口是否打开 */
  static isOpen(): Promise<boolean> {
    return IminHardware.serialIsOpen();
  }

  /** 监听串口接收数据 */
  static addListener(callback: (event: SerialDataEvent) => void): EmitterSubscription {
    return eventEmitter.addListener('serial_data', callback);
  }
}
