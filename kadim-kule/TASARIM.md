# Kadim Kule — Oyun Tasarım Belgesi (taslak v0.1)

> Çalışma adı. Fantastik dünyada geçen, katman katman açılan, uzun soluklu,
> telefon öncelikli, Türkçe bir idle oyun.

---

## 1. Özet

Harabeye dönmüş kadim bir büyücü kulesinin son çırağısın. Kulenin kalbindeki
sönmüş **Mana Kristali**'ne dokunarak onu yeniden uyandırırsın. Topladığın
manayla yaratıklar çağırırsın. Yaratıklar senin yerine mana üretir. Kuleyi
**kat kat** yeniden açtıkça yeni mekanikler gelir.

- **Katmanlı yapı = kulenin katları.** Her yeni kat yeni bir sistem açar. Oyuncu
  ilerlemesini kulenin yükselmesi olarak görür.
- **Önce dokunma, sonra idle.** İlk birkaç dakika yalnızca kristale
  dokunursun. Çağırma Çemberi onarılınca yaratıklar gelir ve oyun kendi kendine
  akmaya başlar.
- **Hep görünür bir sonraki hedef.** Ekranın üstünde her zaman "sıradaki
  hedef" çubuğu durur. Katmanlı oyunlar oyuncuyu kaybetmemek için buna muhtaçtır.
- **Reklam ve satın alma yok** (varsayım).

---

## 2. Kule Katları (katman haritası)

| Kat | Adı | Açtığı sistem | Açılma koşulu (taslak) | Hedef zaman |
|---|---|---|---|---|
| 1 | Kristal Odası | Dokunarak mana toplama | Baştan açık | 0. dk |
| 2 | Çağırma Çemberi | Yaratıklar → **IDLE başlar** | Çemberi onar: 250 mana | ~3. dk |
| 3 | Kütüphane | Parşömenler (tek seferlik yükseltmeler) | 10 Peri | ~10–15. dk |
| 4 | Büyü Salonu | Aktif büyüler (bekleme süreli) | 1 Taş Golem | ~30. dk |
| 5 | Rasathane | **Prestij 1: Yıldız Ayini** + Takımyıldız Haritası | Bu turda 1 Milyar mana | ~60–90. dk |
| 6 | Portal | Seferler + Artefaktlar | 5. Yıldız Ayini | 1–3. gün |
| 7 | Kadim Sunak | **Prestij 2: Kadim Uyanış** + Rünler + Sınavlar | Yıldız Tozu eşiği | 1–2. hafta |
| 8+ | ??? | İleride (ör. Ejderha Yuvası, Tanrılar Meclisi) | — | — |

Kilitli katlar arayüzde **siluet ve "???"** olarak görünür. Oyuncu ileride bir
şey olduğunu bilir ama ne olduğunu bilmez. Bu merak unsuru.

Yukarıdaki süreler çevrimdışı zaman dahil **hedeflerdir**. Gerçek sayılar denge
simülasyonuyla bu hedeflere oturtulacak (bkz. §9).

---

## 3. Kat 1 — Kristal Odası (dokunma evresi)

- Kristale her dokunuş **1 mana** verir. Birden çok parmakla dokunmak sayılır.
- **Kristali Parlat** yükseltmesi: dokunuş gücü +1. Maliyet 10 × 1,6ⁿ.
- **Kritik dokunuş:** %5 şansla ×10 mana, ekranda parlama efekti.
- **Hedef çubuğu:** "Çağırma Çemberini onar — 250 mana". Dolunca Kat 2 açılır.
- Rehber karakter **Üstadın Ruhu** kısa konuşma balonlarıyla yol gösterir
  ("Kristale dokun, çırak…"). Uzun anlatım yok, her adımda bir cümle.

**Geçiş keskin değil.** Periler geldikten sonra da ilk 10–15 dakika kazancın
çoğu dokunmadan gelir. Sonra yaratıklar yavaşça öne geçer ve oyun "idle" hâle
gelir. Dokunma sonra da anlamlı kalır (bkz. Rezonans, §5).

**Rastlantılar:** Ekranda ara sıra süzülen bir **Altın Kelebek** belirir.
Dokunana kısa süreli bonus verir. Aktif oyuncuyu ödüllendirir, idle oyuncuyu
cezalandırmaz.

---

## 4. Kat 2 — Çağırma Çemberi (idle başlar)

### Yaratıklar (1. kademe, 10 tür)

