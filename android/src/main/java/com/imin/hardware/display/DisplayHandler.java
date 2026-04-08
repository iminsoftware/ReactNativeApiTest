package com.imin.hardware.display;

import android.app.Activity;
import android.content.Context;
import android.hardware.display.DisplayManager;
import android.util.Log;
import android.view.Display;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

/**
 * Display 模块 - 副屏控制
 * 参考 FlutterApiTest DisplayHandler.kt
 */
public class DisplayHandler {
    private static final String TAG = "DisplayHandler";

    private final ReactApplicationContext reactContext;
    private DifferentDisplay presentation;

    public DisplayHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    /**
     * 检查副屏是否可用
     */
    public void isAvailable(Promise promise) {
        try {
            Display display = getPresentationDisplay();
            promise.resolve(display != null);
        } catch (Exception e) {
            Log.e(TAG, "Error checking display availability", e);
            promise.resolve(false);
        }
    }

    /**
     * 启用副屏（创建 Presentation）
     */
    public void enable(Promise promise) {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            if (presentation != null) {
                promise.resolve(true);
                return;
            }

            Display display = getPresentationDisplay();
            if (display == null) {
                promise.reject("NO_DISPLAY", "Secondary display not found");
                return;
            }

            // 必须在主线程创建和显示 Presentation
            activity.runOnUiThread(() -> {
                try {
                    presentation = new DifferentDisplay(activity, display);
                    presentation.show();
                    Log.d(TAG, "Secondary display enabled");
                    promise.resolve(true);
                } catch (Exception e) {
                    Log.e(TAG, "Error enabling display on UI thread", e);
                    promise.reject("ENABLE_FAILED", e.getMessage());
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error enabling display", e);
            promise.reject("ENABLE_FAILED", e.getMessage());
        }
    }

    /**
     * 禁用副屏
     */
    public void disable(Promise promise) {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            activity.runOnUiThread(() -> {
                try {
                    if (presentation != null) {
                        presentation.dismiss();
                        presentation = null;
                    }
                    Log.d(TAG, "Secondary display disabled");
                    promise.resolve(true);
                } catch (Exception e) {
                    Log.e(TAG, "Error disabling display", e);
                    promise.reject("DISABLE_FAILED", e.getMessage());
                }
            });
        } catch (Exception e) {
            Log.e(TAG, "Error disabling display", e);
            promise.reject("DISABLE_FAILED", e.getMessage());
        }
    }

    /**
     * 在副屏显示文本
     */
    public void showText(String text, Promise promise) {
        try {
            if (presentation == null) {
                promise.reject("NO_DISPLAY", "Display not enabled. Call enable() first.");
                return;
            }
            presentation.showText(text);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error showing text", e);
            promise.reject("SHOW_TEXT_FAILED", e.getMessage());
        }
    }

    /**
     * 在副屏显示图片
     * @param path 图片路径，支持：
     *   - http/https URL
     *   - file:// 或绝对路径
     *   - content:// URI
     *   - RN bundled resource 名（如 src_assets_images_xxx，自动转为 android resource URI）
     */
    public void showImage(String path, Promise promise) {
        try {
            if (presentation == null) {
                promise.reject("NO_DISPLAY", "Display not enabled. Call enable() first.");
                return;
            }

            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            String resolvedPath = resolveImagePath(activity, path);
            Log.d(TAG, "showImage original: " + path + " -> resolved: " + resolvedPath);
            presentation.showImage(activity, resolvedPath);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error showing image", e);
            promise.reject("SHOW_IMAGE_FAILED", e.getMessage());
        }
    }

    /**
     * 解析图片路径：如果是 RN bundled resource 名，转为 android.resource:// URI
     */
    private String resolveImagePath(Activity activity, String path) {
        // 已经是 URL 或文件路径，直接返回
        if (path.startsWith("http://") || path.startsWith("https://") ||
            path.startsWith("file://") || path.startsWith("/") ||
            path.startsWith("content://") || path.startsWith("android.resource://")) {
            return path;
        }

        // 尝试作为 RN drawable resource 名查找
        // RN release 模式下 resolveAssetSource 返回类似 "src_assets_images_imin_product"
        String resourceName = path.toLowerCase().replace("-", "_");
        int resId = activity.getResources().getIdentifier(
                resourceName, "drawable", activity.getPackageName());
        if (resId != 0) {
            String uri = "android.resource://" + activity.getPackageName() + "/" + resId;
            Log.d(TAG, "Resolved RN resource: " + path + " -> " + uri);
            return uri;
        }

        // 没找到 resource，原样返回
        Log.w(TAG, "Could not resolve resource: " + path);
        return path;
    }

    /**
     * 在副屏播放视频
     * @param path 视频路径，支持：
     *   - http/https URL
     *   - file:// 或绝对路径
     *   - content:// URI
     *   - Android raw resource 名（如 imin_video_3，自动转为 android.resource:// URI）
     */
    public void playVideo(String path, Promise promise) {
        try {
            if (presentation == null) {
                promise.reject("NO_DISPLAY", "Display not enabled. Call enable() first.");
                return;
            }

            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            String resolvedPath = resolveVideoPath(activity, path);
            Log.d(TAG, "playVideo original: " + path + " -> resolved: " + resolvedPath);
            presentation.playVideo(activity, resolvedPath);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error playing video", e);
            promise.reject("PLAY_VIDEO_FAILED", e.getMessage());
        }
    }

    /**
     * 解析视频路径：如果是 raw resource 名，转为 android.resource:// URI
     */
    private String resolveVideoPath(Activity activity, String path) {
        if (path.startsWith("http://") || path.startsWith("https://") ||
            path.startsWith("file://") || path.startsWith("/") ||
            path.startsWith("content://") || path.startsWith("android.resource://")) {
            return path;
        }

        // 去掉扩展名，尝试作为 raw resource 查找
        String resourceName = path.toLowerCase().replace("-", "_");
        if (resourceName.contains(".")) {
            resourceName = resourceName.substring(0, resourceName.lastIndexOf('.'));
        }
        int resId = activity.getResources().getIdentifier(
                resourceName, "raw", activity.getPackageName());
        if (resId != 0) {
            String uri = "android.resource://" + activity.getPackageName() + "/" + resId;
            Log.d(TAG, "Resolved raw resource: " + path + " -> " + uri);
            return uri;
        }

        Log.w(TAG, "Could not resolve video resource: " + path);
        return path;
    }

    /**
     * 清除副屏内容
     */
    public void clear(Promise promise) {
        try {
            if (presentation == null) {
                promise.resolve(true);
                return;
            }
            presentation.clear();
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error clearing display", e);
            promise.reject("CLEAR_FAILED", e.getMessage());
        }
    }

    /**
     * 获取副屏 Display 对象
     */
    private Display getPresentationDisplay() {
        Activity activity = reactContext.getCurrentActivity();
        if (activity == null) return null;

        DisplayManager displayManager =
                (DisplayManager) activity.getSystemService(Context.DISPLAY_SERVICE);
        Display[] displays = displayManager.getDisplays(DisplayManager.DISPLAY_CATEGORY_PRESENTATION);

        if (displays != null) {
            for (Display display : displays) {
                Log.d(TAG, "Found display: " + display + ", Flags: " + display.getFlags());
                if ((display.getFlags() & Display.FLAG_SECURE) != 0 &&
                        (display.getFlags() & Display.FLAG_PRESENTATION) != 0) {
                    Log.d(TAG, "Selected presentation display: " + display);
                    return display;
                }
            }
        }

        return null;
    }

    /**
     * 清理资源
     */
    public void cleanup() {
        try {
            if (presentation != null) {
                presentation.dismiss();
                presentation = null;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        }
    }
}
