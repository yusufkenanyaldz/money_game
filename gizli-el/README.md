# GİZLİ EL — Aşama 1: Simülasyon Çekirdeği

Bir strateji oyunu. Oyuncu hiçbir fraksiyonu yönetmez; dünyayı kimsenin
göremediği yerden iter. Bu klasör oyunun **çekirdeğini** içerir: dünyanın
fiziği, o fiziğin nasıl üretildiği ve üretilen fiziğin nasıl sınavdan
geçirildiği. Arayüz ve oyuncu hamleleri sonraki aşamalarda gelecek.

## Temel iddia

Kurallar sabit değildir. Her oyunda sistem **yeni bir fizik üretir**:
hangi değişken hangisini besler, hangi işaretle, hangi eşikten sonra,
hangi matematiksel şekille. Bir dünyada "meşruiyet düşerse öfke artar"
doğrudur; başka bir dünyada tam tersi. Oyuncu kanunları bilmeden başlar,
gözlemleyerek öğrenir.

## Dosyalar

| Dosya | İş |
|---|---|
| `sim.js` | Çekirdek: kanun üreteci, dünya kurulumu, tur simülasyonu, doğrulayıcı |
| `test.js` | 15 regresyon testi (`node test.js`) |
| `kronik.js` | Bir dünya üretir, kanunlarını yazar, 50 tur tarih yazdırır, kelebek etkisini kanıtlar (`node kronik.js [tohum]`) |

## Fiziğin anatomisi

**Durum.** Her fraksiyonun 6 değişkeni var: Güç, Servet, İstikrar,
Meşruiyet, Bilgi, Öfke (0–100). Ayrıca N×N **asimetrik** ilişki matrisi
(A, B'ye güvenirken B, A'dan nefret edebilir), bölgeler (zenginlik +
huzursuzluk + komşuluk) ve liderler (yaş, hırs, kuşku, kurnazlık,
sadakat, zalimlik, sağlık).

**Kanun.** Bir kanun, hedef değişkenin turluk değişimine katkı ekler:

```
Δ(hedef) += katsayı × şekil( kapsam(kaynak) )
```

- **kapsam** ∈ {kendi, düşmanlarının, müttefiklerinin, komşularının, dünyanın}
- **şekil** ∈ {doğrusal, eşik, çarpım, kıtlık, doyum, geri besleme}
- **katsayı** ∈ ±[0.45, 3.0], **eşik** ∈ [22, 78]

6 hedef × 6 kaynak × 6 şekil × 5 kapsam × sürekli katsayı/eşik → tek bir
kanun için binlerce ayrık biçim; bir dünyada 13–19 kanun bulunur.

**Güdümlü rastgelelik.** Kör rastgelelik ölü doğan setler üretir, bu yüzden
üretimde üç kısıt var (`kanunSetiUret`): her hedef değişken en az bir
kanunla beslenir (yetim boyut olmaz), kanunların en az %45'i fraksiyonlar
arasıdır (dalga yayılabilsin), en az bir geri besleme çevrimi bulunur.
Gerisi serbest.

**Evrenin değişmez yasaları.** Rastgele kanunların altında sabit bir
zemin var: ordu beslenir (`Δservet -= (güç/100)² × 1.3`), büyük güç kendi
ağırlığı altında ezilir (`Δgüç -= (güç/100)³ × 1.1`), her fraksiyon kendi
doğasına (`taban`) çekilir ve aynı kanuna farklı şiddette tepki verir
(`mizaç` ∈ [0.55, 1.5]). Uygulama adımında **yumuşak bariyer** vardır:
12–84 arasında fiziğe hiç dokunmaz, uçlarda karesel olarak geri iter —
böylece değişkenler tavana park edemez ama orta bölgede dünya canlı kalır.

**İlişkiler kutuplaşır.** Düşmanlık düşmanlığı besler (çift kararlılık),
sınır komşuluğu sürtüşme yaratır, savaş ve toprak kaybı kalıcı kin bırakır.
Bu eklenmeden önce 120 dünyada yalnızca **6** savaş çıkıyordu; sonrasında
6410. İlişki dağılımı ortada sıkışmak yerine uçlara yayıldı (%15 kan davası,
%28 sıkı ittifak).

**Olaylar sürekli olasılıklıdır.** İsyan, darbe, kıtlık, savaş, kopuş,
altın çağ, veraset ve çöküş sabit eşiklerle değil, duruma göre kayan
olasılıklarla tetiklenir. Kararların birikmesi buradan doğar: durumdaki
en küçük fark eşiği geçme ihtimalini kaydırır.

**Rastgelelik konumsaldır.** Gürültü ve olay zarları `hash(tohum, tur, …)`
ile üretilir, sıralı bir akıştan değil. Böylece geçmiş değişse bile aynı
turda aynı zar atılır — ölçülen sapma gerçek dinamikten gelir, akış
kaymasından değil.

## Doğrulama: üretilen her fizik sınava girer

Rastgele fiziğin çoğu oynanmaz. `dogrula(tohum)` bir dünyayı 200 tur
koşturur ve 11 ölçütle yargılar:

| Ölçüt | Eşik | Neyi eler |
|---|---|---|
| canlılık | 0.30–2.2 | donuk ve çılgın dünyalar |
| uç değer oranı | ≤ %18 | tavana yapışmış dünyalar |
| ayakta kalan | ≥ 4 | kırım dünyaları |
| çeşitlilik | ≥ 7 | tek düze dünyalar |
| olay sayısı | 15–260 | olaysız ve gürültülü dünyalar |
| olay tipi | ≥ 4 | dar dramalar |
| olay tekeli | ≤ %55 | tek bir olayın kroniği ele geçirmesi |
| ayrışan boyut | ≥ 4/6 | fraksiyonların birbirine benzemesi |
| ray | 0 | ortalaması tavana/tabana gitmiş boyut |
| açılış (ilk 60 tur) | ≥ 8 olay, ≥ 4 tip | soğuk açılış (oyuncu ilk turları oynar) |
| **kelebek** | en sapma ≥ 12, yayılım ≥ %15, yapısal ≥ 1 | **kararların birikmediği dünyalar** |

