package com.imin.hardware.light;

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

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.imin.library.IminSDKManager;

/**
 * Light Handler for iMin devices
 * 
 * Based on FlutterApiTest LightHandler.kt implementation
 * Controls LED lights via USB connection
 */
public class LightHandler {
    private static final String TAG = "LightHandler";
    private static final String ACTION_USB_PERMISSION = "android.permission.USB_PERMISSION";
    private static final String ACTION_USB_DEVICE_ATTACHED = "android.hardware.usb.action.USB_DEVICE_ATTACHED";
    private static final String ACTION_USB_DEVICE_DETACHED = "android.hardware.usb.action.USB_DEVICE_DETACHED";

    private final ReactApplicationContext reactContext;
    private final Activity activity;
    private UsbManager usbManager;
    private UsbDevice usbDevice;
    private boolean isReceiverRegistered = false;
    private Promise pendingPermissionPromise;

    public LightHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        this.activity = reactContext.getCurrentActivity();
        
        if (activity != null) {
            this.usbManager = (UsbManager) activity.getSystemService(Context.USB_SERVICE);
            Log.d(TAG, "LightHandler initialized");
        } else {
            Log.w(TAG, "Activity is null, Light initialization delayed");
        }
    }

    /**
     * Connect to light device
     */
    public void connect(Promise promise) {
        try {
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            // Get light device
            usbDevice = IminSDKManager.getLightDevice(activity);
            
            if (usbDevice == null) {
                Log.w(TAG, "Light device not found");
                promise.resolve(false);
                return;
            }

            // Request permission and connect
            boolean hasPermission = requestPermission(usbDevice, promise);
            if (hasPermission) {
                boolean isConnected = IminSDKManager.connectLightDevice(activity);
                Log.d(TAG, "Light device connected: " + isConnected);
                promise.resolve(isConnected);
            }
            // If no permission, promise will be resolved in broadcast receiver
        } catch (Exception e) {
            Log.e(TAG, "Error connecting light device", e);
            promise.reject("CONNECT_FAILED", e.getMessage());
        }
    }

    /**
     * Turn on green light
     */
    public void turnOnGreen(Promise promise) {
        try {
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            IminSDKManager.turnOnGreenLight(activity);
            Log.d(TAG, "Green light turned on");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error turning on green light", e);
            promise.reject("GREEN_LIGHT_FAILED", e.getMessage());
        }
    }

    /**
     * Turn on red light
     */
    public void turnOnRed(Promise promise) {
        try {
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            IminSDKManager.turnOnRedLight(activity);
            Log.d(TAG, "Red light turned on");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error turning on red light", e);
            promise.reject("RED_LIGHT_FAILED", e.getMessage());
        }
    }

    /**
     * Turn off light
     */
    public void turnOff(Promise promise) {
        try {
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            IminSDKManager.turnOffLight(activity);
            Log.d(TAG, "Light turned off");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error turning off light", e);
            promise.reject("TURN_OFF_FAILED", e.getMessage());
        }
    }

    /**
     * Disconnect light device
     */
    public void disconnect(Promise promise) {
        try {
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }

            IminSDKManager.disconnectLightDevice(activity);
            Log.d(TAG, "Light device disconnected");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error disconnecting light device", e);
            promise.reject("DISCONNECT_FAILED", e.getMessage());
        }
    }

    /**
     * Request USB permission
     */
    private boolean requestPermission(UsbDevice device, Promise promise) {
        Log.d(TAG, "Requesting USB permission for light device");
        
        if (usbManager.hasPermission(device)) {
            Log.d(TAG, "USB permission already granted");
            return true;
        }

        // Register broadcast receiver
        if (!isReceiverRegistered) {
            IntentFilter intentFilter = new IntentFilter();
            intentFilter.addAction(ACTION_USB_PERMISSION);
            intentFilter.addAction(ACTION_USB_DEVICE_ATTACHED);
            intentFilter.addAction(ACTION_USB_DEVICE_DETACHED);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                activity.registerReceiver(usbDeviceReceiver, intentFilter, Context.RECEIVER_NOT_EXPORTED);
            } else {
                activity.registerReceiver(usbDeviceReceiver, intentFilter);
            }
            isReceiverRegistered = true;
            Log.d(TAG, "USB receiver registered");
        }

        // Store promise for later resolution
        pendingPermissionPromise = promise;

        // Request permission
        PendingIntent pendingIntent;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            pendingIntent = PendingIntent.getBroadcast(
                activity,
                0,
                new Intent(ACTION_USB_PERMISSION),
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
        } else {
            pendingIntent = PendingIntent.getBroadcast(activity, 0, new Intent(ACTION_USB_PERMISSION), 0);
        }

        usbManager.requestPermission(device, pendingIntent);
        return false;
    }

    /**
     * USB device broadcast receiver
     */
    private final BroadcastReceiver usbDeviceReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            Log.d(TAG, "USB broadcast received: " + action);

            if (ACTION_USB_PERMISSION.equals(action)) {
                UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                if (device != null && intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                    boolean isConnected = IminSDKManager.connectLightDevice(activity);
                    Log.d(TAG, "USB permission granted, connected: " + isConnected);
                    
                    if (pendingPermissionPromise != null) {
                        pendingPermissionPromise.resolve(isConnected);
                        pendingPermissionPromise = null;
                    }
                } else {
                    Log.d(TAG, "USB permission denied");
                    if (pendingPermissionPromise != null) {
                        pendingPermissionPromise.resolve(false);
                        pendingPermissionPromise = null;
                    }
                }
            } else if (ACTION_USB_DEVICE_ATTACHED.equals(action)) {
                Log.d(TAG, "USB device attached");
            } else if (ACTION_USB_DEVICE_DETACHED.equals(action)) {
                Log.d(TAG, "USB device detached");
            }
        }
    };

    /**
     * Cleanup resources
     */
    public void cleanup() {
        try {
            if (isReceiverRegistered && activity != null) {
                activity.unregisterReceiver(usbDeviceReceiver);
                isReceiverRegistered = false;
                Log.d(TAG, "USB receiver unregistered");
            }
            if (activity != null) {
                IminSDKManager.disconnectLightDevice(activity);
            }
            Log.d(TAG, "LightHandler cleanup completed");
        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        }
    }
}
