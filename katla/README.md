# KATLA — Düşür · Birleştir · Katla

Tek parmakla oynanan, tek dosyalık bir zincir bulmacası. Sütuna dokunursun,
para düşer; **aynı değerdeki paralar birleşir ve ikiye katlanır**. Bir
birleşme yenisini tetikler — zincir uzadıkça puan katlanır.

> **Oyna:** `katla/index.html` dosyasını herhangi bir tarayıcıda aç. Tek dosya,
> bağımlılıksız, **sıfır dış istek**, çevrimdışı çalışır. Telefon, tablet ve
> masaüstünde oynanır. Arayüz **Türkçe/İngilizce**.

---

## Neden bu oyun?

Depodaki *ONE MORE TAP* bir **refleks** oyunu: doğru anda dokunursun. KATLA
kasıtlı olarak onun tersi: **zaman baskısı yok, karar baskısı var.** Hangi
sütuna bırakacağın tek girdi, ama o tek girdi tahtanın tamamını etkiler.
Böylece aynı depoda iki farklı iştah karşılanıyor — biri el, diğeri kafa.

Bağımlılık döngüsü hep aynı üç parçadan kuruluyor:

- **Anında anlaşılan kural.** "Aynı olanlar birleşir" cümlesi yeterli.
- **Değişken ödül.** Bir bırakma bazen hiçbir şey, bazen 7 halkalık zincir
  getirir. Ne zaman patlayacağını bilmemek oynatan şey.
- **Kendi hatan.** Oyun seni hız ile öldürmüyor; tahtayı sen tıkıyorsun. Bu
  yüzden her kayıptan sonra "bir el daha" hissi doğuyor.

## Çekirdek mekanik

1. **Bırak.** Sütuna dokun (ya da yön tuşu + boşluk). Para en alttaki boş
   göze düşer.
2. **Birleş.** Bir taşın **dört komşusundan** aynı değerde olanlar onun
   içine akar. Her komşu bir katlama demek: iki komşu ×4, üç komşu ×8.
3. **Zincir.** Birleşmeden sonra üstteki taşlar düşer; yeni eşleşme doğarsa
   zincir devam eder. Puan = **oluşan değer × zincir sırası**, yani 5.
   halkada aynı taş beş katı yazar.
4. **Yükseliş.** Birkaç bırakmada bir alttan yeni bir sıra iter. Tahtanın
   altındaki ince çubuk ne zaman geleceğini gösterir.
5. **Bitiş.** Yükselen sıra tepeden taşarsa ya da hiçbir sütunda yer kalmazsa
   oyun biter. Rekor kaydedilir.

**Depo:** sıradaki parayı saklar; sonra dokunup geri alırsın. Her bırakmada
bir kez kullanılabilir — panikteyken kaçış, planlıyken kurulum aracı.

**Joker (★):** 3. seviyeden sonra seyrek düşer, **her değerle** birleşir;
komşularının en yükseğini benimser. Tıkalı tahtayı açan koz.

**Tohum kuralı:** Açılış zemini hiçbir zaman hazır birleşme içermez. İlk
zinciri her zaman oyuncu kurar, oyun kendi kendine puan vermez.

## Kontroller

| Girdi | Ne yapar |
|---|---|
| Dokun / tıkla (sürükleyerek nişan alınabilir) | O sütuna bırakır |
| ← → | Nişanı kaydırır |
| Boşluk / ↓ / Enter | Bırakır |
| 1–5 | Doğrudan o sütuna bırakır |
| D / Shift | Depo ile değiştirir |
| P / Esc | Duraklatır |
| M | Sesi açar/kapatır |

## "Juice" — geri bildirim katmanı

| Teknik | Ne yapar |
|---|---|
| **Hit-stop** | Birleşmede oyun 45–70 ms donar; darbeye ağırlık verir |
| **Ekran sarsıntısı** | Zincir uzadıkça sertleşir |
| **Emme animasyonu** | Komşular tohum taşa doğru küçülerek akar |
| **Şok halkası + parçacık** | Her birleşmede merkezden dalga ve altın saçılır |
| **Ezilme/yaylanma** | Düşen taş çarpınca yassılır, birleşen taş şişer |
| **Prosedürel ses** | WebAudio ile yükselen pentatonik zincir merdiveni (dosya yok) |
| **Haptik titreşim** | Mobilde `navigator.vibrate`, zincirde ritmik desen |
| **Kayan yazılar** | `+₺128`, `ZİNCİR x4`, `SEVİYE 3` doğuş sıçramasıyla |
| **Tehlike nabzı** | Tepeye yaklaşınca tahta kenarı kırmızı atar |
| **Rekor kutlaması** | Yeni rekorda altın yağmuru + fanfar |

Ses ve titreşim, tarayıcı politikası gereği **ilk dokunuşta** etkinleşir.

## Teknik

- **Tek dosya**, ~50 KB, bağımlılık ve dış istek yok. Font sistem yazı tipi
  yığınından gelir, gömülü font taşımaz.
- Tahta `<canvas>` üzerinde çizilir (DPR'e göre ölçeklenir); skor, depo ve
  bindirmeler DOM'dur. Düşme gerçek ivmeyle canlanır, kare kilidi yoktur.
- Durum makinesi: `menu → idle → falling → resolve → idle … → over`.
  `resolve` turu birleşme kalmayana kadar döner; 20 saniyelik bir emniyet
  supabı turun kilitlenmesini imkânsız kılar.
- Rekor, dil ve ses tercihi `localStorage`'ta; **erişilemezse oyun çökmez**,
  yalnızca kayıt tutmaz (iframe/üçüncü taraf depolama engeli senaryosu).
- Sekme arkaya atılınca oyun kendini duraklatır.

## Kendi kendini sınama

`katla/index.html?test=1` adresini aç: birleşme seçimi, yerçekimi, joker
kuralı, para biçimi ve gerçek bir bırakma turu için **24 doğrulama** çalışır,
sonuç ekrana ve `document.title`'a yazılır. Başsız tarayıcıdan da okunabilir:

```js
// Playwright
await page.goto('file:///.../katla/index.html?test=1');
const r = await page.evaluate(() => window.__KATLA_TEST_RESULT);  // {ok, fail, lines}
```

Oynanış otomasyonu için `window.__KATLA` açıktır: `reset()`, `drop(c)`,
`swapHold()` ve canlı durum `G`.

## itch.io paketi

Zip'in kökünde `index.html` olmalı:

```bash
zip -j -9 katla-itch.zip katla/index.html
```

Viewport **540 × 860** (dikey), *Fullscreen button* açık — iframe içinde
depolama üçüncü taraf sayıldığında rekorun silinmemesi için.

---
_KATLA — düşür, birleştir, katla._
