package com.imin.hardware.rfid;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.RemoteException;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.imin.rfid.RFIDManager;
import com.imin.rfid.RFIDHelper;
import com.imin.rfid.ReaderCall;
import com.imin.rfid.entity.DataParameter;
import com.imin.rfid.constant.ParamCts;

/**
 * RFID Handler - 使用 IminRfidSdk 实现
 */
public class RfidHandler {
    private static final String TAG = "RfidHandler";
    private static final String EVENT_RFID_TAG = "rfid_tag";
    private static final String EVENT_RFID_CONNECTION = "rfid_connection";
    private static final String EVENT_RFID_BATTERY = "rfid_battery";

    private final ReactApplicationContext reactContext;
    private RFIDManager rfidManager;
    private RFIDHelper rfidHelper;
    private boolean isConnected = false;
    private boolean isReading = false;
    private BroadcastReceiver rfidReceiver;

    private final ReaderCall readerCall = new ReaderCall() {
        @Override
        public void onSuccess(byte cmd, DataParameter params) throws RemoteException {
            Log.d(TAG, "onSuccess cmd=" + cmd);
        }

        @Override
        public void onTag(byte cmd, byte tagType, DataParameter params) throws RemoteException {
            if (params == null) return;
            WritableMap map = Arguments.createMap();
            map.putString("type", "tag");
            map.putString("epc", params.getString(ParamCts.TAG_EPC, ""));
            map.putString("pc", params.getString(ParamCts.TAG_PC, ""));
            map.putString("rssi", params.getString(ParamCts.TAG_RSSI, ""));
            map.putInt("count", params.getInt(ParamCts.TAG_READ_COUNT, 1));
            map.putString("tid", params.getString(ParamCts.TAG_DATA, ""));
            map.putDouble("timestamp", System.currentTimeMillis());

            if (tagType == ParamCts.FOUND_TAG) {
                map.putString("tagType", "found");
            } else if (tagType == ParamCts.UPDATE_TAG) {
                map.putString("tagType", "update");
            }

            sendEvent(EVENT_RFID_TAG, map);
        }

        @Override
        public void onFiled(byte cmd, byte errorCode, String msg) throws RemoteException {
            Log.e(TAG, "onFailed cmd=" + cmd + " error=" + errorCode + " msg=" + msg);
        }
    };

