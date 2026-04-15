package com.imin.hardware;

import android.content.Intent;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import com.imin.hardware.device.DeviceInfoHandler;
import com.imin.hardware.scanner.ScannerHandler;
import com.imin.hardware.cashbox.CashBoxHandler;
import com.imin.hardware.nfc.NfcHandler;
import com.imin.hardware.msr.MsrHandler;
import com.imin.hardware.light.LightHandler;
import com.imin.hardware.display.DisplayHandler;
import com.imin.hardware.segment.SegmentHandler;
import com.imin.hardware.serial.SerialHandler;
import com.imin.hardware.scale.ScaleHandler;
import com.imin.hardware.scale.ScaleNewHandler;
import com.imin.hardware.camera.CameraScanHandler;
import com.imin.hardware.floatingwindow.FloatingWindowHandler;
import com.imin.hardware.rfid.RfidHandler;

/**
 * iMin Hardware Module - 主模块（路由中心）
 */
public class IminHardwareModule extends ReactContextBaseJavaModule {
    private static final String TAG = "IminHardwareModule";
    
    private final ReactApplicationContext reactContext;
    
    // Handlers
    private DeviceInfoHandler deviceHandler;
    private ScannerHandler scannerHandler;
    private CashBoxHandler cashBoxHandler;
    private NfcHandler nfcHandler;
    private MsrHandler msrHandler;
    private LightHandler lightHandler;
    private DisplayHandler displayHandler;
    private SegmentHandler segmentHandler;
    private SerialHandler serialHandler;
    private ScaleHandler scaleHandler;
    private ScaleNewHandler scaleNewHandler;
    private CameraScanHandler cameraScanHandler;
    private FloatingWindowHandler floatingWindowHandler;
    private RfidHandler rfidHandler;

