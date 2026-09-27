# Kadim Kule

Fantastik dünyada geçen, Türk mitolojisinden beslenen, kat kat açılan bir idle
oyun. Telefon için tasarlandı, Türkçe. Tasarım ayrıntıları için
[TASARIM.md](TASARIM.md).

## Çalıştırma

```bash
npm install
npm run dev        # geliştirme sunucusu (telefondan da açılabilir: --host)
npm run build      # tip denetimi + tek dosyalık derleme: dist/index.html
```

`dist/index.html` tek başına çalışır (JS ve CSS içine gömülü). Her yere
kopyalanabilir: GitHub Pages, itch.io ya da doğrudan dosya olarak.
Derleme ayrıca `dist-artifact/kadim-kule.html` üretir; bu, Claude Artifact olarak
yayınlanan sürümdür (başlık, stil ve betik dışındaki iskelet çıkarılmış hali).

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm test` | Birim testleri (Vitest): formüller, alımlar, Hüma, çevrimdışı, kayıt, sayı biçimi |
| `npm run typecheck` | TypeScript denetimi |
| `npm run sim` | Denge simülasyonu: hangi dakikada neyin açıldığını yazdırır |
| `npm run e2e` | Telefon boyutunda Chromium'da duman testi (önce `npm run build`), ekran görüntüleri `e2e/shots/` |
| `npm run icons` | Kullanılan ikonları game-icons setinden `src/ui/icons.gen.ts`'e çıkarır |

## Klasörler

```
src/
  core/     saf oyun mantığı: durum, formüller, eylemler, çevrimdışı, hedefler (DOM yok)
  data/     yaratıklar, parşömenler, katlar, Üstadın Ruhu ipuçları
  save/     kayıt, sürüm denetimi, dışa/içe aktarma
  i18n/     Türkçe sayı ve süre biçimi
  audio/    Web Audio ile üretilen efektler ve Hicaz müziği
  ui/       ekranlar: kristal, yaratıklar, kütüphane, kule; uygulama iskeleti
sim/        denge simülasyonu
tests/      birim testleri
e2e/        tarayıcı duman testi
scripts/    ikon çıkarma, ana ekran simgesi, Artifact dönüştürme
```

Oyun mantığı (`core/`) arayüzden bağımsızdır; simülasyon ve testler aynı kodu
kullanır. Büyük sayılar için `break_infinity.js` kullanılır.

## Denge değerlerini değiştirmek

Yaratık değerleri `src/data/creatures.ts`, parşömenler `src/data/scrolls.ts`,
diğer sabitler `src/core/formulas.ts` içinde. Değiştirdikten sonra
`npm run sim` ile zaman çizelgesine bak.

## Lisanslar

- İkonlar: [game-icons.net](https://game-icons.net), CC BY 3.0
- Yazı tipleri: El Messiri, Alegreya Sans (SIL Open Font License), Google Fonts üzerinden