**Kelebek sınavı** en kritiği. 20. turda oyuncu ölçeğinde tek bir dokunuş
yapılır ve 120. turda dünya karşılaştırılır. İki ayrı hamle denenir
(bir fraksiyonu finanse etmek, başka birinin meşruiyetini sarsmak) ve
**ikisi de** dünyayı yeniden yazabilmelidir — tek şanslı kaldıraç sayılmaz.
"Yapısal fark" değişken oynamasını değil, bölgenin el değiştirmesini,
liderin başkası olmasını, fraksiyonun yaşayıp ölmesini sayar.

Ucuz sınavlar önce koşar; pahalı kelebek sınavı yalnızca onları geçen
dünyalara uygulanır.

## Ölçümler

1000 tohum üzerinde (`node test.js` bunu 600 tohumda tekrar doğrular):

- **Kabul oranı: %0.30** — rastgele üretilen her 330 fizikten biri oynanmaya değer
- **Tohum başına maliyet: 13 ms** → oyun açılışında dünya arama **~4 saniye**
- Sınavı geçen dünyalarda tipik: 8 olay tipi, ilk 50 turda 35–41 olay,
  6/6 ayrışan boyut, tek hamlenin en büyük etkisi 13–56 birim, yayılım %19–50

Olay dağılımı (100 dünya × 200 tur): savaş %24 · isyan %23 · kıtlık %22 ·
kopuş %12 · darbe %8 · veraset %5 · altın çağ %4 · çöküş %1.

## Denenip elenen yaklaşımlar

Bunlar ölçülerek reddedildi, not düşülüyor ki tekrar denenmesin:

- **Sert kırpma (0–100).** Değişkenler uçlara yapışınca küçük farklar yok
  oluyor, kelebek etkisi ölüyor. Yerine lojistik doyum + yumuşak bariyer.
- **Global sönüm artırma.** Dünyayı raydan kurtarıyor ama tek düzeleştiriyor:
  çöküş %14 azalırken donukluk %60 arttı. Kötü takas.
- **Kanun setini denge sabitleriyle kalibre etmek** (`kalibreEt`, kodda
  duruyor ama çağrılmıyor). 500 dünyada ölçüldü: kabul oranına katkısı yok,
  maliyeti 3 katı. Dünyayı raydan koruyan şey kalibrasyon değil, bariyer ve
  fraksiyon başına taban/mizaç farkları.
- **Sabit olasılıklı ikili olay eşikleri.** Durumdaki küçük farkları
  görmüyor, kararların birikmesini engelliyor. Yerine sürekli olasılıklar.

## Neden LLM kullanılmıyor

Çekirdek için Claude API'si düşünüldü ve reddedildi: her tur gecikme,
dengelenemeyen kurallar, internet ve anahtar zorunluluğu. Strateji oyununun
kalbi tutarlı, keşfedilebilir ve tekrar üretilebilir bir matematik olmalı.

## Sonraki aşamalar

Aşama 2a aşağıda. Kalanlar: oyuncunun tam fiil dağarcığı, nüfuz/ifşa
ekonomisi, doktrinler ve arayüz.

---

# Aşama 2a: Tohumlar, Meseleler ve Kontrolden Çıkma

Oyunun ekrandan çok kafada dönmesi için iki şey gerekiyordu: **iyi şeylerin
kontrolden çıkabilmesi** ve **kararların gerçek bilgi gerektirmesi**. İkisi
de mekaniğe gömüldü.

## Fayda ile risk ayrılamaz

Oyuncu bir fikri bir toplumsal katmana eker (`tohumEk`). Tohumun tek bir
büyüme değişkeni var: **olgunluk**. Getirisi olgunlukla artar — ve üzerindeki
**denetim** aynı olgunlukla erir:

```
getiri   = olgunluk × (denetim/100) × 2.6  +  olgunluk × 0.55
erime    = (olgunluk/100)^1.55 × katman.tehlike × 1.05  +  ideolojik sapma × 1.30
bağımsız = olgunluk × (1 − denetim/100)
    → öfke +2.5×bağımsız, meşruiyet −1.9×bağımsız, istikrar −1.1×bağımsız
```

Yani kendini geliştirmiş ama düzeni kabul etmeyen bir topluluk, tam olarak
onu değerli kılan olgunluk yüzünden tehlikelidir. Bu iki etkiyi ayıran bir
düğme yok — tasarımın özü bu.

Denetim kendiliğinden **geri gelmez**. Ancak bir bedelle (gözetim, bastırma,
kurumsallaştırma) durdurulabilir.

**Katmanlar** farklı davranır: asker hızlı ve en tehlikeli (tehlike 2.10),
esnaf hızlı ama görünmez, halk yavaş, seçkinler hızlı ve gözle görülür.
Aynı fikri nereye ektiğin, ne olacağını belirler.

## Mekanikler gerçek kuramların matematiğidir

Bu oyunun kuralları uydurulmuş değil. Her mesele bir kuramın modelidir:

| Kavram | Kaynak | Oyunda nasıl işliyor |
|---|---|---|
| Tunç Oligarşi Yasası | Michels, *Siyasal Partiler* (1911) | Denetim olgunlukla erir; hareket kendi seçkinini üretir ve doğrultusu katmanın çıkarına kayar |
| Tercih Saklama | Timur Kuran, *Yalanla Yaşamak* (1995) | `görünürDestek` ≠ `gerçekDestek`; bastırma ilkini kırar, ikincisini büyütür; fark 30'u aşınca çağlayan riski |
| Tocqueville Paradoksu | Tocqueville, *Eski Rejim ve Devrim* (1856) | Konağın serveti hızla düzelirken öfke artar — iyileşme isyanı besler |
| Günah Keçisi | Girard, *Şiddet ve Kutsal* (1972) | Suçu tek bir kurbana yıkmak öfkeyi gerçekten düşürür — meşruiyet bedeliyle |
| Vekil Sorunu | Jensen & Meckling (1976) | Gözetim işe yarar ama serveti yer ve fark edilir |
| Asabiyet · Goodhart · Olson · Okunabilirlik · Ortakların Yönetimi | İbn Haldun, Goodhart, Olson, Scott, Ostrom | Kütüphanede; sonraki aşamalarda mekaniğe bağlanacak |

**Oyun bu kavramları açıklamaz.** Mesele kapandıktan sonra yalnızca kavramın
adını, tek cümlesini ve kaynağını kütüphaneye ekler. Okuyan oyuncu bir
sonrakini önceden görür. Araştırmaya zorlayan şey bu: bilgi gerçekten
oynanış avantajına dönüşüyor.

## Meseleler durağan değildir

Mesele açıldığında dünya durmaz. Pencere açık kaldığı sürece akım büyümeye,
denetim erimeye, saklı destek birikmeye devam eder; her tur `mesele.günlük`'e
yeni bir satır düşer. **Beklemek de bir karardır** ve denetimden 6 puan götürür.
Süre dolarsa karar senin yerine verilir.

Kritik bilgi (gerçek destek) oyuncudan **gizlenir**; öğrenmek için gözetim
gerekir ve gözetimin kendi bedeli vardır.

## Kopuş: eserin sana rakip olur

`olgunluk > 78` **ve** `denetim < 8` **ve** ideolojik sapma > 0.30 **ve**
gerçek destek > %52 olduğunda akım kopabilir: `fraksiyonEkle` yeni bir
fraksiyon doğurur, ilişki matrisini büyütür, ana gövdeyle ilişkisini −85'e
sabitler, konağın meşruiyet ve istikrarını düşürür, destek yeterliyse bir
bölgeyi de götürür. Artık dünyada senin yarattığın ama sana ait olmayan
bir güç vardır.

## Ölçülen: aynı andan beş farklı tarih

`node mesele-demo.js` — bir akımı olgunlaştırır, mesele açıldığı anda dünyayı
beşe dallandırır ve 60 mevsim sonrasını karşılaştırır. Tipik bir çıktı:

| Karar | Konağın hâli | Akımın hâli | 60 mevsim |
|---|---|---|---|
| Bekle | meşruiyet 42 · öfke 60 | **koptu** | 18 ayaklanma · 1 yeni fraksiyon |
| Gözetle | meşruiyet 28 · öfke 71 · **bilgi 77** | senin · denetim %29 · **gerçek destek %84** | 16 ayaklanma |
| Kurumsallaştır | meşruiyet 25 · öfke 70 | düzenin parçası · sökülemez | 16 ayaklanma |
| Yönlendir (tuttu/tutmadı) | meşruiyet 47 · öfke 56 | direndi, koptu | 18 ayaklanma · 1 yeni fraksiyon |
| Terk et | meşruiyet 38 · öfke 56 | koptu | 18 ayaklanma · 1 yeni fraksiyon |

Dikkat: **en parlak görünen dal (Gözetle, bilgi 77) en tehlikelisi** —
saklanan destek %84. Oyun bunu söylemez.

`test.js` 31 testle doğruluyor: olgunluk 50/50 turda büyüyor, denetim 50/50
turda eriyor, beş karar beş farklı durum vektörü üretiyor, bastırma görüneni
31→8 kırarken gerçeği 37→59 büyütüyor, kopuş sonrası ilişki matrisi ve bölge
sahiplikleri tutarlı kalıyor.

## Sonraki

3. Oyuncunun tam fiil dağarcığı (tur başına 200–400 meşru hamle) ve nüfuz/ifşa
   ekonomisi
4. Kalan kuramların mekaniğe bağlanması (Asabiyet hanedan döngüsüne, Goodhart
   tekrarlanan müdahaleye, Olson kolektif eyleme, Scott merkezileşmeye)
5. Doktrinler ve arayüz

---

# Aşama 2b: Gizli El — fiiller, kaynaklar, doktrin

Oyuncu hiçbir fraksiyonu yönetmez. İki kaynağı vardır ve asıl kısıt
nüfuz değil, **ifşa**dır.

| Kaynak | Davranış |
|---|---|
| **Nüfuz** | Harcanır. Dolma hızı doktrinine hizalanmayla belirlenir: `0.5 + (hizalanma/100)^1.4 × 3.4`. Tavan 24. |
| **İfşa** | Birikir, yavaş söner (1.15/tur), 100'e varırsa oyun biter. |

## Tur başına 381 meşru hamle

Ölçüldü: 12. turda 381, olgun ajanlarla 500'ün üstü.