| # | Yaratık | Taban maliyet | Taban üretim (mana/sn) | Renk teması |
|---|---|---|---|---|
| 1 | Peri | 15 | 0,5 | pembe |
| 2 | Cüce Madenci | 180 | 4 | bakır/turuncu |
| 3 | Orman Elfi | 2,2 B | 32 | yeşil |
| 4 | Cin | 26 B | 256 | mor duman |
| 5 | Taş Golem | 310 B | 2 B | taş grisi |
| 6 | Grifon | 3,7 Mn | 16 B | altın |
| 7 | Tulpar (kanatlı at) | 45 Mn | 131 B | gök mavisi |
| 8 | Şahmeran | 540 Mn | 1 Mn | zümrüt |
| 9 | Zümrüdüanka | 6,5 Mr | 8,4 Mn | ateş kırmızısı |
| 10 | Kadim Ejderha | 78 Mr | 67 Mn | obsidyen/kızıl |

(B = bin, Mn = milyon, Mr = milyar. Başlangıç değerleri: maliyet ×12,
üretim ×8 artar. Simülasyonla ayarlanacak.)

### Kurallar
- **Maliyet artışı:** her alımda ×1,12 (türe göre 1,10–1,15 arası).
- **Toplu alım:** ×1 / ×10 / ×25 / MAKS düğmeleri. Telefonda şart.
- **Eşik bonusları:** bir türden 10, 25, 50, 100, 150, 200, 250, 300, 400, 500
  adede ulaşınca o türün üretimi ×2. Kartta "sıradaki eşik" ilerleme çubuğu olur.
- **Uyum bonusu:** her türden en az 25 → tüm üretim ×2 (50, 100… için de).
- **Çevrimdışı kazanç** bu katla açılır: başta en fazla 2 saat, %50 verim.
  Takımyıldız Haritası ile 24 saat ve %100'e kadar çıkar. Dönüşte bir özet
  penceresi açılır: "Sen yokken periler 1,2 Mn mana topladı."

---

## 5. Kat 3 — Kütüphane (Parşömenler)

Manayla alınan tek seferlik yükseltmeler. Koşulu sağlanınca rafta belirirler.

- **Türe özel:** "Peri Tozu — Periler ×3", "Cüce Kazmaları — Cüceler ×3"… Her
  tür için birkaç kademe olur.
- **Genel:** "Kadim Metin — tüm üretim ×2".
- **Rezonans I–V:** her dokunuş ek olarak mana/sn'nin %1 / %2 / %3 / %5 / %8'i
  kadar mana verir. Böylece dokunma oyunun sonuna kadar anlamlı kalır.
- **Kristal:** dokunuş gücü ve kritik şans yükseltmeleri.

---

## 6. Kat 4 — Büyü Salonu (aktif büyüler)

Telefonda kısa oturumlar için tasarlandı: gir, büyüleri at, çık. Hepsi
bekleme süreli. Enerji sistemi yok.

| Büyü | Etki (taslak) | Bekleme |
|---|---|---|
| Mana Seli | 30 sn boyunca üretim ×5 | 5 dk |
| Altın Dokunuş | 20 sn boyunca dokunuş ×10, kritik şans %50 | 3 dk |
| Zaman Bükümü | Anında 15 dakikalık üretim | 30 dk |
| Yıldız Yağmuru | 30 sn boyunca düşen yıldızlara dokun, her biri bonus mana | 10 dk |

Büyüler manayla seviye atlar (süre ve etki artar).

---

## 7. Kat 5 — Rasathane (Prestij 1: Yıldız Ayini)

- **Koşul:** bu turda toplam 1 Milyar mana.
- **Kazanç:** Yıldız Tozu ≈ ⌊10 × √(bu turdaki mana / 1 Milyar)⌋. Ekranda
  canlı gösterilir: "Şimdi ayin yaparsan +37 Yıldız Tozu".
- **Sıfırlananlar:** mana, yaratıklar, parşömenler, büyü seviyeleri.
- **Kalanlar:** Yıldız Tozu, Takımyıldız Haritası, başarımlar, açılmış katlar.
- **Pasif bonus:** toplamda kazanılmış her Yıldız Tozu kalıcı olarak +%2
  üretim verir. Tozu harcamak bu bonusu **azaltmaz**. Böylece "harcasam mı,
  biriktirsem mi" diye kötü hissettiren bir ikilem olmaz.

