# itch.io yayın rehberi — ONE MORE TAP

## Paketi üret

```bash
./build-itch.sh          # -> onemoretap-itch.zip (~104 KB)
```

Zip'in **kökünde** `index.html` olmalı, klasör sarmalayıcı olmamalı. Betik
bunu `zip -j` ile garantiler.

## itch.io ayarları

| Alan | Değer |
|---|---|
| **Kind of project** | HTML |
| **Uploads** | `onemoretap-itch.zip` → ✅ *"This file will be played in the browser"* |
| **Embed options** | *Embed in page* |
| **Viewport** | **540 × 860** (dikey) |
| **Fullscreen button** | ✅ **açık** (aşağıdaki nota bak — önemli) |
| **Mobile friendly** | ✅ açık |
| **Orientation** | Portrait |
| **Genre** | Action / Arcade |
| **Tags** | `arcade`, `casual`, `one-button`, `high-score`, `mobile`, `html5`, `endless`, `reflex` |
| **Cover image** | `itch-cover.png` (630×500) |
| **App store links** | boş bırak |

### ⚠ "Fullscreen button" neden önemli?

Oyun itch'te bir **iframe** içinde çalışır; tarayıcı bu durumda depolamayı
"üçüncü taraf" sayabilir. Safari'de ve üçüncü taraf çerezi kapatan Chrome
kullanıcılarında **Kasa / seviye / rekor oturumlar arası silinebilir.**
Oyun bu durumda çökmez (test edildi), sadece kayıt tutmaz. Fullscreen
seçeneği oyunu üst-seviye sayfada açtığı için depolama birinci taraf olur
ve sorun ortadan kalkar.

## Mağaza metni (kopyala-yapıştır)

**Başlık:** `ONE MORE TAP`

**Kısa açıklama (tagline):**
`One tap. Pure greed. Tap the gate, grow your gold — or lose the lot.`

**Açıklama:**

```
Tek dokunuş. Saf hırs.

Kıvılcım pistte döner. Altın kapıdan geçerken dokun — ıskala, biter.

Her vuruş altınını büyütür ama o altın RİSKTEDİR. İstediğin an "Kasaya Al"
diyip garantiye alabilirsin; ama serin sıfırlanır. Bir vuruş daha mı,
yoksa şimdi mi çekilirsin? Oyunun tamamı bu kararın üstüne kurulu.

• 6 farklı pist: Çember → Elips → Sonsuzluk → Dalga → Yıldız → Zikzak
• 14 rütbe, kalıcı seviye + XP, kalıcı güçlendirmeler
• 7 tema, 13 top kıyafeti, görevler, günlük ödül
• Toplanabilir power-up'lar, kalkan, ikinci şans
• Türkçe / İngilizce
• Tek dosya, sıfır dış istek, çevrimdışı çalışır

Dokun · Tıkla · Boşluk tuşu
```

**English description:**

```
One tap. Pure greed.

The spark orbits the track. Tap as it crosses the golden gate — miss once
and it's over.

Every hit grows your gold, but that gold is AT RISK. Hit "Bank It" any time
to lock it in — but your streak resets. One more hit, or cash out now?
The whole game lives on that decision.

• 6 tracks: Circle → Ellipse → Infinity → Wave → Star → Zigzag
• 14 ranks, persistent level + XP, permanent upgrades
• 7 themes, 13 ball skins, quests, daily rewards
• Collectible power-ups, shields, second chances
• English / Turkish
• Single file, zero external requests, works offline

Tap · Click · Spacebar
```

## Yükleme sonrası kontrol listesi

- [ ] Sayfayı **gizli pencerede** aç, oyun yükleniyor mu?
- [ ] Fullscreen düğmesi çalışıyor mu?
- [ ] Telefondan aç — dikey oturuyor mu, dokunma çalışıyor mu?
- [ ] Bir tur oyna, "Bank It" bas, sayfayı yenile — Kasa korunuyor mu?
      (Korunmuyorsa: fullscreen'den oyna, yukarıdaki nota bak.)
- [ ] TR/EN düğmesi dili değiştiriyor mu?

## Reklamlar

**itch.io'da reklam YOKTUR.** Oyun, sayfada bir portal reklam SDK'si
(`PokiSDK` / `CrazyGames.SDK`) olup olmadığını çalışma anında kontrol eder:

- **SDK varsa** (Poki/CrazyGames): ölünce *"REKLAM İZLE & DEVAM"* çıkar ve
  **gerçek ödüllü reklam** onların sistemiyle oynatılır — gelir buradan gelir.
- **SDK yoksa** (itch.io, kendi siten): reklam vaadi edilmez. Buton
  *"İKİNCİ ŞANSI KULLAN"* olur ve hak **ücretsiz** verilir (tur başına 1 kez).

Yani aynı dosya her iki ortamda da dürüst davranır; itch'te oyuncuya
gösterilmeyen bir reklam için bekletme yapılmaz.

## Not: sahibe özel altın hilesi

Portal/temiz derleme kuralları gereği **kapalı** (`const OWNER_CHEAT = false`,
`index.html` içinde). Kendi kişisel kopyanda `true` yaparsan menüde logoya
1.2 sn basılı tutmak +100.000 Kasa verir. **Yayınlanan sürümde açma** —
herkes kullanabilir.
