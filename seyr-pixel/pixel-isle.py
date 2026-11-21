# Seyr Pixel — Gemini videosunu (yeşil perde) gerçek pixel şeride çevirir.
# Gemini'nin "pixel" videoları sabit bir piksel ızgarasına oturmaz (kareler arasında pikseller kayar);
# burada karakter gerçek pixel boyuna indirilir, tek bir ortak palete oturtulur, kenarlar keskinleştirilir.
#
# Kullanım: python3 pixel-isle.py <video.mp4> <hareket> [--bas sn] [--sure sn] [--dongu] [--yon 1|-1]
#   ör. python3 pixel-isle.py yuru.mp4 yuru --bas 0 --sure 4 --dongu
# Çıktı: assets/<hareket>.png (yatay şerit) ve assets/karakter.json (kare sayısı, boyut, fps, yön)
# Ortak palet: ilk işlenen klipten assets/palet.png çıkar; sonraki klipler aynı paleti kullanır (renkler tutarlı kalır).
import argparse, json, os, subprocess, tempfile, glob
import numpy as np
from PIL import Image

BURASI = os.path.dirname(os.path.abspath(__file__)); ASSETS = os.path.join(BURASI, 'assets'); os.makedirs(ASSETS, exist_ok=True)
BOY = 64          # ayakta duruş boyu (piksel)
FPS = 12          # pixel animasyonu için yeterli; dosya küçük kalır
RENK = 28         # ortak paletteki renk sayısı (kılıç izi için birkaç açık renk payı)

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('hareket')
ap.add_argument('--bas', type=float, default=0); ap.add_argument('--sure', type=float, default=0)
ap.add_argument('--dongu', action='store_true'); ap.add_argument('--yon', type=int, default=1)
a = ap.parse_args()

with tempfile.TemporaryDirectory() as t:
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(a.bas), '-i', a.video] + (['-t', str(a.sure)] if a.sure else []) + ['-vf', f'fps={FPS}', t + '/%04d.png']
    subprocess.run(cmd, check=True)
    F = [np.asarray(Image.open(p).convert('RGB')).astype(np.float32) for p in sorted(glob.glob(t + '/*.png'))]
    ilk = subprocess.run(['ffmpeg', '-v', 'error', '-i', a.video, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout


def perde(f):
    """Yeşil perde → alfa; kenarlardaki yeşil taşmayı (spill) bastır."""
    g = f[..., 1] - np.maximum(f[..., 0], f[..., 2])
    al = np.clip(1 - (g - 25) / 60, 0, 1)
    f = f.copy(); f[..., 1] = np.minimum(f[..., 1], np.maximum(f[..., 0], f[..., 2]) + 6)
    return f, al


import io
ilkf, ilka = perde(np.asarray(Image.open(io.BytesIO(ilk)).convert('RGB')).astype(np.float32))
ys, _ = np.where(ilka > .5); ayakta = ys.max() - ys.min()            # Gemini'nin ilk karesi = verilen ayakta görsel
k = BOY / ayakta

FA = [perde(f) for f in F]
if a.dongu:   # doğal döngü noktası: ilk kareye en çok benzeyen kare (en az 1 sn sonra)
    sm = [np.asarray(Image.fromarray((al * 255).astype(np.uint8)).resize((64, 64))).astype(float) for _, al in FA]
    fark = {j: np.abs(sm[0] - sm[j]).mean() for j in range(FPS // 2, len(FA))}
    enaz = min(fark.values()); N = min(j for j, d in fark.items() if d <= enaz * 1.6)   # yeterince iyi olan en kısa döngü (uzun döngü yalnızca biraz daha iyi diye seçilmesin)
    FA = FA[:N]
    print(f'{a.hareket}: döngü {N} kare ({N / FPS:.2f} sn)')

al = np.max([x[1] for x in FA], 0); ys, xs = np.where(al > .5)
y1 = ys.max() + 2; y0 = max(0, ys.min() - 2)
cx = (xs.min() + xs.max()) / 2; yari = (xs.max() - xs.min()) / 2 + 2
W = int(np.ceil(2 * yari * k)); H = int(np.ceil((y1 - y0) * k))
x0 = int(cx - W / 2 / k)

kucuk = []
for f, am in FA:
    kirp = np.zeros((int(round(H / k)), int(round(W / k)), 3), np.float32); ka = np.zeros(kirp.shape[:2], np.float32)
    sy0, sx0 = y1 - kirp.shape[0], x0
    ys_, xs_ = slice(max(0, sy0), min(f.shape[0], sy0 + kirp.shape[0])), slice(max(0, sx0), min(f.shape[1], sx0 + kirp.shape[1]))
    kirp[ys_.start - sy0:ys_.stop - sy0, xs_.start - sx0:xs_.stop - sx0] = f[ys_, xs_]
    ka[ys_.start - sy0:ys_.stop - sy0, xs_.start - sx0:xs_.stop - sx0] = am[ys_, xs_]
    rgb = np.asarray(Image.fromarray(kirp.clip(0, 255).astype(np.uint8)).resize((W, H), Image.BOX)).astype(np.float32)
    aa = np.asarray(Image.fromarray((ka * 255).astype(np.uint8)).resize((W, H), Image.BOX)) > 110
    kucuk.append((rgb, aa))

palyol = os.path.join(ASSETS, 'palet.png')
if os.path.exists(palyol): pal = Image.open(palyol)
else:
    hepsi = np.concatenate([r[m] for r, m in kucuk]).reshape(1, -1, 3).astype(np.uint8)
    pal = Image.fromarray(hepsi).quantize(RENK, method=Image.Quantize.MEDIANCUT); pal.save(palyol)
P = np.array(pal.getpalette()[:RENK * 3], np.float32).reshape(-1, 3)


def en_yakin(rgb):
    d = ((rgb[..., None, :] - P[None, None]) ** 2).sum(-1); return d.argmin(-1), np.sqrt(d.min(-1))


out = []; once = None
for rgb, m in kucuk:
    idx, _ = en_yakin(rgb)
    if once is not None:   # kıpırtı önleme: önceki rengi bu piksele hâlâ yakınsa onu koru
        onceki = P[once]; uzak = np.sqrt(((rgb - onceki) ** 2).sum(-1))
        idx = np.where(uzak < 22, once, idx)
    once = idx
    q = P[idx].astype(np.uint8); out.append(np.dstack([q, m * 255]).astype(np.uint8))

deg = np.mean([np.mean(np.any(out[i][..., :3] != out[i + 1][..., :3], -1) & out[i][..., 3].astype(bool)) for i in range(len(out) - 1)]) if len(out) > 1 else 0
serit = Image.new('RGBA', (W * len(out), H))
for i, o in enumerate(out): serit.paste(Image.fromarray(o, 'RGBA'), (i * W, 0))
yol = os.path.join(ASSETS, a.hareket + '.png'); serit.save(yol, optimize=True)
mpath = os.path.join(ASSETS, 'karakter.json'); meta = json.load(open(mpath)) if os.path.exists(mpath) else {}
meta[a.hareket] = dict(n=len(out), w=W, h=H, fps=FPS, yon=a.yon, dongu=a.dongu)
json.dump(meta, open(mpath, 'w'), indent=1, ensure_ascii=False)
print(f'{a.hareket}: {len(out)} kare, {W}x{H} px, {os.path.getsize(yol) // 1024} KB, ardışık karede değişen piksel %{100 * deg:.1f}')
