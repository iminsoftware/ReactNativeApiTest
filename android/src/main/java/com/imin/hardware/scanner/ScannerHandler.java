package com.imin.hardware.scanner;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.text.TextUtils;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import com.imin.hardware.IminHardwareModule;

import java.lang.reflect.Method;

/**
 * Scanner 模块 - 条码扫描器处理
 * 参考: IMinApiTest/ScannerActivity.java
 */
public class ScannerHandler {
    private static final String TAG = "ScannerHandler";
    
    // 广播 Action
    private static final String DEVICE_CONNECTION = "com.imin.scanner.api.DEVICE_CONNECTION";
    private static final String DEVICE_DISCONNECTION = "com.imin.scanner.api.DEVICE_DISCONNECTION";
    private static final String DEFAULT_RESULT_ACTION = "com.imin.scanner.api.RESULT_ACTION";
    private static final String GET_STATUS = "persist.sys.imin.scanner.status";
    
    private final ReactApplicationContext context;
    private final IminHardwareModule module;
    private BroadcastReceiver scannerReceiver;
    private boolean isListening = false;
    
    // 可配置参数
    private String resultAction = DEFAULT_RESULT_ACTION;
    private String dataKey = "decode_data_str";
    private String byteDataKey = "decode_data";

    public ScannerHandler(ReactApplicationContext context, IminHardwareModule module) {
        this.context = context;
        this.module = module;
    }

    /**
     * 配置扫描器参数（监听中不允许修改）
     */
    public void configure(ReadableMap config, Promise promise) {
        if (isListening) {
            promise.reject("ALREADY_LISTENING", "Cannot configure while listening. Stop listening first.");
            return;
        }
        try {
            if (config.hasKey("action") && !TextUtils.isEmpty(config.getString("action"))) {
                resultAction = config.getString("action");
            }
            if (config.hasKey("dataKey") && !TextUtils.isEmpty(config.getString("dataKey"))) {
                dataKey = config.getString("dataKey");
            }
            if (config.hasKey("byteDataKey") && !TextUtils.isEmpty(config.getString("byteDataKey"))) {
                byteDataKey = config.getString("byteDataKey");
            }
            Log.d(TAG, "Configured: action=" + resultAction + ", dataKey=" + dataKey + ", byteDataKey=" + byteDataKey);
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Failed to configure scanner", e);
            promise.reject("CONFIGURE_ERROR", e.getMessage());
        }
    }

    /**
     * 开始监听扫描事件
     */
    public void startListening(Promise promise) {
        if (isListening) {
            promise.resolve(false);
            return;
        }

        try {
            // 注册广播接收器
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(DEVICE_CONNECTION);
            intentFilter.addAction(DEVICE_DISCONNECTION);
            intentFilter.addAction(resultAction);
            intentFilter.addAction("com.imin.scanner.api.CONNECTION_RESULT");

            scannerReceiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    handleBroadcast(intent);
                }
            };

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(scannerReceiver, intentFilter, Context.RECEIVER_EXPORTED);
            } else {
                context.registerReceiver(scannerReceiver, intentFilter);
            }
            isListening = true;
            Log.d(TAG, "Scanner listening started");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to start listening", e);
            promise.reject("START_ERROR", e.getMessage());
        }
    }

    /**
     * 停止监听扫描事件
     */
    public void stopListening(Promise promise) {
        if (!isListening) {
            promise.resolve(false);
            return;
        }

        try {
            context.unregisterReceiver(scannerReceiver);
            scannerReceiver = null;
            isListening = false;
            Log.d(TAG, "Scanner listening stopped");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Failed to stop listening", e);
            promise.reject("STOP_ERROR", e.getMessage());
        }
    }

    /**
     * 检查扫描器连接状态
     */
    public void isConnected(Promise promise) {
        try {
            // 通过 SystemProperties 查询状态
            Class<?> c = Class.forName("android.os.SystemProperties");
            Method get = c.getMethod("get", String.class, String.class);
            String status = (String) get.invoke(c, GET_STATUS, "0");
            boolean connected = "1".equals(status);
            Log.d(TAG, "Scanner connection status: " + connected);
            promise.resolve(connected);
        } catch (Exception e) {
            Log.e(TAG, "Failed to check connection", e);
            promise.reject("CHECK_ERROR", e.getMessage());
        }
    }

    /**
     * 处理广播消息
     */
    private void handleBroadcast(Intent intent) {
        String action = intent.getAction();
        WritableMap event = Arguments.createMap();

        if (DEVICE_CONNECTION.equals(action)) {
            // 扫描器连接
            event.putString("type", "connected");
            event.putDouble("timestamp", System.currentTimeMillis());
            Log.d(TAG, "Scanner connected");
            
        } else if (DEVICE_DISCONNECTION.equals(action)) {
            // 扫描器断开
            event.putString("type", "disconnected");
            event.putDouble("timestamp", System.currentTimeMillis());
            Log.d(TAG, "Scanner disconnected");
            
        } else if (resultAction.equals(action)) {
            // 扫描结果
            String strData = intent.getStringExtra(dataKey);
            byte[] byteData = intent.getByteArrayExtra(byteDataKey);
            String labelType = intent.getStringExtra("com.imin.scanner.api.label_type");

            WritableMap scanData = Arguments.createMap();
            scanData.putString("data", strData != null ? strData : "");
            scanData.putString("labelType", labelType != null ? labelType : "");
            scanData.putDouble("timestamp", System.currentTimeMillis());

            // 添加原始字节数据
            if (byteData != null) {
                WritableArray rawArray = Arguments.createArray();
                for (byte b : byteData) {
                    rawArray.pushInt(b & 0xFF);
                }
                scanData.putArray("rawData", rawArray);
            }

            event.putString("type", "scanResult");
            event.putMap("data", scanData);
            
            Log.d(TAG, "Scan result: " + strData + ", type: " + labelType);

        } else if ("com.imin.scanner.api.CONNECTION_RESULT".equals(action)) {
            // 连接状态回调
            int type = intent.getIntExtra("com.imin.scanner.api.status", 0);
            boolean isConnected = type == 1;
            event.putString("type", "connectionStatus");
            event.putBoolean("connected", isConnected);
            event.putDouble("timestamp", System.currentTimeMillis());
            Log.d(TAG, "Scanner connection status (broadcast): " + isConnected);
        }

        // 发送事件到 JavaScript
        module.sendEvent("scanner", event);
    }

    /**
     * 清理资源
     */
    public void cleanup() {
        if (isListening && scannerReceiver != null) {
            try {
                context.unregisterReceiver(scannerReceiver);
                isListening = false;
                Log.d(TAG, "Scanner handler cleaned up");
            } catch (Exception e) {
                Log.e(TAG, "Error during cleanup", e);
            }
        }
    }
}
