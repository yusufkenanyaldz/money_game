# Seyr — bir görünümün (Yolcu, Er, ...) Grok videolarını oyun şeritlerine çevirir.
# Kullanım: python3 karakter-isle.py <görünüm> <video klasörü> <geçici klasör>
#   ör. python3 karakter-isle.py yolcu /root/.claude/uploads/... /tmp/yolcu
# Çıktı: assets/anim-<görünüm>-<hareket>.webp ve karakter-<görünüm>.json (ANIM, FACE, PUNCH, ADIM, GECIS)
#
# animasyon-isle.py'den (Garip) farkları:
#  - Ölçek her videoda ayrı: karakterin ayakta durduğu bir kareye göre (Grok bazı videolarda kesmeyle yakınlaşıyor).
#  - Zemin ayaklardan ölçülür (ince asa ayakların altına inebilir), yatay orta başa göre alınır (asa öne uzanınca kaymasın).
#  - Ayak sesi kareleri videonun kendi sesinden çıkarılır.
import glob, json, os, subprocess, sys
import numpy as np
from PIL import Image

BURASI = os.path.dirname(os.path.abspath(__file__))
ASSETS = os.path.join(BURASI, 'assets')
FPS, H_STRIP, COLS = 15, 420, 6

GORUNUMLER = {
    # boy: oyundaki ayakta duruş boyu (Garip'in bekle şeridi = 806). Yolcu sarıklı ve biraz serpilmiş: %4 uzun.
    'yolcu': dict(boy=838, klip={
        # hareket: (dosya adı başı, başlangıç sn, tür, yön, ayakta boy ölçüsü)
        #   tür: 'dongu' (doğal döngü noktası aranır) | ('tek', kare sayısı) | 'gecis' (aşağıda)
        #   ayakta: bu videoda karakter ayaktayken boyu (px); None → videonun ilk karesi (Grok'un verilen görseli)
        'bekle':  ('e311d723', .3, 'dongu', -1, None),
        'yuru':   ('e6f5a958', 1.0, 'dongu', -1, None),
        'yuru2':  ('2215d60d', .6, 'dongu', 1, 850),
        'arka':   ('a46f3a12', .3, 'dongu', 1, None),
        'kos':    ('9a0deb78', 1.5, 'dongu', 1, 845),
        'durus':  ('89c29d8b', .3, 'dongu', -1, 867),
        'yumruk': ('b19d42f4', 1.2, ('tek', 52), -1, 867),
        'kacin':  ('9b87d316', 1.55, ('tek', 20), -1, None),   # gerçek kaçınma değil: geriye kaykılma kısmı (geçici)
        # 'gkosdur': ('ff308d38', 1.4, ('tek', 36), 1, 845),  kullanılmadı: ortada kesme var, sonda asa yatay (bekleme duruşuyla buluşmuyor)
    }),
}

ad, U, T = sys.argv[1], sys.argv[2], sys.argv[3]
G = GORUNUMLER[ad]


def key(f):
    f = f.astype(np.float32); R, Gc, B = f[..., 0], f[..., 1], f[..., 2]; m = np.minimum(R, B) - Gc
    br = np.concatenate([m[:6].ravel(), m[-6:].ravel(), m[:, :6].ravel(), m[:, -6:].ravel()])
    bgv = max(np.percentile(br, 25), 40)
    bord = np.concatenate([f[:6].reshape(-1, 3), f[-6:].reshape(-1, 3), f[:, :6].reshape(-1, 3), f[:, -6:].reshape(-1, 3)])
    bgc = np.median(bord, 0)
    a = 1 - np.clip((m / bgv - .32) / .42, 0, 1); a3 = a[..., None]
    c = np.where(a3 > .02, (f - (1 - a3) * bgc) / np.maximum(a3, 1e-3), 0)
    mm = np.minimum(c[..., 0], c[..., 2]) - c[..., 1]; sp = np.clip(mm - 25, 0, None)[..., None] * (1 - a3 * .5)
    c[..., 0:1] -= sp * .8; c[..., 2:3] -= sp * .8
    return np.dstack([np.clip(c, 0, 255), a * 255]).astype(np.uint8)


def gövde(alpha):
    """(baş ekseni x, ayak tabanı y, üst y): ince asayı dışlamak için yalnızca 25 px'ten geniş satırlar sayılır."""
    a = alpha > 128; rows = np.where(a.sum(1) > 25)[0]
    top, bot = rows.min(), rows.max()
    ys, xs = np.where(a[top:top + int((bot - top) * .13)]); return float(xs.mean()), int(bot), int(top)


def kareler(dosya, bas):
    d = os.path.join(T, dosya); os.makedirs(d, exist_ok=True)
    if not glob.glob(d + '/*.png'):
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', glob.glob(os.path.join(U, dosya + '-*.mp4'))[0],
                        '-vf', f'fps={FPS}', d + '/%03d.png'], check=True)
    fs = sorted(glob.glob(d + '/*.png'))[int(round(bas * FPS)):]
    return [np.asarray(Image.open(f).convert('RGB')) for f in fs]


