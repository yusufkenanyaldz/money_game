# Mürekkep Damlası — notlar

- `kaynak.html` — düzenlenen asıl dosya (Tailwind sınıflarıyla). `<!-- STIL -->` işaretine derleyici stil gömer.
- `derle.py` — `python3 derle.py` → `Murekkep-Damlasi.html` (tek dosya, internetsiz çalışır; Tailwind 3.4.17 ile CSS üretir, `fontlar/` içindeki Cinzel ve Inter'i gömer). Node.js gerekir.
- `Murekkep-Damlasi.html` — oynanacak dosya. `kaynak.html` değişince yeniden derle.

## Yapılan düzeltmeler (ilk sürüme göre)
1. İnternet bağımlılığı kaldırıldı (Tailwind CDN ve Google Fonts dosyaya gömülü).
2. Menüler parmakla kaydırılabiliyor (`touch-action: none` yalnızca tuvalde); yatayda "Parşömene Atıl" düğmesi hep görünür.
3. Nişan, onu başlatan parmağa bağlı: ikinci parmakla yetenek kullanmak atışı ateşlemiyor; dokunma iptal olursa nişan bırakılıyor.
4. Ejderha / Taşkın uçuşunda damla duvarların arasında kalıyor (eskiden ekran dışına çıkıp uçuş bitince dikenli duvarda ölüyordu).
5. Taşkın ve Mühür Fırtınası ekran çerçeveleri görünüyor (eskiden hiç görünmüyordu).
6. Gece bölgesi: damlaya açık kenar ve parıltı, mürekkep kürelerine kenar, okunur üst panel ve yüzen yazılar. Geçersiz `/92`, `/88` sınıfları düzeltildi.
7. Puan gerçek yükseklik. Eski "+m" bonusları ayrı **Hüner** sayacında (kıl payı 25, 360° dönüş 40, mühür kırma 30). Altın ve Öz hesabına yükseklik + hüner girer. Kızıl İmparator fırçası +%10 hüner verir.
8. "Tek koşuda" görevleri (kıl payı, varak, yetenek) her koşu başında sıfırlanır. Kayıt koşu sırasında değil, görev bitince ve koşu sonunda yazılır.
9. Yeşim hokkada dokun-bırak hazır güçle fırlatır.
10. Porselen hokkanın kendine özgü görünüşü, tutunurken kalan süre halkası ve büyüyen çatlakları var.
11. Sönümleme kare hızından bağımsız (120 Hz ekranlarda aynı his).
12. Mağaza açıklamaları kodla uyumlu; Vampir 3. seviye gerçekten %50. Altın Varak fırçası ve Açgözlü Ejder bonusları gerçek yüzde. "Işıltılı" fırçaların izinde yıldızcıklar var (bayrak önceden kullanılmıyordu).
13. Yuvadaki yeteneğe dokununca çıkar; yuvalar doluyken yenisi rastgele birini atmaz.
14. Üst panel yalnızca değişen değerleri yazar.
15. Ekran döndürülünce dünya yeni genişliğe yayılır. Ses tercihi hatırlanır; uygulama arka plana atılınca kayıt yazılır.
16. Kendi kendine uçuş döngüsü kırıldı: uçarken (Ejderha / Taşkın) yeni ejderha tılsımı alınmaz (soluk görünür), Girdap yalnızca varak ve mürekkep çeker, dokunulmazken mühür yanından geçmek kıl payı sayılmaz, Taşkın başlarken kombo sıfırlanır. Ölçüm (hiç dokunmadan, 40 deneme): en uzun kesintisiz uçuş 58 sn → 3 sn; hokka yakalayan otomatik oyuncuyla 42 sn → 5 sn.

## "Tuz" — 1. adım (heyecan ve zorluk)
- **Kuruma kovalar:** ateş çizgisi artık ekranın altında görünür, kıpırdayan kor kenarıyla tırmanır ve en yüksek noktanın biraz altından hiç geri kalmaz. Hızlar: Çırak 55→130, Usta 75→160, Büyük Hattat 95→190, Kabus 120→230 px/sn (1500 m'ye kadar artar); Mühür Fırtınası'nda %25 hızlı. Bir hokkada bekleme payı Çırak'ta 16 sn → 5,5 sn (1500 m'de 2,3 sn).
- **Kalp atışı:** ateş yaklaştıkça hızlanan kalp sesi ve alttan kızaran ekran.
- **İsabet ustalığı:** yakalama alanı 44 → 34 px; nişan yayı yalnızca ilk kısmı gösterir (Keskin Nişancı rünü uzatır, 3. seviyede tam yay).
- **TAM İSABET:** hokkanın tam ortasına giden atış (gidiş çizgisi merkeze 9 px'ten yakın) 2 kombo, 15 hüner ve 15 mürekkep verir.
- **Bedava güç azaldı:** kalkan / ejderha tılsımı %7 → %3, girdap %7 → %4; yerden en çok 2 kalkan; kalkan mürekkebi tam doldurmaz (+30).
- **Mürekkep değerli:** havada atış 22–45 mürekkep (eskiden 15–35); hokkada dolum 22 → 12/sn; yakalama +22 (altın +40); varak +15; küre +35. Havada nişan ağır çekimi daha az yavaş (Çırak 0,20 → 0,30).
- **Kombo hızlı akar:** kombo süresi 4,5 → 3,2 sn; Taşkın 10x komboda, 4 sn.
