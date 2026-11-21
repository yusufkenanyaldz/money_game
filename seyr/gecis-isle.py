# Seyr — geçiş klipleri (Grok, magenta zemin) → oyun şeritleri + eşleşme tablosu.
# Kullanım: python3 gecis-isle.py <video klasörü> <geçici klasör>
# Çıktı: assets/anim-garip-g*.webp ve gecis.json (ANIM girdileri, hizalama, giriş/çıkış kareleri)
#
# Yapılanlar:
#  - Ölçek: yeni klipler farklı yakınlıktan çekilmiş olabilir; her klibin bekleme duruşu boyu,
#    bekle şeridinin boyuna (806 kaynak px) eşitlenir.
#  - Hiza: her şeridin gövde ekseni (figürün üst %40'ının ağırlık merkezi) ölçülür; oyun bu farkı düzeltir.
#  - Eşleşme: geçişe hangi kareden girileceği, o anki yürüme/koşu karesine en benzeyen poza göre seçilir;
#    geçiş bitince hedef döngüye en benzeyen karesinden devam edilir.
import glob, json, os, subprocess, sys
import numpy as np
from PIL import Image

BURASI = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BURASI, 'assets')
U, T = sys.argv[1], sys.argv[2]
H_STRIP, COLS, FPS, IDLE_SRC = 420, 6, 15, 806
UNIT = 200 / IDLE_SRC                      # karşılaştırma ölçeği: bekleme boyu = 200 birim

KLIPLER = {'A': 'e2fa845f', 'B': '152daa7f', 'E': '437dcb00'}   # dosya adlarının başı
ESKI = ['bekle', 'yuru', 'kos', 'yumruk', 'durus', 'kacin', 'arka', 'yuru2']
ANIM = json.loads(open(os.path.join(BURASI, 'index.html'), encoding='utf-8').read().split('const ANIM=')[1].split(';')[0])


def key(f):
    f = f.astype(np.float32); R, G, B = f[..., 0], f[..., 1], f[..., 2]; m = np.minimum(R, B) - G
    br = np.concatenate([m[:6].ravel(), m[-6:].ravel(), m[:, :6].ravel(), m[:, -6:].ravel()])
    bgv = max(np.percentile(br, 25), 40)
    bord = np.concatenate([f[:6].reshape(-1, 3), f[-6:].reshape(-1, 3), f[:, :6].reshape(-1, 3), f[:, -6:].reshape(-1, 3)])
    bgc = np.median(bord, 0)
    a = 1 - np.clip((m / bgv - .32) / .42, 0, 1); a3 = a[..., None]
    c = np.where(a3 > .02, (f - (1 - a3) * bgc) / np.maximum(a3, 1e-3), 0)
    mm = np.minimum(c[..., 0], c[..., 2]) - c[..., 1]; sp = np.clip(mm - 25, 0, None)[..., None] * (1 - a3 * .5)
    c[..., 0:1] -= sp * .8; c[..., 2:3] -= sp * .8
    return np.dstack([np.clip(c, 0, 255), a * 255]).astype(np.uint8)


def kareler(kod):
    d = os.path.join(T, kod); os.makedirs(d, exist_ok=True)
    if not glob.glob(d + '/*.png'):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', glob.glob(os.path.join(U, KLIPLER[kod] + '-*.mp4'))[0],
                        '-vf', f'fps={FPS}', d + '/%03d.png'], check=True)
    return [key(np.asarray(Image.open(f).convert('RGB'))) for f in sorted(glob.glob(d + '/*.png'))]


def eksen(alpha):
    """Baş ekseni: figürün üst %13'ünün (başın) yatay ağırlık merkezi (sütun indeksi). Kol ve heybe karışmaz."""
    ys, xs = np.where(alpha > 128)
    if len(ys) == 0: return alpha.shape[1] / 2
    top, bot = ys.min(), ys.max(); sel = ys < top + (bot - top) * .13
    return float(xs[sel].mean())


def siluet(alpha, olcek, eks):
    """Karşılaştırma tuvali (400x260 birim): eksen x=200'de, şeridin altı y=250'de."""
    h, w = alpha.shape
    im = Image.fromarray(alpha).resize((max(1, round(w * olcek)), max(1, round(h * olcek))), Image.BILINEAR)
    c = Image.new('L', (400, 260)); c.paste(im, (round(200 - eks * olcek), round(250 - h * olcek)))
    return np.asarray(c, dtype=np.float32) / 255


def fark(a, b): return float(np.abs(a - b).mean() * 100)


