# Kadim Kule — Oyun Tasarım Belgesi (v0.2)

> Fantastik dünyada geçen, Türk mitolojisinden beslenen, katman katman açılan,
> uzun soluklu, telefon öncelikli, Türkçe bir idle oyun.
>
> **Durum:** Faz 1 bitti ve oynanabilir (Kat 1–3). Bu belge yapılan oyunu ve
> sonraki fazların planını anlatır.

---

## 1. Özet

Harabeye dönmüş kadim bir büyücü kulesinin son çırağısın. Kulenin kalbindeki
sönmüş **Mana Kristali**'ne dokunarak onu yeniden uyandırırsın. Oyun açıldığında
kristal gri ve sönüktür; dokundukça rengi ve ışığı geri gelir. Topladığın manayla
yaratıklar çağırırsın. Yaratıklar senin yerine mana üretir. Kuleyi **kat kat**
yeniden açtıkça yeni sistemler gelir.

- **Katmanlı yapı = kulenin katları.** Her kat yeni bir sistem açar. "Kule"
  sekmesi kulenin kat kat görselini gösterir.
- **Önce dokunma, sonra idle.** İlk 1,5–3 dakika yalnızca dokunarak geçer.
  Çağırma Çemberi onarılınca yaratıklar gelir, oyun kendi kendine akmaya başlar.
- **Hep görünür bir sonraki hedef.** Üstteki hedef çubuğu her an ne yapılacağını
  söyler.
- **Rehber:** Üstadın Ruhu, kısa konuşma balonlarıyla yol gösterir.
- **Reklam ve satın alma yok.**

### Mitoloji tonu
Klasik fantastik ile Türk mitolojisi karışık: peri, cüce, elf ve ejderhanın
yanında Su İyesi, Bozkurt (Asena), Tulpar, Şahmeran, Zümrüdüanka ve talih
getiren **Hüma Kuşu**. Kütüphanede Orhun Yazıtları, Dede Korkut'un Kitabı ve
Uluğ Bey'in Yıldız Cetveli; dokunuşu güçlendiren telin adı **Kopuz**.

---

## 2. Kule Katları

| Kat | Adı | Açtığı sistem | Açılma koşulu | Aktif oyuncu (simülasyon) | Durum |
|---|---|---|---|---|---|
| 1 | Kristal Odası | Dokunarak mana | Baştan açık | 0. dk | ✅ Faz 1 |
| 2 | Çağırma Çemberi | Yaratıklar, **IDLE başlar** | Çemberi onar: 2.500 mana | ~1,5–3. dk | ✅ Faz 1 |
| 3 | Kütüphane | Parşömenler | 10 Cüce Madenci (enkazı kazarlar) | ~7. dk | ✅ Faz 1 |
| 4 | Büyü Salonu | Aktif büyüler | İlk Taş Golem | ~30. dk | Faz 2 |
| 5 | Rasathane | **Prestij 1: Yıldız Ayini** | Bu turda 1 Milyar mana | ~55. dk | Faz 2 |
| 6 | Portal | Seferler, Artefaktlar | 5. Yıldız Ayini | 1–3. gün | Faz 3 |
| 7 | Kadim Sunak | **Prestij 2: Kadim Uyanış** | Yıldız Tozu eşiği | 1–2. hafta | Faz 4 |

Mühürlü katlar Kule sekmesinde görünür ama adları gizlidir.

---

## 3. Kat 1 — Kristal Odası (dokunma evresi)

- Her dokunuş **1 mana**. Birden çok parmakla dokunmak sayılır.
- **Kristali Parlat:** dokunuşa +1 mana. Maliyet 15 × 1,6ⁿ.
- **Kritik dokunuş:** %5 şansla ×10, altın renkli sayı ve kıvılcımlar çıkar.
- Hızlı art arda dokunmak kristal çanının ezgisini yukarı tırmandırır; ara
  verince başa döner.
- **Hedef:** Çağırma Çemberini onar (2.500 mana).

Geçiş keskin değil. Çember açıldıktan sonra ilk birkaç dakika gelirin çoğu yine
dokunuştan gelir, sonra yaratıklar öne geçer. **Kopuz Telleri** (Kütüphane)
her dokunuşa saniyelik üretimin bir yüzdesini eklediği için dokunmak oyunun
sonuna kadar anlamlı kalır.

**Hüma Kuşu:** Çember onarıldıktan sonra 1,5–4 dakikada bir, 12 saniyeliğine
ekrandan süzülerek geçer. Yakalayana:
- %50 **Hüma'nın Gölgesi:** 30 sn boyunca üretim ×7
- %35 **Hüma'nın Armağanı:** 10 dakikalık üretim kadar mana
- %15 **Tüy Fırtınası:** 20 sn boyunca dokunuş ×10, kritik şansı +%25

---

