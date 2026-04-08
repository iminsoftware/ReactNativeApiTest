// Device 模块 - 设备信息
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

export interface DeviceInfo {
  model: string;
  serialNumber: string;
  androidVersion: string;
  sdkVersion: string;
  brand: string;
  deviceName: string;
  androidVersionName: string;
  serviceVersion: string;
}

export class Device {
  /**
   * 获取设备型号
   */
  static getModel(): Promise<string> {
    return IminHardware.deviceGetModel();
  }

  /**
   * 获取设备序列号
   */
  static getSerialNumber(): Promise<string> {
    return IminHardware.deviceGetSerialNumber();
  }

  /**
   * 获取 Android 版本
   */
  static getAndroidVersion(): Promise<string> {
    return IminHardware.deviceGetAndroidVersion();
  }

  /**
   * 获取 SDK 版本
   */
  static getSdkVersion(): Promise<string> {
    return IminHardware.deviceGetSdkVersion();
  }

  /**
   * 获取品牌
   */
  static getBrand(): Promise<string> {
    return IminHardware.deviceGetBrand();
  }

  /**
   * 获取设备名称
   */
  static getDeviceName(): Promise<string> {
    return IminHardware.deviceGetDeviceName();
  }

  /**
   * 获取 Android 版本名称（如 "11", "13", "14"）
   */
  static getAndroidVersionName(): Promise<string> {
    return IminHardware.deviceGetAndroidVersionName();
  }

  /**
   * 获取 iMin SDK 服务版本号
   */
  static getServiceVersion(): Promise<string> {
    return IminHardware.deviceGetServiceVersion();
  }

  /**
   * 获取完整设备信息
   */
  static async getDeviceInfo(): Promise<DeviceInfo> {
    const [model, serialNumber, androidVersion, sdkVersion, brand, deviceName, androidVersionName, serviceVersion] = await Promise.all([
      Device.getModel(),
      Device.getSerialNumber(),
      Device.getAndroidVersion(),
      Device.getSdkVersion(),
      Device.getBrand(),
      Device.getDeviceName(),
      Device.getAndroidVersionName(),
      Device.getServiceVersion(),
    ]);

    return {
      model,
      serialNumber,
      androidVersion,
      sdkVersion,
      brand,
      deviceName,
      androidVersionName,
      serviceVersion,
    };
  }
}
