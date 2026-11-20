package com.seyr.oyun;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.os.Build;
import android.os.Bundle;
import android.os.SystemClock;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;

/*
 * Seyr kabuğu: oyunu WebView'de açar ve telefonun adım sayacını (TYPE_STEP_COUNTER)
 * JavaScript'e "SeyrAndroid" köprüsüyle verir.
 * Sayaç telefon açıldığından beri atılan toplam adımdır; oyun "son okumadan beri" farkı kendisi hesaplar.
 * Yeniden başlatmayı anlamak için açılış anı (boot) da gönderilir.
 */
public class MainActivity extends Activity implements SensorEventListener {
    private static final int IZIN_ISTEK = 7;
    private WebView web;
    private SensorManager sm;
    private Sensor sayac;
    private volatile long sonDeger = -1;
    private volatile boolean sayfaHazir = false;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        web.setBackgroundColor(0xFF000000);
        web.addJavascriptInterface(new Kopru(), "SeyrAndroid");
        web.loadUrl("file:///android_asset/index.html");
        setContentView(web);

        sm = (SensorManager) getSystemService(SENSOR_SERVICE);
        if (sm != null) sayac = sm.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
        if (sayac != null && !izinVar()) izinIste();
    }

    private boolean izinVar() {
        if (Build.VERSION.SDK_INT < 29) return true;
        return checkSelfPermission(Manifest.permission.ACTIVITY_RECOGNITION) == PackageManager.PERMISSION_GRANTED;
    }

    private void izinIste() {
        if (Build.VERSION.SDK_INT >= 29)
            requestPermissions(new String[]{Manifest.permission.ACTIVITY_RECOGNITION}, IZIN_ISTEK);
    }

    private void dinle() {
        if (sm != null && sayac != null && izinVar())
            sm.registerListener(this, sayac, SensorManager.SENSOR_DELAY_NORMAL);
    }

    private static long acilis() {
        return System.currentTimeMillis() - SystemClock.elapsedRealtime();
    }

    @Override
    public void onRequestPermissionsResult(int kod, String[] izinler, int[] sonuc) {
        if (kod == IZIN_ISTEK) {
            dinle();
            gonder();
        }
    }

    @Override
    public void onSensorChanged(SensorEvent e) {
        sonDeger = (long) e.values[0];
        gonder();
    }

    @Override
    public void onAccuracyChanged(Sensor s, int a) {}

    private void gonder() {
        if (web == null || !sayfaHazir) return;
        final String js = "window.SeyrAdim&&SeyrAdim.sensor(" + sonDeger + "," + acilis() + ",'" + durum() + "')";
        web.post(new Runnable() {
            public void run() {
                web.evaluateJavascript(js, null);
            }
        });
    }

    private String durum() {
        if (sayac == null) return "yok";
        if (!izinVar()) return "izin";
        return "acik";
    }

    class Kopru {
        /* JS hazır olunca çağırır: "değer,açılış,durum" döner. Değer -1 ise sensör henüz okunmadı. */
        @JavascriptInterface
        public String adim() {
            sayfaHazir = true;
            return sonDeger + "," + acilis() + "," + durum();
        }

        @JavascriptInterface
        public void izinIste() {
            runOnUiThread(new Runnable() {
                public void run() {
                    MainActivity.this.izinIste();
                }
            });
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (sm != null) sm.unregisterListener(this);
        if (web != null) web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (web != null) web.onResume();
        dinle();
    }
}
