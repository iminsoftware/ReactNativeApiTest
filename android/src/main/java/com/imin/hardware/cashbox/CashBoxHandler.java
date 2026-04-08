package com.imin.hardware.cashbox;

import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;

import com.imin.library.IminSDKManager;

/**
 * CashBox 模块 - 钱箱控制
 */
public class CashBoxHandler {
    private static final String TAG = "CashBoxHandler";
    
    private final ReactApplicationContext context;

    public CashBoxHandler(ReactApplicationContext context) {
        this.context = context;
    }

    /**
     * 打开钱箱
     */
    public void open(Promise promise) {
        try {
            IminSDKManager.opencashBox(context);
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Failed to open cash box", e);
            promise.reject("OPEN_ERROR", e.getMessage());
        }
    }

    /**
     * 获取钱箱状态
     */
    public void getStatus(Promise promise) {
        try {
            boolean isOpen = IminSDKManager.isCashBoxOpen(context);
            promise.resolve(isOpen);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get cash box status", e);
            promise.reject("STATUS_ERROR", e.getMessage());
        }
    }

    /**
     * 设置钱箱电压
     * @param voltage "1" = 9V, "2" = 12V, "3" = 24V
     */
    public void setVoltage(String voltage, Promise promise) {
        try {
            boolean result = IminSDKManager.setCashBoxKeyValue(context, voltage);
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Failed to set cash box voltage", e);
            promise.reject("VOLTAGE_ERROR", e.getMessage());
        }
    }
}