# ---- mevcut şeritler: kareler, eksen kayması, karşılaştırma siluetleri
eski = {}
for st in ESKI:
    N, fw, fh, C, src = ANIM['anim-garip-' + st]
    sh = np.asarray(Image.open(os.path.join(ASSETS, f'anim-garip-{st}.webp')).convert('RGBA'))
    fr = [sh[(i // C) * fh:(i // C + 1) * fh, (i % C) * fw:(i % C + 1) * fw, 3] for i in range(N)]
    ek = [eksen(a) for a in fr]
    olc = src / H_STRIP * UNIT
    eski[st] = dict(N=N, fw=fw, kay=float(np.mean(ek) - fw / 2) * src / H_STRIP, sil=[siluet(a, olc, e) for a, e in zip(fr, ek)])
    if st in ('yuru', 'kos', 'bekle'):
        S = eski[st]['sil']; n = N
        yan = np.mean([fark(S[i], S[(i + 1) % n]) for i in range(n)]); zit = np.mean([fark(S[i], S[(i + n // 2) % n]) for i in range(n)])
        print(f'kıyas {st}: yan yana kare farkı {yan:.2f}, zıt adım farkı {zit:.2f}')

# ---- geçiş tanımları: (ad, klip, aranacak giriş aralığı, bitiş karesi, durma karesi, yön)
#  giriş: önceki durumun her karesi için bu aralıkta en benzeyen kare
# Kullanılmayanlar (21 Kasım 2026 seti):
#  A (07-28-04, bekle↔yürü): heybe 1. saniyeden sonra zeytin yeşilinden kızıl kahveye döner ve büyür, yamalar değişir.
#     Tanımlar hazır; tutarlı bir klip gelince KLIPLER['A'] güncellenip aşağıdaki iki satır açılabilir:
#     dict(ad='gbasla', klip='A', bas=2, son_ara=(10, 30), hedef='yuru', yon=-1),
#     dict(ad='gdur', klip='A', giris_ara=(30, 52), kaynak='yuru', son=70, dur=62, hedef='bekle', yon=-1),
#  E (07-28-30, vuruş→bekle): eller göğüs hizasında kalır, bekleme duruşuna hiç varmaz.
#  07-28-16 (bekle→yürü): yürümeye başlarken yamalar renk değiştirir. 07-28-23 (bekle→vuruş): arkasını dönüp savrulur.
GECIS = [
    dict(ad='gkosdur', klip='B', giris_ara=(46, 58), kaynak='kos', son=79, dur=75, hedef='bekle', yon=1),
]

klip = {k: kareler(k) for k in {g['klip'] for g in GECIS}}
olcek = {}
for k, fr in klip.items():
    son = fr[-1][..., 3]; ys, _ = np.where(son > 128)
    olcek[k] = IDLE_SRC / float(ys.max() - ys.min())      # bekleme duruşu boyu → 806
    print(f'klip {k}: bekleme boyu {ys.max() - ys.min()} px → ölçek {olcek[k]:.3f}')

sonuc = {}
for g in GECIS:
    fr = klip[g['klip']]; k = olcek[g['klip']]
    sil = [siluet(f[..., 3], k * UNIT, eksen(f[..., 3])) for f in fr]
    hedef = eski[g['hedef']]
    if g['ad'] == 'gbasla':
        aday = []
        for e in range(*g['son_ara']):
            j = min(range(hedef['N']), key=lambda j: fark(sil[e], hedef['sil'][j]))
            aday.append((fark(sil[e], hedef['sil'][j]), e, j))
        enaz = min(a[0] for a in aday)
        d, e, j = next(a for a in aday if a[0] <= enaz * 1.12)  # yeterince iyi olan en erken çıkış
        bas, son, giris = g['bas'], e, None
        cikis = (j + 1) % hedef['N']; print(f"{g['ad']}: {bas}→{son}, yürüme {j}. kareye uyuyor (fark {d:.2f}, en iyi {enaz:.2f})")
    else:
        kay = eski[g['kaynak']]
        idx = [g['kaynak_kare']] if 'kaynak_kare' in g else range(kay['N'])
        harita = {}
        for j in idx:
            e = min(range(*g['giris_ara']), key=lambda e: fark(sil[e], kay['sil'][j]))
            harita[j] = (e, fark(sil[e], kay['sil'][j]))
        bas = min(e for e, _ in harita.values()); son = g['son']
        giris = {j: e - bas for j, (e, _) in harita.items()}
        print(f"{g['ad']}: {bas}→{son}; giriş farkı ort {np.mean([d for _, d in harita.values()]):.2f}, en kötü {max(d for _, d in harita.values()):.2f}")
        cikis = min(range(hedef['N']), key=lambda j: fark(sil[son], hedef['sil'][j]))
        print(f"   bitiş → bekle {cikis}. kare (fark {fark(sil[son], hedef['sil'][cikis]):.2f})")
    secili = fr[bas:son + 1]
    al = np.stack([f[..., 3] for f in secili]).max(0); ys, xs = np.where(al > 20)
    x0, x1, y0, y1 = xs.min() - 3, xs.max() + 4, ys.min() - 3, ys.max() + 4
    fw = round((x1 - x0) * H_STRIP / (y1 - y0)); N = len(secili); rows = -(-N // COLS)
    sheet = Image.new('RGBA', (fw * COLS, H_STRIP * rows))
    eks = []
    for i, f in enumerate(secili):
        im = Image.fromarray(f, 'RGBA').crop((x0, y0, x1, y1)).resize((fw, H_STRIP), Image.LANCZOS)
        sheet.paste(im, ((i % COLS) * fw, (i // COLS) * H_STRIP))
        eks.append((eksen(f[..., 3]) - (x0 + x1) / 2) * k)   # normalize kaynak px
    yol = os.path.join(ASSETS, f"anim-garip-{g['ad']}.webp"); sheet.save(yol, 'WEBP', quality=90, method=6)
    src = round((y1 - y0) * k)
    sonuc[g['ad']] = dict(anim=[N, fw, H_STRIP, COLS, src], yon=g['yon'], kayBas=round(float(np.mean(eks[:3])), 1),
                          kaySon=round(float(np.mean(eks[-3:])), 1), giris=giris, cikis=cikis,
                          dur=(g['dur'] - bas) if 'dur' in g else None)
    print(f"   {N} kare, {fw}x{H_STRIP}, {os.path.getsize(yol) // 1024} KB")

json.dump(dict(gecis=sonuc, kay={st: round(v['kay'], 1) for st, v in eski.items()}),
          open(os.path.join(BURASI, 'gecis.json'), 'w'), ensure_ascii=False, indent=1)
print('✓ gecis.json')
