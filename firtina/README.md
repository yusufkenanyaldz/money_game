# RÜN FIRTINASI

Tarayıcıda oynanan, tek dosyalık (bağımlılıksız, sıfır dış istek) bir
"hayatta kalma" (survivor-like) oyunu. `index.html` dosyasını aç, oyna.

## Neler var?

**Görsel**
- Elle (kodla) çizilmiş yaratıklar: hayaletler, yarasalar (kanat çırpar), taş golemler, göz-yaratıklar, boynuzlu canavarlar, taçlı bekçiler.
- Taş döşemeli zindan zemini, mumlar, kayalar, kemikler, parlayan rün çemberleri.
- **Işık ve gölge:** karanlık bir zindan; ışığı sen, büyülerin, patlamalar ve mumlar getiriyor.
- Vuruşta ezilip esneme (squash & stretch), beyaz flaş, ölümde parlayıp sönme, kıvılcım + duman katmanlı patlamalar, yerde yanık izleri.
- Toplanan hasar sayıları (ekranı doldurmaz), kritikler zıplar.

**Eşyalar ve ilerleme**
- **11 büyü**, 4 element (Ateş, Buz, Şimşek, Rün) ve 13 pasif.
- **Kart nadirliği:** Sıradan / Nadir / Destansı / Efsanevi — Destansı +2 seviye, Efsanevi devasa bonus. Kartlar tam olarak neyin değiştiğini gösterir (Hasar 16 → 21).
- **Evrim:** 5. seviye büyü + eşi olan pasif → elit sandığından yeni bir büyü çıkar (ör. Ateş Topu + Rün Gücü = Güneş Patlaması).
- **Sandık açma animasyonu:** 1, 3 ya da 5 ödüllü sandıklar; ışınlar en iyi ödülün renginde parlar.
- **Rün fenerleri:** kır → Rün Bombası (ekranı temizler), Zaman Kumu (her şey donar), Öfke İksiri (×2 hasar), mıknatıs, şifa, altın kesesi.
- **Kombo sayacı:** 25 / 50 / 100 / 500… öldürmede ödül yağmuru.
- **Element tepkimeleri:** Ateş+Buz = BUHAR, Ateş+Şimşek = PATLAMA, Buz+Şimşek = KIRILMA; Rün büyüleri işaretli düşmana +%30.
- 3 bekçi, 11 emanet, 4 kahraman, Sığınak'ta kalıcı güçlendirmeler.

## Kontroller

- Bilgisayar: `WASD`/oklar yürü, `Boşluk`/`Shift` atıl, `Esc` duraklat, `1-3` kart seç, `R` yenile.
- Telefon: ekranda bas-sürükle (yüzen joystick), sağ alttaki **ATIL** düğmesi.

## Teknik

Canvas 2D, uzamsal ızgara ile çarpışma, `shadowBlur` yerine önceden çizilmiş
parıltı sprite'ları (telefon dostu), WebAudio ile prosedürel ses, `localStorage`
ile kalıcı ilerleme. Denge, başsız tarayıcıda 12 dakikalık otomatik oyun
simülasyonlarıyla ayarlandı (rastgele kart seçen bir bot ilk koşuda çoğunlukla
1. ya da 3. bekçide düşüyor; Sığınak güçlendirmeleri ve akıllı seçimlerle kazanılır).