## 4. Kat 2 — Çağırma Çemberi

| # | Yaratık | Taban maliyet | Taban üretim (mana/sn) |
|---|---|---|---|
| 1 | Peri | 50 | 1 |
| 2 | Cüce Madenci | 600 | 6 |
| 3 | Su İyesi | 7.000 | 35 |
| 4 | Orman Elfi | 80.000 | 200 |
| 5 | Bozkurt | 1 Mn | 1.200 |
| 6 | Taş Golem | 13 Mn | 7.000 |
| 7 | Tulpar | 170 Mn | 40.000 |
| 8 | Şahmeran | 2,2 Mr | 230.000 |
| 9 | Zümrüdüanka | 30 Mr | 1,3 Mn |
| 10 | Kadim Ejderha | 400 Mr | 7,5 Mn |

- **Maliyet artışı:** her alımda ×1,15.
- **Geri ödeme süresi** her kademede ~2 kat uzar (Peri 50 sn, Ejderha ~15 saat).
  Bu, yeni yaratıkları heyecanlı, eskileri yine de değerli tutar.
- **Toplu alım:** ×1 / ×10 / ×25 / MAKS.
- **Eşikler:** bir türden 10, 25, 50, 100, 150, 200, 250, 300, 400, 500 … 1000
  adede ulaşınca o türün üretimi ×2.
- **Uyum:** her türden en az 25, 50, 100, 150, 200, 300, 400, 500 → tüm üretim ×2.
- Kartlarda: tanesi ve toplam üretim, toplam içindeki pay, sıradaki eşik
  çubuğu ve paran yetmiyorsa "≈ 3 dk" gibi bekleme süresi.

### Çevrimdışı kazanç
Oyun kapalıyken (ya da 60 saniyeden uzun arka planda) yaratıklar çalışmaya devam
eder. Başta en fazla **2 saat**, **%50 verim**. Dönüşte "Hoş geldin, çırak!"
penceresi toplananı gösterir. Hüma etkileri çevrimdışı sürmez.

---

## 5. Kat 3 — Kütüphane (Parşömenler)

Tek seferlik, kalıcı yükseltmeler. Koşulu sağlanınca rafta belirir.

- **Türe özel (her tür için 3):** 10 adette ×2, 50 adette ×2, 100 adette ×3.
  Örn. Peri Tozu, Asena'nın İzi, Ergenekon Yolu, Lokman'ın Defteri, İlk Ateş.
- **Genel (tüm üretim ×2):** Üstadın Notları, Orhun Yazıtları, Uluğ Bey'in
  Yıldız Cetveli, Dede Korkut'un Kitabı, Divânu Lugâti't-Türk.
- **Kopuz Telleri (5 tel):** her dokunuş saniyelik üretimin %2 / %3 / %5 / %5 /
  %5'i kadar ek mana verir (toplam %20).
- **Dokunuş:** Keskin Kristal ×2, Kristal Kalp ×3, Gök Taşı ×3; Parlak Göz
  (kritik şansı +%5), Şimşek Dokunuşu (kritik ×2).
- **Çevrimdışı:** Uyku Ninnisi (verim +%25), Rüya Kapısı (+4 saat), Derin Uyku
  (+6 saat).
- **Hüma:** Hüma Tüyü (daha sık gelir), Talih Kuşu (etkiler %50 uzun).

---

## 6. Denge (simülasyonla ayarlandı)

`npm run sim` akıllı oynayan bir oyuncuyu taklit eder: her an "bekleme süresi +
geri ödeme süresi" en kısa olan alımı yapar. Hüma hesaba katılmaz, yani gerçek
oyuncu biraz daha hızlıdır.

**Aktif oyuncu** (ilk 5 dk saniyede 3,5, sonra giderek azalan dokunuş):

| Olay | Süre |
|---|---|
| Çağırma Çemberi | 1 dk 31 sn |
| Kütüphane | 6 dk 49 sn |
| İlk Taş Golem | 30 dk |
| Bu turda 1 Milyar mana (ilk prestij koşulu) | 54 dk |
| İlk Kadim Ejderha | 3 sa 52 dk |

Dokunuşun gelirdeki payı: 5. dk %32, 15. dk %17, 1. saat %22 (Kopuz sayesinde).

**Rahat oyuncu** (ilk 20 dk oyunda, sonra 3 saatte bir 5 dk): Taş Golem ~3 saat,
1 Milyar ~6 saat, Kadim Ejderha ~15 saat, ilk Uyum ~1 gün.

### Formüller
- **Yaratık maliyeti:** taban × 1,15^adet; k adet: taban × 1,15^adet × (1,15^k − 1) / 0,15
- **Üretim:** adet × taban üretim × 2^(eşik) × parşömen × 2^(uyum) × genel parşömen × Hüma
- **Dokunuş:** (1 + parlatma seviyesi) × dokunuş parşömenleri + mana/sn × Kopuz % ; kritikte × kritik çarpanı
- **Çevrimdışı:** min(geçen süre, sınır) × mana/sn × verim

