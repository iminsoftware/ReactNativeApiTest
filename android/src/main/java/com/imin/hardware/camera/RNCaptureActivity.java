package com.imin.hardware.camera;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.imin.scan.CaptureActivity;
import com.imin.scan.DecodeConfig;
import com.imin.scan.DecodeFormatManager;
import com.imin.scan.Result;
import com.imin.scan.analyze.MultiFormatAnalyzer;
import com.imin.zxing.BarcodeFormat;
import com.imin.zxing.DecodeHintType;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

/**
 * 自定义 CaptureActivity，支持参数配置
 *
 * Intent extras:
 * - formats: String[] 条码格式列表
 * - useFlash: boolean 是否开启闪光灯
 * - beepEnabled: boolean 是否播放提示音
 * - timeout: int 超时时间(ms)，0=不超时
 */
public class RNCaptureActivity extends CaptureActivity {

    public static final String SCAN_RESULT = "SCAN_RESULT";
    public static final String SCAN_FORMAT = "SCAN_FORMAT";

    public static final String EXTRA_FORMATS = "formats";
    public static final String EXTRA_USE_FLASH = "useFlash";
    public static final String EXTRA_BEEP_ENABLED = "beepEnabled";
    public static final String EXTRA_TIMEOUT = "timeout";

    private Handler timeoutHandler;
    private Runnable timeoutRunnable;

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
                    // 忽略无效格式
                }
            }
            if (!barcodeFormats.isEmpty()) {
                hints = new EnumMap<>(DecodeHintType.class);
                hints.put(DecodeHintType.POSSIBLE_FORMATS, barcodeFormats);
                hints.put(DecodeHintType.TRY_HARDER, Boolean.TRUE);
                hints.put(DecodeHintType.CHARACTER_SET, "UTF-8");
            } else {
                hints = DecodeFormatManager.DEFAULT_HINTS;
            }
        } else {
            hints = DecodeFormatManager.DEFAULT_HINTS;
        }

        // 解析其他参数
        boolean beepEnabled = intent.getBooleanExtra(EXTRA_BEEP_ENABLED, true);
        boolean useFlash = intent.getBooleanExtra(EXTRA_USE_FLASH, false);
        int timeout = intent.getIntExtra(EXTRA_TIMEOUT, 0);

        // 配置解码 - 和 Flutter 保持一致
        DecodeConfig decodeConfig = new DecodeConfig();
        decodeConfig.setHints(hints);
        decodeConfig.setSupportVerticalCode(false);
        decodeConfig.setSupportLuminanceInvert(false);
        decodeConfig.setAreaRectRatio(0.8f);
        decodeConfig.setFullAreaScan(false);

        // 配置相机扫描
        getCameraScan()
                .setPlayBeep(beepEnabled)
                .setVibrate(false)
                .setNeedAutoZoom(true)
                .setNeedTouchZoom(true)
                .setOnScanResultCallback(this)
                .setAnalyzer(new MultiFormatAnalyzer(decodeConfig))
                .setAnalyzeImage(true);

        // 绑定闪光灯按钮
        // Java 中直接访问父类字段 ivFlashlight
        if (ivFlashlight != null) {
            getCameraScan().bindFlashlightView(ivFlashlight);
            ivFlashlight.setVisibility(android.view.View.VISIBLE);
        }

        // 闪光灯
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
    }

    private boolean hasResult = false;

    @Override
    public boolean onScanResultCallback(Result result) {
        if (result != null && !hasResult) {
            hasResult = true;
            // Stop analysis immediately to prevent duplicate results
            getCameraScan().setAnalyzeImage(false);
            cancelTimeout();
            Intent intent = new Intent();
            intent.putExtra(SCAN_RESULT, result.getText());
            intent.putExtra(SCAN_FORMAT, result.getBarcodeFormat().name());
            setResult(Activity.RESULT_OK, intent);
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