    public IminHardwareModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        
        // 初始化 Handlers（在后台线程，不阻塞启动）
        new Thread(() -> {
            this.deviceHandler = new DeviceInfoHandler(reactContext);
            this.scannerHandler = new ScannerHandler(reactContext, this);
            this.cashBoxHandler = new CashBoxHandler(reactContext);
            this.nfcHandler = new NfcHandler(reactContext);
            this.msrHandler = new MsrHandler(reactContext);
            this.lightHandler = new LightHandler(reactContext);
            this.displayHandler = new DisplayHandler(reactContext);
            this.segmentHandler = new SegmentHandler(reactContext);
            this.serialHandler = new SerialHandler(reactContext);
            this.scaleHandler = new ScaleHandler(reactContext);
            this.scaleNewHandler = new ScaleNewHandler(reactContext);
            this.cameraScanHandler = new CameraScanHandler(reactContext);
            this.floatingWindowHandler = new FloatingWindowHandler(reactContext);
            this.rfidHandler = new RfidHandler(reactContext);
        }).start();
    }

    @Override
    public String getName() {
        return "IminHardware";
    }

    // ==================== Device 模块 ====================
    
    @ReactMethod
    public void deviceGetModel(Promise promise) {
        deviceHandler.getModel(promise);
    }

    @ReactMethod
    public void deviceGetSerialNumber(Promise promise) {
        deviceHandler.getSerialNumber(promise);
    }

    @ReactMethod
    public void deviceGetAndroidVersion(Promise promise) {
        deviceHandler.getAndroidVersion(promise);
    }

    @ReactMethod
    public void deviceGetSdkVersion(Promise promise) {
        deviceHandler.getSdkVersion(promise);
    }

    @ReactMethod
    public void deviceGetBrand(Promise promise) {
        deviceHandler.getBrand(promise);
    }

    @ReactMethod
    public void deviceGetDeviceName(Promise promise) {
        deviceHandler.getDeviceName(promise);
    }

    @ReactMethod
    public void deviceGetAndroidVersionName(Promise promise) {
        deviceHandler.getAndroidVersionName(promise);
    }

    @ReactMethod
    public void deviceGetServiceVersion(Promise promise) {
        deviceHandler.getServiceVersion(promise);
    }

    // ==================== Scanner 模块 ====================
    
    @ReactMethod
    public void scannerConfigure(ReadableMap config, Promise promise) {
        scannerHandler.configure(config, promise);
    }

    @ReactMethod
    public void scannerStartListening(Promise promise) {
        scannerHandler.startListening(promise);
    }

    @ReactMethod
    public void scannerStopListening(Promise promise) {
        scannerHandler.stopListening(promise);
    }

    @ReactMethod
    public void scannerIsConnected(Promise promise) {
        scannerHandler.isConnected(promise);
    }

    // ==================== CashBox 模块 ====================
    
    @ReactMethod
    public void cashboxOpen(Promise promise) {
        cashBoxHandler.open(promise);
    }

    @ReactMethod
    public void cashboxGetStatus(Promise promise) {
        cashBoxHandler.getStatus(promise);
    }

    @ReactMethod
    public void cashboxSetVoltage(String voltage, Promise promise) {
        cashBoxHandler.setVoltage(voltage, promise);
    }

    // ==================== NFC 模块 ====================
    
    @ReactMethod
    public void nfcIsAvailable(Promise promise) {
        nfcHandler.isAvailable(promise);
    }

    @ReactMethod
    public void nfcIsEnabled(Promise promise) {
        nfcHandler.isEnabled(promise);
    }

    @ReactMethod
    public void nfcOpenSettings(Promise promise) {
        nfcHandler.openSettings(promise);
    }

    @ReactMethod
    public void nfcStartListening(Promise promise) {
        nfcHandler.startListening(promise);
    }

    @ReactMethod
    public void nfcStopListening(Promise promise) {
        nfcHandler.stopListening(promise);
    }

    // ==================== MSR 模块 ====================
    
    @ReactMethod
    public void msrIsAvailable(Promise promise) {
        msrHandler.isAvailable(promise);
    }

    // ==================== Light 模块 ====================
    
    @ReactMethod
    public void lightConnect(Promise promise) {
        lightHandler.connect(promise);
    }

    @ReactMethod
    public void lightTurnOnGreen(Promise promise) {
        lightHandler.turnOnGreen(promise);
    }

    @ReactMethod
    public void lightTurnOnRed(Promise promise) {
        lightHandler.turnOnRed(promise);
    }

    @ReactMethod
    public void lightTurnOff(Promise promise) {
        lightHandler.turnOff(promise);
    }

    @ReactMethod
    public void lightDisconnect(Promise promise) {
        lightHandler.disconnect(promise);
    }

    // ==================== Display 模块 ====================

    @ReactMethod
    public void displayIsAvailable(Promise promise) {
        displayHandler.isAvailable(promise);
    }

    @ReactMethod
    public void displayEnable(Promise promise) {
        displayHandler.enable(promise);
    }

    @ReactMethod
    public void displayDisable(Promise promise) {
        displayHandler.disable(promise);
    }

    @ReactMethod
    public void displayShowText(String text, Promise promise) {
        displayHandler.showText(text, promise);
    }

    @ReactMethod
    public void displayShowImage(String path, Promise promise) {
        displayHandler.showImage(path, promise);
    }

    @ReactMethod
    public void displayPlayVideo(String path, Promise promise) {
        displayHandler.playVideo(path, promise);
    }

    @ReactMethod
    public void displayClear(Promise promise) {
        displayHandler.clear(promise);
    }

    // ==================== Segment 模块 ====================

    @ReactMethod
    public void segmentFindDevice(Promise promise) {
        segmentHandler.findDevice(promise);
    }

    @ReactMethod
    public void segmentRequestPermission(Promise promise) {
        segmentHandler.requestPermission(promise);
    }

    @ReactMethod
    public void segmentConnect(Promise promise) {
        segmentHandler.connect(promise);
    }

    @ReactMethod
    public void segmentSendData(String data, String align, Promise promise) {
        segmentHandler.sendData(data, align, promise);
    }

    @ReactMethod
    public void segmentClear(Promise promise) {
        segmentHandler.clear(promise);
    }

    @ReactMethod
    public void segmentFull(Promise promise) {
        segmentHandler.full(promise);
    }

    @ReactMethod
    public void segmentDisconnect(Promise promise) {
        segmentHandler.disconnect(promise);
    }

    // ==================== Serial 模块 ====================

    @ReactMethod
    public void serialOpen(String path, int baudRate, Promise promise) {
        serialHandler.open(path, baudRate, promise);
    }

    @ReactMethod
    public void serialClose(Promise promise) {
        serialHandler.close(promise);
    }

    @ReactMethod
    public void serialWrite(String data, Promise promise) {
        serialHandler.write(data, promise);
    }

    @ReactMethod
    public void serialWriteString(String text, Promise promise) {
        serialHandler.writeString(text, promise);
    }

    @ReactMethod
    public void serialIsOpen(Promise promise) {
        serialHandler.isOpen(promise);
    }

    // ==================== Scale 模块 ====================

    @ReactMethod
    public void scaleConnect(String devicePath, Promise promise) {
        scaleHandler.connect(devicePath, promise);
    }

    @ReactMethod
    public void scaleDisconnect(Promise promise) {
        scaleHandler.disconnect(promise);
    }

    @ReactMethod
    public void scaleTare(Promise promise) {
        scaleHandler.tare(promise);
    }

    @ReactMethod
    public void scaleZero(Promise promise) {
        scaleHandler.zero(promise);
    }

    // ==================== ScaleNew 模块 (Android 13+) ====================

    @ReactMethod
    public void scaleNewConnectService(Promise promise) {
        scaleNewHandler.connectService(promise);
    }

    @ReactMethod
    public void scaleNewGetData(Promise promise) {
        scaleNewHandler.getData(promise);
    }

    @ReactMethod
    public void scaleNewCancelGetData(Promise promise) {
        scaleNewHandler.cancelGetData(promise);
    }

    @ReactMethod
    public void scaleNewGetServiceVersion(Promise promise) {
        scaleNewHandler.getServiceVersion(promise);
    }

    @ReactMethod
    public void scaleNewGetFirmwareVersion(Promise promise) {
        scaleNewHandler.getFirmwareVersion(promise);
    }

    @ReactMethod
    public void scaleNewZero(Promise promise) {
        scaleNewHandler.zero(promise);
    }

    @ReactMethod
    public void scaleNewTare(Promise promise) {
        scaleNewHandler.tare(promise);
    }

    @ReactMethod
    public void scaleNewDigitalTare(int weight, Promise promise) {
        scaleNewHandler.digitalTare(weight, promise);
    }

    @ReactMethod
    public void scaleNewSetUnitPrice(String price, Promise promise) {
        scaleNewHandler.setUnitPrice(price, promise);
    }

    @ReactMethod
    public void scaleNewGetUnitPrice(Promise promise) {
        scaleNewHandler.getUnitPrice(promise);
    }

    @ReactMethod
    public void scaleNewSetUnit(int unit, Promise promise) {
        scaleNewHandler.setUnit(unit, promise);
    }

    @ReactMethod
    public void scaleNewGetUnit(Promise promise) {
        scaleNewHandler.getUnit(promise);
    }

    @ReactMethod
    public void scaleNewReadAcceleData(Promise promise) {
        scaleNewHandler.readAcceleData(promise);
    }

    @ReactMethod
    public void scaleNewReadSealState(Promise promise) {
        scaleNewHandler.readSealState(promise);
    }

    @ReactMethod
    public void scaleNewGetCalStatus(Promise promise) {
        scaleNewHandler.getCalStatus(promise);
    }

    @ReactMethod
    public void scaleNewRestart(Promise promise) {
        scaleNewHandler.restart(promise);
    }

    @ReactMethod
    public void scaleNewGetCalInfo(Promise promise) {
        scaleNewHandler.getCalInfo(promise);
    }

    @ReactMethod
    public void scaleNewGetCityAccelerations(Promise promise) {
        scaleNewHandler.getCityAccelerations(promise);
    }

    @ReactMethod
    public void scaleNewSetGravityAcceleration(int index, Promise promise) {
        scaleNewHandler.setGravityAcceleration(index, promise);
    }

    // ==================== Camera 扫码模块 ====================

    @ReactMethod
    public void cameraScan(Promise promise) {
        cameraScanHandler.scan(promise);
    }

    @ReactMethod
    public void cameraScanWithOptions(ReadableMap options, Promise promise) {
        cameraScanHandler.scanWithOptions(options, promise);
    }

    // ==================== FloatingWindow 悬浮窗模块 ====================

    @ReactMethod
    public void floatingWindowHasPermission(Promise promise) {
        floatingWindowHandler.hasPermission(promise);
    }

    @ReactMethod
    public void floatingWindowRequestPermission(Promise promise) {
        floatingWindowHandler.requestPermission(promise);
    }

    @ReactMethod
    public void floatingWindowShow(Promise promise) {
        floatingWindowHandler.show(promise);
    }

    @ReactMethod
    public void floatingWindowHide(Promise promise) {
        floatingWindowHandler.hide(promise);
    }

    @ReactMethod
    public void floatingWindowIsShowing(Promise promise) {
        floatingWindowHandler.isShowing(promise);
    }

    @ReactMethod
    public void floatingWindowUpdateText(String text, Promise promise) {
        floatingWindowHandler.updateText(text, promise);
    }

    @ReactMethod
    public void floatingWindowSetPosition(int x, int y, Promise promise) {
        floatingWindowHandler.setPosition(x, y, promise);
    }

    // ==================== RFID 模块 ====================

    @ReactMethod
    public void rfidConnect(Promise promise) { rfidHandler.connect(promise); }

    @ReactMethod
    public void rfidDisconnect(Promise promise) { rfidHandler.disconnect(promise); }

    @ReactMethod
    public void rfidIsConnected(Promise promise) { rfidHandler.isConnected(promise); }

    @ReactMethod
    public void rfidStartReading(Promise promise) { rfidHandler.startReading(promise); }

    @ReactMethod
    public void rfidStopReading(Promise promise) { rfidHandler.stopReading(promise); }

    @ReactMethod
    public void rfidReadTag(ReadableMap params, Promise promise) { rfidHandler.readTag(params, promise); }

    @ReactMethod
    public void rfidClearTags(Promise promise) { rfidHandler.clearTags(promise); }

    @ReactMethod
    public void rfidWriteTag(ReadableMap params, Promise promise) { rfidHandler.writeTag(params, promise); }

    @ReactMethod
    public void rfidWriteEpc(ReadableMap params, Promise promise) { rfidHandler.writeEpc(params, promise); }

    @ReactMethod
    public void rfidLockTag(ReadableMap params, Promise promise) { rfidHandler.lockTag(params, promise); }

    @ReactMethod
    public void rfidKillTag(String password, Promise promise) { rfidHandler.killTag(password, promise); }

    @ReactMethod
    public void rfidSetPower(int readPower, int writePower, Promise promise) { rfidHandler.setPower(readPower, writePower, promise); }

    @ReactMethod
    public void rfidSetFilter(String epc, Promise promise) { rfidHandler.setFilter(epc, promise); }

    @ReactMethod
    public void rfidClearFilter(Promise promise) { rfidHandler.clearFilter(promise); }

    @ReactMethod
    public void rfidSetRssiFilter(boolean enabled, int level, Promise promise) { rfidHandler.setRssiFilter(enabled, level, promise); }

    @ReactMethod
    public void rfidSetGen2Q(int qValue, Promise promise) { rfidHandler.setGen2Q(qValue, promise); }

    @ReactMethod
    public void rfidSetSession(int session, Promise promise) { rfidHandler.setSession(session, promise); }

    @ReactMethod
    public void rfidSetTarget(int target, Promise promise) { rfidHandler.setTarget(target, promise); }

    @ReactMethod
    public void rfidSetRfMode(String rfMode, Promise promise) { rfidHandler.setRfMode(rfMode, promise); }

    @ReactMethod
    public void rfidGetBatteryLevel(Promise promise) { rfidHandler.getBatteryLevel(promise); }

    @ReactMethod
    public void rfidIsCharging(Promise promise) { rfidHandler.isCharging(promise); }

    // ==================== 事件支持 ====================

    private int listenerCount = 0;

    @ReactMethod
    public void addListener(String eventName) {
        listenerCount++;
    }

    @ReactMethod
    public void removeListeners(int count) {
        listenerCount -= count;
    }

    // ==================== 事件发送 ====================
    
    /**
     * 发送事件到 JavaScript
     */
    public void sendEvent(String eventName, WritableMap params) {
        try {
            android.util.Log.d("IminHardwareModule", "sendEvent: " + eventName);
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
            android.util.Log.d("IminHardwareModule", "sendEvent success: " + eventName);
        } catch (Exception e) {
            android.util.Log.e("IminHardwareModule", "sendEvent failed: " + e.getMessage());
        }
    }

    /**
     * 处理 Intent（用于 NFC 等）
     */
    public void handleIntent(Intent intent) {
        if (nfcHandler != null) {
            nfcHandler.handleNewIntent(intent);
        }
    }

    @Override
    public void invalidate() {
        // 清理资源
        if (scannerHandler != null) {
            scannerHandler.cleanup();
        }
        if (nfcHandler != null) {
            nfcHandler.cleanup();
        }
        if (msrHandler != null) {
            msrHandler.cleanup();
        }
        if (lightHandler != null) {
            lightHandler.cleanup();
        }
        if (displayHandler != null) {
            displayHandler.cleanup();
        }
        if (segmentHandler != null) {
            segmentHandler.cleanup();
        }
        if (serialHandler != null) {
            serialHandler.cleanup();
        }
        if (scaleHandler != null) {
            scaleHandler.cleanup();
        }
        if (scaleNewHandler != null) {
            scaleNewHandler.cleanup();
        }
        if (cameraScanHandler != null) {
            cameraScanHandler.cleanup();
        }
        if (floatingWindowHandler != null) {
            floatingWindowHandler.cleanup();
        }
        if (rfidHandler != null) {
            rfidHandler.cleanup();
        }
    }
}
