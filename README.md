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
Lav, Neon, Zümrüt, Galaksi, Prizma. Rütbeler (açık tavan): KIVILCIM → ATEŞ →
KOR → ALEV → İNFERNO → NOVA → SÜPERNOVA → TANRISAL → … → AŞKIN.

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

## Kalıcı Upgrade'ler (Kasa ile güçlen)

Menü/oyun-sonundan **Yükselt** ekranı açılır. Kasa harcayarak seviyelenen,
**her turda etkili** kalıcı güçler — Kasa'ya kozmetik ötesi anlam katar ve
"harca-güçlen" döngüsü kurar:

| Upgrade | Etki | Kademe |
|---|---|---|
| **Altın Dokunuş** | Kazanılan altın +%8/kademe | 5 |
| **Geniş Perfect** | Perfect bölgesi +%12/kademe (kolay combo) | 4 |
| **Başlangıç Kalkanı** | Her tura N kalkanla başla | 3 |
| **Sakin Başlangıç** | Başlangıç hızı düşer (kolay giriş) | 3 |
| **İkinci Şans+** | +1 revive hakkı (tur başına) | 1 |

Fiyatlar kademeyle artar; seviyeler `localStorage`'da kalıcıdır. Bu, planlanan
**3-katmanlı ilerleme sisteminin son adımıdır** (pist aşamaları + Seviye/XP +
kalıcı upgrade'ler).

## Kalıcı Seviye + XP (ilerlemenin belkemiği)

Oyuncunun **asla sıfırlanmayan** bir hesap seviyesi vardır. Her vuruş (+2, perfect
+3) ve her "Kasaya Al" (miktara göre) **XP** kazandırır. Menüde büyük bir
**SEVİYE + XP çubuğu** ilerlemeyi gösterir.

- Yeterli XP → **seviye atla**: oyun-içi *"SEVİYE ATLADIN"* bildirimi (toast),
  **altın yağmuru** kutlaması, yükselen fanfar + titreşim ve **Kasa ödülü**
  (100 + seviye×50).
- XP eğrisi: sonraki seviye için gereken = `80 + seviye×45` (giderek artar).
- Seviye ve XP `localStorage`'da kalıcı (oturumlar arası).

**Neden:** "İlerliyor muyum / bir üst seviyeye çıktım mı?" sorusunun somut
cevabı budur — pist aşamalarıyla (tur-içi) birlikte hem kısa hem uzun vadeli
ilerleme hissi verir. (Planın 2. adımı; 3. adım: Kasa ile kalıcı upgrade'ler.)

## Pist şekilleri (tur-içi aşamalar)

Tek çember monotonlaşmasın diye pist, tur ilerledikçe **başkalaşır**. Her ~12
vuruşta bir yeni şekle **morph animasyonuyla** dönüşür ve büyük bir
"**AŞAMA n · İSİM**" bandı + juice ile "yeni bir yere ulaştın" hissi verir:

**ÇEMBER → ELİPS → SONSUZLUK (∞) → DALGA → YILDIZ → ZİKZAK** (sonra döngü).

Her şekil farklı bir refleks meydan okuması sunar (∞'in kesişme noktası, dalga
ve yıldızın keskin dönüşleri, zikzağın testere kenarları). **Adalet:** zor
pistlerde kapı biraz genişler ve hız biraz düşer (`SHAPE_GATE`/`SHAPE_SPEED` —
en çok yardım SONSUZLUK'ta), ayrıca her aşama geçişinde ~2.6sn "**alışma payı**"
ile kapı geçici genişler; böylece şekil değişimi ani bir zorluk zıplaması olmaz.
Teknik: yol **yay-uzunluğuna göre** örneklenir,
böylece kıvılcım tüm şekillerde **sabit hızda** akar; oyun mantığı hâlâ
açı-uzayında (kapı/perfect/power-up hepsi şekilden bağımsız çalışır), sadece
render bir polyline'a döner. Bu, planlanan **ilerleme sistemi**nin ilk adımıdır
(sonraki adımlar: kalıcı Seviye+XP ve kalıcı upgrade'ler).

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

## Power-up'lar (toplanabilir)

Oyun sırasında çemberin üzerinde **ikinci bir kapı** açılır — tıpkı ana altın
kapı gibi bir arc, ama kendi renginde ve **tam ortasında power-up ikonu** durur.
Toplamak için kıvılcım o kapıdan geçerken **dokunursun** (kapı vuruşu sayılmaz,
ıska riski yok). Kapı süreli daralır; **zamanında dokunamazsan solup kaybolur**
— yani power-up'ı kaçırırsın. Aktif etkiler üstte küçük sayaçlı çiplerle görünür.

| Power-up | Etki | Süre |
|---|---|---|
| 🛡️ **Kalkan** | Sıradaki ıskayı emer — ölmezsin, kapı tazelenir | Kullanılınca biter |
| ✨ **x2 Altın** | Kazanılan altın 2 katı | 8 sn |
| 🐌 **Yavaşlat** | Kıvılcım yavaşlar (kolay nişan) | 6 sn |
| 🎯 **Geniş Kapı** | Kapı genişler (hem çizim hem isabet) | 8 sn |

Power-up kapısı ~5-8 sn'de bir doğar (aynı anda tek), ana kapıdan uzağa
yerleşir, ~6 sn içinde toplanmazsa kaybolur. Kalkan aktifken çemberin dışında
mavi bir koruma halkası parlar. **Neden:** ikinci bir zamanlama hedefi ekler —
"her el aynı" hissini kırar, hem ödül hem beceri/risk kararı getirir.

## Revive (İkinci Şans) — reklam izleyerek

Işkalayıp öldüğünde, oyun-sonu ekranından **önce** bir teklif çıkar:

- 💛 **DEVAM ET?** — süreli teklif (süre çubuğu dolunca kaçar; baskı yaratır).
- **▶ Reklam İzle & Devam** → ödüllü reklam (rewarded video) oynar; bitince
  **riskteki altın korunur** ve aynı hız/seviyeden **3-2-1** geri sayımla
  devam edersin (taze kapı + ufak nefes payı).
- **Tur başına 1 kez.** İkinci ölümde teklif çıkmaz, doğrudan oyun-sonu.
- "Hayır, bitir" ya da süre dolması → normal oyun-sonu.

**Neden:** Rage-quit'i azaltır, oturumu uzatır ve **loss aversion**'ı kullanır
("650 altını kaybetme!"). Hyper-casual'ın en güçlü retention + gelir kancası.

> **Gerçek reklam entegrasyonu:** Şu an yerine geçici bir **sahte ödüllü
> reklam** ekranı oynuyor (5 sn geri sayım). Koda `watchAd()` içine
> `// GERÇEK ENTEGRASYON` yorumu bırakıldı: oraya AdMob/Unity Ads rewarded
> video `show()` çağrısı gelir, `onUserEarnedReward → grantRevive()`,
> reklam kapatılırsa `declineRevive()`.

## Görev Sistemi

Menüden ve oyun-sonundan **Görevler** ekranı açılır: aynı anda **3 aktif görev**
gösterilir (açıklama + ilerleme çubuğu + Kasa ödülü). Görevler oynadıkça
otomatik ilerler; biri tamamlanınca **ödül Kasa'ya eklenir**, ekranda bir
"GÖREV TAMAM +X" bildirimi (toast) belirir ve yerine **yeni bir görev** gelir.

Görev havuzu (rastgele 3'ü aktif olur):

- 30 MÜKEMMEL vuruş yap · 12 power-up topla · 1500 altını Kasa'ya al
- 150 kez kapıya vur · Bir turda Seviye 7'e ulaş · Bir turda x6 çarpana ulaş
- Kalkanla 3 kez ölümden dön · 8 el oyna

İlerleme ve aktif görevler `localStorage`'da saklanır (oturumlar arası kalıcı).
**Neden:** kısa vadeli hedefler → oturum uzunluğu ve Kasa harcama döngüsü;
"bir görev daha bitireyim" kancası.

## Top kıyafetleri (mağaza: "Toplar" sekmesi)

Dükkanda **Temalar / Toplar** sekmeleri var. "Toplar", dönen topun (kıvılcımın)
**kostümünü** değiştirir — her biri **canvas'ta elle çizilir** (emoji/resim yok),
kartlarda canlı önizlemesiyle görünür. Kasa ile alınır, seçilir, kalıcı saklanır
(`localStorage`).

**13 top:** Kıvılcım (bedava) · Ateş · Buz · Yıldız · Gezegen (halkalı) · Futbol ·
Kalp · Elmas · Göz (hareket yönüne bakar) · 8 Top · Şimşek (çakan) · Ay · Gökkuşağı
(gökkuşağı kuyruk). Kimi tema rengiyle boyanır (kıvılcım, yıldız, elmas, gezegen),
kimi sabit renklidir (ateş, buz, futbol…). Seçilen top kuyruğuyla birlikte oyuna
yansır.

## Oyuna özel ikonlar

Oyun-içi öğelerde emoji yerine **canvas'ta ve SVG ile çizilmiş özel ikonlar**
kullanılır: power-up kapılarının ortasındaki ikonlar (kalkan, 2×, kum saati,
çift-yönlü ok), üstteki aktif-etki çipleri, "Kasaya Al" butonundaki kumbara ve
Kasa/coin göstergeleri. Böylece cihazdan bağımsız, tutarlı ve oyuna has bir
görsel dil sağlanır.

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
- **Rütbe sistemi:** seviye adları temadan bağımsızdır. Tavan **açıktır**, asla
  tıkanmaz — TANRISAL sonrası prestij rütbeleri devreye girer:
  KIVILCIM → ATEŞ → KOR → ALEV → İNFERNO → NOVA → SÜPERNOVA → TANRISAL →
  KOZMİK → EBEDİ → SONSUZ → MUTLAK → EFSANE → AŞKIN.

Serveti harcamak (spending) tıpkı kazanmak kadar tatmin edicidir; bu da
oyuncuyu daha çok oynayıp Kasa büyütmeye iter — kalıcı bir grind döngüsü.

## Sıralama + skor paylaşımı

- **Yerel en iyi 5 tur** (`localStorage`): her turun Kasa'sı, rütbesi, vuruşu ve
  tarihi kaydedilir; menü/oyun-sonundan **Sıralama** ile açılır. #1 altınla
  vurgulanır.
- **Skor paylaş:** oyun-sonu ve sıralama ekranındaki **PAYLAŞ** butonu, cihazın
  yerel paylaşım sayfasını (`navigator.share`) açar; yoksa panoya kopyalar.
  Metin bir meydan okumadır: "MİDAS'ta X Kasa topladım · rütbem … Geçebilir
  misin?" — viral/geri dönüş kancası.

## Günlük ödül / seri (streak)

Her gün ilk açılışta **GÜNLÜK ÖDÜL** açılır. 7 günlük döngü; ödül gün
büyüdükçe artar (100·gün), **7. günde büyük bonus** (+400). Ardışık günler
**seriyi** büyütür; bir gün kaçarsan seri sıfırlanır. Klasik geri dönüş kancası.

## Onboarding (kademeli açılım)

Oyun ~10 sistemi ilk anda yüzüne çarpmaz:
- **İlk açılışta 3 adımlık rehber** (tek kural → Kasaya Al → büyü/ilerle).
- **Menü butonları kademeli açılır:** başta yalnız **BAŞLA + Dükkan**; 1 tur
  sonra **Görevler + Sıralama**, 2 tur sonra **Yükselt** görünür. Yeni oyuncu
  boğulmaz, kıdemli oyuncu her şeye erişir.

## Arka plan müziği

WebAudio ile **prosedürel lo-fi arpej** (dosya yok, ~0 KB). Sağ alttaki 🎵
düğmesiyle açılır/kapanır (SFX'ten bağımsız); tercih `localStorage`'ta tutulur.
Üst üste binen bildirim/toast'lar artık **sıraya alınır** (yüksek hızda karmaşa
olmaz).

---
_MİDAS — dokun, altına çevir._

## 🔒 Sahibe özel: geçici altın hilesi

Menüde **MİDAS logosuna ~1.2 sn basılı tut** → **+100.000 Kasa** ("PATRON MODU").
Tek kişilik, sunucusuz oyun olduğu için zararsızdır. Kodda `GEÇİCİ ALTIN HİLESİ`
bloğu tek parça; yayına almadan önce silmek istersen o bloğu kaldırman yeter.
