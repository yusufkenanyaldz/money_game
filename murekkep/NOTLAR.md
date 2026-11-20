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
