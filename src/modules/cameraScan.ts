// CameraScan 模块 - 相机扫码
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

export interface ScanResultData {
  code: string;
  format: string;
}

export interface CameraScanOptions {
  /** 要识别的条码格式列表，不传则使用默认格式 */
  formats?: BarcodeFormatType[];
  /** 是否开启闪光灯，默认 false */
  useFlash?: boolean;
  /** 是否播放提示音，默认 true */
  beepEnabled?: boolean;
  /** 超时时间(毫秒)，0 = 不超时，默认 0 */
  timeout?: number;
}

/** 支持的条码格式 */
export const BarcodeFormat = {
  QR_CODE: 'QR_CODE',
  EAN_13: 'EAN_13',
  EAN_8: 'EAN_8',
  UPC_A: 'UPC_A',
  UPC_E: 'UPC_E',
  CODE_128: 'CODE_128',
  CODE_39: 'CODE_39',
  CODE_93: 'CODE_93',
  CODABAR: 'CODABAR',
  ITF: 'ITF',
  RSS_14: 'RSS_14',
  RSS_EXPANDED: 'RSS_EXPANDED',
  DATA_MATRIX: 'DATA_MATRIX',
  PDF_417: 'PDF_417',
  AZTEC: 'AZTEC',
  MAXICODE: 'MAXICODE',
} as const;

export type BarcodeFormatType = (typeof BarcodeFormat)[keyof typeof BarcodeFormat];

/** 默认格式 */
export const DEFAULT_FORMATS: BarcodeFormatType[] = [
  BarcodeFormat.QR_CODE,
  BarcodeFormat.UPC_A,
  BarcodeFormat.EAN_13,
  BarcodeFormat.CODE_128,
];

/** 所有一维码格式 */
export const ONE_D_FORMATS: BarcodeFormatType[] = [
  BarcodeFormat.CODABAR,
  BarcodeFormat.CODE_39,
  BarcodeFormat.CODE_93,
  BarcodeFormat.CODE_128,
  BarcodeFormat.EAN_8,
  BarcodeFormat.EAN_13,
  BarcodeFormat.ITF,
  BarcodeFormat.RSS_14,
  BarcodeFormat.RSS_EXPANDED,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
];

/** 所有二维码格式 */
export const TWO_D_FORMATS: BarcodeFormatType[] = [
  BarcodeFormat.AZTEC,
  BarcodeFormat.DATA_MATRIX,
  BarcodeFormat.MAXICODE,
  BarcodeFormat.PDF_417,
  BarcodeFormat.QR_CODE,
];

/** 全部格式 */
export const ALL_FORMATS: BarcodeFormatType[] = [...ONE_D_FORMATS, ...TWO_D_FORMATS];

/**
 * CameraScan 模块 - 使用摄像头扫描条码/二维码
 */
export class CameraScan {
  /**
   * 启动相机扫码（默认配置）
   */
  static scan(options?: CameraScanOptions): Promise<ScanResultData> {
    if (options) {
      return IminHardware.cameraScanWithOptions(options);
    }
    return IminHardware.cameraScan();
  }

  /** 快速扫码，返回扫码内容字符串 */
  static async scanQuick(): Promise<string> {
    const result = await CameraScan.scan();
    return result.code;
  }

  /** 扫码并返回完整结果（code + format） */
  static async scanAll(): Promise<ScanResultData> {
    return CameraScan.scan({ formats: ALL_FORMATS });
  }

  /** 仅扫描二维码 */
  static async scanQRCode(): Promise<string> {
    const result = await CameraScan.scan({ formats: [BarcodeFormat.QR_CODE] });
    return result.code;
  }

  /** 仅扫描条码 */
  static async scanBarcode(): Promise<string> {
    const result = await CameraScan.scan({ formats: ONE_D_FORMATS });
    return result.code;
  }
}
