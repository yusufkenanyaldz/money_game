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

2. Oyuncu fiilleri (Fısılda, İfşa et, Sızdır, Finanse et, Kışkırt, Koru,
   Tohum ek, Kehanet) — her biri her fraksiyona/lidere/çifte/bölgeye
   yönelebilir: tur başına 200–400 meşru hamle
3. Derinlik: olgunlaşan ajanlar, saklanan sırlar, gecikmeli etkiler,
   gizli bilgi (kanunları keşfetmek için nüfuz harcamak)
4. Doktrinler (hangi dünya durumunun değerli olduğunu yeniden tanımlar) + arayüz