| Fiil | Nüfuz | İfşa | Hedef uzayı | Bağlı kuram |
|---|---|---|---|---|
| İncele | 3 | 0.4 | her gizli kanun | — (araştırma döngüsü) |
| Fısılda | 2 | 1.0 | her lider (ajan gerekir) | Vekil sorunu |
| Ajan yerleştir | 4 | 1.5 | her fraksiyon | Vekil sorunu |
| Koru | 3 | 0.8 | her fraksiyon | — |
| Finanse et | 4 | 1.5 | her fraksiyon | Tocqueville |
| Sızdır | 2 | 1.7 | her fraksiyon çifti | Scott |
| Kışkırt | 3 | 2.4 | her fraksiyon | Olson |
| Tohum ek | 5 | 1.0 | fraksiyon × 5 katman × 6 amaç = 240 | Michels |
| Kehanet | 4 | 2.0 | fraksiyon × 6 değişken × 2 yön = 96 | Merton |
| İfşa et | 3 | 2.9 | her sır × her fraksiyon | Girard |

## Goodhart: aynı kaldıraca basmak onu bozar

Her `(fiil, hedef)` çifti yıpranır. Etkinlik `1 / (1 + yıpranma^1.3 × 0.38)`
ile düşer, yıpranma turda yalnızca 0.035 iyileşir. Düşük etkinlik ayrıca
ifşayı artırır (`ifşa × (2 − etkinlik)`) — beceriksiz hamle daha görünürdür.

Ölçüldü: aynı hamleyi 40 kez tekrarlayan oyuncunun etkinliği **0.05**'e
çöküyor; altı fiil arasında dönen oyuncu **0.64**'te kalıyor.

## İfşa riski dünyaya bağlıdır

`(0.5 + hedef.bilgi/115) × (orada olgun ajan varsa 0.72) × (korunuyorsa 1.15)`

Ölçüldü: aynı fiilin maliyeti hedefe göre 0.70 ile 1.18 arasında değişiyor;
olgun bir ajan izi 0.92'den 0.66'ya düşürüyor. Yani *nereye* dokunduğun,
*ne yaptığın* kadar önemli.

**Tempo eğrisi** (ölçüldü, 3 dünya):

| Tempo | Sonuç |
|---|---|
| Her tur hamle | 65–86. turda yakalanır |
| İki turda bir | 142–166. turda yakalanır (bir dünyada hayatta kalır) |
| Üç turda bir | 200+ tur ayakta, etkinlik 0.72–0.80 |
| Tek fiili spamlamak | Güvenli ama etkisiz (0.05–0.13) — ölü yol, sömürü değil |

## Kehanet — geleceğe göre şimdi karar vermek

Bir fraksiyonun bir değişkeni hakkında 12 mevsimlik iddia. Tutarsa +9 nüfuz
ve −4 ifşa; tutmazsa +7 ifşa ("yalancı peygamber fark edilir"). İlan etmek
dünyayı iddiaya doğru hafifçe iter (**Merton**, kendini gerçekleştiren
kehanet) — ama bu itiş, iddiayı kanıt olmaktan da çıkarır.

Kehanet oyunun "gelecekteki kararına göre şimdi karar ver" talebinin
karşılığıdır: doğru kehanet için kanunları bilmen gerekir, kanunları
bilmek için nüfuz harcaman gerekir.

## Doktrin: hem amaç hem motor

| Doktrin | Tarif |
|---|---|
| **Denge** | Hiçbir güç ötekini ezmesin. |
| **Bilgelik** | Dünya bilsin ve öfkelenmesin. |
| **Dirlik** | Kimin elinde olduğu önemli değil; halk rahat etsin. |
| **Çözülme** | Büyük olan hiçbir şey ayakta kalmasın. |
| **Arılık** | Tek bir fikir dünyaya sinsin. |
| **Süreklilik** | Aynı el hep üstte kalsın — kim olduğu fark etmez. |

Doktrin yalnızca puan tablosu değil: dünya doktrinine benzedikçe nüfuzun
dolar. Bu yüzden doktrinine aykırı her hamle iki kez pahalıdır — bir kez
nüfuz olarak, bir kez de nüfuzunun kaynağını kuruttuğu için.

Ölçüldü: aynı dünyayı doktrinler 0 ile 59 arasında puanlıyor. Aynı doktrin
(Bilgelik) üç farklı dünyada 10 / 27 / 57 ortalama veriyor — yani amaç sabit
olsa bile oyun her dünyada baştan öğrenilir.

## Test kapsamı

`node test.js` — 49 test. Yenileri: 381 hamle sayımı, Goodhart yıpranması
(0.05 vs 0.64), ifşanın hedefe göre değişmesi, ajanın iz örtmesi, gizli
kanunların incelemeyle açılması, kehanetin vadesinde çözülmesi, aceleci
oyuncunun yakalanıp sabırlının ayakta kalması, doktrinlerin ayrışması ve
**oyuncu hiç hamle yapmazsa dünyanın birebir aynı akması**.

## Kalan

- Asabiyet (İbn Haldun) hanedan döngüsüne, Ostrom ortak bölgelere bağlanacak
- Meselelerin tek cümleden istihbarat dosyasına dönmesi (günlerce düşündüren
  asıl şey bu)
- Arayüz

---

# Aşama 2c: Dosya, Asabiyet ve Ortaklar

## Mesele değil, dosya

Bir mesele açıldığında oyuncuya rakam verilmez. **Dosya** verilir:
tanıklıklar, çelişkiler, aralıklı tahminler ve nitel seçenekler. Hiçbir
seçenek tarifinde sayı geçmez — "Bastır: sokağı sustur; görünen biter,
görünmeyen için bir şey söylenemez."

Dosyanın kalitesi oyuncunun **önceden yaptığı yatırıma** bağlıdır. Her olgu
bir gizlilik derecesi taşır, her kaynağın bir erişim sınırı vardır:

