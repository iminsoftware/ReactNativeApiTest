package com.imin.hardware.msr;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Gravity;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;

/**
 * 自定义 EditText，用 TextWatcher 监听完整输入，
 * 1秒无新输入后一次性回调完整数据并清空。
 * 不重写 onKeyDown，让系统完整处理所有字符（包括特殊字符）。
 */
public class MsrEditText extends EditText {
    private static final String TAG = "MsrEditText";
    private static final long FLUSH_DELAY = 1000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private Runnable flushRunnable;
    private OnCardDataListener listener;
    private boolean isFlushing = false;

    public interface OnCardDataListener {
        void onCardData(String data);
    }

    public MsrEditText(Context context) {
        super(context);
        init();
    }

    public void setOnCardDataListener(OnCardDataListener listener) {
        this.listener = listener;
    }

    private void init() {
        setGravity(Gravity.TOP | Gravity.START);
        setTextSize(14f);
        setHint("等待刷卡...");
        setInputType(EditorInfo.TYPE_CLASS_TEXT | EditorInfo.TYPE_TEXT_FLAG_MULTI_LINE);
        setMaxLines(Integer.MAX_VALUE);
        setVerticalScrollBarEnabled(true);
        setOverScrollMode(OVER_SCROLL_ALWAYS);
        setFocusable(true);
        setFocusableInTouchMode(true);

        // 右侧清除按钮
        updateClearButton();

        addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {}

            @Override
            public void afterTextChanged(Editable s) {
                if (isFlushing) return;
                updateClearButton();
                post(() -> scrollToEnd());
                if (s.length() > 0) {
                    scheduleFlush();
                }
            }
        });
    }

    private void scheduleFlush() {
        if (flushRunnable != null) handler.removeCallbacks(flushRunnable);
        flushRunnable = () -> {
            post(() -> {
                Editable text = getText();
                if (text.length() > 0 && !text.toString().endsWith("\n\n")) {
                    isFlushing = true;
                    append("\n\n");
                    isFlushing = false;
                    scrollToEnd();
                }
            });
        };
        handler.postDelayed(flushRunnable, FLUSH_DELAY);
    }

    private void scrollToEnd() {
        int len = getText().length();
        setSelection(len);
        if (getLayout() != null) {
            int line = getLayout().getLineForOffset(len);
            int y = getLayout().getLineBottom(line);
            int viewHeight = getHeight() - getPaddingTop() - getPaddingBottom();
            scrollTo(0, Math.max(0, y - viewHeight));
        }
    }

    private void updateClearButton() {
        if (getText().length() > 0) {
            android.graphics.drawable.Drawable clearIcon = getContext().getResources()
                    .getDrawable(android.R.drawable.ic_menu_close_clear_cancel, null);
            if (clearIcon != null) {
                clearIcon.setBounds(0, 0, 48, 48);
                setCompoundDrawables(null, null, clearIcon, null);
            }
        } else {
            setCompoundDrawables(null, null, null, null);
        }
    }

    @Override
    public boolean onTouchEvent(android.view.MotionEvent event) {
        if (event.getAction() == android.view.MotionEvent.ACTION_UP) {
            android.graphics.drawable.Drawable drawable = getCompoundDrawables()[2];
            if (drawable != null) {
                int touchX = (int) event.getX();
                int clearBtnStart = getWidth() - getPaddingRight() - drawable.getIntrinsicWidth();
                if (touchX >= clearBtnStart) {
                    isFlushing = true;
                    setText("");
                    isFlushing = false;
                    updateClearButton();
                    return true;
                }
            }
        }
        return super.onTouchEvent(event);
    }

    public void cleanup() {
        if (flushRunnable != null) handler.removeCallbacks(flushRunnable);
    }
}
