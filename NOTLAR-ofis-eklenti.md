# Ofis eklentisi: pixel kadro planı (not)

Tarih notu: bu fikir eklenti animasyonu (v2.18.0) çalıştıktan sonra konuşuldu.

## Plan
- **Ofisteki herkesin** Gemini ile pixel karakteri yapılacak, **patron dahil**.
- Mevcut eklentiye (Karşıt İnceleme - Otomatik Tutanak, v2.18.0, içinde `animasyon.js`) bir de **karşı eklenti** yapılacak. Karşı eklentiyi Claude Code kuracak.
- Eklentiler **muhasebecilere** verilecek, **ücretsiz dağıtılacak**. Amaç: firmanın reklamı yapılsın.

## Ekranda nasıl görünecek
- **Üstad** (patron / eklentiyi yaptıran) **üstte duracak**: onun pixel'i ana karakter.
- **Raportörlerin pixel'leri isimleriyle birlikte yandan kayıp gidecek** (kayan şerit gibi).
- Eklenti çalışırken (gönderme sürerken) animasyon oynuyor; mevcut animasyon: portal → düşüş → sersem kalkış → yürüyüp bilgisayara oturma → "BİRAZ REELS KAYDIR HALLEDİYORUM" yazısı.

## Yapılacaklar (aklımdaki sıra)
1. Herkesten fotoğraf al, Gemini'de pixel yap (aynı çizim stili için bir referans pixel resmini hep birlikte yükle; her kişi için aynı arka plan: düz yeşil #00FF00).
2. **Üstad için** tam set: düşüş, kalkış, yürüme, bilgisayar başında çalışma (mevcut videolar var).
3. **Raportörler için** küçük set: tek karakter + isim, yatay kayma (yürüme döngüsü ya da tek kare).
4. Videolar `seyr-pixel/stiker/stiker.py` hattıyla işlenir (`KALITE=yuksek` + yeşil gözler/eşyalar için `ANAHTAR=renk`).
5. Karşı eklentiyi (Claude Code) kur, ikisini aynı pakette ya da ayrı ayrı dağıt.

## Dikkat edilecekler (kısa)
- **Çalışanların fotoğrafı/pixel'i:** herkesten yazılı onay al (KVKK). Ücretsiz dağıtımda pixel'ler ve isimler kopyalanabilir, bunu bilerek paylaş.
- **Dağıtım:** Chrome Web Store'a koyulacaksa mağaza kuralları ve gizlilik politikası gerekir; zip ile "paketlenmemiş öğe" kurulumu muhasebeciler için zor olabilir.
- **Portal otomasyonu:** eklenti GİB portalıyla çalışıyor; başkalarına verirken kullanım sorumluluğunu ve olası portal değişikliklerini düşün.
- Pixel stikerler ve fotoğraflar repoya girmesin (kişisel); sadece kod ve notlar girsin.