| Kaynak | Hata | Yalan | Erişim |
|---|---|---|---|
| Yerinde (olgun ajan) | ±4 | %4 | 1.00 |
| Kurum (kurumsallaşmış akım) | ±9 | %12 | 0.72 |
| Rakip (düşmanın anlatısı) | ±15 | %36 | 0.55 |
| Sokak (kulaktan dolma) | ±25 | %32 | 0.45 |
| Kronik (kendi gözlemin) | ±3 | %0 | 0.32 |

Kronik hatasızdır ama yalnızca olup bitmiş görünür şeyleri anlatır: erişimi
en dar kaynaktır. Halkın **gerçek** desteği (gizlilik 0.92) yalnızca
içerideki olgun bir ajanla bilinir — Timur Kuran'ın tercih saklaması tam
olarak burada mekanik hâline gelir.

**Ölçüldü** (`node dosya-demo.js`): altı olgudan doğru bilinenlerin oranı

| | Ajan yerleştirmiş | Yerleştirmemiş |
|---|---|---|
| Doğru bilinen olgu | %83 | %33 |
| Karanlıkta kalan | 0 | 4 |
| Kritik olgu (gerçek destek) | biliniyor | **karanlıkta** |

Ajansız oyuncunun elindeki en iyi tahmin "%20–%70" gibi bir bant olur.
Karar vermek için oturup düşünmek zorunda kalmanın kaynağı bu.

**Çelişkiler.** Aynı konuda iki kaynak, biri yanılıyor:

```
Amaçtan sapma:
  Rakip (düşmanının anlattığı): "Artık senin öğrettiğini değil,
                                 kendi bulduklarını konuşuyorlar."
  Kronik (kendi gözlemin):      "Sapma var ama gövde duruyor."
```

Oyun hangisinin doğru olduğunu söylemez. Kaynağın ağırlığını, o kaynağın
o konuya erişimi olup olmadığını ve yalan payını sen tartarsın.

## Asabiyet — döngü, kayma değil

İlk uygulamada asabiyet tek yönlü sıfıra kayıyordu; bu İbn Haldun değil,
sadece bir çöküştü. Döngüyü kapatan parça eklendi: asabiyeti 14'ün altına
düşen hanedanın yerini **taşradan gelen taze bir dayanışma** alır
(`yenilenme` olayı) — nesil sıfırlanır, asabiyet 68–90'a sıçrar, servet
%22 düşer, istikrar sarsılır.

- Çözülme: `(0.10 + servet/100 × 0.42 + nesil × 0.10) × (0.4 + asabiyet/140)` — dipte yavaşlar
- Diriliş: dış tehdit başına +0.42
- Veraset nesli artırır; **darbe ve kopuş yeni hanedandır** (nesil 0, asabiyet tazelenir)

Ölçüldü: 260 turda asabiyet 12 ile 100 arasında salınıyor, fraksiyonlar
birbirinden bağımsız evrelerde. Kopan akımlar 88 asabiyetle doğuyor —
bu yüzden senin eserin sana en tehlikeli rakip olur.

## Ortaklar — Hardin ve Ostrom

Üç veya daha fazla gücün sınırında kalan bölge **ortak**tır. Kural yoksa
tükenir (−0.30/tur); kural varsa kendini taşır (+0.10/tur).

Kural iki yoldan doğar: oyuncunun o bölgedeki kurumsallaşmış akımı, ya da
kendiliğinden biriken **gelenek** (sakin ve istikrarlı yıllarda +0.42/tur).
Ama gelenek kırılgandır: bölge el değiştirdiğinde %68'i yok olur. Ostrom'un
asıl tezi budur — yerel kural dışarıdan gelen düzenle değil, yerinde
birikimle ayakta kalır.

Ölçüldü (40 dünya, 150 tur): kurallı ortak **60.6**, kuralsız ortak
**35.8**, özel bölge **36.5** zenginlik.

## Yol boyunca düzeltilen kusurlar

- **Bölge ölüm sarmalı.** Fraksiyonun serveti 50'nin altına düşünce bölge
  fakirleşiyor, fakir bölge serveti daha da düşürüyordu. Ortalama bölge
  zenginliği 200 turda **7.4**'e iniyordu. Her bölgeye kendi taşıma
  kapasitesi verildi → **34.5**. Dünya kabul oranı da %0.25'ten %0.50'ye çıktı.
- **Savaş kroniği kaplıyordu** (%35). Savaş olasılığı 0.09→0.072 → %33,
  dokuz olay tipine dengeli dağılım.
- **Testler sabit tohuma bağlıydı.** Fizik değişince kırıldılar. Artık her
  koşuda sınavı geçen bir tohum yeniden aranıyor.
- **İlk dosya tasarımında "kendi gözlemin" kaynağına sıfır hata verilmişti** —
  üstelik görülemeyecek şeyler için bile. Ölçüm ajanın değerini %90'a karşı
  %87 gösterdi, yani yatırım anlamsızdı. Kaynaklara erişim sınırı eklenince
  fark %83'e karşı %33 oldu.

## Test kapsamı

`node test.js` — **63 test**. Yenileri: dosya yapısı, tahminlerin aralık
olması, seçenek tariflerinde sayı bulunmaması, ajanın doğru bilinen olgu
sayısını ikiye katlaması, ajansız oyuncuda kritik olguların karanlıkta
kalması, çelişkilerin farklı kaynaklardan gelmesi, kütüphanenin dolması,
asabiyet döngüsünün hem çöküp hem dirilmesi, kuralsız ortakların tükenmesi.

## Kalan

- Arayüz
- Kehanetin dosyaya bağlanması (kanunları bilen oyuncu daha iyi kehanet kurar)
- Meselelerin fraksiyon-içi olmayan türleri (savaş öncesi, veraset krizi, ortak bölge anlaşmazlığı)