---

## 7. Ses ve müzik

Ses dosyası yok; her şey Web Audio ile tarayıcıda üretilir.
- **Kristal çanı:** uyumsuz kısmi seslerle parlak bir çan. Hızlı dokunuşlar re
  pentatonik dizide yukarı tırmanır; kritikte parlak bir akor çalar.
- **Alım, parşömen (sayfa hışırtısı), eşik, kat açılışı, Hüma** için ayrı sesler.
- **Müzik:** re perdesinde alçak bir dem sesi üstünde, **Hicaz makamında** saz
  benzeri tel sesleri (Karplus-Strong sentezi). Ezgi rastgele ama durak
  perdesine dönen cümlelerle gezinir; hiç tekrar etmez.
- Ayarlar: ses efektleri, müzik, ses düzeyi, titreşim (Android). Üstteki düğme
  hepsini tek dokunuşla susturur. Sayfa arka plana geçince ses durur.

---

## 8. Telefon arayüzü

- Dikey ekran, tek elle kullanım, en az 44 px dokunma alanları.
- **Üst çubuk:** mana, mana/sn, dokunuş değeri, etkin Hüma etkileri, ses düğmesi.
- **Hedef çubuğu**, altında içerik, en altta **sekmeler:** Kristal · Yaratıklar ·
  Kütüphane · Kule. Sekmeler açıldıkça belirir ve "Yeni" rozeti taşır;
  Kütüphanede okunabilecek parşömen varsa kırmızı nokta çıkar.
- **Görsel dil:** gece göğü ve İznik çinisi renkleri: kobalt, turkuaz (mana),
  altın (maliyet, Hüma), mercan (kritik). Kristalin arkasında dönen Selçuklu
  yıldızı. Arka planda parıldayan yıldızlar ve yükselen mana zerreleri.
- **Yazı tipleri:** El Messiri (başlıklar ve sayılar), Alegreya Sans (metin).
- **İkonlar:** game-icons.net (CC BY 3.0), her yaratık kendi renginde madalyonda.
- **Sayılar:** milyonun altı tam yazılır (2.500), üstü Mn, Mr, Tn, Kd, Kn, Sk,
  Sp, Ok, Nn, Dc; sonra bilimsel. Ayarlardan her zaman bilimsel seçilebilir.
- **Ana ekrana ekleme:** simge ve tam ekran açılış hazır. Çevrimdışı çalışma
  (service worker) oyun kalıcı bir adrese konunca eklenecek.

---

## 9. Kayıt

- Tarayıcıda otomatik: 10 saniyede bir, alımlardan sonra ve sayfa arka plana
  geçince.
- Sürüm numaralı; bozuk ya da eksik alanlar varsayılana döner, daha yeni sürümün
  kaydı reddedilir.
- **Dışa / içe aktarma:** `KADIMKULE1:` ile başlayan metin. Başka cihaza taşımak
  için.
- **Sıfırlama:** iki adımlı onayla.

---

## 10. Sonraki fazlar

### Faz 2 — Kat 4–5
- **Büyü Salonu:** Umay'ın Lütfu (üretim ×5, 30 sn), Altın Dokunuş, Zaman
  Bükümü (anında 15 dk üretim), Yıldız Yağmuru. Bekleme süreli, seviye atlar.
- **Başarımlar:** her biri kalıcı +%1 üretim.
- **Yıldız Ayini (prestij 1):** Yıldız Tozu ≈ ⌊10 × √(bu turdaki mana / 1 Mr)⌋.
  Kazanılan her toz kalıcı +%2 üretim; harcamak bu bonusu azaltmaz.
- **Takımyıldız Haritası:** üç dal. **Ülgen** (ışık, üretim), **Erlik**
  (gölge, otomasyon: otomatik çağırma, otomatik parşömen, Kristal Muhafızı ile
  otomatik dokunuş), **Umay** (zaman: çevrimdışı süre ve verim, büyü bekleme
  süreleri, hızlı başlangıç).

### Faz 3 — Kat 6: Portal
Seferler (15 dk / 1 sa / 4 sa / 12 sa) ve Artefaktlar. Diyarlar: Fısıltı
Ormanı, Kaf Dağı, Ergenekon, Buz Tahtı, Erlik'in Yeraltı Ülkesi.

### Faz 4 — Kat 7: Kadim Uyanış
Kadim Rünler, 2. kademe yaratıklar (Tepegöz, Yelbegen, Buz Devi, Kraken,
Yıldız Balinası), Rün Yuvaları, Sınavlar.

---

## 11. Teknik yapı

Bkz. [README.md](README.md).
