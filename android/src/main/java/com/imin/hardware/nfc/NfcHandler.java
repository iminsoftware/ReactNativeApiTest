package com.imin.hardware.nfc;

import android.app.Activity;
import android.app.Application;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.nfc.NdefMessage;
import android.nfc.NfcAdapter;
import android.nfc.Tag;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * NFC Handler for iMin devices
 * 
 * Based on FlutterApiTest NfcHandler.kt implementation
 * Uses Android native NFC API
 */
public class NfcHandler implements Application.ActivityLifecycleCallbacks {
    private static final String TAG = "NfcHandler";
    private static final String EVENT_NFC_TAG = "nfc_tag_detected";

    private final ReactApplicationContext reactContext;
    private Activity activity;
    private NfcAdapter nfcAdapter;
    private PendingIntent pendingIntent;
    private IntentFilter[] intentFilters;
    private String[][] techLists;
    private boolean isListening = false;
    private boolean isInitialized = false;

    public NfcHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
        Log.d(TAG, "NfcHandler created, will init on first use");
    }

    private void ensureInit() {
        if (isInitialized) return;
        
        Activity currentActivity = reactContext.getCurrentActivity();
        if (currentActivity == null) {
            Log.w(TAG, "Activity still null, cannot init NFC");
            return;
        }
        
        this.activity = currentActivity;
        initNfc();
        activity.getApplication().registerActivityLifecycleCallbacks(this);
        isInitialized = true;
        Log.d(TAG, "NfcHandler initialized");
        
        // Activity 可能已经 resumed，手动触发一次 foreground dispatch
        if (isListening) {
            enableForegroundDispatch();
        }
    }

    private void initNfc() {
        try {
            // Get NFC adapter
            nfcAdapter = NfcAdapter.getDefaultAdapter(reactContext);
            
            if (nfcAdapter == null) {
                Log.w(TAG, "NFC not available on this device");
                return;
            }

            // Create pending intent (same as Flutter implementation)
            Intent intent = new Intent(activity, activity.getClass());
            intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                pendingIntent = PendingIntent.getActivity(
                    activity,
                    0,
                    intent,
                    PendingIntent.FLAG_MUTABLE
                );
            } else {
                pendingIntent = PendingIntent.getActivity(activity, 0, intent, 0);
            }

            // Create intent filters - include TECH_DISCOVERED for non-NDEF cards
            IntentFilter ndefFilter = new IntentFilter(NfcAdapter.ACTION_NDEF_DISCOVERED);
            try {
                ndefFilter.addDataType("*/*");
            } catch (Exception e) {
                Log.e(TAG, "Error adding data type", e);
            }
            IntentFilter techFilter = new IntentFilter(NfcAdapter.ACTION_TECH_DISCOVERED);
            IntentFilter tagFilter = new IntentFilter(NfcAdapter.ACTION_TAG_DISCOVERED);
            intentFilters = new IntentFilter[]{ndefFilter, techFilter, tagFilter};

            // Tech lists for TECH_DISCOVERED - covers all common NFC card types
            techLists = new String[][]{
                new String[]{"android.nfc.tech.NfcA"},
                new String[]{"android.nfc.tech.NfcB"},
                new String[]{"android.nfc.tech.NfcF"},
                new String[]{"android.nfc.tech.NfcV"},
                new String[]{"android.nfc.tech.IsoDep"},
                new String[]{"android.nfc.tech.MifareClassic"},
                new String[]{"android.nfc.tech.MifareUltralight"},
                new String[]{"android.nfc.tech.Ndef"},
                new String[]{"android.nfc.tech.NdefFormatable"},
            };

            Log.d(TAG, "NFC initialized successfully");
        } catch (Exception e) {
            Log.e(TAG, "Error initializing NFC", e);
        }
    }

    /**
     * Check if NFC is available on device
     */
    public void isAvailable(Promise promise) {
        try {
            ensureInit();
            boolean isAvailable = nfcAdapter != null;
            Log.d(TAG, "NFC available: " + isAvailable);
            promise.resolve(isAvailable);
        } catch (Exception e) {
            Log.e(TAG, "Error checking NFC availability", e);
            promise.reject("CHECK_FAILED", e.getMessage());
        }
    }

    /**
     * Check if NFC is enabled
     */
    public void isEnabled(Promise promise) {
        try {
            ensureInit();
            boolean isEnabled = nfcAdapter != null && nfcAdapter.isEnabled();
            Log.d(TAG, "NFC enabled: " + isEnabled);
            promise.resolve(isEnabled);
        } catch (Exception e) {
            Log.e(TAG, "Error checking NFC status", e);
            promise.reject("CHECK_FAILED", e.getMessage());
        }
    }

    /**
     * Open NFC settings
     */
    public void openSettings(Promise promise) {
        try {
            ensureInit();
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity is null");
                return;
            }
            Intent intent = new Intent(Settings.ACTION_NFC_SETTINGS);
            activity.startActivity(intent);
            Log.d(TAG, "Opened NFC settings");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error opening NFC settings", e);
            promise.reject("OPEN_SETTINGS_FAILED", e.getMessage());
        }
    }

    /**
     * Start listening for NFC tags
     */
    public void startListening(Promise promise) {
        try {
            ensureInit();
            if (nfcAdapter == null) {
                promise.reject("NFC_NOT_AVAILABLE", "NFC not available on this device");
                return;
            }
            
            if (activity == null) {
                promise.reject("NO_ACTIVITY", "Activity not available, please try again");
                return;
            }

            isListening = true;
            enableForegroundDispatch();
            Log.d(TAG, "Started listening for NFC tags");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error starting NFC listening", e);
            promise.reject("START_FAILED", e.getMessage());
        }
    }

    /**
     * Stop listening for NFC tags
     */
    public void stopListening(Promise promise) {
        try {
            isListening = false;
            disableForegroundDispatch();
            Log.d(TAG, "Stopped listening for NFC tags");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error stopping NFC listening", e);
            promise.reject("STOP_FAILED", e.getMessage());
        }
    }

    /**
     * Handle new NFC intent
     * This should be called from MainActivity's onNewIntent
     */
    public void handleNewIntent(Intent intent) {
        if (!isListening) {
            Log.d(TAG, "Not listening, ignoring NFC intent");
            return;
        }

        String action = intent.getAction();
        Log.d(TAG, "Received NFC intent: " + action);

        if (NfcAdapter.ACTION_TAG_DISCOVERED.equals(action) || 
            NfcAdapter.ACTION_NDEF_DISCOVERED.equals(action) ||
            NfcAdapter.ACTION_TECH_DISCOVERED.equals(action)) {
            try {
                // Read NFC data (same as Flutter implementation)
                String nfcId = readNFCId(intent);
                String content = readNFCFromTag(intent);
                
                Log.d(TAG, "NFC ID: " + nfcId + ", Content: " + content);
                
                if (!nfcId.isEmpty()) {
                    Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
                    String[] techList = tag != null ? tag.getTechList() : new String[0];
                    
                    WritableMap nfcData = Arguments.createMap();
                    nfcData.putString("id", nfcId);
                    nfcData.putString("content", content);
                    nfcData.putString("technology", String.join(", ", techList));
                    nfcData.putString("tagType", getTagType(techList));
                    nfcData.putDouble("timestamp", System.currentTimeMillis());
                    
                    // Send to React Native via event
                    sendEvent(EVENT_NFC_TAG, nfcData);
                }
            } catch (Exception e) {
                Log.e(TAG, "Error reading NFC data", e);
                WritableMap error = Arguments.createMap();
                error.putString("error", e.getMessage());
                sendEvent(EVENT_NFC_TAG, error);
            }
        }
    }

    /**
     * Read NFC ID (same as Flutter implementation)
     */
    private String readNFCId(Intent intent) {
        Tag tag = intent.getParcelableExtra(NfcAdapter.EXTRA_TAG);
        if (tag == null) {
            return "";
        }
        return byteArrayToHexString(tag.getId());
    }

    /**
     * Read NFC content (same as Flutter implementation)
     */
    private String readNFCFromTag(Intent intent) {
        try {
            android.os.Parcelable[] rawArray = intent.getParcelableArrayExtra(NfcAdapter.EXTRA_NDEF_MESSAGES);
            if (rawArray != null && rawArray.length > 0) {
                NdefMessage ndefMsg = (NdefMessage) rawArray[0];
                if (ndefMsg.getRecords().length > 0) {
                    byte[] payload = ndefMsg.getRecords()[0].getPayload();
                    return new String(payload, java.nio.charset.StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            Log.w(TAG, "Error reading NFC content", e);
        }
        return "";
    }

    /**
     * Get human-readable tag type from tech list
     */
    private String getTagType(String[] techList) {
        if (techList == null) return "";
        for (String tech : techList) {
            if (tech.contains("NfcA")) return "ISO 14443-3A";
            if (tech.contains("NfcB")) return "ISO 14443-3B";
            if (tech.contains("NfcF")) return "JIS 6319-4 (FeliCa)";
            if (tech.contains("NfcV")) return "ISO 15693";
            if (tech.contains("IsoDep")) return "ISO 14443-4";
            if (tech.contains("MifareClassic")) return "MIFARE Classic";
            if (tech.contains("MifareUltralight")) return "MIFARE Ultralight";
        }
        return "";
    }

    /**
     * Convert byte array to hex string (same as Flutter implementation)
     */
    private String byteArrayToHexString(byte[] inarray) {
        String[] hex = {"0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"};
        StringBuilder out = new StringBuilder();
        
        for (byte b : inarray) {
            int value = b & 0xff;
            int i = (value >> 4) & 0x0f;
            out.append(hex[i]);
            int j = value & 0x0f;
            out.append(hex[j]);
        }
        
        return out.toString();
    }

    /**
     * Enable foreground dispatch (called in Activity's onResume)
     */
    private void enableForegroundDispatch() {
        try {
            if (nfcAdapter != null && activity != null && isListening) {
                // 每次都重新创建 pendingIntent，因为 activity 可能变了
                Intent intent = new Intent(activity, activity.getClass());
                intent.addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
                PendingIntent pi;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    pi = PendingIntent.getActivity(activity, 0, intent, PendingIntent.FLAG_MUTABLE);
                } else {
                    pi = PendingIntent.getActivity(activity, 0, intent, 0);
                }
                this.pendingIntent = pi;
                
                nfcAdapter.enableForegroundDispatch(activity, pendingIntent, intentFilters, techLists);
                Log.d(TAG, "NFC foreground dispatch enabled");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error enabling foreground dispatch", e);
        }
    }

    /**
     * Disable foreground dispatch (called in Activity's onPause)
     */
    private void disableForegroundDispatch() {
        try {
            if (nfcAdapter != null) {
                nfcAdapter.disableForegroundDispatch(activity);
                Log.d(TAG, "NFC foreground dispatch disabled");
            }
        } catch (Exception e) {
            Log.e(TAG, "Error disabling foreground dispatch", e);
        }
    }

    /**
     * Send event to React Native
     */
    private void sendEvent(String eventName, WritableMap data) {
        try {
            Log.d(TAG, "sendEvent: " + eventName);
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, data);
            Log.d(TAG, "sendEvent success: " + eventName);
        } catch (Exception e) {
            Log.e(TAG, "sendEvent failed: " + eventName, e);
        }
    }

    // ActivityLifecycleCallbacks implementation
    @Override
    public void onActivityResumed(Activity activity) {
        this.activity = activity;
        if (isListening) {
            enableForegroundDispatch();
        }
    }

    @Override
    public void onActivityPaused(Activity activity) {
        if (activity == this.activity) {
            disableForegroundDispatch();
        }
    }

    @Override
    public void onActivityCreated(Activity activity, Bundle savedInstanceState) {}

    @Override
    public void onActivityStarted(Activity activity) {}

    @Override
    public void onActivityStopped(Activity activity) {}

    @Override
    public void onActivitySaveInstanceState(Activity activity, Bundle outState) {}

    @Override
    public void onActivityDestroyed(Activity activity) {}

    /**
     * Cleanup resources
     */
    public void cleanup() {
        try {
            disableForegroundDispatch();
            if (activity != null) {
                activity.getApplication().unregisterActivityLifecycleCallbacks(this);
            }
            isListening = false;
            Log.d(TAG, "NfcHandler cleanup completed");
        } catch (Exception e) {
            Log.e(TAG, "Error during cleanup", e);
        }
    }
}