---

# Aşama 2d: Dünyanın kendi krizleri + araştırmanın karşılığı

## Üç yeni mesele türü

Meseleler artık yalnızca senin ektiğin tohumlardan doğmuyor. Dünyanın kendi
gerilimleri de dosya açıyor.

| Mesele | Tetik | Kuram | Seçenekler |
|---|---|---|---|
| **Savaş eşiği** | İlişki −60'ın altında **ve** saldıranın gücü hızla artıyor | Thukydides Tuzağı | Araya gir · Planı sızdır · Düşmanlığı saptır · Kızıştır · Bekle |
| **Veraset** | Lider yaşlı/hasta **ve** asabiyet zayıf | Kralın İki Bedeni | Veliahdı destekle · Rakibi destekle · Uzlaştır · Krizi derinleştir · Bekle |
| **Ortak toprak** | Ortak bölgede gelenek çökmüş **ve** huzursuzluk yüksek | Ostrom | Kural yazdır · Bölüştür · Tek ele bırak · Kızıştır · Bekle |

**Thukydides tetiği önemli:** savaş olasılığını güç *farkı* değil, gücün
*değişme hızı* belirliyor (`ivme × 0.10 + düşmanlık + fark/600`). Yükselen
bir güç, hâlâ zayıfken bile krizi açar.

Yeni kavramlar kütüphaneye eklendi: **Thukydides** (Allison, *Kaçınılmaz
Savaş*, 2017) ve **Kantorowicz** (*Kralın İki Bedeni*, 1957).

**Tempo ölçüldü:** 8 dünya × 180 tur → ortalama **8.8 turda bir mesele**,
aynı anda en çok **2** açık. Oyuncu 3 turda bir hamle yaptığına göre bu,
her meseleye birkaç hamlelik nefes alanı bırakıyor.

Kararların gerçekten ayrıştığı ölçüldü: araya girmek ilişkiyi −47'de
tutarken kızıştırmak −100'e indiriyor; veliahdı desteklemek meşruiyeti
39'da tutup asabiyeti 17'ye düşürürken rakibi desteklemek meşruiyeti 15'e
indirip asabiyeti 49'a çıkarıyor ve nesli sıfırlıyor; kural yazdırmak
geleneği 67'de bırakırken tek ele bırakmak 5'e düşürüyor.

## Araştırma artık gerçekten kazandırıyor

`İncele` fiilinin iki hedefi var:

- **Kanun** — dünyanın fiziğinden bir tanesi açığa çıkar
- **Doğa** — bir fraksiyonun `taban`ı çözülür: hangi değerlere geri döndüğü

