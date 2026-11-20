# Oyunu tek HTML dosyasına toplar (resimler, sesler, betikler içine gömülür).
# Kullanım: python3 tek-html.py <seyr klasörü> <çıktı.html> [webp kalitesi, ör. 87]
# Kalite verilirse resimler yeniden sıkıştırılır (depodaki asıl resimler değişmez).
import base64,glob,io,json,os,re,sys
Q=int(sys.argv[3]) if len(sys.argv)>3 else 0
def resim(p):
    if not Q: return open(p,'rb').read()
    from PIL import Image
    b=io.BytesIO();Image.open(p).save(b,'WEBP',quality=Q,method=6,alpha_quality=90);return b.getvalue()
os.chdir(sys.argv[1]);h=open('index.html').read()
for f in ['assets/ses/ses.js','sesler.js','savas.js','defter.js']:
    tag=f'<script src="{f}"></script>';assert tag in h,f
    h=h.replace(tag,'<script>'+open(f).read().replace('</script','<\\/script')+'</script>')
img={os.path.basename(p)[:-5]:'data:image/webp;base64,'+base64.b64encode(resim(p)).decode() for p in glob.glob('assets/*.webp')}
a="const AURL=n=>'assets/'+n+'.webp',";assert a in h
h=h.replace(a,'const RESIM='+json.dumps(img)+";const AURL=n=>RESIM[n]||'assets/'+n+'.webp',")
open(sys.argv[2],'w').write(h)
