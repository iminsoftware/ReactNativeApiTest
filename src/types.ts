// 通用类型定义

export interface BaseEvent {
  timestamp: number;
}

export interface ErrorEvent extends BaseEvent {
  type: 'error';
  code: string;
  message: string;
}

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  UNKNOWN = 'unknown',
}
