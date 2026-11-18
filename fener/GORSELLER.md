# Son Fener — Görsel Üretim Rehberi

Bu dosyadaki komutları bir resim yapay zekasına (Midjourney, ChatGPT/DALL·E, Leonardo, Scenario…) ver,
çıkan görselleri `fener/assets/` klasörüne aşağıdaki **dosya adlarıyla** koy (ya da sohbete yükle). Gerisini ben bağlarım.

## Altın kurallar

1. **Hepsini aynı oturumda, aynı stil cümlesiyle üret.** Tutarlılık her şeyden önemli.
   - Midjourney: ilk beğendiğin görselin linkini sonrakilere `--sref <link>` ile ekle.
   - Leonardo / Scenario: bir "stil" ya da "model" oluşturup hepsini onunla üret.
   - ChatGPT: hepsini aynı sohbette iste, "aynı tarzda devam et" de.
2. **Arka plan şeffaf olsun** (PNG). Araç şeffaf veremiyorsa düz siyah arka planla üret,
   sonra ücretsiz bir arka plan silme aracıyla (ör. remove.bg) temizle.
3. **Yazı isteme.** Yapay zekalar Türkçe harfleri ve rünleri bozuk yazar. Yazıları ve rün işaretlerini ben kodla eklerim.
4. **Küçük boyutta okunmalı.** Binalar oyunda ~50 piksel görünecek: sade, güçlü siluet, az detay.
5. Boyut: 1024×1024 üret, ben küçültürüm.

## Stil cümlesi (her komutun sonuna ekle)

```
dark fantasy, hand-painted game asset, painterly, muted desaturated colors, deep shadows, warm amber candlelight accents, 3/4 top-down view, single object centered, clean strong silhouette, readable at small size, no text, transparent background
```

---

## 1. Fener — `fener.png`
Oyunun merkezi. Ekranın ortasında, yerde duruyor.
```
an old wrought-iron lantern standing on the ground, four glass panes, a single small warm flame inside, soot-stained metal, ring handle on top, glowing softly
```

## 2. Yerler (9 adet)
Her biri hem **yanıyor** hem **sönmüş** hâlde gösteriliyor; sönmüş hâlini ben koddan üretirim, sadece yanan hâlini iste.
Pencereler/ışık kaynakları amber renkte hafif parlasın.

| Dosya | Komut |
|---|---|
| `yer-1-kulube.png` | `a small abandoned wooden hut with a crooked stone chimney, one glowing window, firewood pile beside it` |
| `yer-2-kuyu.png` | `an old stone well with a tiny wooden roof and a rope bucket, moss on the stones, a faint lantern hanging from the beam` |
| `yer-3-mezarlik.png` | `a small old graveyard, three leaning tombstones and a wooden cross, freshly dug earth, a single candle burning on a grave` |
| `yer-4-degirmen.png` | `a lonely old windmill with torn sail blades, weathered wood and stone base, one lit window` |
| `yer-5-maden.png` | `a mine entrance carved into a rocky hill, wooden support beams, a minecart, a lantern at the dark tunnel mouth` |
| `yer-6-manastir.png` | `a small ruined stone monastery with a bell tower, gothic arched windows glowing with candlelight` |
| `yer-7-kule.png` | `a tall crumbling stone watchtower with battlements, a single torch burning at the top window` |
| `yer-8-katedral.png` | `a dark gothic cathedral with three sharp spires, a glowing rose window, ancient and overgrown` |
| `yer-9-kapi.png` | `a massive ancient stone gate standing alone, its arch opening into pure void, countless tiny distant lantern lights floating inside the darkness` |

## 3. Zemin dokusu — `zemin.png`
Kenarları birbirine kusursuz bağlanmalı (tekrarlanan desen). **Bu görselde şeffaf arka plan istemiyoruz.**
```
seamless tileable texture, top-down view of dark cold earth with scattered flat stones, dry dead grass, cracks and small pebbles, very dark, low contrast, muted brown and grey, no objects, no light source
```
Midjourney'de sonuna `--tile` ekle.

## 4. Sis — `sis.png`
Karanlığın kenarında süzülen sis için.
```
a single soft wisp of black smoke and fog, organic shape, feathered edges, isolated, transparent background
```

## 5. Arayüz

**Panel çerçevesi — `panel.png`** (ortası boş olmalı, kenarları süslü; ben 9 parçaya bölüp her boyuta uydururum)
```
ornate dark iron frame border for a game UI panel, square, empty dark center, subtle rivets and engraved vine pattern, aged metal, flat front view, no text
```

**Düğme — `buton.png`**
```
a rectangular dark game UI button, aged black iron with thin tarnished gold trim, flat front view, empty center, no text, transparent background
```

**Rün taşı — `runtasi.png`** (Rünler sekmesi için; üstüne rün işaretini ben çizerim)
```
a small flat carved stone tablet, blank surface, chipped edges, dark grey granite, subtle moss, front view, no symbols, transparent background
```

## 6. Küçük ikonlar (5 adet)
Hepsini **aynı çerçeve dilinde** iste: koyu daire içinde tek nesne.

| Dosya | Komut |
|---|---|
| `ikon-kor.png` | `game icon, a single glowing ember coal, orange core, dark circular frame` |
| `ikon-fitil.png` | `game icon, a burning candle wick with a small flame, dark circular frame` |
| `ikon-sur.png` | `game icon, a short fortified stone wall segment, dark circular frame` |
| `ikon-cam.png` | `game icon, a polished glass lantern pane catching light, dark circular frame` |
| `ikon-kul.png` | `game icon, a small pile of grey ash with a faint last spark, dark circular frame` |

## 7. (İsteğe bağlı) Açılış görseli — `acilis.png`
Menü arka planı. **Şeffaf değil**, yatay 16:9.
```
a vast endless darkness, a tiny lone lantern glowing in the center on cracked ground, faint silhouettes of ruins at the edge of the light, cinematic, dark fantasy painting, lots of empty dark space at the top for a title, no text
```
Midjourney'de sonuna `--ar 16:9` ekle.

---

## Teslim listesi

```
fener/assets/
  fener.png
  yer-1-kulube.png  yer-2-kuyu.png  yer-3-mezarlik.png
  yer-4-degirmen.png  yer-5-maden.png  yer-6-manastir.png
  yer-7-kule.png  yer-8-katedral.png  yer-9-kapi.png
  zemin.png  sis.png
  panel.png  buton.png  runtasi.png
  ikon-kor.png  ikon-fitil.png  ikon-sur.png  ikon-cam.png  ikon-kul.png
  acilis.png   (isteğe bağlı)
```

**Önce sadece `fener.png` + 2–3 yer üret ve bana göster.** Tarz oturduysa gerisini aynı şekilde üretirsin;
böylece 20 görseli baştan yapmak zorunda kalmazsın.