def adimlar(dosya, bas, N):
    """Videonun sesinden ayak basma anları → şerit kare numaraları."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', glob.glob(os.path.join(U, dosya + '-*.mp4'))[0],
                          '-f', 's16le', '-ac', '1', '-ar', '22050', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, np.int16).astype(float) / 32768
    if len(x) == 0 or np.abs(x).max() < 1e-3: return []
    sr, hop = 22050, 22050 // 200
    e = np.array([np.sqrt((x[i:i + hop] ** 2).mean()) for i in range(0, len(x) - hop, hop)]); db = 20 * np.log10(e + 1e-9)
    d = np.diff(db, prepend=db[0]); thr = db.max() - 24; ons = []; i = 0
    while i < len(db):
        if db[i] > thr and d[i] > 4: ons.append(i * hop / sr); i += 24
        else: i += 1
    return sorted(round(t * FPS - bas * FPS, 1) for t in ons if 0 <= t * FPS - bas * FPS < N)


def duzenli(ons, N, sil):
    """Adım aralığı görüntüden (siluetin kendini tekrar ettiği süre = bir çift adım), adımın düştüğü an sesten."""
    if not ons: return []
    fark = [np.mean([np.abs(sil[i] - sil[(i + L) % N]).mean() for i in range(N)]) for L in range(1, N // 2 + 1)]
    # en küçük farklı gecikme: bir çift adım (yarım adımlık gecikmede ayaklar ters, fark büyük)
    adaylar = [(fark[L - 1], L) for L in range(4, N // 2 + 1)]
    S = min(adaylar)[1]; n = max(2, round(N / (S / 2))); P = N / n
    en = max(((sum(1 for o in ons if min((o - f) % P, P - (o - f) % P) < 1.2), f) for f in np.arange(0, P, .25)))
    print(f'   çift adım {S} kare → döngüde {n} adım, her {P:.1f} karede; sesle uyan {en[0]}/{len(ons)}')
    return [round(float(en[1] + i * P), 1) for i in range(n)]


meta = dict(ANIM={}, FACE={}, ADIM={})
for st, (dosya, bas, tur, yon, ayakta) in G['klip'].items():
    F = kareler(dosya, bas)
    if ayakta is None:   # videonun ilk karesi = Grok'a verilen ayakta görsel
        ilk = key(np.asarray(Image.open(sorted(glob.glob(os.path.join(T, dosya, '*.png')))[0]).convert('RGB')))
        _, b0, t0 = gövde(ilk[..., 3]); ayakta = b0 - t0
    k = G['boy'] / ayakta
    if tur == 'dongu':
        small = [np.asarray(Image.fromarray(f).resize((96, 96))).astype(float) for f in F]
        sc = [(np.abs(small[0] - small[j]).mean(), j) for j in range(20, min(len(F) - 3, 75))]
        err, N = min(sc); print(f'{st}: döngü {N} kare ({N / FPS:.2f} sn), fark {err:.1f}')
        R = [key(f) for f in F[:N]]; K = 3
        R = [(R[i].astype(float) * (i / K) + key(F[N + i]).astype(float) * (1 - i / K)).astype(np.uint8) if i < K and N + i < len(F) else R[i] for i in range(N)]
    else:
        N = min(tur[1], len(F)); R = [key(f) for f in F[:N]]; print(f'{st}: {N} kare (tek seferlik)')
    gv = [gövde(r[..., 3]) for r in R]
    cx = float(np.mean([g[0] for g in gv])); taban = max(g[1] for g in gv)
    al = np.stack([r[..., 3] for r in R]).max(0); ys, xs = np.where(al > 20)
    y0 = max(0, ys.min() - 3); y1 = taban + 4                  # asa ayağın altına inerse kesilir
    yari = max(cx - xs.min(), xs.max() - cx) + 4; x0, x1 = int(cx - yari), int(cx + yari)   # baş tam ortada
    fw = round((x1 - x0) * H_STRIP / (y1 - y0)); rows = -(-N // COLS)
    sheet = Image.new('RGBA', (fw * COLS, H_STRIP * rows))
    for i, r in enumerate(R):
        im = Image.fromarray(r, 'RGBA'); pad = Image.new('RGBA', (x1 - x0, y1 - y0)); pad.paste(im, (-x0, -y0))
        sheet.paste(pad.resize((fw, H_STRIP), Image.LANCZOS), ((i % COLS) * fw, (i // COLS) * H_STRIP))
    yol = os.path.join(ASSETS, f'anim-{ad}-{st}.webp'); sheet.save(yol, 'WEBP', quality=90, method=6)
    meta['ANIM'][f'anim-{ad}-{st}'] = [N, fw, H_STRIP, COLS, round((y1 - y0) * k)]
    meta['FACE'][st] = yon
    if st in ('yuru', 'kos'):
        sil = [np.asarray(Image.fromarray(r[..., 3]).resize((64, 64))).astype(float) / 255 for r in R]
        meta['ADIM'][st] = duzenli(adimlar(dosya, bas, N), N, sil)
    if st == 'gkosdur': meta['ADIM'][st] = adimlar(dosya, bas, N)
    print(f'   {fw}x{H_STRIP}, ölçek {k:.3f}, {os.path.getsize(yol) // 1024} KB, adım {meta["ADIM"].get(st, "-")}')

json.dump(meta, open(os.path.join(BURASI, f'karakter-{ad}.json'), 'w'), ensure_ascii=False, indent=1)
print('✓', f'karakter-{ad}.json')
