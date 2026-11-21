# Seyr — Yapılacaklar

Sıra kullanıcının kararıdır: **önce ana karakter tamamen otursun**, sonra dünya, sonra canavarlar, en son gerçek hayat bağlantıları.
Her adım bitince telefonda denenir, beğenilmeden bir sonrakine geçilmez.

---

## 0. Geçişlerdeki "donma" hissi — DÜZELTİLDİ (APK 1.2), telefonda denenecek
Son denemede (APK 1.1) geçişler yumuşadı ama donma hissi verdi. Muhtemel sebepler:
- [x] Çapraz geçişte **eski poz sabit bir kare** olarak sönüyor → eski hareket de geçiş boyunca oynamaya devam etmeli.
- [x] Yavaşlarken adım animasyonu %45'e kadar düşüyor → ağır çekim gibi; alt sınırı yükselt (~%75), yavaşlamayı kısalt.
- [x] Yumruk başında bekleme pozu sönerken gard pozu geliyor → yumruğa geçiş daha kısa olsun (Grok önerisi: 120 ms), her geçişe ayrı süre.
- [x] Köprü klip: **koşudan fren** (APK 1.7, telefonda denenecek). Koşarken çubuk bırakılınca o anki adıma en yakın kareden girer, hız klibe göre söner, bekleme duruşuna iner.
- [x] Ayak sesleri adımla eşzamanlı (1.8): ses artık zamanlayıcıyla değil, ayağın yere bastığı karelerde çalar (`ADIM` tablosu; kareler kaynak videoların sesinden çıkarıldı). Darbe yiyip geri itilince koşu/fren animasyonu oynamıyor.
- [ ] Köprü klip: **bekle ↔ yürü** — 21 Kasım setinde heybe rengi/yamalar değiştiği için kullanılmadı; Grok'tan yeniden istenecek.
- [ ] Köprü klip: vuruştan bekleye — gelen klip bekleme duruşuna varmıyordu; şimdiki hızlı geçiş yeterli, gerekirse yeniden.

## 1. Ana karakter (1–100. seviye) — ŞU AN BURADAYIZ
10 görünüm (her 10 seviyede bir unvan). Garip hazır.

| Seviye | Unvan | Görsel | Hareketler |
|---|---|---|---|
| 1–9 | Garip | ✅ | ✅ bekleme, yürüme ×2, koşma, ufka yürüyüş, dövüş duruşu, yumruk, kaçınma (+ses) |
| 10–19 | Yolcu | ✅ | ✅ bekleme, yürüme, sağa yürüme, ufka yürüyüş, koşu, dövüş duruşu, asayla vuruş · ⚠️ kaçınma geçici (gerçek kaçınma değil), koşudan fren yok (APK 1.9) |
| 20–29 | Er | ☐ | ☐ |
| 30–39 | Alp | ☐ | ☐ |
| 40–49 | Bahadır | ☐ | ☐ |
| 50–59 | Ulu | ☐ | ☐ |
| 60–69 | Bilge | ☐ | ☐ |
| 70–79 | Kutlu | ☐ | ☐ |
| 80–89 | Nurlu | ☐ | ☐ |
| 90–100 | Simurg | ☐ | ☐ |

