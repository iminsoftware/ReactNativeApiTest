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
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import com.imin.scan.ScanUtils;

/**
 * Camera 扫码模块 - 支持参数配置
 */
public class CameraScanHandler {
    private static final String TAG = "CameraScanHandler";
    private static final int REQUEST_CODE_SCAN = 0x1001;
    private static final int REQUEST_CODE_SCAN_MULTI = 0x1002;

    private final ReactApplicationContext reactContext;
    private Promise pendingPromise;
    private boolean isMultiMode = false;

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            if (requestCode == REQUEST_CODE_SCAN) {
                handleSingleScanResult(resultCode, data);
            } else if (requestCode == REQUEST_CODE_SCAN_MULTI) {
                handleMultiScanResult(resultCode, data);
            }
        }
    };

    private void handleSingleScanResult(int resultCode, Intent data) {
        Promise promise = pendingPromise;
        pendingPromise = null;
        isMultiMode = false;

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

    private void handleMultiScanResult(int resultCode, Intent data) {
        Promise promise = pendingPromise;
        pendingPromise = null;
        isMultiMode = false;

        if (promise == null) return;

        if (resultCode == Activity.RESULT_OK && data != null) {
            String[] results = data.getStringArrayExtra(RNMultiCaptureActivity.SCAN_RESULTS);
            String[] formats = data.getStringArrayExtra(RNMultiCaptureActivity.SCAN_FORMATS);
            int count = data.getIntExtra(RNMultiCaptureActivity.SCAN_COUNT, 0);

            if (results != null && results.length > 0) {
                WritableArray arr = Arguments.createArray();
                for (int i = 0; i < results.length; i++) {
                    WritableMap item = Arguments.createMap();
                    item.putString("code", results[i]);
                    item.putString("format", (formats != null && i < formats.length) ? formats[i] : "UNKNOWN");
                    arr.pushMap(item);
                }
                promise.resolve(arr);
            } else {
                // fallback: 尝试读取单条码结果
                String scanResult = data.getStringExtra(RNMultiCaptureActivity.SCAN_RESULT);
                String scanFormat = data.getStringExtra(RNMultiCaptureActivity.SCAN_FORMAT);
                if (scanResult != null) {
                    WritableArray arr = Arguments.createArray();
                    WritableMap item = Arguments.createMap();
                    item.putString("code", scanResult);
                    item.putString("format", scanFormat != null ? scanFormat : "UNKNOWN");
                    arr.pushMap(item);
                    promise.resolve(arr);
                } else {
                    promise.reject("NO_DATA", "No scan result returned");
                }
            }
        } else if (resultCode == Activity.RESULT_CANCELED) {
            promise.reject("CANCELED", "Scan was canceled");
        } else {
            promise.reject("ERROR", "Unknown result code: " + resultCode);
        }
    }

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

    /**
     * 启动多条码/多角度扫码（新接口，走 RNMultiCaptureActivity）
     */
    public void scanMulti(ReadableMap options, Promise promise) {
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
            isMultiMode = true;
            Intent intent = new Intent(activity, RNMultiCaptureActivity.class);

            if (options != null) {
                if (options.hasKey("formats")) {
                    ReadableArray formatsArr = options.getArray("formats");
                    if (formatsArr != null && formatsArr.size() > 0) {
                        String[] formats = new String[formatsArr.size()];
                        for (int i = 0; i < formatsArr.size(); i++) {
                            formats[i] = formatsArr.getString(i);
                        }
                        intent.putExtra(RNMultiCaptureActivity.EXTRA_FORMATS, formats);
                    }
                }
                if (options.hasKey("useFlash")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_USE_FLASH, options.getBoolean("useFlash"));
                }
                if (options.hasKey("beepEnabled")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_BEEP_ENABLED, options.getBoolean("beepEnabled"));
                }
                if (options.hasKey("timeout")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_TIMEOUT, options.getInt("timeout"));
                }
                if (options.hasKey("supportMultiBarcode")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_SUPPORT_MULTI_BARCODE, options.getBoolean("supportMultiBarcode"));
                }
                if (options.hasKey("supportMultiAngle")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_SUPPORT_MULTI_ANGLE, options.getBoolean("supportMultiAngle"));
                }
                if (options.hasKey("decodeEngine")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_DECODE_ENGINE, options.getInt("decodeEngine"));
                }
                if (options.hasKey("fullAreaScan")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_FULL_AREA_SCAN, options.getBoolean("fullAreaScan"));
                }
                if (options.hasKey("areaRectRatio")) {
                    intent.putExtra(RNMultiCaptureActivity.EXTRA_AREA_RECT_RATIO, (float) options.getDouble("areaRectRatio"));
                }
            }

            // 默认开启多条码
            if (options == null || !options.hasKey("supportMultiBarcode")) {
                intent.putExtra(RNMultiCaptureActivity.EXTRA_SUPPORT_MULTI_BARCODE, true);
            }

            activity.startActivityForResult(intent, REQUEST_CODE_SCAN_MULTI);
        } catch (Exception e) {
            pendingPromise = null;
            isMultiMode = false;
            Log.e(TAG, "Failed to start multi camera scan", e);
            promise.reject("ERROR", "Failed to start multi camera scan: " + e.getMessage());
        }
    }

    /**
     * 检测 ML Kit 是否可用
     */
    public void isMLKitAvailable(Promise promise) {
        promise.resolve(ScanUtils.isMLKitAvailable());
    }
}
