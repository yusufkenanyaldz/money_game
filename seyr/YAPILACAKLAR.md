# Seyr — Yapılacaklar

Sıra kullanıcının kararıdır: **önce ana karakter tamamen otursun**, sonra dünya, sonra canavarlar, en son gerçek hayat bağlantıları.
Her adım bitince telefonda denenir, beğenilmeden bir sonrakine geçilmez.

---

## 0. Geçişlerdeki "donma" hissi — DÜZELTİLDİ (APK 1.2), telefonda denenecek
Son denemede (APK 1.1) geçişler yumuşadı ama donma hissi verdi. Muhtemel sebepler:
- [x] Çapraz geçişte **eski poz sabit bir kare** olarak sönüyor → eski hareket de geçiş boyunca oynamaya devam etmeli.
- [x] Yavaşlarken adım animasyonu %45'e kadar düşüyor → ağır çekim gibi; alt sınırı yükselt (~%75), yavaşlamayı kısalt.
- [x] Yumruk başında bekleme pozu sönerken gard pozu geliyor → yumruğa geçiş daha kısa olsun (Grok önerisi: 120 ms), her geçişe ayrı süre.
- [ ] Gerekirse köprü klipler (Grok): koşudan durma, yürümeye ilk adım.

## 1. Ana karakter (1–100. seviye) — ŞU AN BURADAYIZ
10 görünüm (her 10 seviyede bir unvan). Garip hazır.

| Seviye | Unvan | Görsel | Hareketler |
|---|---|---|---|
| 1–9 | Garip | ✅ | ✅ bekleme, yürüme ×2, koşma, ufka yürüyüş, dövüş duruşu, yumruk, kaçınma (+ses) |
| 10–19 | Yolcu | ☐ | ☐ |
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
- [ ] Savaş: can, hasar, isabet, darbe alma, emanetlerin canavarlara karşı gücü.
- [x] Seviye (1–100, eğri: ~240 tecrübe/gün ile ~1 yıl) ve 4 güç (Kut, Hikmet, Alp, Cevher) — `defter.js`
- [x] Yıldız Defteri + Seher Çiyi (itiraf da aynı tecrübeyi verir; ayrıca çiy)
- [x] Devamlılık serisi (+%2/gün, en çok +%50; boş gün seriyi yarıya indirir)
- [x] Zikirmatik, günlük giriş ekranı, gizli anahtar (DEFTER başlığına 1,5 sn bas)
- [x] Vuruş gücü seviyeye ve Alp gücüne bağlı (ilk adım)

## 6. Gerçek hayat bağlantıları
- [x] **Kitap okuma:** elle sayfa girişi. Ölçü: **10 sayfa = 30 dakika** (Risale-i Nur temposu). Süre tutmaya gerek yok.
- [ ] **Adım / yürüyüş:** Android **Health Connect**. ⚠ Not: Health Connect, şu anki basit APK yönteminin yetmediği Android kütüphaneleri gerektirir; bu aşamada derleme düzenini büyütmemiz gerekecek (ya da ilk sürümde elle giriş).
- [ ] **Zikir:** kullanıcının kullandığı zikir uygulamasından veri alma. Önce uygulamanın adı öğrenilecek; dışa veri veriyor mu bakılacak. Vermiyorsa: oyun içi zikirmatik ya da elle giriş.
- [ ] Kur'an okuma, kitap dinleme, tesbihat, ahlaki emanetler: elle giriş / Yıldız Defteri.
- [ ] Hatırlatma bildirimleri, namaz vakitleri (en sona).

---

### Teknik notlar
- Animasyon işleme: `animasyon-isle.py` (pembe zemin temizleme, doğal döngü noktası bulma). Ses kesme: `ses-kes.py`.
- APK: `android/build.sh` — anahtar `seyr.p12` repoda **yok**, kullanıcıda.
- Yandan görünümlü (yan ekran) oyun, yüzen joystick, VUR/KAÇIN düğmeleri.
