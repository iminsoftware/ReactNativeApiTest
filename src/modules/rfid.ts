// RFID 模块 - RFID 读写器
import { NativeModules, DeviceEventEmitter, EmitterSubscription } from 'react-native';

const { IminHardware } = NativeModules;

// ==================== 类型定义 ====================

export interface RfidTagData {
  type: 'tag';
  epc: string;
  pc?: string;
  tid?: string;
  rssi: number;
  count: number;
  frequency: number;
  timestamp: number;
}

export interface RfidReadSuccessEvent {
  type: 'read_success';
  data: string;
  bank: number;
  address: number;
  timestamp: number;
}

export interface RfidWriteSuccessEvent {
  type: 'write_success';
  timestamp: number;
}

export interface RfidErrorEvent {
  type: 'error';
  message: string;
  timestamp: number;
}

export type RfidEvent = RfidTagData | RfidReadSuccessEvent | RfidWriteSuccessEvent | RfidErrorEvent;

export interface RfidBatteryStatus {
  level: number;
  charging: boolean;
}

export interface ReadTagParams {
  /** 存储区域：0=Reserved, 1=EPC, 2=TID, 3=USER */
  bank?: number;
  /** 起始地址（字） */
  address?: number;
  /** 读取长度（字） */
  length?: number;
  /** 访问密码（十六进制字符串） */
  password?: string;
}

export interface WriteTagParams {
  /** 存储区域：0=Reserved, 1=EPC, 2=TID, 3=USER */
  bank: number;
  /** 起始地址（字） */
  address: number;
  /** 要写入的数据（十六进制字符串） */
  data: string;
  /** 访问密码（十六进制字符串） */
  password?: string;
}

export interface LockTagParams {
  /** 锁定对象：0=KillPassword, 1=AccessPassword, 2=EPC, 3=TID, 4=USER */
  lockObject: number;
  /** 锁定类型：0=Unlock, 1=Lock, 2=PermanentLock */
  lockType: number;
  /** 访问密码（十六进制字符串） */
  password?: string;
}

// ==================== 常量 ====================

/** 存储区域 */
export const RfidBank = { RESERVED: 0, EPC: 1, TID: 2, USER: 3 } as const;

/** 锁定对象 */
export const LockObject = { KILL_PASSWORD: 0, ACCESS_PASSWORD: 1, EPC: 2, TID: 3, USER: 4 } as const;

/** 锁定类型 */
export const LockType = { UNLOCK: 0, LOCK: 1, PERMANENT_LOCK: 2 } as const;

/** 会话模式 */
export const SessionMode = { S0: 0, S1: 1, S2: 2, S3: 3 } as const;

/** 目标模式 */
export const TargetMode = { A: 0, B: 1, A_TO_B: 2, B_TO_A: 3 } as const;

// ==================== RFID 类 ====================

/**
 * RFID 模块 - RFID 标签读写
 *
 * 注意：当前为基础实现（stub），需要在真机上使用 IminRfidSdk 完善。
 *
 * 使用流程：
 * 1. connect() 连接设备
 * 2. addTagListener() 监听标签事件
 * 3. startReading() 开始读取
 * 4. stopReading() 停止读取
 * 5. disconnect() 断开连接
 */
export class Rfid {
  // ==================== 连接管理 ====================

  static connect(): Promise<boolean> {
    return IminHardware.rfidConnect();
  }

  static disconnect(): Promise<boolean> {
    return IminHardware.rfidDisconnect();
  }

  static isConnected(): Promise<boolean> {
    return IminHardware.rfidIsConnected();
  }

  // ==================== 标签读取 ====================

  static startReading(): Promise<boolean> {
    return IminHardware.rfidStartReading();
  }

  static stopReading(): Promise<boolean> {
    return IminHardware.rfidStopReading();
  }

  static readTag(params?: ReadTagParams): Promise<boolean> {
    return IminHardware.rfidReadTag(params ?? { bank: 1, address: 2, length: 6, password: '' });
  }

  static clearTags(): Promise<boolean> {
    return IminHardware.rfidClearTags();
  }

  // ==================== 标签写入 ====================

  static writeTag(params: WriteTagParams): Promise<boolean> {
    return IminHardware.rfidWriteTag(params);
  }

  static writeEpc(params: { newEpc: string; password?: string }): Promise<boolean> {
    return IminHardware.rfidWriteEpc(params);
  }

  // ==================== 标签操作 ====================

  static lockTag(params: LockTagParams): Promise<boolean> {
    return IminHardware.rfidLockTag(params);
  }

  static killTag(password: string): Promise<boolean> {
    return IminHardware.rfidKillTag(password);
  }

  // ==================== 配置管理 ====================

  static setPower(readPower: number = 30, writePower: number = 30): Promise<boolean> {
    return IminHardware.rfidSetPower(readPower, writePower);
  }

  static setFilter(epc: string): Promise<boolean> {
    return IminHardware.rfidSetFilter(epc);
  }

  static clearFilter(): Promise<boolean> {
    return IminHardware.rfidClearFilter();
  }

  static setRssiFilter(enabled: boolean, level: number = -70): Promise<boolean> {
    return IminHardware.rfidSetRssiFilter(enabled, level);
  }

  static setGen2Q(qValue: number = -1): Promise<boolean> {
    return IminHardware.rfidSetGen2Q(qValue);
  }

  static setSession(session: number = 0): Promise<boolean> {
    return IminHardware.rfidSetSession(session);
  }

  static setTarget(target: number = 0): Promise<boolean> {
    return IminHardware.rfidSetTarget(target);
  }

  static setRfMode(rfMode: string = 'RF_MODE_1'): Promise<boolean> {
    return IminHardware.rfidSetRfMode(rfMode);
  }

  // ==================== 电池监控 ====================

  static getBatteryLevel(): Promise<number> {
    return IminHardware.rfidGetBatteryLevel();
  }

  static isCharging(): Promise<boolean> {
    return IminHardware.rfidIsCharging();
  }

  // ==================== 事件监听 ====================

  static addTagListener(callback: (event: RfidEvent) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('rfid_tag', callback);
  }

  static addConnectionListener(callback: (connected: boolean) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('rfid_connection', (event) => {
      callback(event?.connected ?? false);
    });
  }

  static addBatteryListener(callback: (status: RfidBatteryStatus) => void): EmitterSubscription {
    return DeviceEventEmitter.addListener('rfid_battery', callback);
  }
}
