package com.imin.hardware.camera;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

/**
 * Camera 扫码模块 - 支持参数配置
 */
public class CameraScanHandler {
    private static final String TAG = "CameraScanHandler";
    private static final int REQUEST_CODE_SCAN = 0x1001;

    private final ReactApplicationContext reactContext;
    private Promise pendingPromise;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == REQUEST_CODE_SCAN) {
                Promise promise = pendingPromise;
                pendingPromise = null;

                if (promise == null) return;

                if (resultCode == Activity.RESULT_OK && data != null) {
                    String scanResult = data.getStringExtra(RNCaptureActivity.SCAN_RESULT);
                    String scanFormat = data.getStringExtra(RNCaptureActivity.SCAN_FORMAT);

                    if (scanResult != null) {
                        WritableMap result = Arguments.createMap();
                        result.putString("code", scanResult);
                        result.putString("format", scanFormat != null ? scanFormat : "UNKNOWN");
                        promise.resolve(result);
                    } else {
                        promise.reject("NO_DATA", "No scan result returned");
                    }
                } else if (resultCode == Activity.RESULT_CANCELED) {
                    promise.reject("CANCELED", "Scan was canceled");
                } else {
                    promise.reject("ERROR", "Unknown result code: " + resultCode);
                }
            }
        }
    };

    public CameraScanHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        reactContext.addActivityEventListener(activityEventListener);
    }

    /**
     * 启动相机扫码（无参数，使用默认配置）
     */
    public void scan(Promise promise) {
        scanWithOptions(null, promise);
    }

    /**
     * 启动相机扫码（带参数）
     */
    public void scanWithOptions(ReadableMap options, Promise promise) {
        if (pendingPromise != null) {
            promise.reject("ALREADY_ACTIVE", "Camera scan is already active");
            return;
        }

        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            pendingPromise = promise;
            Intent intent = new Intent(activity, RNCaptureActivity.class);

            // 传递参数
            if (options != null) {
                if (options.hasKey("formats")) {
                    ReadableArray formatsArr = options.getArray("formats");
                    if (formatsArr != null && formatsArr.size() > 0) {
                        String[] formats = new String[formatsArr.size()];
                        for (int i = 0; i < formatsArr.size(); i++) {
                            formats[i] = formatsArr.getString(i);
                        }
                        intent.putExtra(RNCaptureActivity.EXTRA_FORMATS, formats);
                    }
                }
                if (options.hasKey("useFlash")) {
                    intent.putExtra(RNCaptureActivity.EXTRA_USE_FLASH, options.getBoolean("useFlash"));
                }
                if (options.hasKey("beepEnabled")) {
                    intent.putExtra(RNCaptureActivity.EXTRA_BEEP_ENABLED, options.getBoolean("beepEnabled"));
                }
                if (options.hasKey("timeout")) {
                    intent.putExtra(RNCaptureActivity.EXTRA_TIMEOUT, options.getInt("timeout"));
                }
            }

            activity.startActivityForResult(intent, REQUEST_CODE_SCAN);
        } catch (Exception e) {
            pendingPromise = null;
            Log.e(TAG, "Failed to start camera scan", e);
            promise.reject("ERROR", "Failed to start camera scan: " + e.getMessage());
        }
    }

    public void cleanup() {
        if (pendingPromise != null) {
            pendingPromise.reject("CANCELED", "Handler cleanup");
            pendingPromise = null;
        }
    }
}
