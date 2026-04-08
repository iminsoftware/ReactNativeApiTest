// Display 模块 - 副屏控制
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

/**
 * Display 模块 - 控制 iMin 设备的副屏
 *
 * 使用流程：
 * 1. 调用 isAvailable() 检查副屏是否可用
 * 2. 调用 enable() 启用副屏
 * 3. 调用 showText() / showImage() / playVideo() 显示内容
 * 4. 调用 clear() 清除内容
 * 5. 调用 disable() 关闭副屏
 */
export class Display {
  /**
   * 检查副屏是否可用
   */
  static isAvailable(): Promise<boolean> {
    return IminHardware.displayIsAvailable();
  }

  /**
   * 启用副屏（创建 Presentation 窗口）
   */
  static enable(): Promise<boolean> {
    return IminHardware.displayEnable();
  }

  /**
   * 禁用副屏
   */
  static disable(): Promise<boolean> {
    return IminHardware.displayDisable();
  }

  /**
   * 在副屏显示文本
   * @param text 要显示的文本内容
   */
  static showText(text: string): Promise<boolean> {
    return IminHardware.displayShowText(text);
  }

  /**
   * 在副屏显示图片
   * @param path 图片路径，支持：
   *   - 网络URL: "https://example.com/image.png"
   *   - 本地文件: "/sdcard/image.png" 或 "file:///sdcard/image.png"
   */
  static showImage(path: string): Promise<boolean> {
    return IminHardware.displayShowImage(path);
  }

  /**
   * 在副屏播放视频（循环播放）
   * @param path 视频路径，支持：
   *   - 网络URL: "https://example.com/video.mp4"
   *   - 本地文件: "/sdcard/video.mp4" 或 "file:///sdcard/video.mp4"
   */
  static playVideo(path: string): Promise<boolean> {
    return IminHardware.displayPlayVideo(path);
  }

  /**
   * 清除副屏内容
   */
  static clear(): Promise<boolean> {
    return IminHardware.displayClear();
  }
}
