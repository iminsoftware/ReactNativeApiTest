package com.imin.hardware.floatingwindow;

import android.app.Service;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.os.Build;
import android.os.IBinder;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.widget.TextView;

/**
 * 悬浮窗 Service - 管理悬浮窗的显示、隐藏、拖拽
 */
public class FloatingWindowService extends Service {

    public static final String ACTION_SHOW = "com.imin.hardware.floatingwindow.SHOW";
    public static final String ACTION_HIDE = "com.imin.hardware.floatingwindow.HIDE";
    public static final String ACTION_UPDATE_TEXT = "com.imin.hardware.floatingwindow.UPDATE_TEXT";
    public static final String ACTION_SET_POSITION = "com.imin.hardware.floatingwindow.SET_POSITION";

    public static boolean isShowing = false;

    private WindowManager windowManager;
    private View floatingView;
    private WindowManager.LayoutParams params;
    private TextView tvFloating;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_STICKY;

        String action = intent.getAction();
        if (action == null) return START_STICKY;

        switch (action) {
            case ACTION_SHOW:
                showFloatingWindow();
                break;
            case ACTION_HIDE:
                hideFloatingWindow();
                break;
            case ACTION_UPDATE_TEXT:
                String text = intent.getStringExtra("text");
                updateText(text != null ? text : "");
                break;
            case ACTION_SET_POSITION:
                int x = intent.getIntExtra("x", 0);
                int y = intent.getIntExtra("y", 100);
                setPosition(x, y);
                break;
        }
        return START_STICKY;
    }

    private void showFloatingWindow() {
        if (isShowing) return;

        try {
            int layoutFlag;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                layoutFlag = WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
            } else {
                layoutFlag = WindowManager.LayoutParams.TYPE_PHONE;
            }

            params = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
            );

            params.gravity = Gravity.TOP | Gravity.START;
            params.x = 0;
            params.y = 100;

            floatingView = createFloatingView();

            windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
            windowManager.addView(floatingView, params);

            isShowing = true;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private View createFloatingView() {
        TextView textView = new TextView(this);
        textView.setText("Floating Window");
        textView.setTextSize(16f);
        textView.setPadding(32, 16, 32, 16);
        textView.setBackgroundColor(0xCC2196F3); // Semi-transparent blue
        textView.setTextColor(0xFFFFFFFF);        // White text

        tvFloating = textView;

        // 拖拽支持
        textView.setOnTouchListener(new View.OnTouchListener() {
            private int lastAction = 0;
            private int initialX = 0;
            private int initialY = 0;
            private float initialTouchX = 0f;
            private float initialTouchY = 0f;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                if (params == null) return false;

                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = params.x;
                        initialY = params.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        lastAction = event.getAction();
                        return true;
                    case MotionEvent.ACTION_UP:
                        lastAction = event.getAction();
                        return true;
                    case MotionEvent.ACTION_MOVE:
                        params.x = initialX + (int) (event.getRawX() - initialTouchX);
                        params.y = initialY + (int) (event.getRawY() - initialTouchY);
                        windowManager.updateViewLayout(floatingView, params);
                        lastAction = event.getAction();
                        return true;
                }
                return false;
            }
        });

        return textView;
    }

    private void hideFloatingWindow() {
        if (!isShowing) return;

        try {
            if (floatingView != null) {
                windowManager.removeView(floatingView);
            }
            floatingView = null;
            tvFloating = null;
            isShowing = false;
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void updateText(String text) {
        if (tvFloating != null) {
            tvFloating.setText(text);
        }
    }

    private void setPosition(int x, int y) {
        if (params != null && floatingView != null) {
            params.x = x;
            params.y = y;
            windowManager.updateViewLayout(floatingView, params);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        hideFloatingWindow();
    }
}
