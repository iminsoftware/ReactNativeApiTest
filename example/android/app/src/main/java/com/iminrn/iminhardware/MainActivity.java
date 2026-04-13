package com.iminrn.iminhardware;

import android.content.Intent;
import android.content.res.Configuration;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.imin.hardware.IminHardwareModule;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "react-native-imin-hardware-example";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }

  /**
   * Handle new intent for NFC
   */
  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    setIntent(intent);
    android.util.Log.d("MainActivity", "onNewIntent: " + (intent != null ? intent.getAction() : "null"));
    
    // Forward intent to IminHardwareModule for NFC handling
    try {
      ReactInstanceManager reactInstanceManager = getReactNativeHost().getReactInstanceManager();
      ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
      
      if (reactContext != null) {
        // Use module name instead of class to avoid @ReactModule annotation issue
        IminHardwareModule module = (IminHardwareModule) reactContext.getCatalystInstance()
            .getNativeModule("IminHardware");
        if (module != null) {
          module.handleIntent(intent);
        }
      }
    } catch (Exception e) {
      android.util.Log.e("MainActivity", "Error forwarding intent", e);
    }
  }

  @Override
  public void onConfigurationChanged(Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    // 通知 JS 层语言变化
    try {
      ReactInstanceManager reactInstanceManager = getReactNativeHost().getReactInstanceManager();
      ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
      if (reactContext != null) {
        String lang = newConfig.getLocales().get(0).getLanguage();
        WritableMap params = Arguments.createMap();
        params.putString("language", lang);
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit("localeChanged", params);
      }
    } catch (Exception e) {
      android.util.Log.e("MainActivity", "Error sending locale change", e);
    }
  }
}