İkisi de gerekli. Ölçüm şunu gösterdi: kanunların anlık net katkısı 12
turluk değişimle **0.71 korelasyon** taşıyor — yani kanunlar gerçekten
öngörü veriyor. Ama ikinci büyük kuvvet (doğaya geri dönüş, **−0.44**)
oyuncuya kapalıydı; bu yüzden ilk halinde araştırma hiçbir işe yaramıyordu
(%28'e karşı %27).

Doğa incelenebilir hâle gelince kehanet isabet oranları:

| Oyuncu | İsabet |
|---|---|
| Hiç araştırmayan | %31 |
| **Sadece kanunları bilen** | **%25** |
| Kanun + doğa | **%39** |

Sadece kanunları bilmenin cahilden **kötü** çıkması bir hata değil,
ölçümün ortaya çıkardığı bir özellik: kanunu bilip geri dönüş kuvvetini
görmeyen oyuncu, kendinden emin şekilde yanılıyor. Yarım bilgi hiç
bilgiden zararlı.

Ödül tarafı da dayanağa bağlandı:

```
tutarsa  : nüfuz += 5 + 11 × dayanakGücü     ifşa −= 2 + 4 × dayanakGücü
tutmazsa : ifşa  += 9 − 4 × dayanakGücü
```

Dayanaksız bir kehanet ucuzdur ve tuttuğunda şans sayılır; yanlış çıktığında
en çok onu yakar. Ayrıca ilan edilen kehanetin Merton itişi de dayanakla
güçlenir (`× (1 + dayanakGücü × 0.8)`) — kanunu bilen, hangi kaldıraca
bastığını da bilir.

## Dürüstçe: henüz gösteremediğim şey

Araştırmanın kehanet isabetini ve ödülünü artırdığı ölçüldü. Ama bu
avantajın **dünya sonucuna** yansıdığını gösteremedim: üç bilgi seviyesinde
de doktrin hizalanması 57–59 arasında kaldı. Sebebi büyük olasılıkla ölçüm
oyuncusunun kazandığı fazla nüfuzu hiçbir şeye harcamaması. Bunu ancak
gerçek bir oyuncu stratejisiyle (ya da arayüzle) doğrulayabilirim.

## Düzeltilen kaçak

Açık mesele tavanı yalnızca dünyanın krizlerine uygulanıyordu; tohum
meseleleri tavanı deliyordu ve oyuncu 3 dosyayla birden karşılaşabiliyordu.
Tavan `meseleAc` içine taşındı: artık tohum meselesi de dünyanın krizi de
aynı kuyruğa giriyor, açılamayan kriz sırasını bekliyor (uyarı bayrağı
harcanmıyor).

## Test kapsamı

`node test.js` — **82 test**. Yenileri: mesele tempoları, açık mesele
tavanı, üç kriz türünün de doğması ve kendine özgü olgularla dosya
üretmesi, her kriz türünde kararların ayrışması, incelemenin hem kanun hem
doğa açması, doğa bilinmeden geri dönüş kuvvetinin hesaplanamaması,
kanunların öngörü korelasyonu (0.71) ve dayanaklı kehanetin farklı
bedellendirilmesi.

---

# Aşama 3: Arayüz

Gösterge paneli değil **masa**. Sen dünyayı görmüyorsun; dünya hakkında
rapor alıyorsun.

## Hak etmediğin rakamı görmezsin

Görünürlük sunum katmanında değil, oyun mantığında (`bilgiSeviyesi`,
`gorunum`, `bolgeGorunum` — test edilebilir):

| Seviye | Koşul | Ne görürsün |
|---|---|---|
| 0 | kaynağın yok | yalnızca dışarıdan görülen üç değişken, kelimeyle |
| 1 | doğasını çözdün ya da orada kurumun var | altı değişken kelimeyle + gidişat |
| 2 | olgun ajanın var | kesin rakam + gidişat |

Fraksiyon satırı böyle okunur: `Kara Yemini — güçlü · dar · homurdanıyor`
ve sağda `kaynağın yok`. İstikrar, meşruiyet ve bilgi hiç görünmez.

**İfşa rakamla değil kelimeyle** gösteriliyor: *iz yok · silik · seçiliyor ·
belirgin · tehlikeli · açıkta*. "İfşa 63" yazsaydım oyuncu onu optimize
ederdi; "iz: belirgin" yazınca tartmak zorunda kalıyor. Doktrin hizalanması
da aynı: *dünya sana benziyor / yaklaşıyor / kayıtsız / yabancı / karşı*.

## Şema — yalnızca bildiğin kadarı

Bölgeler halka üzerinde düğüm, komşuluklar çizgi. Coğrafya ve sahiplik
herkesçe bilinir, **içerisi bilinmez**: içi boş düğüm "kaynağın yok"
demektir, içi dolu düğüm zenginliği ve huzursuzluğu görebildiğin yer.
Çift halka ortak toprağı gösterir (bölgelerin ölçülen %33'ü).

## Emir yaz

Fiil → hedef → onay. Hedef listesinde her satır yıpranmayı ve bırakacağı
izi söyler (`yıpranmış ×0.42 · iz orta`), onay ekranı bedeli tekrar eder.
Sayı yerine kelime: *az · orta · çok · pervasız*.

## Açık dosyanın üstünden geçemezsin

Bir mesele açıkken alt butonun yazısı **"Bekle · 2 dosya açık"** olur ve
vurgusu kaybolur. Pencere son mevsime indiğinde geçmeye çalışırsan
"Karar vermezsen karar senin yerine verilir" uyarısı çıkar. Yeni bir dosya
geldiğinde hangi çekmecede olursan ol masaya çekilirsin.

"10 tur ilerlet" butonu **yok**. Tek tek mevsim.

## Açılış anlık

Dünya arama tarayıcıda 2.5–15 saniye sürüyordu; telefonda çok daha kötü
olurdu. İki düzeltme:

- **Doğrulayıcıya erken eleme kapısı** eklendi: adayların çoğu 60. ve 85.
  turda zaten belli oluyor (soğuk açılış, gürültü, kırım). 17.2 → 12.9 ms/tohum.
- **160 doğrulanmış tohum önceden bulunup gömüldü** (`tohumlar.js`, 1 KB).
  23.726 aday elenerek toplandı, kabul %0.67. Açılış artık **0.3 saniye**.
  Oynadığın dünyalar işaretleniyor; liste tükenirse oyun canlı aramaya düşer.

## Kayıt

Her hamlede ve her mevsimde `localStorage`'a yazılıyor. Kütüphane ekranında
**kaydı metin olarak dışa aktarma** var — iOS ana ekrana eklenmemiş
sitelerin verisini 7 günde sildiği için bu şart.

## Çevrimdışı

`sw.js` beş dosyayı önbelleğe alıyor; internet olmadan açılıyor.
Ölçüldü: **0 dış istek**, **0 hata**.

## Yol boyunca bulunan hatalar

- `hidden` olan giriş ekranı dokunmaları yutuyordu — CSS'teki `display:flex`
  `[hidden]`'ı eziyordu. Telefonda oyun hiç başlamazdı.
- Harita etiketleri düğümlerin üstüne binip tıklamayı engelliyordu; etiketlere
  `pointer-events:none` ve düğümlere 17px görünmez dokunma hedefi eklendi.
- Etiketler görüş alanından taşıp kesiliyordu (viewBox 300→380, yarıçap 118→98).
- Örtü yarı saydamdı, arka plan sızıyordu.
- **Oyuncu açık dosyanın üstünden geçip gidebiliyordu**: meseleler süresi
  dolup kendiliğinden kapanıyor, karar hiç verilmiyordu.
- Başka çekmecedeyken gelen dosya görünmüyordu.

## Dosyalar

`index.html` (9 KB) · `ui.js` (20 KB) · `sim.js` (60 KB) · `tohumlar.js` (1 KB)
· `sw.js` · `manifest.webmanifest`

Yayına almak için: GitHub → Settings → Pages → branch
`claude/simple-addictive-game-design-q8yeyq`, klasör `/ (root)`. Adres
`https://yusufkenanyaldz.github.io/money_game/gizli-el/` olur; telefonda
Paylaş → Ana Ekrana Ekle.

---

# Aşama 3b: Arayüz yeniden — kâğıt dosya

İlk arayüz reddedildi ve haklı olarak: sadelik değil **karaktersizlik**
olmuştu. Koyu antrasit + tek kehribar vurgu, büyük harf harf-aralıklı
etiketler, ince çerçeveli kartlar, ortalanmış sütun — "zevkli minimal"in
varsayılan ayarı. Oyunun kendi fikri arayüze hiç yansımamıştı: bu oyun
dosya, kronik ve kütüphane üzerine kurulu, yani **kâğıt** üzerine; ben onu
ekrana çizmiştim.

## Ne değişti

**Kâğıt.** Sıcak kemik rengi zemin (`#e9e2d3`), sepya mürekkep. Belgeler
belge gibi görünüyor. Tek vurgu rengi damga kırmızısı ve yalnızca süre
dolmak üzereyken kullanılıyor.

**Karalama.** Bilinmeyen değerler artık "bilinmiyor" yazmıyor —
**basılmamış, karalanmış blok** olarak çıkıyor. Fraksiyon listesinde altı
değişkenin hepsi listeleniyor; göremediklerin boş değil karalı, yani neyi
bilmediğini de görüyorsun. Kütüphanede incelemediğin kanunlar da karalı
satırlar hâlinde duruyor: "9 kanun hâlâ karanlıkta."

**Kenar notları.** Büyük harfli başlık şeridi yok. Bölüm adları sol kenar
boşluğunda küçük italik notlar: *bu mevsim · güçler · tanıklıklar ·
tahminler · çelişki · kararın*. Basılı bir raporun düzeni.

**Kart yok.** Çerçeveli kutular gitti; yerine boşluk, ince cetvel çizgisi
ve girinti. Tahminler noktalı sıra (dot leader) ile hizalanıyor, defter
gibi. Rakamlar eski tarz (oldstyle) rakam.

**Sekme şeridi yok.** Çekmeceler küçük italik bir satır: *Masa · Harita ·
Kronik · Kütüphane*, açık olanı düz yazı ve altı çizili.

**Şema mürekkeple.** Sahip renkleri kuru boya gibi soluk tonlar. İçi boş
düğüm "kaynağın yok", içi dolu düğüm görebildiğin yer.

Ölçüldü: 82/82 çekirdek testi, uçtan uca tarayıcı testi, 0 dış istek,
0 hata. Tek dosyalık sürüm 136 KB.

## Düzeltilen düzen hatası

Telefonda arayüz kayık ve taşkın görünüyordu. İki sebebi vardı:

1. **İki sütunlu değer ızgarası.** Dikey yer kazanmak için fraksiyon
   değerlerini iki sütuna almıştım; her sütuna ~127 piksel düşüyordu ve
   Türkçe değerler ("çok güçlü", "idare eder", "homurdanıyor") sığmıyordu.
   Kelimeler bölünüyor, satırlar hizasını kaybediyor, uzun değerler ekranın
   dışına taşıyordu. Tek sütuna geri alındı (`78px` etiket + kalan).
2. **Android metin büyütmesi.** Chrome/Brave bazı metin bloklarını
   kendiliğinden büyütüyor; `-webkit-text-size-adjust:100%` ile kapatıldı.

Ayrıca bütün ızgara sütunları `1fr` yerine `minmax(0,1fr)` yapıldı (CSS
ızgarada `1fr` içeriğin altına inmez, bu da sessiz taşmaların klasik
sebebidir) ve dar ekran için ayrı bir düzen eklendi (`max-width:370px`).

`iz iz yok` gibi görünen kelime tekrarı da düzeltildi.

**`arayuz-test.js`** eklendi: 320 / 360 / 390 / 430 piksel genişliklerde
beş ekranı gezip ekrandan taşan her öğeyi listeler. Bu sınıf hata bir daha
sessizce geçmesin diye.

## Servis işçisi hatası: güncellemeler kullanıcıya ulaşmıyordu

İlk `sw.js` **cache-first**ti ve önbellek adı sabitti (`gizliel-v1`). Sonuç:
bir kez önbelleğe alındıktan sonra sayfa sonsuza kadar eski sürümü
gösteriyordu. Kullanıcı düzeltilmiş düzeni göremedi çünkü düzeltme
telefonuna hiç inmedi — çevrimdışı çalışsın diye yazdığım şey güncellemeleri
kilitlemişti.

Yeni davranış:

- **Ağ önce, önbellek yedek.** Çevrimiçiyken hep güncel, çevrimdışıyken
  önbellekten açılır.
- **Sürümlü önbellek adı** (`gizliel-<sürüm>`); eski önbellekler
  `activate` sırasında silinir.
- **`sw.js` asla önbellekten servis edilmez**, yoksa işçinin kendisi de
  güncellenemez.
- Sayfa `controllerchange`'i dinler ve yeni işçi devralınca **kendini bir
  kez tazeler**.
- Giriş ekranında **sürüm numarası** görünür — "önbellek bayat mı?"
  sorusu artık gözle cevaplanabiliyor.

Ayrıca `navigator.storage.persist()` çağrılıyor: Android'de depolama
baskısı altında bile kaydın silinmemesi için.

**`sw-test.js`** eklendi: gerçek bir HTTP sunucu ayağa kaldırır, sayfayı
yükler, sunucudaki sürümü değiştirir, yeniler ve yeni sürümün ulaşıp
ulaşmadığını ölçer; sonra çevrimdışına geçip hâlâ açıldığını doğrular.
Ölçüldü: güncelleme tek yenilemede ulaşıyor, çevrimdışı açılış çalışıyor.

## Bir düzeltme

Kullanıcıya defalarca "iOS verileri 7 günde siler, ana ekrana eklemek şart"
denmişti. Kullanıcı **Android**'de; o kısıt WebKit'e özgü. Android'de
Chrome/Brave `localStorage`'ı süresiz tutar, yalnızca ağır depolama
baskısında ve site yüklü değilse temizleyebilir — `storage.persist()` onu
da kapatır.
