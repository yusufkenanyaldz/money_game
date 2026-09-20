# VEBA — bir şehir, bir salgın yılı

Bir şehri veba yılında yönetiyorsun. 48 hafta, altı mahalle, her hafta bir karar.

## Tasarımın tek iddiası

**Gerçek salgın bilgisi oynanışa dönüşmeli.** Wikipedia'dan bakılabilecek
bir bilgi değil; sürekli okumayla oluşan sezgi.

Ölçüldü (20 şehir, her biri 48 hafta):

| Oyuncu | Hayatta kalan |
|---|---|
| Hiçbir şey yapmayan | **%28** |
| Sezgiyle oynayan | **%34** |
| Gerçek bilgiyle oynayan | **%57** |

Ve 20 şehrin **20'sinde** okumuş oyuncu önde. Üstünlük şanstan değil.

## Neden sezgi yanıltıyor

Vebanın iki bulaşma yolu vardır ve **farklı müdahale isterler**:

- **Hıyarcıklı form** fare–pire–insan yoluyla geçer. İnsanları birbirinden
  ayırmak ona az etki eder; asıl kaldıraç **tahıl ambarları ve fareler**dir.
- **Akciğer formu** insandan insana geçer. Karantina onu gerçekten keser.

Modelde en can alıcı ayrıntı şu: **insanlar fareler öldüğünde hastalanır.**
Konağını kaybeden aç pireler yeni konak arar. Yani insan için en tehlikeli
an, farelerin kırıldığı andır — sezgiye tamamen aykırı.

Oyun hastalığın adını **söylemez**. Yalnızca belirti raporu gelir:

> *"Ölenlerin neredeyse tamamında koltuk altında ve kasıkta şişlikler vardı."*
> *"Ölenlerin çoğu kan tükürüyordu. Hastalananlar iki gün bile dayanmıyor."*

Hangisiyle uğraştığını kendin anlar, müdahaleni ona göre seçersin.

## İki perde

- **Mart–Eylül:** pire etkinliği zirvede. Hıyarcıklı dalga kademeli tırmanır.
  Bu perdede ambar temizliği kazandırır, karantina az iş görür.
- **Kasım–Şubat:** soğuk bastırır. Kışın hasta bir kervan gelir — **kapı
  açıksa şehre girer**, kapalıysa geri çevrilir. Akciğer dalgası insandan
  insana yayılır; bu perdede karantina belirleyicidir, ama kapalı kapı
  tahılı da keser.

## Tuzak

**Toplu dua ayini.** Halk teselli bulur, huzursuzluk gerçekten düşer.
Ama bütün şehir bir meydanda toplanır ve iki hafta boyunca temas patlar.
Ölçüldü: %28.4 → **%22.1**. Tarihte yapılmış, gerçekten zarar vermiş bir şey.

## Tasarımda reddedilen fikir

Kedi ve köpekleri itlaf ettirme eylemi vardı — tarihsel bir hata olduğu
için tuzak olmasını istemiştim. Model ısrarla "hayır" dedi: bu modelde
fare *sayısı* değil, fare kırımının *zamanlaması* baskın çıkıyor; daha çok
fare salgını ilkbaharda erken patlatıyor, pire henüz uyanmadığı için insana
az atlıyor. **Fiziği zorlamak yerine eylemi kaldırdım** — çünkü bu oyunun
tüm vaadi modelin gerçek olması.

## Dosyalar

| Dosya | İş |
|---|---|
| `cekirdek.js` | Model: iki bulaşma yolu, fare–pire döngüsü, mevsimsellik, huzursuzluk |
| `test.js` | 14 test. En kritiği: gerçek bilgi sezgiyi yeniyor mu? |
| `ablasyon.js` | Her kaldıracı tek başına ölçer |
| `ayar.js` | Dört oyuncu tipini karşılaştırır |

## Model ayarlanırken ölçülerek düzeltilen hatalar

- **Hafta içi sıralama:** akciğer vakaları bulaş hesabından önce ölüyordu,
  zincir hiç başlamıyordu. Sıra düzeltildi: kuluçkadan çıkış → bulaş → ölüm.
- **Yanlış doygunluk formülü:** `yaygınlık/(yaygınlık+k)` düşük yaygınlıkta
  bulaşı 18 kat şişiriyordu; ilkbaharda tek vaka kış dalgasını başlatıyordu.
  Doğrusu `yaygınlık/(1+yaygınlık/k)`.
- **İsyan şehir ortalamasına bakıyordu:** bir mahalle 20 hafta 100'de
  yanarken ortalama 20 görünüyordu. Artık en kötü iki mahalle belirliyor.
- **Puanlamaya ters teşvik gömülmüştü:** isyan oyunu erken bitirdiği için
  puanı *koruyordu*; yani isyanı önlemek "daha çok ölü" demekti. İsyan artık
  yenilgi sayılıyor.
- **Bıçak sırtı model:** `lp` 0.90'da %72, 1.15'te %4.7 hayatta kalan
  veriyordu. Temas doygunluğu eklendi; parametre iki katına çıksa bile
  sonuç %31-35 bandında kalıyor.

## Arayüz

Tek ekran. Üstte iki büyük sayı: **yaşayan** ve **ölen**. Altında hazine,
tahıl, kapıların durumu ve halkın hâlini gösteren bir çubuk. Sonra bu
haftanın raporu, sonra altı mahalle.

Altta iki buton: **Karar ver** ve **Haftayı geçir**. Haftada bir karar.

**Sana rakam verilmez.** Bir yönetici mahallesindeki hasta sayısını bilemez;
gördüğü şeyleri bilir:

| Ne | Nasıl görünür |
|---|---|
| hasta | görülmedi · birkaç · çok · her sokakta |
| fareler | seyrek · var · çok · her yerde |
| ambar | boşaltılmış · dolu · ağzına kadar |
| halk | sakin · tedirgin · öfkeli · ayağa kalkmak üzere |

**Kayıtlar** ekranı her haftanın belirti raporunu saklar. Mevsimsel örüntüyü
— yazın şişlikler, kışın kan — ancak oraya bakarak fark edersin.

### Arayüzde düzeltilen hata

İlk halinde yedi eylem sürekli ekranın altındaydı ve **şehri tamamen
gizliyordu** — oysa okuyup karar vermen gereken şey şehrin kendisi.
Eylemler "Karar ver" butonunun arkasına alındı.

Dört telefon genişliğinde (320/360/390/430) taşma yok, 0 dış istek, 0 hata.

### Yayın

`veba/` klasörü GitHub Pages'te:
`https://yusufkenanyaldz.github.io/money_game/veba/`

Tek parça sürüm: `veba.html` (33 KB).
