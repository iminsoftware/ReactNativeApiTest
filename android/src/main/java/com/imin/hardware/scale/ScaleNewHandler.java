package com.imin.hardware.scale;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.imin.scalelibrary.ScaleManager;
import com.imin.scalelibrary.ScaleResult;

/**
 * Scale 模块 - 电子秤（新版 iMinEscale_SDK，Android 13+）
 * 参考 FlutterApiTest ScaleNewHandler.kt
 */
public class ScaleNewHandler {
    private static final String TAG = "ScaleNewHandler";
    private static final String EVENT_SCALE_NEW = "scale_new_data";

    private final ReactApplicationContext reactContext;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private ScaleManager scaleManager;
    private volatile boolean isConnected = false;
    private volatile boolean isGettingData = false;
    private volatile boolean autoStartGetData = false;

    // 轮询
    private Runnable pollingRunnable;
    private static final long POLLING_INTERVAL_MS = 1000;

    private final ScaleManager.ScaleServiceConnection serviceConnection =
            new ScaleManager.ScaleServiceConnection() {
                @Override
                public void onServiceConnected() {
                    Log.d(TAG, "Scale service connected");
                    isConnected = true;
                    sendEvent("connection", true);

                    if (autoStartGetData) {
                        mainHandler.postDelayed(() -> {
                            try { startGetDataInternal(); }
                            catch (Exception e) { Log.e(TAG, "Auto start failed", e); }
                        }, 500);
                    }
                }

                @Override
                public void onServiceDisconnect() {
                    Log.w(TAG, "Scale service disconnected");
                    isConnected = false;
                    isGettingData = false;
                    sendEvent("connection", false);
                }
            };

    private final ScaleResult scaleResultCallback = new ScaleResult() {
        @Override
        public void getResult(int net, int tare, boolean isStable) {
            Log.d(TAG, "Callback getResult: net=" + net + ", tare=" + tare + ", stable=" + isStable);
            mainHandler.post(() -> {
                try {
                    WritableMap event = Arguments.createMap();
                    event.putString("type", "weight");
                    event.putInt("net", net);
                    event.putInt("tare", tare);
                    event.putBoolean("isStable", isStable);
                    event.putDouble("timestamp", System.currentTimeMillis());
                    emitEvent(event);
                } catch (Exception e) { Log.e(TAG, "Error emitting weight", e); }
            });
        }

        @Override
        public void getStatus(boolean isLightWeight, boolean overload,
                              boolean clearZeroErr, boolean calibrationErr) {
            Log.d(TAG, "Callback getStatus: light=" + isLightWeight + ", overload=" + overload);
            mainHandler.post(() -> {
                try {
                    WritableMap event = Arguments.createMap();
                    event.putString("type", "status");
                    event.putBoolean("isLightWeight", isLightWeight);
                    event.putBoolean("overload", overload);
                    event.putBoolean("clearZeroErr", clearZeroErr);
                    event.putBoolean("calibrationErr", calibrationErr);
                    event.putDouble("timestamp", System.currentTimeMillis());
                    emitEvent(event);
                } catch (Exception e) { Log.e(TAG, "Error emitting status", e); }
            });
        }

        @Override
        public void getPrice(int net, int tare, int unit, String unitPrice,
                             String totalPrice, boolean isStable, boolean isLightWeight) {
            Log.d(TAG, "Callback getPrice: net=" + net + ", unitPrice=" + unitPrice + ", totalPrice=" + totalPrice);
            final String up = unitPrice != null ? unitPrice : "0";
            final String tp = totalPrice != null ? totalPrice : "0";
            mainHandler.post(() -> {
                try {
                    WritableMap event = Arguments.createMap();
                    event.putString("type", "price");
                    event.putInt("net", net);
                    event.putInt("tare", tare);
                    event.putInt("unit", unit);
                    event.putString("unitPrice", up);
                    event.putString("totalPrice", tp);
                    event.putBoolean("isStable", isStable);
                    event.putBoolean("isLightWeight", isLightWeight);
                    event.putDouble("timestamp", System.currentTimeMillis());
                    emitEvent(event);
                } catch (Exception e) { Log.e(TAG, "Error emitting price", e); }
            });
        }

        @Override
        public void error(int errorCode) {
            Log.e(TAG, "Callback error: code=" + errorCode);
            mainHandler.post(() -> {
                try {
                    WritableMap event = Arguments.createMap();
                    event.putString("type", "error");
                    event.putInt("errorCode", errorCode);
                    event.putDouble("timestamp", System.currentTimeMillis());
                    emitEvent(event);
                } catch (Exception e) { Log.e(TAG, "Error emitting error", e); }
            });
        }
    };

