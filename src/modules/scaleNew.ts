// ScaleNew 模块 - 电子秤（新版 iMinEscale_SDK，Android 13+）
import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';

const { IminHardware } = NativeModules;

export interface ScaleNewWeightEvent {
  type: 'weight';
  net: number;
  tare: number;
  isStable: boolean;
  timestamp: number;
}

export interface ScaleNewStatusEvent {
  type: 'status';
  isLightWeight: boolean;
  overload: boolean;
  clearZeroErr: boolean;
  calibrationErr: boolean;
  timestamp: number;
}

export interface ScaleNewPriceEvent {
  type: 'price';
  net: number;
  tare: number;
  unit: number;
  unitPrice: string;
  totalPrice: string;
  isStable: boolean;
  isLightWeight: boolean;
  timestamp: number;
}

export interface ScaleNewConnectionEvent {
  type: 'connection';
  connected: boolean;
  timestamp: number;
}

export interface ScaleNewErrorEvent {
  type: 'error';
  errorCode: number;
  timestamp: number;
}

export type ScaleNewEvent =
  | ScaleNewWeightEvent
  | ScaleNewStatusEvent
  | ScaleNewPriceEvent
  | ScaleNewConnectionEvent
  | ScaleNewErrorEvent;

/** 重量单位常量 */
export const ScaleUnit = {
  g: 0,
  g100: 1,
  g500: 2,
  kg: 3,
} as const;

/**
 * ScaleNew 模块 - 新版电子秤（Android 13+ iMinEscale_SDK）
 */
export class ScaleNew {
  static connectService(): Promise<boolean> {
    return IminHardware.scaleNewConnectService();
  }

  static getData(): Promise<boolean> {
    return IminHardware.scaleNewGetData();
  }

  static cancelGetData(): Promise<boolean> {
    return IminHardware.scaleNewCancelGetData();
  }

  static getServiceVersion(): Promise<string> {
    return IminHardware.scaleNewGetServiceVersion();
  }

  static getFirmwareVersion(): Promise<string> {
    return IminHardware.scaleNewGetFirmwareVersion();
  }

  static zero(): Promise<boolean> {
    return IminHardware.scaleNewZero();
  }

  static tare(): Promise<boolean> {
    return IminHardware.scaleNewTare();
  }

  static digitalTare(weight: number): Promise<boolean> {
    return IminHardware.scaleNewDigitalTare(weight);
  }

  static setUnitPrice(price: string): Promise<boolean> {
    return IminHardware.scaleNewSetUnitPrice(price);
  }

  static getUnitPrice(): Promise<string> {
    return IminHardware.scaleNewGetUnitPrice();
  }

  static setUnit(unit: number): Promise<boolean> {
    return IminHardware.scaleNewSetUnit(unit);
  }

  static getUnit(): Promise<number> {
    return IminHardware.scaleNewGetUnit();
  }

  static readAcceleData(): Promise<number[]> {
    return IminHardware.scaleNewReadAcceleData();
  }

  static readSealState(): Promise<number> {
    return IminHardware.scaleNewReadSealState();
  }

  static getCalStatus(): Promise<number> {
    return IminHardware.scaleNewGetCalStatus();
  }

  static restart(): Promise<boolean> {
    return IminHardware.scaleNewRestart();
  }

  /**
   * 读取电子秤参数信息（量程信息）
   * 返回二维数组，如 [[6,2],[15,5]] 表示 6/15kg e=2/5g 多量程
   */
  static getCalInfo(): Promise<number[][]> {
    return IminHardware.scaleNewGetCalInfo();
  }

  /**
   * 获取城市重力加速表
   * 返回字符串数组，如 ["安徽,97947", ...]
   */
  static getCityAccelerations(): Promise<string[]> {
    return IminHardware.scaleNewGetCityAccelerations();
  }

  /**
   * 设置城市重力加速
   * @param index 对应城市重力加速列表的索引
   * @returns true 设置成功，false 设置失败
   */
  static setGravityAcceleration(index: number): Promise<boolean> {
    return IminHardware.scaleNewSetGravityAcceleration(index);
  }

  static addListener(callback: (event: ScaleNewEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('scale_new_data', callback);
  }
}
