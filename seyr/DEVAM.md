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

## Dal
Tüm Seyr işi `ccr-1c90c77b-uxvoi0` dalında (**main dalında YOK**). Yeni sohbette önce:
`git fetch origin ccr-1c90c77b-uxvoi0 && git checkout ccr-1c90c77b-uxvoi0`

## Dosyalar
- `index.html` — oyun: manzara, karakter, joystick, VUR/KAÇIN, animasyon geçişleri (çapraz geçiş, ivme).
- `defter.js` — emanetler, zikirmatik, Yıldız Defteri + Seher Çiyi, seviye/güçler/seri, geçmiş gün, yedek kodu.
- `savas.js` — savaş altyapısı (düşman durum makinesi, can, dalgalar, Kızıl Dev). Düşmanlar şimdilik kodla çizilmiş gölge.
- `sesler.js` — sentez sesler (davul, Hicaz kanun teli, hırıltı, rüzgâr).
- `vitrin.html` — karakter hareket vitrini.
- `ses-dinle.html` — sentez sesleri tek tek dinleme sayfası.
- `assets/anim-garip-*.webp` — Garip'in 8 hareketi (ızgara kare şeridi: [kare sayısı, kare genişliği, yükseklik, sütun, kaynak boy] index.html'deki ANIM içinde).
- `assets/ses/` — videolardan kesilmiş sesler + `ses.js` (WebView'de fetch engelli olduğu için sesler script olarak gömülü).
- `animasyon-isle.py` — videodan kare şeridi: magenta temizleme, **doğal döngü noktası** bulma (harmanlama yok). İçindeki dosya yolları önceki oturuma ait; yeniden kullanırken `U`, `T`, `O` yollarını ve `V` listesini güncelle.
- `ses-kes.py` — videolardan ses efekti kesme.
- `GORSELLER.md` — karakter görünüm komutları (10 unvan).
- `android/` — APK: `KEYSTORE=... KEYPASS=... VCODE=n VNAME=x ./build.sh cikti.apk`. Araçlar (aapt2, smali, apksig) Maven Central'dan otomatik iner. Paket `com.seyr.oyun`, yatay kilitli.

## İmza anahtarı
`seyr.p12` (alias `seyr`) ve şifresi **kullanıcıda**, repoda yok. Yeni APK gerekince kullanıcıdan dosyayı ve şifreyi iste;
aynı anahtar olmazsa güncelleme eskisinin üstüne kurulmaz. Son sürüm: **1.6 (VCODE 7)**.

## Bilinen tuzaklar
- `const` ile tanımlanan modüller `window`'a düşmez: `window.SAVAS=SAVAS` gibi açıkça ata.
- Satır içinde `//` yorum kullanma (tek satırlık kodlarda geri kalanı yorum yapar), `/* */` kullan.
- Yumruk videosu kol uzanmış başlıyor; temiz vuruş kare 4–11 (PUNCH ayarı).
- Bekleme hareketi için yanlış (renkli yamalı) video kullanılmamalı; doğru kaynaklar animasyon-isle.py içindeki V listesinde.

- **İsim çakışması:** ses paketi `window.SES_DOSYA`, sentez sesler `window.SES`. Eskiden ikisi de `SES` idi; sentez dosyası paketi ezdi ve APK'da video sesleri hiç çalmadı (1.6'da düzeltildi).
- Ses için MP3 değil **kırpılmış WAV** (MP3 başa ~25 ms sessizlik ekler). Ses bağlamı sayfa açılınca kurulur, sesler dokunmadan önce çözülür.
- Adım sesleri zamanlayıcıyla değil, **videodaki ayak sesinin geldiği karelerde** çalar (`ADIM` dizisi). Yumruk sesi isabetten 1 kare önce (Android gecikmesi).

## Bekleyen kararlar
- Kur'an ölçüsü (öneri 1 sayfa = 3 dk), zikir ölçüsü (öneri 100 = 1,5 dk), adım ölçüsü (öneri 100 adım = 1 dk).
- Kullanıcının zikir uygulamasının adı (veri alınabilir mi?).
- Gemini'den gelecek müzikler; SeyrSesler'deki sentez seslerin beğenilip beğenilmediği.
