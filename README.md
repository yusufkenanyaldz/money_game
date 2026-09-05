# ONE MORE TAP — Bank It or Lose It All

Tek dokunuşluk, refleks temelli bir "hyper-casual" oyun. Bir çember üzerinde
dönen kıvılcım **altın kapının** içindeyken dokun; kıvılcımı altına çevir, para
ve çarpanı büyüt, ıskalama. 7'den 70'e herkes 3 saniyede öğrenir.

> **Oyna:** `index.html` dosyasını herhangi bir tarayıcıda aç. Tek dosya,
> bağımlılıksız, **sıfır dış istek** — font dâhil her şey gömülü, çevrimdışı
> çalışır. Telefon, tablet ve masaüstünde çalışır. Arayüz **Türkçe/İngilizce**.

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
- **PWA:** gömülü manifest + ikon ile telefona kurulabilir; ana ekrandan
  tam ekran (`standalone`) açılır. Ek dosya yok — ikon da gömülü.
- **Sıfır dış istek:** Poppins fontu woff2/base64 olarak gömülüdür (latin +
  latin-ext, ~52 KB). Poki gibi portallar tüm dış istekleri engeller; ayrıca
  çevrimdışı ve gizlilik açısından da doğrusu budur.

### Render motoru: `shadowBlur` yerine katmanlı bloom

Neon parıltı ilk sürümde canvas `shadowBlur` ile çiziliyordu. `shadowBlur`
canvas'ın **en pahalı** işlemidir ve burada her karede 200 noktalı pist +
3 kapı yayı için (68px yarıçapa kadar) çalışıyordu — orta seviye telefonda
takılmanın ana sebebi buydu. Yerine:

- Yol bir kez **`Path2D`** olarak kurulur, pist için **önbelleklenir**
  (şekil değişince/morph sırasında tazelenir).
- Parıltı, `globalCompositeOperation='lighter'` ile **giderek genişleyen ve
  saydamlaşan katmanlı çizgilerden** üretilir (yumuşak alfa düşüşü → bantlaşma yok).
- **Adaptif kalite:** ortalama kare süresi izlenir; yavaşlarsa bloom katmanı
  otomatik azalır (FX 2→1→0), hızlanınca geri yükselir.

**Ölçüm** (aynı sahne: derin aşama + kalkan parıltısı, başsız Chromium):

| | eski (`shadowBlur`) | yeni (katmanlı bloom) |
|---|---|---|
| `drawScene()` CPU maliyeti | 0.208 ms/kare | **0.101 ms/kare** |
| en kötü kare (takılma) | 76.5 ms | **21.4 ms** |
| 6× CPU kısıtlı (orta telefon taklidi) | 12.0 fps | **15.4 fps** |

Ayrıca: `devicePixelRatio` 2 ile sınırlandı (3× ekranlarda %36 daha az piksel,
gözle fark yok), arka plan gradyanları önbelleklendi, fon müziği
`setInterval` yerine **ses kartı saatine kilitli ileri-bakışlı zamanlayıcıya**
taşındı (kayma yok) ve sekme gizlenince durur.

### Erişilebilirlik

- Sistemde **"hareketi azalt"** (`prefers-reduced-motion`) açıksa ekran
  sarsıntısı ~%12'ye, beyaz flaş ~%28'e kısılır. Yoğun flaş vestibüler
  rahatsızlık ve fotosensitif nöbet riski taşıdığı için bu bir tercih değil,
  gerekliliktir.
