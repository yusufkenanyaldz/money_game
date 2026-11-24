# Yeşil perdeli pixel videodan hareketli WhatsApp stikeri: 512x512 saydam WebP, 500 KB altı.
# Kullanım: python3 stiker.py <video.mp4> <çıktı.webp> [piksel kenarı, varsayılan 112]
#   KALITE=yuksek python3 stiker.py ... → pixel'e indirmeden, orijinal ayrıntıyla (kayıplı WebP)
#   ANAHTAR=renk python3 stiker.py ...  → sahnede yeşil eşya (koltuk vb.) varsa
#  - siyah bantları atar, yeşil zemini saydam yapar, karakterin etrafını sıkı kırpar (ortanca kareye göre;
#    gezici efektler kutuyu büyütmez), gerçek pixel'e indirir, ortak palete oturtur, kıpırtıyı azaltır
#  - 500 KB'ı aşarsa kareleri seyreltir
import glob, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image

src, cikti = sys.argv[1], sys.argv[2]; N = int(sys.argv[3]) if len(sys.argv) > 3 else 112
with tempfile.TemporaryDirectory() as t:
    subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', 'fps=12', t + '/%04d.png'], check=True)
    F = [np.asarray(Image.open(f).convert('RGB')).astype(np.float32) for f in sorted(glob.glob(t + '/*.png'))]
siyah = F[0].max(2) < 24                                                     # siyah bant: neredeyse tamamen siyah satır/sütun
ry, rx = np.where(siyah.mean(1) < .9)[0], np.where(siyah.mean(0) < .9)[0]
F = [f[ry.min() + 2:ry.max() - 1, rx.min() + 2:rx.max() - 1] for f in F]


RENK = os.environ.get('ANAHTAR') == 'renk'   # sahnede yeşil eşya varsa: yalnızca perdenin kendi rengini sil
ZEMIN = np.median(np.concatenate([F[0][:4].reshape(-1, 3), F[0][-4:].reshape(-1, 3)]), 0)


def key(f):
    if RENK:
        from scipy import ndimage
        d = np.sqrt(((f - ZEMIN) ** 2).sum(-1)); lab, _ = ndimage.label(d < 45)   # kenara değen ve büyük perde silinir, eşyanın içindeki küçük yeşil (göz bebeği, koltuk) kalır
        kenar = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]])); alan = np.bincount(lab.ravel())
        buyuk = np.where(alan > f.shape[0] * f.shape[1] * .0001)[0]           # kapalı kalan büyük boşluk (kol-gövde arası) da silinir; küçük göz bebeği kalır
        dis = np.isin(lab, np.union1d(kenar[kenar > 0], buyuk[buyuk > 0]))
        a = np.where(dis, 0., 1.); a = np.minimum(a, np.clip((d - 20) / 25, 0, 1) + ~ndimage.binary_dilation(dis, iterations=2))
        f = f.copy(); k = ndimage.binary_dilation(dis, iterations=2); f[..., 1] = np.where(k, np.minimum(f[..., 1], np.maximum(f[..., 0], f[..., 2]) + 6), f[..., 1]); return f, a
    g = f[..., 1] - np.maximum(f[..., 0], f[..., 2]); a = np.clip(1 - (g - 25) / 50, 0, 1)
    f = f.copy(); f[..., 1] = np.minimum(f[..., 1], np.maximum(f[..., 0], f[..., 2]) + 6); return f, a