### Takımyıldız Haritası (yetenek ağacı, ~25 düğüm, 3 dal)
- **Işık (üretim):** tüm üretim çarpanları, eşik bonuslarının güçlenmesi.
- **Gölge (otomasyon):** yaratıkları tür tür otomatik alma, parşömenleri
  otomatik alma, **Kristal Muhafızı** (saniyede otomatik dokunuş), en sonda
  otomatik ayin. *Oyun asıl idle hâline burada kavuşur.*
- **Zaman:** çevrimdışı süre ve verimi, büyü bekleme süreleri, ayinden sonra
  hızlı başlangıç ("10 Peri ile başla").

---

## 8. Sonraki katlar (Faz 3–4, ana hatlarıyla)

### Kat 6 — Portal: Seferler ve Artefaktlar
- 3 sefer yuvası. Diyar ve süre seçilir (15 dk / 1 sa / 4 sa / 12 sa).
- Diyarlar: Fısıltı Ormanı, Cüce Dağları, Kum Denizi, Buz Tahtı, Gölge Diyarı.
- Dönüşte **Artefakt parçaları** ve Yıldız Tozu gelir. Artefaktlar kalıcı
  bonuslardır, parça toplayarak seviye atlarlar ve ayinlerde sıfırlanmazlar.
- Telefonda "şu saatte geri dön" döngüsü yaratır.

### Kat 7 — Kadim Sunak: Kadim Uyanış (Prestij 2)
- Yıldız Tozu, harita ve 1. katmandaki her şey sıfırlanır. Karşılığında
  **Kadim Rün** kazanılır. Artefaktlar kalır.
- Rünlerle açılanlar:
  - **2. kademe yaratıklar** (11–15): Tepegöz, Buz Devi, Kraken, Lav Titanı,
    Yıldız Balinası.
  - **Rün Yuvaları:** seçilebilen güçlü pasifler (oyun tarzına göre kurulum).
  - **Sınavlar:** kısıtlı turlar ("Dokunmak yasak", "Yalnızca 3 tür yaratık",
    "Büyü yok"). Tamamlayınca kalıcı ödül verir.

### Başarımlar (her evrede)
Her başarım kalıcı olarak +%1 üretim verir. Toplama ve keşif hissi için.

---

## 9. Denge ve formüller

- **Yaratık maliyeti:** taban × r^adet
- **k adet toplu alım:** taban × r^adet × (r^k − 1) / (r − 1)
- **MAKS alım:** k = ⌊ log( mana × (r − 1) / (taban × r^adet) + 1 ) / log r ⌋
- **Üretim (tür başına):** adet × taban üretim × 2^(eşik sayısı) × parşömen
  çarpanları × uyum × (1 + 0,02 × toplam Yıldız Tozu) × artefakt × büyü
- **Dokunuş:** (dokunuş gücü + mana/sn × rezonans %) × kritik
- **Çevrimdışı:** min(geçen süre, sınır) × mana/sn × verim

**Denge simülasyonu:** Node'da çalışan bir betik, akıllı oynayan bir oyuncuyu
taklit eder (her an en verimli alımı yapar; "aktif" profilde saniyede 5
dokunuş, "idle" profilde günde birkaç kez uğrar). Hangi dakikada hangi katın
açıldığını çıkarır ve §2'deki hedef tablosuyla karşılaştırır. Sayıları buna
göre ayarlarız. Her faz sonunda yeniden çalıştırılır.

---

## 10. Telefon arayüzü

- **Dikey ekran, tek elle kullanım.**
- **Üst çubuk:** mana miktarı, mana/sn, sıradaki hedef çubuğu.
- **Orta:** parlayan, nabız gibi atan kristal. Dokununca yukarı uçan "+12"
  sayıları ve parçacıklar çıkar. Android'de titreşim.
- **Alt sekme çubuğu:** Kristal · Yaratıklar · Kütüphane · Büyüler · Kule.
  Sekmeler açıldıkça belirir ve "Yeni!" rozeti taşır. "Kule" sekmesi kulenin
  kat kat görselini gösterir ve Rasathane, Portal, Sunak, Başarımlar ve
  Ayarlar'a buradan gidilir.
- **Görsel dil:** gece mavisi ve mor gradyan arka plan, yıldızlar. Her yaratık
  kendi renginde bir kartta durur.
