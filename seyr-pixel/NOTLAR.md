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
- `onizleme.py` → `onizleme.html`: şeritleri gömülü, telefonda açılan önizleme (ok tuşları / ekran düğmeleri).

## Durum
- Palet saldırı klibinden (kılıç izinin açık mavisi için), 28 renk. Yeni palet gerekirse `assets/palet.png` silinip önce saldırı işlenir.
- Bekleme 105 kare (8,75 sn; pelerin düzensiz, kısa döngü yok) · yürüme 14 · koşu 9 · saldırı 19 · kaçınma 16 kare. Toplam ~340 KB.
- Bekleyen: darbe, yenilme, zafer (video olarak). Gemini'nin sprite sheet'leri farklı çizimde (iri kafa, önden bakış, beyaz zemin JPEG) — kullanılmadı.
