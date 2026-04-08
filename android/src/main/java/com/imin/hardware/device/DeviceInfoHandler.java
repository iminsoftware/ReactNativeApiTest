package com.imin.hardware.device;

import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.imin.library.SystemPropManager;

import java.lang.reflect.Method;

/**
 * Device 模块 - 设备信息处理
 */
public class DeviceInfoHandler {
    private static final String TAG = "DeviceInfoHandler";
    
    private final ReactApplicationContext context;

    public DeviceInfoHandler(ReactApplicationContext context) {
        this.context = context;
    }

    /**
     * 获取设备型号（使用 iMin SDK）
     */
    public void getModel(Promise promise) {
        try {
            String model = SystemPropManager.getModel();
            if (model == null || model.isEmpty()) {
                model = getSystemProperty("ro.product.model", Build.MODEL);
            }
            promise.resolve(model);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get model", e);
            promise.reject("GET_MODEL_ERROR", e.getMessage());
        }
    }

    /**
     * 获取设备序列号（使用 iMin SDK）
     */
    public void getSerialNumber(Promise promise) {
        try {
            String serialNumber = SystemPropManager.getSn();
            if (serialNumber == null || serialNumber.isEmpty()) {
                // fallback: 尝试系统属性
                serialNumber = getSystemProperty("ro.serialno", "unknown");
            }
            promise.resolve(serialNumber);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get serial number", e);
            promise.reject("GET_SERIAL_ERROR", e.getMessage());
        }
    }

    /**
     * 获取 Android 版本
     */
    public void getAndroidVersion(Promise promise) {
        try {
            String version = Build.VERSION.RELEASE;
            promise.resolve(version);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get Android version", e);
            promise.reject("GET_VERSION_ERROR", e.getMessage());
        }
    }

    /**
     * 获取 SDK 版本
     */
    public void getSdkVersion(Promise promise) {
        try {
            int sdkInt = Build.VERSION.SDK_INT;
            promise.resolve(String.valueOf(sdkInt));
        } catch (Exception e) {
            Log.e(TAG, "Failed to get SDK version", e);
            promise.reject("GET_SDK_ERROR", e.getMessage());
        }
    }

    /**
     * 获取品牌（使用 iMin SDK）
     */
    public void getBrand(Promise promise) {
        try {
            String brand = SystemPropManager.getBrand();
            if (brand == null || brand.isEmpty()) {
                brand = Build.BRAND;
            }
            promise.resolve(brand);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get brand", e);
            promise.resolve("iMin");
        }
    }

    /**
     * 获取设备名称
     */
    public void getDeviceName(Promise promise) {
        try {
            String deviceName = getSystemProperty("persist.sys.device", "Unknown");
            promise.resolve(deviceName);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get device name", e);
            promise.resolve("Unknown");
        }
    }

    /**
     * 获取 Android 版本名称（如 "11", "13", "14"）
     */
    public void getAndroidVersionName(Promise promise) {
        try {
            String versionName = Build.VERSION.RELEASE;
            promise.resolve(versionName);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get Android version name", e);
            promise.resolve("Unknown");
        }
    }

    /**
     * 获取 iMin SDK 服务版本号
     */
    public void getServiceVersion(Promise promise) {
        try {
            // 尝试通过反射获取 SDK 版本
            String version = null;
            try {
                java.lang.reflect.Method method = SystemPropManager.class.getMethod("getServiceVersion");
                version = (String) method.invoke(null);
            } catch (NoSuchMethodException e) {
                // 方法不存在，尝试其他方式
            }
            if (version == null || version.isEmpty()) {
                try {
                    java.lang.reflect.Method method = SystemPropManager.class.getMethod("getVersion");
                    version = (String) method.invoke(null);
                } catch (NoSuchMethodException e) {
                    // 方法不存在
                }
            }
            promise.resolve(version != null && !version.isEmpty() ? version : "1.0.25");
        } catch (Exception e) {
            Log.e(TAG, "Failed to get service version", e);
            promise.resolve("1.0.25");
        }
    }

    /**
     * 通过反射获取系统属性
     */
    private String getSystemProperty(String key, String defaultValue) {
        try {
            Class<?> c = Class.forName("android.os.SystemProperties");
            Method get = c.getMethod("get", String.class, String.class);
            return (String) get.invoke(c, key, defaultValue);
        } catch (Exception e) {
            Log.e(TAG, "Failed to get system property: " + key, e);
            return defaultValue;
        }
    }
}
