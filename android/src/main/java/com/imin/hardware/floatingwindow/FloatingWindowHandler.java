package com.imin.hardware.floatingwindow;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

/**
 * 悬浮窗功能处理器
 *
 * 功能：show / hide / isShowing / updateText / setPosition / requestPermission
 */
public class FloatingWindowHandler {
    private static final String TAG = "FloatingWindowHandler";
    private static final int OVERLAY_PERMISSION_REQUEST_CODE = 5469;

    private final ReactApplicationContext reactContext;

    public FloatingWindowHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    /**
     * 检查是否拥有悬浮窗权限
     */
    public void hasPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext));
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error checking overlay permission", e);
            promise.reject("ERROR", "Failed to check permission: " + e.getMessage());
        }
    }

    /**
     * 请求悬浮窗权限（跳转到系统设置页）
     */
    public void requestPermission(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (Settings.canDrawOverlays(reactContext)) {
                    promise.resolve(true);
                    return;
                }
                Activity activity = reactContext.getCurrentActivity();
                if (activity == null) {
                    promise.reject("NO_ACTIVITY", "Activity is null");
                    return;
                }
                Intent intent = new Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + activity.getPackageName())
                );
                activity.startActivityForResult(intent, OVERLAY_PERMISSION_REQUEST_CODE);
                // 用户需要手动授权后返回，这里先返回 false
                promise.resolve(false);
            } else {
                promise.resolve(true);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error requesting overlay permission", e);
            promise.reject("ERROR", "Failed to request permission: " + e.getMessage());
        }
    }

    /**
     * 显示悬浮窗
     */
    public void show(Promise promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!Settings.canDrawOverlays(reactContext)) {
                    promise.reject("PERMISSION_DENIED",
                        "Overlay permission not granted. Call requestPermission() first.");
                    return;
                }
            }

            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            Intent intent = new Intent(activity, FloatingWindowService.class);
            intent.setAction(FloatingWindowService.ACTION_SHOW);
            activity.startService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error showing floating window", e);
            promise.reject("ERROR", "Failed to show floating window: " + e.getMessage());
        }
    }

    /**
     * 隐藏悬浮窗
     */
    public void hide(Promise promise) {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            Intent intent = new Intent(activity, FloatingWindowService.class);
            intent.setAction(FloatingWindowService.ACTION_HIDE);
            activity.startService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error hiding floating window", e);
            promise.reject("ERROR", "Failed to hide floating window: " + e.getMessage());
        }
    }

    /**
     * 检查悬浮窗是否正在显示
     */
    public void isShowing(Promise promise) {
        try {
            promise.resolve(FloatingWindowService.isShowing);
        } catch (Exception e) {
            Log.e(TAG, "Error checking floating window status", e);
            promise.reject("ERROR", "Failed to check status: " + e.getMessage());
        }
    }

    /**
     * 更新悬浮窗文本
     */
    public void updateText(String text, Promise promise) {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            Intent intent = new Intent(activity, FloatingWindowService.class);
            intent.setAction(FloatingWindowService.ACTION_UPDATE_TEXT);
            intent.putExtra("text", text);
            activity.startService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error updating floating window text", e);
            promise.reject("ERROR", "Failed to update text: " + e.getMessage());
        }
    }

    /**
     * 设置悬浮窗位置
     */
    public void setPosition(int x, int y, Promise promise) {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            Intent intent = new Intent(activity, FloatingWindowService.class);
            intent.setAction(FloatingWindowService.ACTION_SET_POSITION);
            intent.putExtra("x", x);
            intent.putExtra("y", y);
            activity.startService(intent);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error setting floating window position", e);
            promise.reject("ERROR", "Failed to set position: " + e.getMessage());
        }
    }

    /**
     * 清理资源
     */
    public void cleanup() {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity != null && FloatingWindowService.isShowing) {
                Intent intent = new Intent(activity, FloatingWindowService.class);
                intent.setAction(FloatingWindowService.ACTION_HIDE);
                activity.startService(intent);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        }
    }
}
