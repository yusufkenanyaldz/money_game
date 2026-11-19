# SON FENER

Karanlık fantastik bir idle (boşta ilerleyen) oyun. `index.html` + `assets/` klasörü; bağımlılıksız, çevrimdışı çalışır (klasörü birlikte taşı).

Dünyayı sonsuz bir karanlık yutmuş. Elinde tek bir fener var. Işığın ulaştığı yerleri geri alırsın.

## Döngü
- **Fenere dokun** → kor. Kor bu oyunun parası.
- **Fitil** ışığı uzatır. Işık bir yere değince o yer ortaya çıkar (kulübe, kuyu, mezarlık, değirmen, maden, manastır, kule, katedral… ve en sonda Uçurum Kapısı).
- **Yerleri yak**, derecelerini artır; 10/25/50/100… derecelerde üretim ikiye katlanır.
- Yerler canlı: kuledeki ışıklar, kapıdaki girdap, mezarlığın sisi, dönen değirmen (video karelerinden üretilmiş animasyonlar).
- Her yer ilk kez ışığa çıktığında **Günce**'ye kasvetli bir not düşer; notlar birleşince hikâye ortaya çıkar.

## Gece dalgası
- Belirli aralıklarla karanlık geri saldırır. **Sur** savunmanı, dalganın gücüyle karşılaştırılır.
- Dalga sırasında fenere dokunmak ışığı **harlar** (+%60'a kadar savunma).
- Savuşturursan ödül ve kararmış bir yer yeniden yanar; kaybedersen en uzaktaki yerler **söner**.
- Işığı büyütmek geceyi de sertleştirir: büyüme ile savunma arasında hep bir karar var.
- Oyun kapalıyken fener %50 güçle yanmayı sürdürür. Gece sen yokken güçlenmez; ama savunman yetmiyorsa her gece bir yer daha söner. Döndüğünde "Sen yokken" raporu seni bekler.

## Feneri söndür (prestij)
- Gece bir noktada durdurulamaz olur. O zaman feneri söndür: her şey sıfırlanır, geriye **kül** kalır.
- Kül ile **rün** kazırsın (Fehu, Uruz, Algiz, Kenaz, Jera, Sowilo, Raidho, Othala, Laguz). Harcanmamış her kül de üretimi %3 artırır.
- Her yeni fener başka bir yerde yanar: yerlerin isimleri ve konumları değişir.

## Denge
Başsız tarayıcıda bot simülasyonuyla ayarlandı: ilk yerler ilk dakikalarda açılır, ilk söndürme ~12. dakikadan itibaren mümkün,
ilk tur ~45 dakikada duvara dayanır; rünlerle sonraki turlar belirgin şekilde ileri gider. Katedral ve Uçurum Kapısı birkaç söndürme ister.