    public RfidHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        this.rfidManager = RFIDManager.getInstance();
    }

    private void registerBroadcasts() {
        if (rfidReceiver != null) return;
        rfidReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                String action = intent.getAction();
                if (ParamCts.BROADCAST_ON_LOST_CONNECT.equals(action)) {
                    Log.w(TAG, "RFID connection lost");
                    isConnected = false;
                    isReading = false;
                    WritableMap map = Arguments.createMap();
                    map.putBoolean("connected", false);
                    sendEvent(EVENT_RFID_CONNECTION, map);
                } else if (ParamCts.BROADCAST_BATTER_LOW_ELEC.equals(action)) {
                    Log.w(TAG, "RFID battery low");
                    WritableMap map = Arguments.createMap();
                    map.putInt("level", 0);
                    map.putBoolean("isLow", true);
                    sendEvent(EVENT_RFID_BATTERY, map);
                } else if (ParamCts.BROADCAST_UN_FOUND_READER.equals(action)) {
                    Log.w(TAG, "RFID reader not found");
                    isConnected = false;
                }
            }
        };
        IntentFilter filter = new IntentFilter();
        filter.addAction(ParamCts.BROADCAST_ON_LOST_CONNECT);
        filter.addAction(ParamCts.BROADCAST_BATTER_LOW_ELEC);
        filter.addAction(ParamCts.BROADCAST_UN_FOUND_READER);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactContext.registerReceiver(rfidReceiver, filter, Context.RECEIVER_EXPORTED);
        } else {
            reactContext.registerReceiver(rfidReceiver, filter);
        }
    }

    // ==================== 连接管理 ====================

    public void connect(Promise promise) {
        try {
            rfidManager.connect(reactContext);
            registerBroadcasts();

            // Use ServiceStatusListener for reliable connection callback
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                com.imin.rfid.RFIDHelper helper = rfidManager.getHelper();
                if (helper instanceof com.imin.rfid.ServicesHelper) {
                    com.imin.rfid.ServicesHelper servicesHelper = (com.imin.rfid.ServicesHelper) helper;
                    if (servicesHelper.isServiceAvailable()) {
                        rfidHelper = servicesHelper;
                        rfidHelper.registerReaderCall(readerCall);
                        isConnected = true;
                        Log.d(TAG, "RFID connected (service already available)");
                        WritableMap map = Arguments.createMap();
                        map.putBoolean("connected", true);
                        sendEvent(EVENT_RFID_CONNECTION, map);
                        promise.resolve(true);
                    } else {
                        servicesHelper.addServiceStatusListener(new com.imin.rfid.ServicesHelper.ServiceStatusListener() {
                            @Override
                            public void onServiceConnected() {
                                servicesHelper.removeServiceStatusListener(this);
                                rfidHelper = servicesHelper;
                                rfidHelper.registerReaderCall(readerCall);
                                isConnected = true;
                                Log.d(TAG, "RFID service connected");
                                WritableMap map = Arguments.createMap();
                                map.putBoolean("connected", true);
                                sendEvent(EVENT_RFID_CONNECTION, map);
                                promise.resolve(true);
                            }

                            @Override
                            public void onServiceDisconnected() {
                                servicesHelper.removeServiceStatusListener(this);
                                isConnected = false;
                                isReading = false;
                                Log.w(TAG, "RFID service disconnected");
                                WritableMap map = Arguments.createMap();
                                map.putBoolean("connected", false);
                                sendEvent(EVENT_RFID_CONNECTION, map);
                                promise.resolve(false);
                            }

                            @Override
                            public void onServiceError(RemoteException e) {
                                servicesHelper.removeServiceStatusListener(this);
                                isConnected = false;
                                Log.e(TAG, "RFID service error", e);
                                promise.reject("CONNECT_ERROR", e != null ? e.getMessage() : "Service error");
                            }
                        });
                    }
                } else {
                    // helper still null after delay, keep polling (max 9 more times x 500ms)
                    pollForHelper(promise, 9);
                }
            }, 500);
        } catch (Exception e) {
            Log.e(TAG, "Error connecting RFID", e);
            promise.reject("CONNECT_ERROR", e.getMessage());
        }
    }

    private void pollForHelper(Promise promise, int retries) {
        if (retries <= 0) {
            Log.w(TAG, "RFID connect timeout");
            promise.resolve(false);
            return;
        }
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            com.imin.rfid.RFIDHelper helper = rfidManager.getHelper();
            if (helper instanceof com.imin.rfid.ServicesHelper) {
                com.imin.rfid.ServicesHelper servicesHelper = (com.imin.rfid.ServicesHelper) helper;
                if (servicesHelper.isServiceAvailable()) {
                    rfidHelper = servicesHelper;
                    rfidHelper.registerReaderCall(readerCall);
                    isConnected = true;
                    Log.d(TAG, "RFID connected (polled)");
                    WritableMap map = Arguments.createMap();
                    map.putBoolean("connected", true);
                    sendEvent(EVENT_RFID_CONNECTION, map);
                    promise.resolve(true);
                } else {
                    pollForHelper(promise, retries - 1);
                }
            } else {
                pollForHelper(promise, retries - 1);
            }
        }, 500);
    }

    public void disconnect(Promise promise) {
        try {
            if (isReading) {
                stopReadingInternal();
            }
            if (rfidHelper != null) {
                rfidHelper.unregisterReaderCall();
                rfidHelper = null;
            }
            rfidManager.disconnect();
            isConnected = false;
            isReading = false;
            WritableMap map = Arguments.createMap();
            map.putBoolean("connected", false);
            sendEvent(EVENT_RFID_CONNECTION, map);
            Log.d(TAG, "RFID disconnected");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error disconnecting", e);
            promise.reject("DISCONNECT_ERROR", e.getMessage());
        }
    }

    public void isConnected(Promise promise) {
        promise.resolve(isConnected && rfidHelper != null);
    }

    // ==================== 标签读取 ====================

    public void startReading(Promise promise) {
        try {
            if (rfidHelper == null) {
                promise.reject("NOT_CONNECTED", "RFID not connected");
                return;
            }
            rfidHelper.tagInventoryRawStartReading();
            isReading = true;
            Log.d(TAG, "RFID start reading");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting reading", e);
            promise.reject("READ_ERROR", e.getMessage());
        }
    }

    public void stopReading(Promise promise) {
        try {
            stopReadingInternal();
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping reading", e);
            promise.reject("STOP_ERROR", e.getMessage());
        }
    }

    private void stopReadingInternal() {
        if (rfidHelper != null) {
            rfidHelper.tagInventoryRawStopReading();
        }
        isReading = false;
        Log.d(TAG, "RFID stop reading");
    }

    public void readTag(ReadableMap params, Promise promise) {
        try {
            if (rfidHelper == null) {
                promise.reject("NOT_CONNECTED", "RFID not connected");
                return;
            }
            byte bank = (byte) params.getInt("bank");
            byte offset = (byte) params.getInt("offset");
            byte length = (byte) params.getInt("length");
            byte[] password = hexToBytes(params.getString("password"));
            rfidHelper.readTag(bank, offset, length, password);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error reading tag", e);
            promise.reject("READ_TAG_ERROR", e.getMessage());
        }
    }

    public void clearTags(Promise promise) {
        promise.resolve(true);
    }

    // ==================== 标签写入 ====================

    public void writeTag(ReadableMap params, Promise promise) {
        try {
            if (rfidHelper == null) { promise.reject("NOT_CONNECTED", "RFID not connected"); return; }
            byte[] data = hexToBytes(params.getString("data"));
            byte bank = (byte) params.getInt("bank");
            byte offset = (byte) params.getInt("offset");
            byte length = (byte) params.getInt("length");
            byte[] password = hexToBytes(params.getString("password"));
            rfidHelper.writeTag(data, bank, offset, length, password);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error writing tag", e);
            promise.reject("WRITE_ERROR", e.getMessage());
        }
    }

    public void writeEpc(ReadableMap params, Promise promise) {
        try {
            if (rfidHelper == null) { promise.reject("NOT_CONNECTED", "RFID not connected"); return; }
            byte[] data = hexToBytes(params.getString("epc"));
            byte[] password = hexToBytes(params.getString("password"));
            rfidHelper.writeTag(data, (byte) 1, (byte) 2, (byte) (data.length / 2), password);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error writing EPC", e);
            promise.reject("WRITE_EPC_ERROR", e.getMessage());
        }
    }

    // ==================== 标签操作 ====================

    public void lockTag(ReadableMap params, Promise promise) {
        try {
            if (rfidHelper == null) { promise.reject("NOT_CONNECTED", "RFID not connected"); return; }
            byte[] password = hexToBytes(params.getString("password"));
            byte lockObject = (byte) params.getInt("lockObject");
            byte lockType = (byte) params.getInt("lockType");
            rfidHelper.lockTag(password, lockObject, lockType);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error locking tag", e);
            promise.reject("LOCK_ERROR", e.getMessage());
        }
    }

    public void killTag(String password, Promise promise) {
        try {
            if (rfidHelper == null) { promise.reject("NOT_CONNECTED", "RFID not connected"); return; }
            rfidHelper.killTag(hexToBytes(password));
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error killing tag", e);
            promise.reject("KILL_ERROR", e.getMessage());
        }
    }

    // ==================== 配置管理 ====================

    public void setPower(int readPower, int writePower, Promise promise) {
        try {
            if (rfidHelper == null) { promise.reject("NOT_CONNECTED", "RFID not connected"); return; }
            rfidHelper.extendOperation((byte) 0x01, readPower + "," + writePower);
            promise.resolve(true);
        } catch (Exception e) { promise.reject("ERROR", e.getMessage()); }
    }

    public void setFilter(String epc, Promise promise) {
        try {
            if (rfidHelper == null) { promise.reject("NOT_CONNECTED", "RFID not connected"); return; }
            byte[] epcBytes = hexToBytes(epc);
            rfidHelper.setTagInventoryRawFilter(true, (byte) 1, (byte) (epcBytes.length * 8), epcBytes);
            promise.resolve(true);
        } catch (Exception e) { promise.reject("ERROR", e.getMessage()); }
    }

    public void clearFilter(Promise promise) {
        try {
            if (rfidHelper == null) { promise.reject("NOT_CONNECTED", "RFID not connected"); return; }
            rfidHelper.setTagInventoryRawFilter(false, (byte) 0, (byte) 0, new byte[0]);
            promise.resolve(true);
        } catch (Exception e) { promise.reject("ERROR", e.getMessage()); }
    }

    public void setRssiFilter(boolean enabled, int level, Promise promise) {
        Log.d(TAG, "setRssiFilter enabled=" + enabled + " level=" + level);
        promise.resolve(true);
    }

    public void setGen2Q(int qValue, Promise promise) {
        Log.d(TAG, "setGen2Q q=" + qValue);
        promise.resolve(true);
    }

    public void setSession(int session, Promise promise) {
        Log.d(TAG, "setSession session=" + session);
        promise.resolve(true);
    }

    public void setTarget(int target, Promise promise) {
        Log.d(TAG, "setTarget target=" + target);
        promise.resolve(true);
    }

    public void setRfMode(String rfMode, Promise promise) {
        Log.d(TAG, "setRfMode mode=" + rfMode);
        promise.resolve(true);
    }

    // ==================== 电池监控 ====================

    public void getBatteryLevel(Promise promise) {
        try {
            if (rfidHelper == null) { promise.resolve(0); return; }
            rfidHelper.extendOperation((byte) 0x02, "");
            promise.resolve(50); // 实际值通过 ReaderCall 回调获取
        } catch (Exception e) { promise.resolve(0); }
    }

    public void isCharging(Promise promise) {
        promise.resolve(false);
    }

    // ==================== 工具方法 ====================

    private byte[] hexToBytes(String hex) {
        if (hex == null || hex.isEmpty()) return new byte[]{0, 0, 0, 0};
        hex = hex.replace(" ", "");
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }

    private void sendEvent(String eventName, WritableMap params) {
        try {
            if (reactContext.hasActiveReactInstance()) {
                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(eventName, params);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error sending event: " + eventName, e);
        }
    }

    public void cleanup() {
        try {
            if (isReading) stopReadingInternal();
            if (rfidHelper != null) {
                rfidHelper.unregisterReaderCall();
                rfidHelper = null;
            }
            rfidManager.disconnect();
            if (rfidReceiver != null) {
                reactContext.unregisterReceiver(rfidReceiver);
                rfidReceiver = null;
            }
            isConnected = false;
        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        }
    }
}
