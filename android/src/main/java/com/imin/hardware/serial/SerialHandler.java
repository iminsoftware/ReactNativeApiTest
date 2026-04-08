package com.imin.hardware.serial;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.neostra.serialport.SerialPort;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Serial 模块 - 串口通信
 * 参考 FlutterApiTest SerialHandler.kt
 */
public class SerialHandler {
    private static final String TAG = "SerialHandler";
    private static final String EVENT_SERIAL_DATA = "serial_data";
    private static final int BUFFER_SIZE = 512;

    static {
        try {
            SerialPort.setSuPath("");
        } catch (Exception e) {
            Log.w(TAG, "Failed to set su path", e);
        }
    }

    private final ReactApplicationContext reactContext;
    private SerialPort serialPort;
    private InputStream inputStream;
    private OutputStream outputStream;
    private Thread readThread;
    private volatile boolean isReading = false;

    public SerialHandler(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    /**
     * 打开串口
     * @param path 串口路径，如 "/dev/ttyS4"
     * @param baudRate 波特率，默认 115200
     */
    public void open(String path, int baudRate, Promise promise) {
        try {
            if (path == null || path.isEmpty()) {
                promise.reject("INVALID_ARGUMENT", "Serial port path is required");
                return;
            }

            // 关闭已有连接
            if (serialPort != null) {
                closeInternal();
            }

            File file = new File(path);
            serialPort = new SerialPort(file, baudRate, 0);
            inputStream = serialPort.getInputStream();
            outputStream = serialPort.getOutputStream();

            if (inputStream == null || outputStream == null) {
                promise.reject("OPEN_FAILED", "Failed to get input/output streams");
                return;
            }

            startReading();
            Log.d(TAG, "Serial port opened: " + path + " @ " + baudRate);
            promise.resolve(true);
        } catch (SecurityException e) {
            Log.e(TAG, "Security exception opening serial port", e);
            promise.reject("SECURITY_ERROR", "Permission denied: " + e.getMessage());
        } catch (IOException e) {
            Log.e(TAG, "IO exception opening serial port", e);
            promise.reject("IO_ERROR", "Failed to open port: " + e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Error opening serial port", e);
            promise.reject("OPEN_FAILED", e.getMessage());
        }
    }

    /**
     * 关闭串口
     */
    public void close(Promise promise) {
        try {
            closeInternal();
            Log.d(TAG, "Serial port closed");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error closing serial port", e);
            promise.reject("CLOSE_FAILED", e.getMessage());
        }
    }

    /**
     * 写入数据
     * @param data 要写入的字节数据（以逗号分隔的整数字符串，如 "72,101,108,108,111"）
     */
    public void write(String data, Promise promise) {
        try {
            if (data == null || data.isEmpty()) {
                promise.reject("INVALID_ARGUMENT", "Data is required");
                return;
            }
            if (outputStream == null) {
                promise.reject("NOT_OPEN", "Serial port is not open");
                return;
            }

            // 解析逗号分隔的字节数据
            String[] parts = data.split(",");
            byte[] bytes = new byte[parts.length];
            for (int i = 0; i < parts.length; i++) {
                bytes[i] = (byte) Integer.parseInt(parts[i].trim());
            }

            outputStream.write(bytes);
            outputStream.flush();
            Log.d(TAG, "Wrote " + bytes.length + " bytes to serial port");
            promise.resolve(true);
        } catch (IOException e) {
            Log.e(TAG, "IO exception writing to serial port", e);
            promise.reject("WRITE_FAILED", e.getMessage());
        } catch (Exception e) {
            Log.e(TAG, "Error writing to serial port", e);
            promise.reject("WRITE_FAILED", e.getMessage());
        }
    }

    /**
     * 写入字符串
     */
    public void writeString(String text, Promise promise) {
        try {
            if (text == null) {
                promise.reject("INVALID_ARGUMENT", "Text is required");
                return;
            }
            if (outputStream == null) {
                promise.reject("NOT_OPEN", "Serial port is not open");
                return;
            }

            byte[] bytes = text.getBytes();
            outputStream.write(bytes);
            outputStream.flush();
            Log.d(TAG, "Wrote string (" + bytes.length + " bytes) to serial port");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error writing string to serial port", e);
            promise.reject("WRITE_FAILED", e.getMessage());
        }
    }

    /**
     * 检查串口是否打开
     */
    public void isOpen(Promise promise) {
        boolean open = serialPort != null && inputStream != null && outputStream != null;
        promise.resolve(open);
    }

    private void startReading() {
        if (readThread != null && isReading) return;

        isReading = true;
        readThread = new Thread(() -> {
            byte[] buffer = new byte[BUFFER_SIZE];
            while (isReading && !Thread.currentThread().isInterrupted()) {
                try {
                    Thread.sleep(50);
                    if (inputStream == null) break;

                    if (inputStream.available() > 0) {
                        int size = inputStream.read(buffer);
                        if (size > 0) {
                            WritableMap event = Arguments.createMap();
                            event.putString("event", "data");
                            WritableArray dataArray = Arguments.createArray();
                            for (int i = 0; i < size; i++) {
                                dataArray.pushInt(buffer[i] & 0xFF);
                            }
                            event.putArray("data", dataArray);
                            event.putDouble("timestamp", System.currentTimeMillis());

                            reactContext
                                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                                .emit(EVENT_SERIAL_DATA, event);
                        }
                    } else {
                        Thread.sleep(1000);
                    }
                } catch (InterruptedException e) {
                    break;
                } catch (IOException e) {
                    Log.e(TAG, "IO exception reading from serial port", e);
                    break;
                } catch (Exception e) {
                    Log.e(TAG, "Error reading from serial port", e);
                    break;
                }
            }
        });
        readThread.start();
    }

    private void closeInternal() {
        isReading = false;
        if (readThread != null) {
            readThread.interrupt();
            readThread = null;
        }
        try { if (inputStream != null) inputStream.close(); } catch (Exception e) {}
        try { if (outputStream != null) outputStream.close(); } catch (Exception e) {}
        inputStream = null;
        outputStream = null;
        serialPort = null;
    }

    public void cleanup() {
        closeInternal();
    }
}
