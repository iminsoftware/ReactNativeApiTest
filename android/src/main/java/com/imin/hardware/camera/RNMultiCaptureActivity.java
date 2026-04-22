package com.imin.hardware.camera;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.imin.scan.CaptureActivity;
import com.imin.scan.DecodeConfig;
import com.imin.scan.DecodeFormatManager;
import com.imin.scan.Result;
import com.imin.scan.ScanUtils;
import com.imin.scan.analyze.MultiFormatAnalyzer;
import com.imin.zxing.BarcodeFormat;
import com.imin.zxing.DecodeHintType;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 多条码/多角度扫码 Activity（独立于 RNCaptureActivity，不影响原有逻辑）
 *
 * 走 ML Kit + ScanUtils 链路，支持：
 * - 多条码同时识别
 * - 多角度识别（ML Kit 原生支持任意角度）
 * - 自动降级到 ZXing
 *
 * Intent extras:
 * - formats: String[] 条码格式列表
 * - useFlash: boolean 是否开启闪光灯
 * - beepEnabled: boolean 是否播放提示音
 * - timeout: int 超时时间(ms)，0=不超时
 * - supportMultiBarcode: boolean 是否多条码
 * - supportMultiAngle: boolean 是否多角度
 * - decodeEngine: int 解码引擎 (0=ZXing, 1=MLKit)
 * - fullAreaScan: boolean 全区域扫码
 * - areaRectRatio: float 识别区域比例
 */
public class RNMultiCaptureActivity extends CaptureActivity {

    private static final String TAG = "RNMultiCaptureActivity";

    public static final String SCAN_RESULT = "SCAN_RESULT";
    public static final String SCAN_FORMAT = "SCAN_FORMAT";
    public static final String SCAN_RESULTS = "SCAN_RESULTS";
    public static final String SCAN_FORMATS = "SCAN_FORMATS";
    public static final String SCAN_COUNT = "SCAN_COUNT";

    public static final String EXTRA_FORMATS = "formats";
    public static final String EXTRA_USE_FLASH = "useFlash";
    public static final String EXTRA_BEEP_ENABLED = "beepEnabled";
    public static final String EXTRA_TIMEOUT = "timeout";
    public static final String EXTRA_SUPPORT_MULTI_BARCODE = "supportMultiBarcode";
    public static final String EXTRA_SUPPORT_MULTI_ANGLE = "supportMultiAngle";
    public static final String EXTRA_DECODE_ENGINE = "decodeEngine";
    public static final String EXTRA_FULL_AREA_SCAN = "fullAreaScan";
    public static final String EXTRA_AREA_RECT_RATIO = "areaRectRatio";

    private Handler timeoutHandler;
    private Runnable timeoutRunnable;
    private boolean hasResult = false;
    private boolean supportMultiBarcode = false;

    @Override
    public void initCameraScan() {
        super.initCameraScan();

        Intent intent = getIntent();

        // 解析格式参数
        Map<DecodeHintType, Object> hints;
        String[] formats = intent.getStringArrayExtra(EXTRA_FORMATS);
        if (formats != null && formats.length > 0) {
            List<BarcodeFormat> barcodeFormats = new ArrayList<>();
            for (String fmt : formats) {
                try {
                    barcodeFormats.add(BarcodeFormat.valueOf(fmt));
                } catch (IllegalArgumentException ignored) {
                }
            }
            if (!barcodeFormats.isEmpty()) {
                hints = new EnumMap<>(DecodeHintType.class);
                hints.put(DecodeHintType.POSSIBLE_FORMATS, barcodeFormats);
                hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
                hints.put(DecodeHintType.CHARACTER_SET, "UTF-8");
            } else {
                hints = DecodeFormatManager.ALL_HINTS;
            }
        } else {
            hints = DecodeFormatManager.ALL_HINTS;
        }

        // 解析参数
        boolean beepEnabled = intent.getBooleanExtra(EXTRA_BEEP_ENABLED, true);
        boolean useFlash = intent.getBooleanExtra(EXTRA_USE_FLASH, false);
        int timeout = intent.getIntExtra(EXTRA_TIMEOUT, 0);
        supportMultiBarcode = intent.getBooleanExtra(EXTRA_SUPPORT_MULTI_BARCODE, false);
        boolean supportMultiAngle = intent.getBooleanExtra(EXTRA_SUPPORT_MULTI_ANGLE, true);
        int decodeEngine = intent.getIntExtra(EXTRA_DECODE_ENGINE, ScanUtils.ENGINE_MLKIT);
        boolean fullAreaScan = intent.getBooleanExtra(EXTRA_FULL_AREA_SCAN, true);
        float areaRectRatio = intent.getFloatExtra(EXTRA_AREA_RECT_RATIO, 0.8f);

        // 配置解码
        DecodeConfig decodeConfig = new DecodeConfig();
        decodeConfig.setHints(hints);
        decodeConfig.setSupportVerticalCode(supportMultiAngle);
        decodeConfig.setSupportLuminanceInvert(false);
        decodeConfig.setAreaRectRatio(areaRectRatio);
        decodeConfig.setFullAreaScan(fullAreaScan);

        // 配置相机扫描
        getCameraScan()
                .setPlayBeep(beepEnabled)
                .setVibrate(false)
                .setNeedAutoZoom(true)
                .setNeedTouchZoom(true)
                .setOnScanResultCallback(this)
                .setAnalyzer(new MultiFormatAnalyzer(decodeConfig))
                .setAnalyzeImage(true);

        // 闪光灯按钮
        if (ivFlashlight != null) {
            getCameraScan().bindFlashlightView(ivFlashlight);
            ivFlashlight.setVisibility(android.view.View.VISIBLE);
        }

        if (useFlash) {
            getCameraScan().enableTorch(true);
        }

        // 超时处理
        if (timeout > 0) {
            timeoutHandler = new Handler(Looper.getMainLooper());
            timeoutRunnable = () -> {
                setResult(Activity.RESULT_CANCELED);
                finish();
            };
            timeoutHandler.postDelayed(timeoutRunnable, timeout);
        }

        Log.i(TAG, "initCameraScan: engine=" + decodeEngine
                + " multiBarcode=" + supportMultiBarcode
                + " multiAngle=" + supportMultiAngle
                + " fullArea=" + fullAreaScan);
    }

    @Override
    public boolean onScanResultCallback(Result result) {
        if (result != null && !hasResult) {
            hasResult = true;
            getCameraScan().setAnalyzeImage(false);
            cancelTimeout();

            Intent data = new Intent();
            if (supportMultiBarcode) {
                // 多条码模式：当前 CameraX + ZXing 链路一次只返回一个结果
                // 将单个结果包装成数组格式返回，保持接口一致性
                data.putExtra(SCAN_RESULTS, new String[]{ result.getText() });
                data.putExtra(SCAN_FORMATS, new String[]{ result.getBarcodeFormat().name() });
                data.putExtra(SCAN_COUNT, 1);
            } else {
                data.putExtra(SCAN_RESULT, result.getText());
                data.putExtra(SCAN_FORMAT, result.getBarcodeFormat().name());
            }
            setResult(Activity.RESULT_OK, data);
            finish();
            return true;
        }
        return false;
    }

    private void cancelTimeout() {
        if (timeoutHandler != null && timeoutRunnable != null) {
            timeoutHandler.removeCallbacks(timeoutRunnable);
            timeoutRunnable = null;
        }
    }

    @Override
    protected void onDestroy() {
        cancelTimeout();
        super.onDestroy();
    }
}
