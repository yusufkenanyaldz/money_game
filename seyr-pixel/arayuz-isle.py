# Seyr Pixel — Gemini arayüz görsellerini (yeşil perde, büyük çizilmiş pixel art) asıl pixel boyutuna indirir.
# Görselin piksel ızgarası bulunur (blok içi farkın en küçük olduğu en büyük blok boyu), her blok tek renge iner,
# yeşil perde saydam olur, boş kenarlar kırpılır. Çıktı: assets/ui-<ad>.png
# Kullanım: python3 arayuz-isle.py <görsel.jpg> <ad> [--blok N]
import argparse, os
import numpy as np
from PIL import Image

BURASI = os.path.dirname(os.path.abspath(__file__)); A = os.path.join(BURASI, 'assets')
ap = argparse.ArgumentParser(); ap.add_argument('gorsel'); ap.add_argument('ad'); ap.add_argument('--blok', type=float, default=0)
a = ap.parse_args()
f = np.asarray(Image.open(a.gorsel).convert('RGB')).astype(np.float32)


def blok_hatasi(s, ox, oy):
    h, w, _ = f.shape; n_y, n_x = int((h - oy) // s), int((w - ox) // s)
    ys = (oy + (np.arange(n_y) + .5) * s).astype(int); xs = (ox + (np.arange(n_x) + .5) * s).astype(int)
    merkez = f[ys][:, xs]                                          # her bloğun ortası
    # blok kenarına yakın ama içindeki noktalar merkezle aynı renkte olmalı
    d = s * .3; e = 0
    for dy, dx in ((-d, -d), (d, d), (-d, d), (d, -d)):
        yy = np.clip((ys + dy).astype(int), 0, h - 1); xx = np.clip((xs + dx).astype(int), 0, w - 1)
        e += np.abs(f[yy][:, xx] - merkez).mean()
    return e / 4


if a.blok: s = a.blok; ox = oy = 0
else:
    sonuc = []
    for s in np.arange(10, 90, .5):
        en = min((blok_hatasi(s, ox, oy), ox, oy) for ox in np.linspace(0, s, 6, endpoint=False) for oy in np.linspace(0, s, 6, endpoint=False))
        sonuc.append((en[0], s, en[1], en[2]))
    enaz = min(x[0] for x in sonuc)
    e, s, ox, oy = max((x for x in sonuc if x[0] <= enaz * 1.25), key=lambda x: x[1])   # yeterince iyi en büyük blok
h, w, _ = f.shape; n_y, n_x = int((h - oy) // s), int((w - ox) // s)
ys = (oy + (np.arange(n_y) + .5) * s).astype(int); xs = (ox + (np.arange(n_x) + .5) * s).astype(int)
# blok rengi: merkezdeki 3x3'ün ortancası (JPEG gürültüsüne dayanıklı)
P = np.stack([f[np.clip(ys + dy, 0, h - 1)][:, np.clip(xs + dx, 0, w - 1)] for dy in (-2, 0, 2) for dx in (-2, 0, 2)]).astype(np.float32)
rgb = np.median(P, 0)
yesil = (rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2])) > 40
alfa = ~yesil
ys_, xs_ = np.where(alfa); y0, y1, x0, x1 = ys_.min(), ys_.max() + 1, xs_.min(), xs_.max() + 1
out = np.dstack([rgb.clip(0, 255).astype(np.uint8), (alfa * 255).astype(np.uint8)])[y0:y1, x0:x1]
yol = os.path.join(A, f'ui-{a.ad}.png'); Image.fromarray(out, 'RGBA').save(yol, optimize=True)
print(f'{a.ad}: ızgara {s:.1f} px → {out.shape[1]}x{out.shape[0]} piksel, {os.path.getsize(yol)} bayt')
