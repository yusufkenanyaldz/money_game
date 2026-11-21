# Seyr — Yeni sohbet için başlangıç notu

Bu dosyayı oku, sonra `YAPILACAKLAR.md`'ye bak. Kullanıcı Türkçe konuşur; cevaplar Türkçe.

## Proje nedir
Gerçek hayattaki iyi amellerin (Kur'an, kitap okuma/dinleme, zikir, tesbihat, yürüyüş, ahlaki emanetler)
bir minyatür tarzı karakteri 1–100. seviyeye büyüttüğü, yandan görünümlü (yan ekran, joystick) bir Android oyunu.
Canavarlar nefsin huylarıdır. **Oyun içinde ameller açıkça yazılmaz**, efsanevi isimlerle geçer (kullanıcının isteği:
"nefsim sıkılır"). Gerçek anlamlar yalnızca gizli anahtarda (DEFTER başlığına 1,5 sn bas).

## Kullanıcı tercihleri (önemli)
- **Yavaş yavaş ilerle**, her adımı telefonda denetip onay al. Hızlı büyük atlamalar istemiyor.
- Görsel/video komutlarını **tek parça, kopyala-yapıştır** ver (İngilizce komut, Türkçe açıklama).
- Görseller Grok (bazen ChatGPT/Gemini) ile üretiliyor; **arka plan düz magenta (#E8087F)**, karakterde pembe yok, yazı yok, hale yok.
- Erkek karakter, Osmanlı/İran minyatür tarzı. Müzik: "dahi asi" — sakinlikle hiddet arası, geleneksel sazlar + sert vurmalılar.
- Kitap ölçüsü: **10 sayfa = 30 dakika** (Risale-i Nur okuyor).
- Boyut/RAM sorun değil (12 GB RAM'li Samsung).

## Dosyalar
- `index.html` — oyun: manzara, karakter, joystick, VUR/KAÇIN, animasyon geçişleri (çapraz geçiş, ivme).
- `defter.js` — emanetler, zikirmatik, Yıldız Defteri + Seher Çiyi, seviye/güçler/seri, geçmiş gün, yedek kodu.
- `savas.js` — savaş altyapısı (düşman durum makinesi, can, dalgalar, Kızıl Dev). Düşmanlar şimdilik kodla çizilmiş gölge.
- `sesler.js` — sentez sesler (davul, Hicaz kanun teli, hırıltı, rüzgâr).
- `vitrin.html` — karakter hareket vitrini.
- `assets/anim-garip-*.webp` — Garip'in 8 hareketi (ızgara kare şeridi: [kare sayısı, kare genişliği, yükseklik, sütun, kaynak boy] index.html'deki ANIM içinde).
- `assets/ses/` — videolardan kesilmiş sesler + `ses.js` (WebView'de fetch engelli olduğu için sesler script olarak gömülü).
- `animasyon-isle.py` — videodan kare şeridi: magenta temizleme, **doğal döngü noktası** bulma (harmanlama yok). İçindeki dosya yolları önceki oturuma ait; yeniden kullanırken `U`, `T`, `O` yollarını ve `V` listesini güncelle.
- `ses-kes.py` — videolardan ses efekti kesme.
- `gecis-isle.py` — köprü klipler: ölçeği bekleme boyuna eşitler, baş hizasını ölçer, giriş karesini o anki adıma en benzeyen pozdan seçer → `assets/anim-garip-g*.webp` + `gecis.json` (index.html'deki `GECIS` tablosu buradan).
- `tek-html.py` — tek dosya HTML: `python3 tek-html.py . Seyr.html <kalite> <küçültme>`. İki görünümle 9,5 MB'a sığması için `82 0.6` (şeritler %60 boyda; APK tam boy).
- `karakter-isle.py` — yeni görünümün (Yolcu, Er, ...) Grok videolarını şeritlere çevirir: her videoda ayrı ölçek (ayakta boydan), zemin ayaklardan, yatay orta baştan, ayak sesleri görüntüdeki adım aralığı + videonun sesi. Çıktı `karakter-<ad>.json` → index.html'de `FACE_ALL`, `ADIM_ALL`, `PUNCH_ALL`, `ANIM`.
- Görünüm seçimi: `setKar()`; seviye ≥10 → Yolcu. Defter › Güçler › **Görünüm önizleme** ile seviyeye gelmeden denenir (geçici).
- `GORSELLER.md` — karakter görünüm komutları (10 unvan).
- `android/` — APK: `KEYSTORE=... KEYPASS=... VCODE=n VNAME=x ./build.sh cikti.apk`. Araçlar (aapt2, smali, apksig) Maven Central'dan otomatik iner. Paket `com.seyr.oyun`, yatay kilitli.
  Kabuk `MainActivity.java` (WebView + adım sensörü köprüsü `SeyrAndroid`). Derleme: `javac --release 8` (Robolectric `android-all` imzalarına karşı) → `dalvik-dx`. Araçlar `android/.tools/` içine iner (gitignore'da).

## İmza anahtarı
`seyr.p12` (alias `seyr`) ve şifresi **kullanıcıda**, repoda yok. Yeni APK gerekince kullanıcıdan dosyayı ve şifreyi iste;
aynı anahtar olmazsa güncelleme eskisinin üstüne kurulmaz. Son sürüm: **1.9 (VCODE 10)** — Yolcu görünümü (10–19. seviye).

## Bilinen tuzaklar
- `const` ile tanımlanan modüller `window`'a düşmez: `window.SAVAS=SAVAS` gibi açıkça ata.
- Satır içinde `//` yorum kullanma (tek satırlık kodlarda geri kalanı yorum yapar), `/* */` kullan.
- Yumruk videosu kol uzanmış başlıyor; temiz vuruş kare 4–11 (PUNCH ayarı).
- Bekleme hareketi için yanlış (renkli yamalı) video kullanılmamalı; doğru kaynaklar animasyon-isle.py içindeki V listesinde.

## Bekleyen kararlar
- Kur'an ölçüsü (öneri 1 sayfa = 3 dk), zikir ölçüsü (öneri 100 = 1,5 dk). Adım ölçüsü onaylandı: **100 adım = 1 dk**.
- Kullanıcının zikir uygulamasının adı (veri alınabilir mi?).
- Gemini'den gelecek müzikler; SeyrSesler'deki sentez seslerin beğenilip beğenilmediği.