- **İkonlar:** game-icons.net SVG seti (4000+ fantastik ikon, CC BY 3.0,
  "Emeği Geçenler" ekranında yazarları anılır). CSS ile renkli gradyanlarla
  boyanır. Emoji kullanmıyoruz, çünkü her telefonda farklı görünüyor.
- **Dokunma ergonomisi:** en az 44 px dokunma alanı, çift dokunmada yakınlaştırma
  kapalı, çentikli ekranlar için güvenli alan payı.
- **Ana ekrana eklenebilir (PWA):** uygulama gibi tam ekran açılır, internetsiz
  çalışır.

### Sayı gösterimi (Türkçe)
- Ondalık ayırıcı virgül: 1,5 Mn.
- Kısaltmalar: B (bin), Mn (milyon), Mr (milyar), Tn (trilyon), Kd (katrilyon),
  Kn (kentilyon) … desilyona kadar. Sonrasında bilimsel gösterim (1,23e45).
  Ayarlardan her zaman bilimsel gösterim de seçilebilir.

---

## 11. Teknik yapı

- **Vite + TypeScript**, framework yok.
- **break_infinity.js** (büyük sayı kütüphanesi) baştan kullanılır. Uzun
  soluklu katmanlı bir oyunda sayılar 1e308'i geçecek. Sonradan geçiş yapmak
  çok zahmetli olur.
- **Oyun döngüsü:** mantık saniyede 10 sabit adım, çizim
  `requestAnimationFrame` ile. Telefon sekmeyi uyutursa dönüşte geçen süre bir
  kerede hesaplanır.
- **Kayıt:** `localStorage`. Her 10 saniyede bir ve uygulama arka plana
  atıldığında kaydeder (telefonda sayfa her an kapatılabilir). Kayıtlar sürüm
  numaralıdır ve eski kayıtları yeni formata çeviren adımlar vardır. Kaydı
  metin olarak dışa ve içe aktarmak mümkündür.
- **Türkçe:** tüm metinler tek dosyada. Büyük harf dönüşümünde `tr-TR` yerel
  ayarı kullanılır (i → İ, ı → I).
- **Ses:** ilk sürümde yok. İstenirse dosya gerektirmeyen, WebAudio ile
  sentezlenmiş basit efektler eklenir.
- **Test:** Vitest (formüller, kayıt, çevrimdışı hesap). Playwright ile telefon
  boyutunda gerçek tarayıcıda dokunma akışı ve ekran görüntüleri.

```
kadim-kule/
  src/
    core/     # saf oyun mantığı: durum, formüller, adım, prestij (DOM yok)
    data/     # yaratık, parşömen, büyü tanımları (tablo hâlinde)
    ui/       # ekranlar ve bileşenler
    save/     # kayıt, sürüm geçişleri, çevrimdışı hesap
    i18n/     # Türkçe metinler, sayı biçimlendirme
  sim/        # denge simülasyonu
  tests/
```

---

## 12. Yol haritası

| Faz | İçerik | Sonuç |
|---|---|---|
| 0 | Bu belge, onay | ← şu an |
| 1 | Kat 1–3: dokunma, 10 yaratık, Kütüphane, kayıt ve çevrimdışı kazanç, Türkçe sayılar, telefon arayüzü, PWA | İlk oynanabilir sürüm, telefondan oynanabilir link |
| 2 | Kat 4–5: büyüler, başarımlar, Yıldız Ayini, Takımyıldız Haritası, otomasyon | İlk prestij döngüsü |
| 3 | Kat 6: Portal, seferler, artefaktlar | Günlük uğrama döngüsü |
| 4 | Kat 7: Kadim Uyanış, rünler, 2. kademe yaratıklar, sınavlar | Uzun vadeli oyun sonu |

Her fazın sonunda simülasyon ve testler çalıştırılır, telefon ekranında
denenir ve sana oynanabilir bir link verilir.

---

## 13. Açık sorular

1. **İsim:** "Kadim Kule" uygun mu?
2. **Mitoloji tonu:** Şu an klasik fantastik (peri, cüce, elf, ejderha) ile Türk
   mitolojisi (Tulpar, Şahmeran, Zümrüdüanka, Tepegöz) karışık. Bu karışım mı
   kalsın, tek yöne mi çekelim?
3. **Tempo:** İlk prestijin ~1–1,5 saatte gelmesi uygun mu? Daha hızlı ya da
   daha yavaş mı olsun?
4. **Ses:** Basit sentezlenmiş efektler ister misin?
