package com.imin.hardware.segment;

import android.content.Context;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;
import android.text.TextUtils;
import android.util.Log;

import java.nio.ByteBuffer;

/**
 * USB 通信类 - 段码屏数据收发
 * 参考 FlutterApiTest UsbCommunication.kt
 */
public class UsbCommunication {
    private static final String TAG = "UsbCommunication";
    private static final byte HEADER_BYTE_1 = (byte) 0xFC;
    private static final byte HEADER_BYTE_2 = (byte) 0xFC;

    private final UsbManager usbManager;
    private UsbDevice usbDevice;
    private UsbDeviceConnection connection;
    private UsbEndpoint endpointOut;
    private UsbEndpoint endpointIn;
    private volatile boolean isNeedRead = false;

    public UsbCommunication(Context context) {
        this.usbManager = (UsbManager) context.getSystemService(Context.USB_SERVICE);
    }

    public boolean connectToDevice(UsbDevice device) {
        this.usbDevice = device;
        UsbInterface usbInterface = device.getInterface(0);

        connection = usbManager.openDevice(device);
        if (connection == null) {
            Log.e(TAG, "Failed to open device connection");
            return false;
        }

        connection.claimInterface(usbInterface, true);

        for (int i = 0; i < usbInterface.getEndpointCount(); i++) {
            UsbEndpoint endpoint = usbInterface.getEndpoint(i);
            if (endpoint.getDirection() == UsbConstants.USB_DIR_OUT) {
                endpointOut = endpoint;
            } else if (endpoint.getDirection() == UsbConstants.USB_DIR_IN) {
                endpointIn = endpoint;
            }
        }

        return endpointOut != null && endpointIn != null;
    }

    public boolean sendData(byte cmd, String data) {
        if (connection == null || endpointOut == null) {
            Log.e(TAG, "Connection or endpoint not available");
            return false;
        }

        byte[] dataBytes;
        int dataLength;

        if (TextUtils.isEmpty(data)) {
            dataLength = 2; // cmd + chk
            dataBytes = new byte[0];
        } else {
            String trimmed = data.length() > 9 ? data.substring(0, 9) : data;
            dataBytes = trimmed.getBytes();
            dataLength = 1 + dataBytes.length + 1; // cmd + data + chk
        }

        byte len = (byte) dataLength;

        ByteBuffer buffer = ByteBuffer.allocate(3 + dataLength);
        buffer.put(HEADER_BYTE_1);
        buffer.put(HEADER_BYTE_2);
        buffer.put(len);
        buffer.put(cmd);
        buffer.put(dataBytes);
        buffer.put(calculateChecksum(len, cmd, dataBytes));

        byte[] packet = buffer.array();
        int result = connection.bulkTransfer(endpointOut, packet, packet.length, 5000);
        return result == packet.length;
    }

    public byte[] receiveData() {
        if (connection == null || endpointIn == null) {
            return null;
        }

        byte[] buffer = new byte[64];
        int received = connection.bulkTransfer(endpointIn, buffer, buffer.length, 5000);

        if (received > 0) {
            byte[] result = new byte[received];
            System.arraycopy(buffer, 0, result, 0, received);
            return result;
        }
        return null;
    }

    private byte calculateChecksum(byte len, byte cmd, byte[] data) {
        int sum = (len & 0xFF) + (cmd & 0xFF);
        for (byte b : data) {
            sum += (b & 0xFF);
        }
        return (byte) (sum & 0xFF);
    }

    public boolean parseReceivedData(byte[] data) {
        if (data.length < 5) return false;
        if (data[0] != HEADER_BYTE_1 || data[1] != HEADER_BYTE_2) return false;

        byte len = data[2];
        if (data.length != 3 + (len & 0xFF)) return false;

        byte cmd = data[3];
        int dataLength = (len & 0xFF) - 2;
        byte[] receivedData = new byte[dataLength];
        System.arraycopy(data, 4, receivedData, 0, dataLength);

        byte receivedChecksum = data[data.length - 1];
        byte calculatedChecksum = calculateChecksum(len, cmd, receivedData);
        return receivedChecksum == calculatedChecksum;
    }

    public void startRead() {
        isNeedRead = true;
        new Thread(() -> {
            while (isNeedRead) {
                receiveData();
                try {
                    Thread.sleep(800);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }

    public void closeConnection() {
        isNeedRead = false;
        if (connection != null) {
            connection.close();
            connection = null;
        }
    }
}