- Ses ve müzik **ayrı ayrı** kapatılabilir; tercih kalıcıdır.

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
pistlerde kapı genişler ve hız düşer (`SHAPE_GATE`/`SHAPE_SPEED` — en çok
yardım SONSUZLUK'ta), ayrıca her aşama geçişinde ~2.6sn "**alışma payı**" ile
kapı geçici genişler. Katsayılar birbirine yakın tutulur ki aşama değişimi
zorluk uçurumuna dönüşmesin. Teknik: yol **yay-uzunluğuna göre** örneklenir,
böylece kıvılcım tüm şekillerde **sabit hızda** akar; oyun mantığı hâlâ
açı-uzayında (kapı/perfect/power-up hepsi şekilden bağımsız çalışır), sadece
render bir polyline'a döner. Bu, planlanan **ilerleme sistemi**nin ilk adımıdır
(sonraki adımlar: kalıcı Seviye+XP ve kalıcı upgrade'ler).

## Diller (TR / EN)

Arayüzün tamamı sözlük tabanlıdır (`LANG` + `t()`); tarayıcı dili Türkçe ise
**TR**, değilse **EN** açılır ve oyuncu sağ alttaki **TR/EN** düğmesiyle anında
değiştirebilir (tercih kalıcı). Çeviri yalnızca menüleri değil rütbeleri
(KIVILCIM↔SPARK … AŞKIN↔TRANSCENDENT), pist adlarını (SONSUZLUK↔INFINITY),
tema/top adlarını, görevleri, upgrade'leri, eğitim koçunu ve oyun-içi kayan
yazıları da kapsar. Portallar küresel yayın yaptığı için çok dillilik
onların açık gereksinimidir.

## Oyun portallarına yayın (itch.io / Poki / CrazyGames)

Portalların ortak şartlarına göre hazırlandı:

| Şart | Durum |
|---|---|
| Kökte tek `index.html`, zip'lenebilir | ✅ 244 KB |
| **Sıfır dış istek** (font/asset pakete gömülü) | ✅ ölçüldü: 0 istek |
| Çok dilli arayüz | ✅ TR + EN |
| **Temiz derleme** — hata ayıklama/test kodu yok | ✅ `OWNER_CHEAT = false` |
| Reklam portalın kendi SDK'siyle | ✅ `Portal` köprüsü |
| Anında oyna, giriş/oturum yok, kişisel veri toplamaz | ✅ |
| Mobil + masaüstü, dikey/yatay uyum | ✅ |
| İlk indirme boyutu (Poki ≤ 8 MB) | ✅ 0.24 MB |

**`Portal` köprüsü:** oyun, `PokiSDK` veya `CrazyGames.SDK` sayfada varsa
otomatik algılar; `gameplayStart()` / `gameplayStop()` olaylarını (Poki bunları
zorunlu tutar ve üst üste atmamalarını ister) ve **ödüllü reklamı** onların
sistemine devreder. SDK yoksa her şey sessizce devre dışı kalır ve oyun
kendi yedek akışıyla tek başına çalışır — yani aynı dosya hem itch.io'da hem
portallarda çalışır.

**Sahibe özel altın hilesi** portal şartı gereği varsayılan **kapalıdır**
(`const OWNER_CHEAT = false`). Kendi kişisel sürümünde `true` yapman yeterli.

**itch.io notu:** oyun iframe'de çalıştığı için tarayıcı depolamayı "üçüncü
taraf" sayabilir ve ilerleme oturumlar arası silinebilir. Oyun bu durumda
**çökmez** (test edildi), yalnızca kayıt tutmaz. itch sayfasında
*"Click to launch in fullscreen"* seçeneğini açmak sorunu giderir.

## Sahne: derin uzay

Oyun içi arka plan düz bir gradyandı; artık menüdeki **prosedürel nebula**
oyunda da kullanılır (yıldızlar, renkli bulut kümeleri, en parlak yıldızlarda
kırınım çizgileri). Üstüne sahneyi karartan bir katman gelir ki kapı ve
kıvılcım net okunsun. Nebula tema rengine göre üretilir ve offscreen
canvas'ta önbelleklenir — dış dosya yok.

Sahnenin diğer parçaları:
- **Cam halka sistemi:** iç içe 5 saydam halka, her birinin üst kenarında
  ince ışık vurgusu — hacim hissi buradan gelir.
- **Yontulmuş kristal kapı:** kapı düz bir neon çubuk değil; yay faset
  parçalarına bölünür, her faset farklı parlaklıkta çizilir ve aralarına
  koyu ayrım çizgileri konur → mücevher görünümü.
- **Kuyruklu yıldız izi:** kıvılcımın arkasında 22 parçalı, karesel sönümlü,
  `lighter` harmanlı sıcak çekirdekli kuyruk.

**Performans:** Bu sahne daha ağır değil, daha HAFİF. Zerrecik (mote) sistemi
nebula geldiği için gereksizleşti ve %72 kısıldı; iki tam ekran gradyan
dolgusu tek bir önbellekli `drawImage`'a indi. 6× CPU kısıtlı ölçümde
**14.7 → 16.6 fps.**

## Ekonomi dengesi (ölçülmüş)

**Sorun:** Kazanç, combo çarpanı sınırsız büyüdüğü için tur uzunluğuyla
**karesel** artıyordu. Simülasyon: 40 vuruşluk bir turda usta oyuncu **9.824**,
acemi **1.305** altın kazanıyordu — **7,5 kat** uçurum. Dükkânın tamamı
(144.200 altın) sadece **~69 turda** bitiyordu; yani oyuncunun hedefi
bir saatte tükeniyordu.

**Çözüm 1 — yumuşak tavan.** Çarpan artık `x8`e kadar her seride +1, sonra
her 4 seride +1 artar:

| seri | 1 | 3 | 5 | 7 | 11 | 15 | 23 | 30 |
|---|---|---|---|---|---|---|---|---|
| çarpan | x2 | x4 | x6 | x8 | x9 | x10 | x12 | x13 |

Tırmanma hissi korunur (asla tıkanmaz) ama karesel patlama biter:
usta/acemi uçurumu **7,5x → 4,2x**.

**Çözüm 2 — dik fiyat eğrisi.** Erken ucuz, geç çok pahalı:

| | eski | yeni |
|---|---|---|
| Temalar | 91.100 | 222.800 |
| Toplar | 30.300 | 237.400 |
| Upgrade'ler | 22.800 | 49.500 *(kademeler uzatıldı)* |
| **Toplam** | **144.200** | **509.700** |

- **İlk kozmetik: 200 altın** → ilk turda alınır. Erken ödül tutundurmanın
  belkemiğidir, orayı ucuz tuttum.
- **En üst öğe: 150.000 altın** → haftalarca sürecek gerçek bir hedef.
- Dükkânın tamamı: **~69 tur → ~259 tur.**

## Ödül mimarisi (bağımlılık motoru)

"Juice" görselliktir; asıl bağlayıcı olan **ödülün ne zaman ve nasıl
verildiğidir.** Uygulananlar:

| Mekanizma | Ne yapar |
|---|---|
| **ALTIN KAPI (x5)** | %12 ihtimalle kapı altına döner, 5 kat öder. *Değişken oranlı* ödül — ne zaman geleceği bilinmediği için sabit ödülden çok daha güçlü bağlar. Ayrı renk, nabız, fanfar ve tam ekran patlama ile işaretlenir. |
| **Yaklaşma gerilimi** | Kıvılcım kapıya yaklaştıkça kapı belirginleşir. Beklenti, ödülün kendisi kadar güçlü bir uyarandır. |
| **Combo kilometre taşları** | Her 5 seride bir, bir öncekinden büyük kutlama ve bir perde tiz çalan akor. "Bir sonraki eşik" serinin bırakılmasını zorlaştırır. |
| **Yükselen yoğunluk** | Sarsıntı, flaş, parçacık sayısı ve hit-stop combo ile birlikte büyür (`heat`). Aynı hareket, giderek artan ödül hissi verir. |
| **Kıl payı ıska** | Kapının hemen dışında ölmek "KIL PAYI!" olarak işaretlenir. Temiz bir yenilgiden çok daha güçlü bir tekrar-oynama dürtüsü yaratır. |
| **Oyun-sonu kancası** | "Rekora sadece 80 altın kaldı!" / "2 vuruş daha = NOVA rütbesi". Tamamlanmamış hedef, tamamlanmıştan daha çok akılda kalır. |
| **Anında tekrar** | Oyun-sonu bekleme süresi 0.75sn → 0.45sn. Sürtünme = kaybedilen tur. |

**Sınır:** Bunların hepsi *oyun hissi* düzeyindedir. Gerçek parayla kumar,
sahte aciliyet veya ödeme baskısı yok — oyun tamamen ücretsiz ve
uygulama-içi satın alma içermiyor.

## Zorluk eğrisi: ölçülmüş adalet

Oyunun adaleti tek bir sayıyla ölçülebilir: **pencere** — kıvılcımın kapının
içinde geçirdiği süre. Oyuncunun dokunmak için sahip olduğu gerçek zaman budur.

```
pencere(ms) = 2 × (kapı_yarı_genişliği × ŞEKİL_KAPI) / (hız × ŞEKİL_HIZ) × 1000
```

Eski lineer rampa (`hız += 0.115` tavan 7.6, `kapı ×= 0.972` taban 0.235) bu
ölçüde **çöküyordu**:

| vuruş | 0 | 12 | 24 | 36 | 48 | 72 |
|---|---|---|---|---|---|---|
| **eski** | 729ms | 307ms | 232ms | **98ms** | 88ms | **62ms** |
| **yeni** | 729ms | 322ms | 270ms | **186ms** | 188ms | **137ms** |

36. vuruşta tek aşamada %42'lik bir uçurum vardı: kapı tabanına çarpıyor, hız
ise lineer artmaya devam ediyordu. 62–98ms'lik pencereler **dokunmatik giriş
gecikmesinin (50–100ms) altında** kalır — orada oyun beceri olmaktan çıkıp
şansa döner. Oyuncunun "sabahtan beri geçemiyorum" dediği duvar buydu.

**Yeni model:**
- Hız **asimptotik** yaklaşır: `hız += (5.4 − hız) × 0.045` — ani sıçrama yok,
  tavan adil.
- Kapı tabanı `0.36`'ya yükseltildi (`×= 0.980`).
- Şekil katsayıları birbirine yaklaştırıldı (uçurumu düzleştirmek için).

Sonuç: pencere **hiçbir zaman ~135ms altına inmez**; zorluk artık imkânsız
zamanlamadan değil, **hızdan ve istikrar gerektiren uzunluktan** gelir.
SONSUZLUK'taki yükselme (270ms) bilinçlidir — gerilim/rahatlama ritmi yaratan
bir "nefes alma" aşamasıdır. Ölçümler oyunun içinden, gerçek turlarda da
doğrulanmıştır (en dar gözlenen pencere: 176ms).

## Kasa (risk / ödül) — bağımlılık motoru

Oyunun greed döngüsü **Kasa** sistemiyle çalışır:

- **Riskteki Altın (pot):** run sırasında kazandığın, henüz güvende olmayan
  altın. **Iskalarsan hepsi yanar.**
- **Kasaya Al (🏦 / `C` tuşu):** pot'u kalıcı **Kasa**'ya aktarır. Kasa asla
  kaybolmaz, oturumlar arası saklanır (`localStorage`). Bedeli: **seri
  çarpanın sıfırlanır** — momentumunu feda edersin, ama garantiye alırsın.
- Her an oyuncunun kararı: *"Şimdi kasaya alıp kilitle, yoksa bir perfect
  daha çekip pot'u büyüt ve riske at?"* — **greed vs. kayıp korkusu.**
- Pot büyüdükçe "Kasaya Al" butonu **ısınır** (altın → kırmızı, nabız atar):
  kaybedecek çok şeyin olduğunu hissettirir.
- Kalıcı Kasa = **geri dönüş kancası** (meta-progression): oyuncu servetini
  büyütmek için tekrar tekrar döner.
- Temiz kaçış: pot'u kasaya alıp sonra ıskalarsan kayıp **0** olur ("TEMİZ
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

Iskalayıp öldüğünde, oyun-sonu ekranından **önce** bir teklif çıkar:

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
  Metin bir meydan okumadır: "ONE MORE TAP'ta X Kasa topladım · rütbem … Geçebilir
  misin?" — viral/geri dönüş kancası.

## Günlük ödül / seri (streak)

Her gün ilk açılışta **GÜNLÜK ÖDÜL** açılır. 7 günlük döngü; ödül gün
büyüdükçe artar (100·gün), **7. günde büyük bonus** (+400). Ardışık günler
**seriyi** büyütür; bir gün kaçarsan seri sıfırlanır. Klasik geri dönüş kancası.

## Onboarding: oynayarak öğreten interaktif eğitim

Metin duvarı **yok**. Araştırma nettir: hyper/hybrid-casual'da *"yaparak
öğreten"* interaktif eğitim, statik anlatıma göre tutundurmayı belirgin
biçimde artırır; "tutorial duvarı" ise ilk oturumda oyuncu kaybettirir.
Bu yüzden **ilk tur, oyunun kendisidir** — sadece güvenli hâli:

| Eğitim adımı | Ne olur |
|---|---|
| **1. Dokun** | Yavaş dönüş + çok geniş kapı. Koç balonu: *"Kıvılcım kapıdan geçerken dokun"* |
| **Iska** | **Ölüm yok.** Nazik düzeltme: *"Kapı tam üstündeyken dokun"* |
| **2. Isınma** | Birkaç vuruş daha; zorluk **artmaz** |
| **3. Kasaya Al** | *"Altının riskte"* + **KASAYA AL** butonu nabız atarak işaret edilir |
| **Bitiş** | *"Hazırsın!"* → hız/kapı normale döner, gerçek oyun sorunsuz devralır |

Eğitim bir kez çalışır (`localStorage`), sonra bir daha görünmez.

**Kademeli açılım:** menü butonları oyuncu ilerledikçe açılır — başta yalnız
**BAŞLA + Dükkan**; 1 tur sonra **Görevler + Sıralama**, 2 tur sonra
**Yükselt**. Yeni oyuncu 10 sistemle boğulmaz, kıdemli oyuncu her şeye erişir.

## Arka plan müziği

WebAudio ile **prosedürel lo-fi arpej** (dosya yok, ~0 KB). Sağ alttaki 🎵
düğmesiyle açılır/kapanır (SFX'ten bağımsız); tercih `localStorage`'ta tutulur.
Üst üste binen bildirim/toast'lar artık **sıraya alınır** (yüksek hızda karmaşa
olmaz).

---
_ONE MORE TAP — kasaya al ya da kaybet._

## 🔒 Sahibe özel: geçici altın hilesi

Menüde **ONE MORE TAP logosuna ~1.2 sn basılı tut** → **+100.000 Kasa** ("PATRON MODU").
Tek kişilik, sunucusuz oyun olduğu için zararsızdır. Kodda `GEÇİCİ ALTIN HİLESİ`
bloğu tek parça; yayına almadan önce silmek istersen o bloğu kaldırman yeter.
