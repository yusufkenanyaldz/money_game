# MİDAS — Dokun, Altına Çevir

Tek dokunuşluk, refleks temelli bir "hyper-casual" oyun. Bir çember üzerinde
dönen kıvılcım **altın kapının** içindeyken dokun; kıvılcımı altına çevir, para
ve çarpanı büyüt, ışkalama. 7'den 70'e herkes 3 saniyede öğrenir.

> **Oyna:** `index.html` dosyasını herhangi bir tarayıcıda aç. Bağımlılık yok,
> internet gerekmez, tek dosya. Telefon, tablet ve masaüstünde çalışır.

---

## Neden bu tasarım?

Kullanıcının isteği netti: **basit, herkesin oynayacağı, bağımlılık yapan,
ışıklar–efektler–titremeler ile kazanma hissini anlık yaşatan** bir oyun.
Piyasayı ve oyun tasarımı prensiplerini süzdüm:

- **Hyper-casual altın kuralı:** tek girdi (tek dokunuş), tek kural, anında
  başla. *Helix Jump, Flappy Bird, Stack, Color Switch* hep aynı DNA: öğrenmesi
  1 saniye, ustalaşması ömür boyu.
- **"Game feel" / Juice** (Jan Willem Nijman, Vlambeer): Aynı mekanik, farklı
  his. Kazanma duygusu mekanikten değil, **tepkiden** doğar — ekran sarsıntısı,
  parçacık, ses, titreme, mikro donma. Bu oyunun kalbi burası.
- **Bağımlılık döngüsü:** *değişken ödül* (perfect/normal), *yükselen gerilim*
  (hız artar, kapı daralır), *kayıp korkusu* (tek ıska = biter), *kişisel rekor
  avı* ("bir el daha").

## Çekirdek mekanik

1. Kıvılcım çember üzerinde döner.
2. Altın kapının içindeyken **dokun / tıkla / boşluk tuşu**.
3. **Vuruş** → +altın, hız artar, kapı daralır, kapı rastgele yeni yere ışınlanır.
4. **PERFECT** (kapının tam ortası) → seri çarpanı büyür (x2, x3, x4…), altın
   patlaması, ekstra ödül.
5. Her 5 vuruşta **yön değişir** — refleksi diri tutar.
6. Kapının dışına dokunmak = **oyun biter.** Rekor kaydedilir.

## "Juice" — kazanma hissini yaşatan tepkiler

Kullanıcının özellikle vurguladığı kısım. Uygulananlar:

| Teknik | Ne yapar |
|---|---|
| **Hit-stop** (mikro donma) | Vuruşta oyun ~90ms donar — darbeye "ağırlık" verir |
| **Ekran sarsıntısı** | Vuruş ve ıskada kamera titrer (perfect'te daha sert) |
| **Parçacık patlaması** | 3B madeni para hissi veren dönen altınlar fışkırır |
| **Genişleyen halkalar** | Darbe noktasından şok dalgası |
| **Ekran flaşı** | Perfect'te sıcak beyaz parlama |
| **Prosedürel ses** | WebAudio ile yükselen pentatonik "combo" merdiveni (dosya yok) |
| **Haptik titreşim** | Mobilde `navigator.vibrate` — perfect'te ritmik desen |
| **Kayan yazılar** | "+40", "PERFECT!", "MÜKEMMEL x4" doğuş sıçramasıyla |
| **Nabız & parıltı** | Çember ve merkez madalyon her vuruşta nabız atar |
| **Rekor kutlaması** | Yeni rekorda ekrandan altın yağmuru + "EFSANE!" |

Ses ve titreşim ilk dokunuşta (tarayıcı politikası gereği) etkinleşir.

## Teknik

- **Tek `index.html`** — HTML + CSS + JS gömülü, hiçbir bağımlılık/CDN yok.
- Canvas 2D ile 60fps render, `devicePixelRatio` ile keskin görüntü.
- WebAudio ile tüm sesler prosedürel üretilir (indirilen dosya yok).
- `localStorage` ile rekor kalıcı.
- Responsive + `safe-area-inset` ile çentikli telefon uyumu, `touch-action`
  ile mobilde kaydırma/zoom engeli.

## Geliştirme fikirleri (sonraki adımlar)

- Günlük görev / seri (streak) takvimi — geri dönüş kancası.
- "Cash out" riski: biriken altını bankaya al ya da riske at (greed döngüsü).
- Temalar/skin'ler, arka plan müziği, ses aç/kapa düğmesi.
- Skor tablosu (yerel çoklu oyuncu / cihaz).

---
_MİDAS — dokun, altına çevir._
