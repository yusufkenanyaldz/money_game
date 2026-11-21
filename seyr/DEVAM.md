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
- `ses-wav.py` — oyunda çalınan 19 sesi 32 kHz mono WAV'a çevirir, her birini vuruştan 5 ms önce başlatır (MP3 baş sessizliği yok), `assets/ses/ses.js`'e `window.SES_DOSYA` olarak gömer.
- `gecis-isle.py` — köprü klipler: ölçeği bekleme boyuna eşitler, baş hizasını ölçer, giriş karesini o anki adıma en benzeyen pozdan seçer → `assets/anim-garip-g*.webp` + `gecis.json` (index.html'deki `GECIS` tablosu buradan).
- `tek-html.py` — tek dosya HTML: `python3 tek-html.py . Seyr.html <kalite> <küçültme>`. İki görünümle 9,5 MB'a sığması için `82 0.6` (şeritler %60 boyda; APK tam boy).
- `karakter-veri.py` — `index.html`'deki `/* KARAKTER-VERI */` bloğunu (ANIM, FACE_ALL, GECIS_ALL, ADIM_ALL, PUNCH_ALL, TEK_ALL, GORUNUM_SEVIYE) json'lardan yeniden yazar. Vuruş kareleri, kaçınma aralığı, görünüm seviyeleri bu betikte elle ayarlanır. **Yeni görünüm ekleme sırası:** `karakter-isle.py <ad>` → `gecis-isle.py <video> <geçici> <ad>` → `karakter-veri.py` (GORUNUMLER/PUNCH/TEK/SEVIYE'ye ekle).
- `gecis-isle.py` artık görünüm adı alır; 'oto' geçişlerde aralıkları kendi bulur. Çıktı `gecis-<ad>.json` (Garip: `gecis.json`).
- **Adım sesleri:** adımın düştüğü kare görüntüden (adımın en açık olduğu an), çünkü Grok'un sesi bazı videolarda 2-5 kare geride. Garip'te görüntü ve ses birebir tutuyor.
- `karakter-isle.py` — yeni görünümün (Yolcu, Er, ...) Grok videolarını şeritlere çevirir: her videoda ayrı ölçek (ayakta boydan), zemin ayaklardan, yatay orta baştan, ayak sesleri görüntüdeki adım aralığı + videonun sesi. Çıktı `karakter-<ad>.json` → index.html'de `FACE_ALL`, `ADIM_ALL`, `PUNCH_ALL`, `ANIM`.
- Görünüm seçimi: `setKar()`; seviye ≥10 → Yolcu. Defter › Güçler › **Görünüm önizleme** ile seviyeye gelmeden denenir (geçici).
- `GORSELLER.md` — karakter görünüm komutları (10 unvan).
- `grok-komutlari.html` — Grok'a yaptırılacak her şeyin kopyala-yapıştır komutları (278 komut: düzeltmeler, darbe/yenilme/zafer, görünümler 3–10, canavarlar, bölgeler, emanet simgeleri). Yayınlanmış sayfası da var.
- `android/` — APK: `KEYSTORE=... KEYPASS=... VCODE=n VNAME=x ./build.sh cikti.apk`. Araçlar (aapt2, smali, apksig) Maven Central'dan otomatik iner. Paket `com.seyr.oyun`, yatay kilitli.
  Kabuk `MainActivity.java` (WebView + adım sensörü köprüsü `SeyrAndroid`). Derleme: `javac --release 8` (Robolectric `android-all` imzalarına karşı) → `dalvik-dx`. Araçlar `android/.tools/` içine iner (gitignore'da).

## İmza anahtarı
`seyr.p12` (alias `seyr`) ve şifresi **kullanıcıda**, repoda yok. Yeni APK gerekince kullanıcıdan dosyayı ve şifreyi iste;
aynı anahtar olmazsa güncelleme eskisinin üstüne kurulmaz. Son sürüm: **1.13 (VCODE 14)** — Er (20+) ve Alp (30+) görünümleri; darbe/yenilme/zafer; bekle↔yürü köprüleri; adım fazı görüntüden. Önceki: **1.12 (VCODE 13)** — video sesleri ilk kez gerçekten çalıyor (isim çakışması), kırpılmış WAV. Önceki: **1.11 (VCODE 12)** — oyun ekranında geçici görünüm düğmesi (GARİP/YOLCU, DEFTER'in solunda; `gorBtn`, sonra kaldırılacak).

## Bilinen tuzaklar
- `const` ile tanımlanan modüller `window`'a düşmez: `window.SAVAS=SAVAS` gibi açıkça ata.
- **İsim çakışması:** ses paketi `window.SES_DOSYA`, sentez sesler (`sesler.js`) `window.SES`. Paket eskiden `SES` idi ve `sesler.js` onu eziyordu → video sesleri hiç çalmıyordu (1.12'de düzeldi).
- Satır içinde `//` yorum kullanma (tek satırlık kodlarda geri kalanı yorum yapar), `/* */` kullan.
- Yumruk videosu kol uzanmış başlıyor; temiz vuruş kare 4–11 (PUNCH ayarı).
- Bekleme hareketi için yanlış (renkli yamalı) video kullanılmamalı; doğru kaynaklar animasyon-isle.py içindeki V listesinde.

## Bekleyen kararlar
- Kur'an ölçüsü (öneri 1 sayfa = 3 dk), zikir ölçüsü (öneri 100 = 1,5 dk). Adım ölçüsü onaylandı: **100 adım = 1 dk**.
- Kullanıcının zikir uygulamasının adı (veri alınabilir mi?).
- Gemini'den gelecek müzikler; SeyrSesler'deki sentez seslerin beğenilip beğenilmediği.
