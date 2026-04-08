// FloatingWindow 模块 - 悬浮窗控制
import { NativeModules } from 'react-native';

const { IminHardware } = NativeModules;

/**
 * FloatingWindow 模块 - 控制 iMin 设备的悬浮窗
 *
 * 使用流程：
 * 1. hasPermission() 检查是否有悬浮窗权限
 * 2. requestPermission() 请求权限（跳转系统设置）
 * 3. show() 显示悬浮窗
 * 4. updateText() 更新文本 / setPosition() 设置位置
 * 5. hide() 隐藏悬浮窗
 *
 * 注意：Android 6.0+ 需要 SYSTEM_ALERT_WINDOW 权限
 */
export class FloatingWindow {
  /**
   * 检查是否拥有悬浮窗权限
   * Android 6.0 以下始终返回 true
   */
  static hasPermission(): Promise<boolean> {
    return IminHardware.floatingWindowHasPermission();
  }

  /**
   * 请求悬浮窗权限
   * 会跳转到系统设置页面，用户需手动授权
   * 返回 true 表示已有权限，false 表示已跳转设置页
   */
  static requestPermission(): Promise<boolean> {
    return IminHardware.floatingWindowRequestPermission();
  }

  /**
   * 显示悬浮窗
   * 需要先获取悬浮窗权限
   */
  static show(): Promise<boolean> {
    return IminHardware.floatingWindowShow();
  }

  /**
   * 隐藏悬浮窗
   */
  static hide(): Promise<boolean> {
    return IminHardware.floatingWindowHide();
  }

  /**
   * 检查悬浮窗是否正在显示
   */
  static isShowing(): Promise<boolean> {
    return IminHardware.floatingWindowIsShowing();
  }

  /**
   * 更新悬浮窗显示的文本
   * @param text 要显示的文本内容
   */
  static updateText(text: string): Promise<boolean> {
    return IminHardware.floatingWindowUpdateText(text);
  }

  /**
   * 设置悬浮窗位置
   * @param x X 坐标（像素，从左边开始）
   * @param y Y 坐标（像素，从顶部开始）
   */
  static setPosition(x: number, y: number): Promise<boolean> {
    return IminHardware.floatingWindowSetPosition(x, y);
  }
}
