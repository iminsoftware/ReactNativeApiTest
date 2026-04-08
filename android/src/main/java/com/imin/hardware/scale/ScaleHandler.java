package com.imin.hardware.scale;

import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.neostra.electronic.Electronic;
import com.neostra.electronic.ElectronicCallback;
import com.neostra.serialport.SerialPort;

import java.io.File;

/**
 * Scale 模块 - 电子秤（旧版 NeoStra SDK）
 * 参考 FlutterApiTest ScaleHandler.kt
 */
public class ScaleHandler implements ElectronicCallback {
    private static final String TAG = "ScaleHandler";
    private static final String EVENT_SCALE_DATA = "scale_data";
    private static final String SCALE_UNSTABLE = "55";
    private static final String SCALE_STABLE = "53";
    private static final String SCALE_OVER_WEIGHT = "46";

    private final ReactApplicationContext reactContext;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private Electronic electronic;

    public ScaleHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    /**
     * 连接电子秤
     * @param devicePath 串口路径，如 "/dev/ttyS4"
     */
    public void connect(String devicePath, Promise promise) {
        new Thread(() -> {
            try {
                if (electronic != null) {
                    electronic.closeElectronic();
                    electronic = null;
                }

                String devPath = (devicePath != null && !devicePath.isEmpty())
                        ? devicePath : "/dev/ttyS4";

                Log.d(TAG, "Connecting to scale: " + devPath);

                // USB 设备需要测试端口
                if (devPath.contains("ttyUSB")) {
                    boolean found = false;
                    for (int i = 0; i <= 9; i++) {
                        String usbTty = devPath + i;
                        try {
                            SerialPort sp = new SerialPort(new File(usbTty), 9600, 0);
                            found = true;
                            SystemClock.sleep(50);
                            sp.close();
                            SystemClock.sleep(50);
                            devPath = usbTty;
                            break;
                        } catch (Exception e) {
                            Log.d(TAG, "USB port " + usbTty + " not available");
                        }
                    }
                    if (!found) {
                        String finalDevPath = devPath;
                        mainHandler.post(() -> promise.reject("USB_NOT_FOUND",
                                "No available USB serial port found"));
                        return;
                    }
                }

                SystemClock.sleep(200);

                String finalPath = devPath;
                electronic = new Electronic.Builder()
                        .setDevicePath(finalPath)
                        .setReceiveCallback(this)
                        .builder();

                Log.d(TAG, "Scale connected: " + finalPath);
                mainHandler.post(() -> promise.resolve(true));
            } catch (Exception e) {
                Log.e(TAG, "Failed to connect scale", e);
                electronic = null;
                mainHandler.post(() -> promise.reject("CONNECT_FAILED", e.getMessage()));
            }
        }).start();
    }

    /** 断开连接 */
    public void disconnect(Promise promise) {
        try {
            if (electronic != null) {
                electronic.closeElectronic();
                electronic = null;
            }
            Log.d(TAG, "Scale disconnected");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to disconnect scale", e);
            promise.reject("DISCONNECT_FAILED", e.getMessage());
        }
    }

    /** 去皮 */
    public void tare(Promise promise) {
        try {
            if (electronic != null) {
                electronic.removePeel();
            }
            Log.d(TAG, "Tare executed");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to tare", e);
            promise.reject("TARE_FAILED", e.getMessage());
        }
    }

    /** 归零 */
    public void zero(Promise promise) {
        try {
            if (electronic != null) {
                electronic.turnZero();
            }
            Log.d(TAG, "Zero executed");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to zero", e);
            promise.reject("ZERO_FAILED", e.getMessage());
        }
    }

    /** 电子秤数据回调 */
    @Override
    public void electronicStatus(String weight, String weightStatus) {
        if (weight == null || weightStatus == null) return;

        String status;
        switch (weightStatus) {
            case SCALE_STABLE: status = "stable"; break;
            case SCALE_UNSTABLE: status = "unstable"; break;
            case SCALE_OVER_WEIGHT: status = "overweight"; break;
            default: status = "unknown"; break;
        }

        WritableMap event = Arguments.createMap();
        event.putString("weight", weight);
        event.putString("status", status);
        event.putDouble("timestamp", System.currentTimeMillis());

        mainHandler.post(() -> {
            try {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(EVENT_SCALE_DATA, event);
            } catch (Exception e) {
                Log.e(TAG, "Error sending scale event", e);
            }
        });
    }

    public void cleanup() {
        if (electronic != null) {
            electronic.closeElectronic();
            electronic = null;
        }
    }
}
