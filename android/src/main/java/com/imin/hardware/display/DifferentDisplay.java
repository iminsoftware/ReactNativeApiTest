package com.imin.hardware.display;

import android.annotation.SuppressLint;
import android.app.Presentation;
import android.content.Context;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.view.Display;
import android.view.Gravity;
import android.view.View;
import android.view.WindowManager;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.VideoView;

import com.bumptech.glide.Glide;

import java.io.File;

/**
 * 副屏显示 Presentation
 * 参考 FlutterApiTest DifferentDisplay.kt
 */
@SuppressLint("NewApi")
public class DifferentDisplay extends Presentation {
    private static final String TAG = "DifferentDisplay";

    private LinearLayout rootLayout;
    private TextView titleText;
    private TextView contentText;
    private LinearLayout contentLayout;
    private ImageView imageView;
    private VideoView videoView;

    public DifferentDisplay(Context outerContext, Display display) {
        super(outerContext, display);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 设置窗口类型
        if (Build.VERSION.SDK_INT >= 26 && Build.VERSION.SDK_INT < 32) {
            getWindow().setType(WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY);
        }

        createLayout();
    }

    private void createLayout() {
        // Root layout
        rootLayout = new LinearLayout(getContext());
        rootLayout.setOrientation(LinearLayout.VERTICAL);
        rootLayout.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT));
        rootLayout.setBackgroundColor(Color.WHITE);

        // Title
        titleText = new TextView(getContext());
        titleText.setText("Secondary Display");
        titleText.setTextSize(20f);
        titleText.setTextColor(Color.BLACK);
        titleText.setGravity(Gravity.CENTER);
        titleText.setPadding(0, 20, 0, 20);
        titleText.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        rootLayout.addView(titleText);

        // Content text
        contentText = new TextView(getContext());
        contentText.setTextSize(16f);
        contentText.setTextColor(Color.BLACK);
        contentText.setPadding(40, 20, 40, 20);
        contentText.setLayoutParams(new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT));
        rootLayout.addView(contentText);

        // Content layout for image/video
        contentLayout = new LinearLayout(getContext());
        contentLayout.setOrientation(LinearLayout.HORIZONTAL);
        contentLayout.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams contentParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT);
        contentParams.setMargins(20, 20, 20, 20);
        contentLayout.setLayoutParams(contentParams);

        // ImageView
        imageView = new ImageView(getContext());
        imageView.setVisibility(View.GONE);
        imageView.setScaleType(ImageView.ScaleType.FIT_CENTER);
        imageView.setLayoutParams(new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        contentLayout.addView(imageView);

        // VideoView
        videoView = new VideoView(getContext());
        videoView.setVisibility(View.GONE);
        videoView.setLayoutParams(new LinearLayout.LayoutParams(
                0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f));
        contentLayout.addView(videoView);

        rootLayout.addView(contentLayout);
        setContentView(rootLayout);
    }

    /**
     * 显示文本
     */
    public void showText(String text) {
        contentText.post(() -> {
            contentText.setText(text);
            contentText.setVisibility(View.VISIBLE);
            imageView.setVisibility(View.GONE);
            videoView.setVisibility(View.GONE);
        });
    }

    /**
     * 显示图片
     * 支持：网络URL (http/https)、本地文件路径 (file:// 或 /absolute/path)
     * 统一使用 Glide 加载，通过 Application context 避免 Presentation context 问题
     */
    public void showImage(Context context, String imagePath) {
        imageView.post(() -> {
            try {
                Log.d(TAG, "showImage: " + imagePath);

                // 统一用 Glide 加载，它能处理 URL、File、Uri
                Object loadSource;
                if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
                    loadSource = imagePath;
                } else if (imagePath.startsWith("android.resource://") || imagePath.startsWith("content://")) {
                    loadSource = Uri.parse(imagePath);
                } else if (imagePath.startsWith("file://")) {
                    loadSource = new File(imagePath.substring(7));
                } else if (imagePath.startsWith("/")) {
                    loadSource = new File(imagePath);
                } else {
                    // 尝试作为本地文件
                    loadSource = new File(imagePath);
                }

                Glide.with(context.getApplicationContext())
                        .load(loadSource)
                        .fitCenter()
                        .into(imageView);

                contentText.setVisibility(View.GONE);
                imageView.setVisibility(View.VISIBLE);
                videoView.setVisibility(View.GONE);
            } catch (Exception e) {
                Log.e(TAG, "Error loading image: " + e.getMessage(), e);
            }
        });
    }

    /**
     * 播放视频
     * 支持：网络URL (http/https)、本地文件路径 (file:// 或 /absolute/path)、content:// URI
     */
    public void playVideo(Context context, String videoPath) {
        videoView.post(() -> {
            try {
                Log.d(TAG, "playVideo: " + videoPath);

                Uri videoUri;
                if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
                    videoUri = Uri.parse(videoPath);
                } else if (videoPath.startsWith("android.resource://") || videoPath.startsWith("content://")) {
                    videoUri = Uri.parse(videoPath);
                } else if (videoPath.startsWith("file://")) {
                    videoUri = Uri.fromFile(new File(videoPath.substring(7)));
                } else if (videoPath.startsWith("/")) {
                    videoUri = Uri.fromFile(new File(videoPath));
                } else {
                    videoUri = Uri.parse(videoPath);
                }

                videoView.setVideoURI(videoUri);
                videoView.setOnPreparedListener(mp -> {
                    mp.setLooping(true);
                    mp.start();
                });

                contentText.setVisibility(View.GONE);
                imageView.setVisibility(View.GONE);
                videoView.setVisibility(View.VISIBLE);
            } catch (Exception e) {
                Log.e(TAG, "Error playing video: " + e.getMessage(), e);
            }
        });
    }

    /**
     * 清除显示内容
     */
    public void clear() {
        contentText.post(() -> {
            contentText.setText("");
            contentText.setVisibility(View.GONE);
            imageView.setVisibility(View.GONE);
            videoView.setVisibility(View.GONE);
            videoView.stopPlayback();
            imageView.setImageBitmap(null);

            try {
                Glide.with(getContext()).clear(imageView);
            } catch (Exception e) {
                Log.e(TAG, "Error clearing Glide: " + e.getMessage());
            }
        });
    }
}
