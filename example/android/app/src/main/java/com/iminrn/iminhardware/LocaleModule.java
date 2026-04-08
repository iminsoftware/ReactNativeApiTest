package com.iminrn.iminhardware;

import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Build;
import android.os.LocaleList;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class LocaleModule extends ReactContextBaseJavaModule {
    public LocaleModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "LocaleHelper";
    }

    @Override
    public Map<String, Object> getConstants() {
        HashMap<String, Object> constants = new HashMap<>();
        Configuration config = Resources.getSystem().getConfiguration();
        Locale locale;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            LocaleList locales = config.getLocales();
            locale = locales.get(0);
        } else {
            locale = config.locale;
        }
        constants.put("language", locale.getLanguage());
        constants.put("country", locale.getCountry());
        constants.put("locale", locale.toString());
        return constants;
    }
}
