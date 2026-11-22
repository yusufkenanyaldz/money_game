# Seyr Pixel — başlangıç notu

Seyr'in pixel sürümü. **Gaye aynı** (gerçek hayattaki ameller karakteri büyütür, canavarlar nefsin huylarıdır, ameller oyunda
açıkça yazılmaz), **görünüm pixel şövalye** (Gemini, kullanıcının seçimi). Eski minyatür Seyr `../seyr/` klasöründe
dokunulmadan duruyor; Defter (`seyr/defter.js`) buraya taşınacak.

## Karar ve plan
- Bölüm bölüm, haftada bir bölüm. **1. bölüm eğlenceli olmadan 2. bölüme geçilmez.**
- 1. bölüm: Gaflet Ovası; birkaç gölge düşman, sonunda Kızıl Dev. Günlük döngü: amel gir → güçlen → o günün kısa sınaması.
- Karakter seti (Gemini, yeşil perde): bekleme, yürüme, koşu, saldırı, kaçınma, darbe, yenilme, zafer. Köprü klip yok.
- Komutlar: `GEMINI-KOMUTLARI.md`.

## Dosyalar
- `pixel-isle.py` — Gemini videosu → gerçek pixel şerit. Gemini'nin "pixel" videoları sabit ızgaraya oturmaz;
  karakter 64 px boya indirilir, ortak 24 renkli palete oturtulur (`assets/palet.png`, ilk klipten), kenarlar keskin,
  yeşil taşma temizlenir, önceki karedeki renge yakın pikseller korunur (kıpırtı az). Döngülerde yeterince iyi olan en kısa döngü seçilir.
  `python3 pixel-isle.py kaynak/video.mp4 <hareket> [--bas sn] [--sure sn] [--dongu] [--yon 1|-1]`
- `assets/<hareket>.png` yatay şerit, `assets/karakter.json` kare sayısı/boyut/fps/yön.
- `kaynak/` Gemini videoları.
- `oyun.js` — 1. bölüm (Gaflet Ovası): 320x180, tam kat büyütme. Savaş kuralı: düşman saldırmadan önce hazırlanır
  (gözler kızarır, "!"); hazırlanırken vurulursa kılıç seker ("tok!"); saldırısı tam zamanında kaçınılırsa sersemler, o arada
  vuruş 2 kat. Kızıl Dev sopayla vurunca iki yana şok dalgası; vuruştan sonra hep sersemler; yarı canında hızlanır.
  Gruplar 260/620/980'de (2/3/4 gölge), dev 1320'de. Ölünce son temiz gruptan devam. Düşmanlar şimdilik kodla çizilmiş yer tutucu.
  Bot testi: kuralı bilen bot 70 sn'de hiç düşmeden bitiriyor; düşünmeden vuran bot 9 kez düşüp devi geçemiyor.
- `onizleme.py` → `onizleme.html`: oyun.js ve şeritler gömülü, telefonda açılan tek dosya (yayınlanmış sayfa).
- `GEMINI-ARAYUZ.md` — düğme, çerçeve, kalp ve dört güç simgesi için resim komutları.

## Durum
- Palet saldırı klibinden (kılıç izinin açık mavisi için), 28 renk. Yeni palet gerekirse `assets/palet.png` silinip önce saldırı işlenir.
- Bekleme 105 kare (8,75 sn; pelerin düzensiz, kısa döngü yok) · yürüme 14 · koşu 9 · saldırı 19 · kaçınma 16 kare. Toplam ~340 KB.
- Bekleyen: darbe, yenilme, zafer (video olarak). Gemini'nin sprite sheet'leri farklı çizimde (iri kafa, önden bakış, beyaz zemin JPEG) — kullanılmadı.
- Darbe (16 kare, darbe anından), yenilme (58), zafer (36; Gemini'de kılıç ağzı kadraj üstünde kesikti, `--kesik-ust 11` ile 11 px uzatılıp sivriltildi) oyunda.
- `pixel-isle.py`: `--kesik-ust N` (üst kenarda kesik ince parçayı uzatır), bozuk (karakter kaybolmuş) kareleri atar.
- `arayuz-isle.py`: Gemini arayüz görsellerini asıl pixel boyutuna indirir → `assets/ui-*.png`. VUR, KAÇ ve yön düğmeleri oyunda;
  defter, pencere, can çubuğu, kalp ve dört güç simgesi Defter ekranı için hazır.
- Düşmanlar: `pixel-isle.py --grup golge|dev --boy N --yon -1` → ayrı palet (`palet-<grup>.png`) ve `assets/<grup>.json`. Dikey videolardaki siyah bant otomatik kırpılır; `--enaz` en kısa döngü süresi.
  Gölge görseli SAĞA bakıyor (`--yon 1`; Gemini sola istense de sağa çizdi). Gölge: bekle, yürü, saldırı (0–19 hazırlanma, 20–40 vuruş), darbe, ölüm. Kızıl Dev: bekle, yürü, saldırı (0–26 sopa kalkar, 27–33 iner, 33–62 yere vurmuş + toz: sersemken oynar), darbe, ölüm.

- **Defter** (`defter.js`, eski Seyr'den): ameller, Yıldız Defteri, seviye, gizli anahtar, yedek. Kayıt anahtarı `seyr_pixel_v1` (eski Seyr'den ayrı).
- **Dört güç amellerden:** bugünkü amellerin güç payı (`bugunGuc`), her 15 dk = 1 kullanım hakkı, günde en çok 3 (`haklar`, `kullan`; `D.kullan`).
  Alp → Güçlü Darbe (sonraki vuruş 3 hasar, hazırlanan düşmanın zırhını deler ve sersemletir) · Kut → Nur Kalkanı (bir darbeyi karşılar)
  · Hikmet → Sezgi (3 sn düşmanlar %40 hızda) · Cevher → Sabır (+1 kalp). Klavye 1-4. Her 10 seviyede +1 kalp.
- **Yadigâr:** Kızıl Dev ölünce Âb-ı Hayat Damlası düşer; üstünden geçince alınır (ilk seferde pencere açılır), `D.yadigar` içinde kalıcı. Etki: düşmanlar %30 uzun sersem (`sersemSure`). Bölüm, damla alınınca biter. Defter › Güçler › Yadigârlar; gizli anlamı (sakin kalmak) yalnızca anahtarda. Simge `ui-abihayat.png`, oyun içi küçük `ui-abihayat-k.png` (15x18).