K = [key(f) for f in F]
al = np.median([a for _, a in K], 0) > .6
r, c = al.sum(1), al.sum(0); ys, xs = np.where(r > r.max() * .15)[0], np.where(c > c.max() * .15)[0]
# hareketli kısımlar (kılıç, kol) için: herhangi bir karede opak olan alanı da biraz kapsa
alh = np.max([a for _, a in K], 0) > .6; rh, ch = alh.sum(1), alh.sum(0)
ysh, xsh = np.where(rh > rh.max() * .05)[0], np.where(ch > ch.max() * .05)[0]
y0, y1 = min(ys.min(), ysh.min()) - 12, max(ys.max(), ysh.max()) + 12
x0, x1 = min(xs.min(), xsh.min()) - 12, max(xs.max(), xsh.max()) + 12
S = max(y1 - y0, x1 - x0); cy, cx = (y0 + y1) / 2, (x0 + x1) / 2; y0, x0 = int(cy - S / 2), int(cx - S / 2)
if os.environ.get('KALITE') == 'yuksek':   # küçültme/palet yok: yalnızca arka plan silinir, kayıplı WebP (alfa korunur)
    kar = []
    for f, a in K:
        cc = np.zeros((S, S, 3), np.float32); ca = np.zeros((S, S), np.float32)
        sy, sx = max(0, y0), max(0, x0); ey, ex = min(f.shape[0], y0 + S), min(f.shape[1], x0 + S)
        cc[sy - y0:ey - y0, sx - x0:ex - x0] = f[sy:ey, sx:ex]; ca[sy - y0:ey - y0, sx - x0:ex - x0] = a[sy:ey, sx:ex]
        kar.append(Image.fromarray(np.dstack([cc.clip(0, 255), ca * 255]).astype(np.uint8), 'RGBA').resize((512, 512), Image.LANCZOS))
    for adim, q in ((1, 80), (2, 80), (2, 65), (3, 70), (3, 55), (4, 60), (4, 45)):
        fr = kar[::adim]; fr[0].save(cikti, save_all=True, append_images=fr[1:], duration=83 * adim, loop=0, quality=q, method=4)
        if os.path.getsize(cikti) < 480 * 1024: break
    print(f'{cikti}: yüksek kalite, {len(fr)} kare, q{q}, {os.path.getsize(cikti) // 1024} KB'); sys.exit()
out = []
for f, a in K:
    cc = np.zeros((S, S, 3), np.float32); ca = np.zeros((S, S), np.float32)
    sy, sx = max(0, y0), max(0, x0); ey, ex = min(f.shape[0], y0 + S), min(f.shape[1], x0 + S)
    cc[sy - y0:ey - y0, sx - x0:ex - x0] = f[sy:ey, sx:ex]; ca[sy - y0:ey - y0, sx - x0:ex - x0] = a[sy:ey, sx:ex]
    out.append((Image.fromarray(cc.clip(0, 255).astype(np.uint8)).resize((N, N), Image.BOX),
                np.asarray(Image.fromarray((ca * 255).astype(np.uint8)).resize((N, N), Image.BOX)) > 110))
hepsi = np.concatenate([np.asarray(rr)[m] for rr, m in out]).reshape(1, -1, 3).astype(np.uint8)
P = np.array(Image.fromarray(hepsi).quantize(40, method=Image.Quantize.MEDIANCUT).getpalette()[:120], np.float32).reshape(-1, 3)
kar, once = [], None
for rr, m in out:
    rgb = np.asarray(rr).astype(np.float32); idx = ((rgb[..., None, :] - P[None, None]) ** 2).sum(-1).argmin(-1)
    if once is not None: idx = np.where(np.sqrt(((rgb - P[once]) ** 2).sum(-1)) < 20, once, idx)
    once = idx
    kar.append(Image.fromarray(np.dstack([P[idx].astype(np.uint8), m * 255]).astype(np.uint8), 'RGBA').resize((512, 512), Image.NEAREST))
for adim in (1, 2, 3):
    fr = kar[::adim]; fr[0].save(cikti, save_all=True, append_images=fr[1:], duration=83 * adim, loop=0, lossless=True, method=4)
    if os.path.getsize(cikti) < 480 * 1024: break
print(f'{cikti}: {len(fr)} kare, {len(fr) * 83 * adim / 1000:.1f} sn, {os.path.getsize(cikti) // 1024} KB')
kontrol = Image.new('RGBA', (512 * 4, 512), (235, 235, 235, 255))
for k, i in enumerate(np.linspace(0, len(fr) - 1, 4).astype(int)): kontrol.alpha_composite(fr[i], (512 * k, 0))
kontrol.resize((1024, 256)).save(os.path.splitext(cikti)[0] + '-kontrol.png')
