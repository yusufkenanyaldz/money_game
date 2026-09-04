# MİDAS — Dokun, Altına Çevir

Tek dokunuşluk, refleks temelli bir "hyper-casual" oyun. Bir çember üzerinde
dönen kıvılcım **altın kapının** içindeyken dokun; kıvılcımı altına çevir, para
ve çarpanı büyüt, ışkalama. 7'den 70'e herkes 3 saniyede öğrenir.

> **Oyna:** `index.html` dosyasını herhangi bir tarayıcıda aç. Tek dosya,
> bağımlılıksız. Telefon, tablet ve masaüstünde çalışır. (Yuvarlak fontlar
> için internet gerekir; yoksa sistem fontuna düşer.)

---

## Görsel dil: Premium koyu-canlı

Arayüz **derin mor zemin + canlı doygun neon aksanlar + güçlü juice**
üzerine kuruludur (Subway Surfers mantığı). Cam (glass) kartlar, katmanlı
neon-bloom parıltı, derinlik vinyeti ve temiz **Poppins** fontu ile
"ucuz neon" değil premium bir his hedeflenir. Temalar canlı: Altın, Buz,
Lav, Neon, Zümrüt, Galaksi, Prizma. Rütbeler: KIVILCIM → ATEŞ → KOR →
ALEV → İNFERNO → NOVA → SÜPERNOVA → TANRISAL.

**Bu yön neden seçildi (araştırma):** Bağımlılık odaklı hyper-casual
oyunlarda **yüksek doygunluk + yüksek kontrast** kazandırır; koyu/donuk
tonlar "az davetkâr" okunur ve retention'ı düşürür. "Juice" (sarsıntı,
flaş, parçacık) dopamin salgılatır ve en iyi yüksek kontrastlı zeminde
parlar. Candy Crush (parlak doygun) ve Subway Surfers (derin zemin + canlı
öğe) bunun kanıtı. Bir ara denenen pastel/cozy yön sakin oyunlara uygun
ama bu oyunun adrenalin hedefiyle çeliştiği için terk edildi.

> Aşağıdaki "en çok kullanılan renkler" bölümü bu araştırmanın özetidir.

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

## Kasa (risk / ödül) — bağımlılık motoru

Oyunun greed döngüsü **Kasa** sistemiyle çalışır:

- **Riskteki Altın (pot):** run sırasında kazandığın, henüz güvende olmayan
  altın. **Işkalarsan hepsi yanar.**
- **Kasaya Al (🏦 / `C` tuşu):** pot'u kalıcı **Kasa**'ya aktarır. Kasa asla
  kaybolmaz, oturumlar arası saklanır (`localStorage`). Bedeli: **seri
  çarpanın sıfırlanır** — momentumunu feda edersin, ama garantiye alırsın.
- Her an oyuncunun kararı: *"Şimdi kasaya alıp kilitle, yoksa bir perfect
  daha çekip pot'u büyüt ve riske at?"* — **greed vs. kayıp korkusu.**
- Pot büyüdükçe "Kasaya Al" butonu **ısınır** (altın → kırmızı, nabız atar):
  kaybedecek çok şeyin olduğunu hissettirir.
- Kalıcı Kasa = **geri dönüş kancası** (meta-progression): oyuncu servetini
  büyütmek için tekrar tekrar döner.
- Temiz kaçış: pot'u kasaya alıp sonra ışkalarsan kayıp **0** olur ("TEMİZ
  KAÇTIN") — akıllıca oynamayı ödüllendirir.

## Dükkan (temalar / skin'ler) — servete anlam

Biriken **Kasa**'yı harcayacağın yer. Menü ya da oyun-sonu ekranından
**🛒 Dükkan** ile açılır.

- Her tema oyunun **renk dünyasını** baştan boyar: kapının ısı rampası,
  kıvılcım, para/HUD rengi, arka plan tonu ve parçacıklar.
- **7 tema** artan fiyat merdiveniyle (grind hedefi):
  Altın (bedava) · Buz (400) · Lav (1.2K) · Neon (3.5K) · Zümrüt (9K) ·
  Galaksi (22K) · Prizma (55K).
- Açtığın tema **seçilebilir**; seçim ve sahiplik kalıcı (`localStorage`).
- Satın alım tatmin edici kutlamayla gelir (altın yağmuru + ses + titreşim).
- **Rütbe sistemi:** seviye adları temadan bağımsızdır —
  KIVILCIM → ATEŞ → KOR → ALEV → İNFERNO → NOVA → SÜPERNOVA → TANRISAL.

Serveti harcamak (spending) tıpkı kazanmak kadar tatmin edicidir; bu da
oyuncuyu daha çok oynayıp Kasa büyütmeye iter — kalıcı bir grind döngüsü.

## Geliştirme fikirleri (sonraki adımlar)

- Günlük görev / seri (streak) takvimi — geri dönüş kancası.
- Arka plan müziği.
- Skor tablosu (yerel çoklu oyuncu / cihaz).

---
_MİDAS — dokun, altına çevir._