Her görünüm için gereken hareketler (Garip'tekilerle aynı): bekleme, yürüme, koşma, dövüş duruşu, saldırı, kaçınma.
İleride eklenecek: **darbe alma**, **yenilme/düşme**, **zafer** pozu.
- [ ] Silah gelen seviyelerde (Alp: kılıç, Bahadır: yay) saldırı hareketi o silahla.
- [ ] Seviye atlama anı: görünüm değişirken geçiş efekti.
- [ ] Komutlar `GORSELLER.md` içinde; her biri **tek parça kopyala-yapıştır** olarak verilecek.

## 2. Arka plan
- [ ] Bölgeler (ör. Gaflet Ovası, Öfke Dağları, Kibir Sarayı…) — minyatür tarzı, katmanlı (uzak dağlar / orta / ön plan) ki kaydırırken derinlik olsun.
- [ ] Ön plan süsleri: servi, çeşme, kemer, taş yol.
- [x] Savaş/defter sesleri (sentez: davul, kanun teli, hırıltı, rüzgâr — `sesler.js`)
- [ ] Ambiyans sesleri ve müzik (ney, kanun havası) — video aracından alınabilir.

## 3. Emanetler, silahlar, yadigârlar
- [ ] 10 emanetin simgeleri (Ezel Kandili, Lokman'ın Kalemi, Yedi Deniz Kabuğu, Sonsuz Gevher Dizisi, Seher Halkası, Tozkoparan Nalı, İskender'in Aynası, Sessiz Ejder Mührü, Kaf Dağı Yankısı, Âb-ı Hayat Damlası).
- [ ] Kılıçlar ve yadigârlar (aksesuarlar): hangi başarıyla kazanılacakları.
- [x] Anahtar (sembol → gerçek anlam): DEFTER başlığına uzun basınca açılır.

## 4. Canavarlar
- [ ] Bölüm sonu canavarları: Kızıl Dev, Yedi Dilli Yılan, Bin Yüzlü Gulyabani, Karabasan, Sis Albastısı, Zifiri Börü, Ateş İfriti, Yeşil Gözlü Ejder, Tavus Şah, Sırça Saray Cini, Dahhâk (son).
- [ ] Her birinin **küçük canavarları** (yardakçıları).
- [ ] Her canavar için hareketler: bekleme, yürüme, saldırı, darbe alma, yenilme.

## 5. Mekanikler
- [x] Savaş altyapısı (`savas.js`): oyuncu canı (seviye + Cevher), düşman yapay zekâsı (yaklaş → hazırlan → saldır → dinlen), kaçınmada dokunulmazlık, sendeleme kuralı, aynı anda tek saldıran, dalgalar, 5. dalgada Kızıl Dev, Seher Çiyi canavarına karşı +%25/çiy, düşme ve yeniden doğma.
- [ ] Düşmanların gerçek görselleri (şu an kodla çizilmiş gölgeler)
- [ ] Karakterin darbe alma / düşme animasyonu (şu an yanıp sönme)
- [ ] Bölge ve seviyeye göre canavar kilidi (Kızıl Dev ancak uygun makamda)
- [x] Seviye (1–100, eğri: ~240 tecrübe/gün ile ~1 yıl) ve 4 güç (Kut, Hikmet, Alp, Cevher) — `defter.js`
- [x] Yıldız Defteri + Seher Çiyi (itiraf da aynı tecrübeyi verir; ayrıca çiy)
- [x] Devamlılık serisi (+%2/gün, en çok +%50; boş gün seriyi yarıya indirir)
- [x] Zikirmatik, günlük giriş ekranı, gizli anahtar (DEFTER başlığına 1,5 sn bas)
- [x] Vuruş gücü seviyeye ve Alp gücüne bağlı (ilk adım)

## 6. Gerçek hayat bağlantıları
- [x] Geçmiş güne giriş (bugün, dün, evvelki gün — daha eskisi dürüstlük ilkesi gereği kapalı)
- [x] Yedekleme: kopyalanabilir yedek kodu + geri yükleme (WebView'de dosya indirme çalışmadığı için)
- [ ] Geçmiş/takvim görünümü, haftalık özet
- [ ] Ayarlar ekranı (ses, titreşim, düğme boyutu, joystick tarafı)
- [ ] Oyun ilerlemesinin kaydı (sınama/dalga)
- [x] **Kitap okuma:** elle sayfa girişi. Ölçü: **10 sayfa = 30 dakika** (Risale-i Nur temposu). Süre tutmaya gerek yok.
- [x] **Adım / yürüyüş — telefonun kendi adım sensörü** (APK 1.6, telefonda denenecek). Ölçü onaylandı: 100 adım = 1 dk. Adımlar `gun[tarih].adimSay` içinde; yedek geri yüklenince adım başlangıç noktası korunur.
  - Bilinen sınır: oyun gece yarısından sonra açılırsa, dünden kalan adımlar bugüne yazılır.
  - Android'in standart `TYPE_STEP_COUNTER` sensörü; ek kütüphane gerekmez, uygulama kapalıyken de sayar.
  - Oyun açılınca "son açılıştan beri atılan adım" Tozkoparan Nalı'na otomatik yazılır. Ölçü önerisi: **100 adım = 1 dakika** (onaylandı).
  - Gerekenler: `ACTIVITY_RECOGNITION` izni (ilk açılışta sorulur), Java kabuk (sensör + WebView'e JavaScript köprüsü).
  - Derleme: Java → `javac` (android-framework.jar'a karşı) → dex için Maven Central'daki `com.jakewharton.android.repackaged:dalvik-dx`. Google Maven bu ortamda kapalı.
  - Sınırlar: telefon yeniden başlarsa sayaç sıfırlanır (son açılış–yeniden başlatma arası kaybolabilir; sayaç küçülürse yeniden başlatma say). Eski Samsung Health kayıtları gelmez.
  - Emülatör yok: ilk deneme kullanıcının telefonunda yapılacak.
- [ ] **Zikir:** kullanıcının kullandığı zikir uygulamasından veri alma. Önce uygulamanın adı öğrenilecek; dışa veri veriyor mu bakılacak. Vermiyorsa: oyun içi zikirmatik ya da elle giriş.
- [ ] Kur'an okuma, kitap dinleme, tesbihat, ahlaki emanetler: elle giriş / Yıldız Defteri.
- [ ] Hatırlatma bildirimleri, namaz vakitleri (en sona).

---

### Teknik notlar
- Animasyon işleme: `animasyon-isle.py` (pembe zemin temizleme, doğal döngü noktası bulma). Ses kesme: `ses-kes.py`.
- APK: `android/build.sh` — anahtar `seyr.p12` repoda **yok**, kullanıcıda.
- Yandan görünümlü (yan ekran) oyun, yüzen joystick, VUR/KAÇIN düğmeleri.
