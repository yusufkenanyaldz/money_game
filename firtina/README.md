# RÜN FIRTINASI

Tarayıcıda oynanan, tek dosyalık (bağımlılıksız, sıfır dış istek) bir
"hayatta kalma" (survivor-like) oyunu. `index.html` dosyasını aç, oyna.

## Türün sıkıcı kısmını nasıl düzeltiyor?

Bu türdeki oyunlar bir süre sonra "yürü, sayılar büyüsün" hâline gelir.
Rün Fırtınası'nda karar vermek gerçekten önemli:

- **Element tepkimeleri.** Her büyü düşmanı elementiyle işaretler
  (Ateş = yanma, Buz = soğuma/donma, Şimşek = şok). İşaretli düşmana
  *farklı* bir element değerse tepkime patlar:
  - Ateş + Buz → **BUHAR** (ağır vuruş + haşlayan bulut)
  - Ateş + Şimşek → **PATLAMA** (alan patlaması, savurma)
  - Buz + Şimşek → **KIRILMA** (canın yüzdesi kadar hasar + kırılganlık)

  Yani yalnızca "en güçlü büyü" değil, birbirini tamamlayan büyüler seçmek kazandırır.
- **Atılma (dash)** — kısa dokunulmazlıklı kaçış; kuşatmadan kurtulmak beceri ister.
- **İşaret veren düşmanlar** — hücum eden Boynuzlar çizgi çizer, tükürenler parlar; okunabilir tehlike.
- **3 bekçi (4:00, 8:00, 12:00)** — halka mermi, hücum, çağırma, sarmal saldırıları.
- **Elit sandıkları** — 5. seviyedeki büyüyü **UYANDIRIR** (6. seviye, davranış değiştirir).
- **Emanetler** — her bekçiden sonra oyunun kurallarını büken 10 eşsiz eşyadan biri.
- **Sığınak** — altınla kalıcı güçlendirmeler (can, hasar, yenileme hakkı, diriliş…).
- **Sürü olayları** — düşmanlar seni halka şeklinde çevreler; dash'in değeri burada ortaya çıkar.

## Kontroller

- Bilgisayar: `WASD`/oklar yürü, `Boşluk`/`Shift` atıl, `Esc` duraklat, `1-3` kart seç, `R` yenile.
- Telefon: ekranda bas-sürükle (yüzen joystick), sağ alttaki **ATIL** düğmesi.

## Teknik

Canvas 2D, uzamsal ızgara ile çarpışma, `shadowBlur` yerine önceden çizilmiş
parıltı sprite'ları (telefon dostu), WebAudio ile prosedürel ses, `localStorage`
ile kalıcı ilerleme. Denge, başsız tarayıcıda 12 dakikalık otomatik oyun
simülasyonlarıyla ayarlandı (rastgele kart seçen bir bot ilk koşuda çoğunlukla
1. ya da 3. bekçide düşüyor; Sığınak güçlendirmeleri ve akıllı seçimlerle kazanılır).
