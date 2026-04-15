package com.imin.hardware.msr;

import android.graphics.Color;
import android.util.TypedValue;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

public class MsrEditTextManager extends SimpleViewManager<MsrEditText> {
    private static final String REACT_CLASS = "MsrNativeEditText";
    private ReactApplicationContext appContext;

    public MsrEditTextManager(ReactApplicationContext context) {
        this.appContext = context;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected MsrEditText createViewInstance(ThemedReactContext context) {
        MsrEditText editText = new MsrEditText(context);
        editText.setBackgroundColor(Color.parseColor("#f9f9f9"));
        editText.setPadding(32, 24, 32, 24);

        editText.setOnCardDataListener(data -> {
            try {
                WritableMap event = Arguments.createMap();
                event.putString("data", data);
                event.putInt("length", data.length());
                event.putDouble("timestamp", System.currentTimeMillis());
                appContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("msr_card_data", event);
            } catch (Exception e) {
                android.util.Log.e("MsrEditTextManager", "Error sending event", e);
            }
        });

        // 自动获取焦点
        editText.post(() -> {
            editText.requestFocus();
            android.view.inputmethod.InputMethodManager imm =
                (android.view.inputmethod.InputMethodManager) context.getSystemService(android.content.Context.INPUT_METHOD_SERVICE);
            if (imm != null) imm.showSoftInput(editText, 0);
        });

        return editText;
    }

    @ReactProp(name = "placeholder")
    public void setPlaceholder(MsrEditText view, String placeholder) {
        view.setHint(placeholder);
    }

    @Override
    public Map<String, Object> getExportedCustomDirectEventTypeConstants() {
        return MapBuilder.<String, Object>builder().build();
    }

    @Override
    public void onDropViewInstance(MsrEditText view) {
        view.cleanup();
        super.onDropViewInstance(view);
    }
}