    public ScaleNewHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        this.scaleManager = ScaleManager.getInstance(reactContext);
    }

    private void emitEvent(WritableMap event) {
        mainHandler.post(() -> {
            try {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(EVENT_SCALE_NEW, event);
            } catch (Exception e) {
                Log.e(TAG, "Error emitting event", e);
            }
        });
    }

    private void sendEvent(String type, boolean connected) {
        WritableMap event = Arguments.createMap();
        event.putString("type", "connection");
        event.putBoolean("connected", connected);
        event.putDouble("timestamp", System.currentTimeMillis());
        emitEvent(event);
    }

    private void startGetDataInternal() {
        try {
            Log.d(TAG, "Calling reqWeightOutPut...");
            scaleManager.reqWeightOutPut();
        } catch (Exception e) { Log.w(TAG, "reqWeightOutPut failed", e); }

        try {
            Log.d(TAG, "Calling getData with callback...");
            scaleManager.getData(scaleResultCallback);
            Log.d(TAG, "getData called successfully");
        } catch (Exception e) { Log.e(TAG, "getData failed", e); }
        isGettingData = true;
        startPolling();
        Log.d(TAG, "startGetDataInternal complete, polling started");
    }

    private void startPolling() {
        stopPolling();
        Log.d(TAG, "Starting polling...");
        pollingRunnable = new Runnable() {
            @Override
            public void run() {
                if (isGettingData && isConnected) {
                    try {
                        scaleManager.reqWeightOutPut();
                        Log.d(TAG, "Polling: reqWeightOutPut called");
                    } catch (Exception e) { Log.e(TAG, "Polling failed", e); }
                    mainHandler.postDelayed(this, POLLING_INTERVAL_MS);
                }
            }
        };
        mainHandler.postDelayed(pollingRunnable, POLLING_INTERVAL_MS);
    }

    private void stopPolling() {
        if (pollingRunnable != null) {
            mainHandler.removeCallbacks(pollingRunnable);
            pollingRunnable = null;
        }
    }

    // === 公开方法 ===

    public void connectService(Promise promise) {
        try {
            scaleManager.connectService(serviceConnection);
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("CONNECT_FAILED", e.getMessage());
        }
    }

    public void getData(Promise promise) {
        try {
            Log.d(TAG, "getData called, isConnected=" + isConnected);
            if (!isConnected) {
                Log.d(TAG, "Not connected, auto connecting...");
                autoStartGetData = true;
                scaleManager.connectService(serviceConnection);
                promise.resolve(true);
                return;
            }
            startGetDataInternal();
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "getData failed", e);
            promise.reject("GET_DATA_FAILED", e.getMessage());
        }
    }

    public void cancelGetData(Promise promise) {
        try {
            stopPolling();
            try { scaleManager.stopWeightOutput(); } catch (Exception e) {}
            try { scaleManager.cancelGetData(); } catch (Exception e) {}
            isGettingData = false;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("CANCEL_FAILED", e.getMessage());
        }
    }

    public void getServiceVersion(Promise promise) {
        try {
            String v = scaleManager.getServiceVersion();
            promise.resolve(v != null ? v : "Unknown");
        } catch (Exception e) { promise.resolve("Unknown"); }
    }

    public void getFirmwareVersion(Promise promise) {
        try {
            String v = scaleManager.getFirmwareVersion();
            promise.resolve(v != null ? v : "Unknown");
        } catch (Exception e) { promise.resolve("Unknown"); }
    }

    public void zero(Promise promise) {
        try {
            scaleManager.zero();
            promise.resolve(true);
        } catch (Exception e) { promise.reject("ZERO_FAILED", e.getMessage()); }
    }

    public void tare(Promise promise) {
        try {
            scaleManager.tare();
            promise.resolve(true);
        } catch (Exception e) { promise.reject("TARE_FAILED", e.getMessage()); }
    }

    public void digitalTare(int weight, Promise promise) {
        try {
            scaleManager.digitalTare(weight);
            promise.resolve(true);
        } catch (Exception e) { promise.reject("DIGITAL_TARE_FAILED", e.getMessage()); }
    }

    public void setUnitPrice(String price, Promise promise) {
        try {
            scaleManager.setUnitPrice(price);
            promise.resolve(true);
        } catch (Exception e) { promise.reject("SET_UNIT_PRICE_FAILED", e.getMessage()); }
    }

    public void getUnitPrice(Promise promise) {
        try {
            String p = scaleManager.getUnitPrice();
            promise.resolve(p != null ? p : "0");
        } catch (Exception e) { promise.resolve("0"); }
    }

    public void setUnit(int unit, Promise promise) {
        try {
            scaleManager.setUnit(unit);
            promise.resolve(true);
        } catch (Exception e) { promise.reject("SET_UNIT_FAILED", e.getMessage()); }
    }

    public void getUnit(Promise promise) {
        try {
            promise.resolve(scaleManager.getUnit());
        } catch (Exception e) { promise.resolve(0); }
    }

    public void readAcceleData(Promise promise) {
        try {
            int[] data = scaleManager.readAcceleData();
            WritableArray arr = Arguments.createArray();
            if (data != null) {
                for (int d : data) arr.pushInt(d);
            }
            promise.resolve(arr);
        } catch (Exception e) { promise.resolve(Arguments.createArray()); }
    }

    public void readSealState(Promise promise) {
        try {
            promise.resolve(scaleManager.getStealStatus());
        } catch (Exception e) { promise.resolve(0); }
    }

    public void getCalStatus(Promise promise) {
        try {
            promise.resolve(scaleManager.getCalStatus());
        } catch (Exception e) { promise.resolve(0); }
    }

    public void restart(Promise promise) {
        try {
            scaleManager.restart();
            promise.resolve(true);
        } catch (Exception e) { promise.reject("RESTART_FAILED", e.getMessage()); }
    }

    public void getCalInfo(Promise promise) {
        try {
            int[][] calInfo = scaleManager.getCalInfo();
            WritableArray result = Arguments.createArray();
            if (calInfo != null) {
                for (int[] range : calInfo) {
                    WritableArray rangeArr = Arguments.createArray();
                    for (int v : range) {
                        rangeArr.pushInt(v);
                    }
                    result.pushArray(rangeArr);
                }
            }
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "getCalInfo failed", e);
            promise.resolve(Arguments.createArray());
        }
    }

    public void getCityAccelerations(Promise promise) {
        try {
            java.util.List<String> cities = scaleManager.getCityAccelerations();
            WritableArray result = Arguments.createArray();
            if (cities != null) {
                for (String city : cities) {
                    result.pushString(city);
                }
            }
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "getCityAccelerations failed", e);
            promise.resolve(Arguments.createArray());
        }
    }

    public void setGravityAcceleration(int index, Promise promise) {
        try {
            int returnCode = scaleManager.setGravityAcceleration(index);
            promise.resolve(returnCode == 0);
        } catch (Exception e) {
            Log.e(TAG, "setGravityAcceleration failed", e);
            promise.reject("SET_GRAVITY_FAILED", e.getMessage());
        }
    }

    public void cleanup() {
        try {
            stopPolling();
            mainHandler.removeCallbacksAndMessages(null);
            if (isGettingData) { scaleManager.cancelGetData(); isGettingData = false; }
            if (isConnected) { scaleManager.disconnectService(); isConnected = false; }
        } catch (Exception e) { Log.e(TAG, "Cleanup failed", e); }
    }
}
