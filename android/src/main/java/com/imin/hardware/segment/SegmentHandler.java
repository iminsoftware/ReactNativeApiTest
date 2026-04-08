package com.imin.hardware.segment;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbManager;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;

/**
 * Segment 模块 - 段码屏控制
 * 参考 FlutterApiTest SegmentHandler.kt
 */
public class SegmentHandler {
    private static final String TAG = "SegmentHandler";
    private static final String ACTION_USB_PERMISSION = "com.imin.hardware.USB_PERMISSION_SEGMENT";

    // iMin 段码屏设备 PID/VID
    private static final int SEGMENT_PID = 8455;
    private static final int SEGMENT_VID = 16701;

    private final ReactApplicationContext reactContext;
    private UsbCommunication usbCommunication;
    private UsbDevice screenDevice;
    private Promise pendingPermissionPromise;
    private Promise pendingConnectPromise;
    private boolean isReceiverRegistered = false;

    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (ACTION_USB_PERMISSION.equals(intent.getAction())) {
                synchronized (this) {
                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        Log.d(TAG, "USB permission granted");
                        if (pendingConnectPromise != null) {
                            // Called from connect() - auto connect after permission
                            Promise p = pendingConnectPromise;
                            pendingConnectPromise = null;
                            doConnect(p);
                        } else if (pendingPermissionPromise != null) {
                            pendingPermissionPromise.resolve(true);
                            pendingPermissionPromise = null;
                        }
                    } else {
                        Log.d(TAG, "USB permission denied");
                        if (pendingConnectPromise != null) {
                            pendingConnectPromise.reject("PERMISSION_DENIED", "USB permission denied");
                            pendingConnectPromise = null;
                        } else if (pendingPermissionPromise != null) {
                            pendingPermissionPromise.reject("PERMISSION_DENIED", "USB permission denied");
                            pendingPermissionPromise = null;
                        }
                    }
                }
            }
        }
    };

    public SegmentHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        this.usbCommunication = new UsbCommunication(reactContext);
    }

    /**
     * 查找段码屏 USB 设备
     */
    public void findDevice(Promise promise) {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            UsbManager usbManager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);
            
            // 列出所有 USB 设备用于调试
            for (UsbDevice device : usbManager.getDeviceList().values()) {
                Log.d(TAG, "USB device found: PID=" + device.getProductId() + 
                    ", VID=" + device.getVendorId() + ", Name=" + device.getDeviceName() +
                    ", Product=" + device.getProductName());
            }
            
            for (UsbDevice device : usbManager.getDeviceList().values()) {
                if (device.getProductId() == SEGMENT_PID && device.getVendorId() == SEGMENT_VID) {
                    screenDevice = device;
                    Log.d(TAG, "Found segment device: PID=" + SEGMENT_PID + ", VID=" + SEGMENT_VID);
                    WritableMap result = Arguments.createMap();
                    result.putBoolean("found", true);
                    result.putInt("productId", device.getProductId());
                    result.putInt("vendorId", device.getVendorId());
                    result.putString("deviceName", device.getDeviceName());
                    promise.resolve(result);
                    return;
                }
            }

            WritableMap result = Arguments.createMap();
            result.putBoolean("found", false);
            promise.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error finding device", e);
            promise.reject("FIND_ERROR", e.getMessage());
        }
    }

    /**
     * 请求 USB 权限
     */
    public void requestPermission(Promise promise) {
        try {
            if (screenDevice == null) {
                promise.reject("NO_DEVICE", "No device found. Call findDevice first.");
                return;
            }

            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            UsbManager usbManager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);
            if (usbManager.hasPermission(screenDevice)) {
                promise.resolve(true);
                return;
            }

            // 注册广播接收器
            if (!isReceiverRegistered) {
                IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    activity.registerReceiver(usbReceiver, filter, Context.RECEIVER_EXPORTED);
                } else {
                    activity.registerReceiver(usbReceiver, filter);
                }
                isReceiverRegistered = true;
            }

            pendingPermissionPromise = promise;
            int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S
                    ? PendingIntent.FLAG_IMMUTABLE : 0;
            Intent permIntent = new Intent(ACTION_USB_PERMISSION);
            permIntent.setPackage(reactContext.getPackageName());
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    activity, 0, permIntent, flags);
            usbManager.requestPermission(screenDevice, pendingIntent);
        } catch (Exception e) {
            Log.e(TAG, "Error requesting permission", e);
            promise.reject("PERMISSION_ERROR", e.getMessage());
        }
    }

    /**
     * 连接段码屏设备（自动 findDevice + requestPermission + connect）
     */
    public void connect(Promise promise) {
        try {
            Activity activity = reactContext.getCurrentActivity();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            UsbManager usbManager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);

            // Auto find device if not already found
            if (screenDevice == null) {
                for (UsbDevice device : usbManager.getDeviceList().values()) {
                    if (device.getProductId() == SEGMENT_PID && device.getVendorId() == SEGMENT_VID) {
                        screenDevice = device;
                        Log.d(TAG, "Auto-found segment device");
                        break;
                    }
                }
            }

            if (screenDevice == null) {
                promise.reject("NO_DEVICE", "Segment device not found. Please check USB connection.");
                return;
            }

            // If already has permission, connect directly
            if (usbManager.hasPermission(screenDevice)) {
                doConnect(promise);
                return;
            }

            // Register receiver and request permission, then connect on grant
            if (!isReceiverRegistered) {
                IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    activity.registerReceiver(usbReceiver, filter, Context.RECEIVER_EXPORTED);
                } else {
                    activity.registerReceiver(usbReceiver, filter);
                }
                isReceiverRegistered = true;
            }

            // Store the connect promise - usbReceiver will call doConnect on grant
            pendingConnectPromise = promise;
            pendingPermissionPromise = null;

            int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? PendingIntent.FLAG_IMMUTABLE : 0;
            Intent permIntent = new Intent(ACTION_USB_PERMISSION);
            permIntent.setPackage(reactContext.getPackageName());
            PendingIntent pendingIntent = PendingIntent.getBroadcast(activity, 0, permIntent, flags);
            usbManager.requestPermission(screenDevice, pendingIntent);
        } catch (Exception e) {
            Log.e(TAG, "Error connecting", e);
            promise.reject("CONNECT_ERROR", e.getMessage());
        }
    }

    private void doConnect(Promise promise) {
        try {
            boolean connected = usbCommunication.connectToDevice(screenDevice);
            if (connected) {
                usbCommunication.startRead();
                Log.d(TAG, "Connected to segment device");
                promise.resolve(true);
            } else {
                promise.reject("CONNECT_FAILED", "Failed to connect to device");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error in doConnect", e);
            promise.reject("CONNECT_ERROR", e.getMessage());
        }
    }

    /**
     * 发送数据到段码屏
     * @param data 要显示的数据（最多9个字符）
     * @param align 对齐方式："left" 或 "right"
     */
    public void sendData(String data, String align, Promise promise) {
        try {
            byte cmd = "left".equals(align) ? (byte) 0x01 : (byte) 0x00;
            boolean success = usbCommunication.sendData(cmd, data);
            if (success) {
                byte[] received = usbCommunication.receiveData();
                if (received != null) {
                    usbCommunication.parseReceivedData(received);
                }
                Log.d(TAG, "Data sent: " + data + ", align: " + align);
                promise.resolve(true);
            } else {
                promise.reject("SEND_FAILED", "Failed to send data");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sending data", e);
            promise.reject("SEND_ERROR", e.getMessage());
        }
    }

    /**
     * 清屏
     */
    public void clear(Promise promise) {
        try {
            boolean success = usbCommunication.sendData((byte) 0x03, "");
            if (success) {
                usbCommunication.receiveData();
                Log.d(TAG, "Display cleared");
                promise.resolve(true);
            } else {
                promise.reject("CLEAR_FAILED", "Failed to clear display");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error clearing display", e);
            promise.reject("CLEAR_ERROR", e.getMessage());
        }
    }

    /**
     * 全亮（测试用）
     */
    public void full(Promise promise) {
        try {
            boolean success = usbCommunication.sendData((byte) 0x04, "");
            if (success) {
                usbCommunication.receiveData();
                Log.d(TAG, "Display set to full");
                promise.resolve(true);
            } else {
                promise.reject("FULL_FAILED", "Failed to set display to full");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error setting display to full", e);
            promise.reject("FULL_ERROR", e.getMessage());
        }
    }

    /**
     * 断开连接
     */
    public void disconnect(Promise promise) {
        try {
            usbCommunication.closeConnection();
            screenDevice = null;
            Log.d(TAG, "Disconnected from segment device");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error disconnecting", e);
            promise.reject("DISCONNECT_ERROR", e.getMessage());
        }
    }

    /**
     * 清理资源
     */
    public void cleanup() {
        try {
            if (isReceiverRegistered) {
                Activity activity = reactContext.getCurrentActivity();
                if (activity != null) {
                    activity.unregisterReceiver(usbReceiver);
                }
                isReceiverRegistered = false;
            }
        } catch (Exception e) {
            Log.e(TAG, "Error unregistering receiver", e);
        }
        if (usbCommunication != null) {
            usbCommunication.closeConnection();
        }
        screenDevice = null;
    }
}
