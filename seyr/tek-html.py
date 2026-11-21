# Oyunu tek HTML dosyasına toplar (resimler, sesler, betikler içine gömülür).
# Kullanım: python3 tek-html.py <seyr klasörü> <çıktı.html> [webp kalitesi, ör. 84] [küçültme, ör. 0.7]
# Kalite verilirse resimler yeniden sıkıştırılır; küçültme verilirse animasyon şeritleri o oranda küçülür
# ve index.html'deki ANIM tablosu (kare genişliği/yüksekliği) buna göre güncellenir. Depodaki asıllar değişmez.
import base64, glob, io, json, os, re, sys
from PIL import Image

Q = int(sys.argv[3]) if len(sys.argv) > 3 else 0
K = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
os.chdir(sys.argv[1]); h = open('index.html', encoding='utf-8').read()
ANIM = json.loads(h.split('const ANIM=')[1].split(';')[0])


def resim(p):
    ad = os.path.basename(p)[:-5]
    if not Q and K == 1: return open(p, 'rb').read()
    im = Image.open(p)
    if K != 1 and ad in ANIM:
        N, fw, fh, C, src = ANIM[ad]; rows = -(-N // C)
        nfw, nfh = max(1, round(fw * K)), max(1, round(fh * K))
        im = im.resize((nfw * C, nfh * rows), Image.LANCZOS)   # ızgara tam bölünsün
        ANIM[ad] = [N, nfw, nfh, C, src]
    b = io.BytesIO(); im.save(b, 'WEBP', quality=Q or 90, method=6, alpha_quality=90); return b.getvalue()


for f in ['assets/ses/ses.js', 'sesler.js', 'savas.js', 'defter.js']:
    tag = f'<script src="{f}"></script>'; assert tag in h, f
    h = h.replace(tag, '<script>' + open(f, encoding='utf-8').read().replace('</script', '<\\/script') + '</script>')
img = {os.path.basename(p)[:-5]: 'data:image/webp;base64,' + base64.b64encode(resim(p)).decode() for p in glob.glob('assets/*.webp')}
h = re.sub(r'const ANIM=\{[^;]*\};', lambda m: 'const ANIM=' + json.dumps(ANIM) + ';', h, count=1)
a = "const AURL=n=>'assets/'+n+'.webp',"; assert a in h
h = h.replace(a, 'const RESIM=' + json.dumps(img) + ";const AURL=n=>RESIM[n]||'assets/'+n+'.webp',")
open(sys.argv[2], 'w', encoding='utf-8').write(h)
print('✓', sys.argv[2], round(os.path.getsize(sys.argv[2]) / 1e6, 2), 'MB')
